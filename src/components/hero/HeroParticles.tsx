"use client";

// The GL scene, dynamically imported by HeroBridgeBand with ssr:false. This
// file (and heroImageSampler/heroParticleShaders, which it alone imports) is
// the ONLY code in the tree permitted to import three/@react-three/fiber —
// keeping that isolated is what keeps three out of the first-load bundle.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { HeroParticlesProps, Tier } from "./particleTypes";
import { sampleBridgeImage, type SampledField } from "./heroImageSampler";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./heroParticleShaders";

const TIER_POINT_BUDGET: Record<Exclude<Tier, "fallback">, number> = {
  low: 28000,
  mid: 85000,
  high: 150000,
};

const DPR_RANGE: [number, number] = [1, 1.5];
const ASSEMBLE_SECONDS = 1.6;
const CAMERA_FOV = 40;
const CAMERA_Z = 30;

export function HeroParticles({ exit, tier, theme, onReady, onContextLost }: HeroParticlesProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(typeof document !== "undefined" && document.hidden);

  // the only mechanism that truly stops rAF + GPU work: drive Canvas's
  // frameloop prop itself rather than early-returning inside useFrame
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const active = inView && !hidden;

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={DPR_RANGE}
        frameloop={active ? "always" : "never"}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: CAMERA_FOV, near: 0.1, far: 500, position: [0, 0, CAMERA_Z] }}
      >
        <ContextLossWatcher onContextLost={onContextLost} />
        <Scene exit={exit} tier={tier} theme={theme} onReady={onReady} />
      </Canvas>
    </div>
  );
}

function ContextLossWatcher({ onContextLost }: { onContextLost?: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    // preventDefault keeps recovery possible; we don't dispose here — the
    // parent downgrades useGL, and disposal happens in the normal unmount
    // cleanup once this component actually unmounts
    const handleLost = (e: Event) => {
      e.preventDefault();
      onContextLost?.();
    };
    canvas.addEventListener("webglcontextlost", handleLost, false);
    return () => canvas.removeEventListener("webglcontextlost", handleLost);
  }, [gl, onContextLost]);
  return null;
}

function Scene({
  exit,
  tier,
  theme,
  onReady,
}: Pick<HeroParticlesProps, "exit" | "tier" | "theme" | "onReady">) {
  const { size, camera, gl } = useThree();
  const [sample, setSample] = useState<SampledField | null>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  const progressRef = useRef(0);
  const readyFired = useRef(false);
  const ndc = useRef(new THREE.Vector2(-10, -10));
  const mouseSmoothed = useRef(new THREE.Vector2(0, 0));
  const hit2 = useMemo(() => new THREE.Vector2(), []);
  const hit3 = useMemo(() => new THREE.Vector3(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const camBaseX = 0;
  const camBaseY = 0;

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uProgress: { value: 0 },
          uScroll: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uPixelRatio: { value: gl.getPixelRatio() },
          uOpacity: { value: 1 },
          uTheme: { value: theme === "dark" ? 1 : 0 },
          uBridgeColor: { value: new THREE.Color(theme === "dark" ? "#68c896" : "#166544") },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending,
      }),
    // material is created once and mutated in place on theme changes below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(() => () => material.dispose(), [material]);

  // additive over ivory would clamp every channel to white — light theme
  // must stay NormalBlending, only dark gets the additive glow
  useEffect(() => {
    material.blending = theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending;
    material.uniforms.uTheme.value = theme === "dark" ? 1 : 0;
    (material.uniforms.uBridgeColor.value as THREE.Color).set(
      theme === "dark" ? "#68c896" : "#166544"
    );
    material.needsUpdate = true;
  }, [theme, material]);

  // rounded key so sub-pixel resize jitter doesn't re-trigger a full resample
  const sizeKey = `${Math.round(size.width)}x${Math.round(size.height)}`;
  useEffect(() => {
    if (!size.width || !size.height) return;
    let cancelled = false;
    const fovRad = (CAMERA_FOV * Math.PI) / 180;
    const visH = 2 * Math.tan(fovRad / 2) * CAMERA_Z;
    sampleBridgeImage({
      src: "/media/hero-bridge.jpg",
      pointBudget: TIER_POINT_BUDGET[tier],
      containerAspect: size.width / size.height,
      visH,
    })
      .then((field) => {
        if (!cancelled) setSample(field);
      })
      .catch(() => {
        // decode or 2d-context failure — the parent's <img> stays visible,
        // onReady simply never fires
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeKey, tier]);

  // build the VBOs once the sample lands, as the last step before the
  // assemble is allowed to progress — this is the onReady gate
  useEffect(() => {
    if (!sample) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(sample.target, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(sample.color, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(sample.seed, 3));
    geo.setAttribute("aBoost", new THREE.BufferAttribute(sample.boost, 1));
    progressRef.current = 0;
    readyFired.current = false;
    setGeometry(geo);
    return () => geo.dispose();
  }, [sample]);

  // fine-pointer only; NDC read from a LIVE rect each move (never bandRef,
  // never a cached rect — the parallax translate + object-cover overflow
  // sit between screen-px and plane-space, so only the live canvas rect is
  // guaranteed correct)
  useEffect(() => {
    const canvas = gl.domElement;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const handleMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      ndc.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const handleLeave = () => ndc.current.set(-10, -10);
    canvas.addEventListener("pointermove", handleMove, { passive: true });
    canvas.addEventListener("pointerleave", handleLeave, { passive: true });
    return () => {
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerleave", handleLeave);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const active = ndc.current.x > -5;
    const parallaxX = active ? ndc.current.x * 2.4 : 0;
    const parallaxY = active ? ndc.current.y * 1.6 : 0;
    camera.position.x += (camBaseX + parallaxX - camera.position.x) * 0.05;
    camera.position.y += (camBaseY + parallaxY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // ray→plane AFTER the camera parallax update, so the hit matches what's
    // actually on screen this frame
    raycaster.setFromCamera(ndc.current, camera);
    if (raycaster.ray.intersectPlane(plane, hit3)) {
      hit2.set(hit3.x, hit3.y);
      mouseSmoothed.current.lerp(hit2, 0.2);
    }
    material.uniforms.uMouse.value.copy(mouseSmoothed.current);
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();

    // seeded from the live MotionValue every active frame — auto-seeds on
    // mount and auto-resumes after an off-screen pause, no separate wiring
    material.uniforms.uScroll.value = exit.get();

    if (geometry && progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta / ASSEMBLE_SECONDS);
    }
    if (geometry) {
      material.uniforms.uProgress.value = progressRef.current;
      if (progressRef.current >= 1 && !readyFired.current) {
        readyFired.current = true;
        onReady?.();
      }
    }
  });

  if (!geometry) return null;
  return <points geometry={geometry} material={material} />;
}
