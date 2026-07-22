"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type DitherMediaHandle = {
  scramble: (duration?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
};

type DitherMediaProps = {
  src: string;
  video?: string | null;
  alt: string;
  className?: string;
  /** CSS px per dither cell */
  cell?: number;
  transition?: "materialize" | "none";
  /** duotone = the dither IS the image; resolve = the dither is an entrance
      that settles, then fades out to reveal the full-colour image beneath */
  mode?: "duotone" | "resolve";
  breathe?: boolean;
  /** histogram stretch for low-contrast sources; disable when the crop
      leaves mostly midtones and the stretch amplifies them into texture */
  autoContrast?: boolean;
  /** false = video waits for playVideo() (hover-to-play cards) */
  videoAutoPlay?: boolean;
};

const MAX_CELLS = 24000;
const LINE_W = 0.55; // line width, fraction of cell
const SWEEP_MS = 500; // left-to-right column stagger spread
const SETTLE_MS = 400; // per-column flicker decay
const NOISE_AMP = 0.5;
const BREATHE_AMP = 0.02;
const BREATHE_PERIOD_MS = 7000;
const BREATHE_FRAME_MS = 85; // ~12fps
const VIDEO_FRAME_MS = 42; // ~24fps

// 4x4 Bayer split into a coarse column term and a fine row term, so the
// threshold tracks x first and tone reads as vertical line density.
const BX = [0, 2, 1, 3];
const BY = [0, 2, 1, 3];

// cheap deterministic flicker, no allocations
function flick(col: number, tick: number) {
  const s = Math.sin(col * 127.1 + tick * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export const DitherMedia = forwardRef<DitherMediaHandle, DitherMediaProps>(
  function DitherMedia(
    {
      src,
      video = null,
      alt,
      className,
      cell = 3,
      transition = "materialize",
      mode = "duotone",
      breathe = false,
      autoContrast = true,
      videoAutoPlay = true,
    },
    ref
  ) {
    const resolveMode = mode === "resolve";
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const s = useRef({
      cols: 0,
      rows: 0,
      cellPx: 3,
      w: 0,
      h: 0,
      lum: new Float32Array(0),
      colOff: new Float32Array(0),
      phases: new Float32Array(0),
      ink: "#000",
      bg: "#fff",
      faded: false, // resolve mode: fade-out has begun (or finished)
      static: false,
      imgReady: false,
      sampled: false,
      inView: false,
      started: false,
      settled: false,
      anim: null as null | { kind: "in" | "scramble"; start: number; ms: number },
      raf: 0,
      tick: 0,
      lastBreathe: 0,
      lastSample: 0,
      play: null as null | (() => void),
      vidCtl: null as null | ((on: boolean) => void),
    }).current;

    useEffect(() => {
      const wrap = wrapRef.current;
      const cvs = canvasRef.current;
      if (!wrap || !cvs) return;
      const ctx = cvs.getContext("2d");
      if (!ctx) return;
      const sampler = document.createElement("canvas");
      const sctx = sampler.getContext("2d", { willReadFrequently: true });
      if (!sctx) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const vid = videoRef.current;
      // resolve mode never canvas-samples the video — the real element plays
      const useVideo = !!video && !reduced && transition !== "none" && !resolveMode;

      s.static = reduced || transition === "none";
      s.cols = 0;
      s.imgReady = false;
      s.sampled = false;
      s.started = false;
      s.settled = false;
      s.anim = null;
      s.faded = false;
      cvs.style.transition = "";
      cvs.style.opacity = "";

      if (resolveMode && s.static) {
        // reduced motion (or transition="none"): show the colour <img>
        // immediately and never paint the canvas
        cvs.style.opacity = "0";
        return;
      }

      const img = new Image();
      img.decoding = "async";
      const hist = new Uint32Array(256);

      function resolveTones() {
        const cs = getComputedStyle(wrap!);
        const i = cs.getPropertyValue("--ink").trim();
        if (i) s.ink = `rgb(${i.split(/\s+/).join(",")})`;
        const b = cs.getPropertyValue("--bg").trim();
        if (b) s.bg = `rgb(${b.split(/\s+/).join(",")})`;
      }

      function sample() {
        let source: CanvasImageSource = img;
        let sw = img.naturalWidth;
        let sh = img.naturalHeight;
        if (useVideo && vid && vid.readyState >= 2) {
          source = vid;
          sw = vid.videoWidth;
          sh = vid.videoHeight;
        }
        if (!sw || !sh || !s.cols) return;
        const { cols, rows, lum } = s;
        const k = Math.max(cols / sw, rows / sh);
        sctx!.drawImage(source, (cols - sw * k) / 2, (rows - sh * k) / 2, sw * k, sh * k);
        const d = sctx!.getImageData(0, 0, cols, rows).data;
        hist.fill(0);
        for (let i = 0; i < lum.length; i++) {
          const p = i * 4;
          const l = 0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2];
          lum[i] = l / 255;
          hist[l | 0]++;
        }
        if (!autoContrast) {
          s.sampled = true;
          return;
        }
        // stretch the 2nd–98th percentile across the full ramp, otherwise
        // low-contrast sources collapse into a flat wall of lines
        const cut = lum.length * 0.02;
        let n = 0;
        let lo = 0;
        let hi = 255;
        for (let v = 0; v < 256; v++) {
          n += hist[v];
          if (n <= cut) lo = v;
          if (n < lum.length - cut) hi = v;
        }
        const span = (hi - lo) / 255;
        if (span > 0.05 && span < 0.98) {
          const a = lo / 255;
          for (let i = 0; i < lum.length; i++) {
            const l = (lum[i] - a) / span;
            lum[i] = l < 0 ? 0 : l > 1 ? 1 : l;
          }
        }
        s.sampled = true;
      }

      function paint() {
        if (!s.sampled) return;
        const { cols, rows, lum, colOff, cellPx } = s;
        const lw = cellPx * LINE_W;
        const inset = (cellPx - lw) / 2;
        if (resolveMode) {
          // opaque backing — the colour image must not leak through the line
          // gaps while the dither pass is still covering it
          ctx!.fillStyle = s.bg;
          ctx!.fillRect(0, 0, s.w, s.h);
        } else {
          ctx!.clearRect(0, 0, s.w, s.h);
        }
        ctx!.fillStyle = s.ink;
        for (let c = 0; c < cols; c++) {
          const off = colOff[c];
          if (off < -1) continue; // column not started yet
          const bx = BX[c & 3] * 4;
          const x = c * cellPx + inset;
          for (let r = 0; r < rows; r++) {
            const th = (bx + BY[r & 3] + 0.5) / 16;
            if (lum[r * cols + c] < th + off) {
              // slight vertical overlap so stacked cells fuse into one line
              ctx!.fillRect(x, r * cellPx, lw, cellPx + 0.3);
            }
          }
        }
      }

      // fills colOff for the current moment; true while still animating
      function setOffsets(now: number): boolean {
        const { cols, colOff, anim } = s;
        if (anim) {
          const t = now - anim.start;
          let live = false;
          if (anim.kind === "in") {
            for (let c = 0; c < cols; c++) {
              const local = (t - (c / cols) * SWEEP_MS) / SETTLE_MS;
              if (local < 0) {
                colOff[c] = -9;
                live = true;
              } else if (local >= 1) {
                colOff[c] = 0;
              } else {
                colOff[c] = (flick(c, s.tick) * 2 - 1) * NOISE_AMP * (1 - local);
                live = true;
              }
            }
          } else {
            const p = t / anim.ms;
            if (p < 1) {
              for (let c = 0; c < cols; c++) {
                colOff[c] = (flick(c, s.tick) * 2 - 1) * NOISE_AMP * (1 - p);
              }
              live = true;
            } else {
              colOff.fill(0);
            }
          }
          if (!live) s.anim = null;
          return live;
        }
        const base = (now / BREATHE_PERIOD_MS) * Math.PI * 2;
        for (let c = 0; c < cols; c++) {
          colOff[c] = BREATHE_AMP * Math.sin(base + s.phases[c]);
        }
        return true;
      }

      function schedule() {
        if (!s.raf) s.raf = requestAnimationFrame(frame);
      }

      function stop() {
        if (s.raf) {
          cancelAnimationFrame(s.raf);
          s.raf = 0;
        }
      }

      // resolve mode: hand over to the colour layer. The transition is only
      // ever attached here, right before the opacity change — attaching it
      // statically would turn scramble's snap-to-visible into a 0.7s ramp.
      function beginFade() {
        s.faded = true;
        cvs!.style.transition = "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1)";
        cvs!.style.opacity = "0";
      }

      function frame(now: number) {
        s.raf = 0;
        if (!s.inView) return;
        s.tick++;

        const liveVideo = !!(useVideo && vid && !vid.paused && vid.readyState >= 2);
        let fresh = false;
        if (liveVideo && now - s.lastSample >= VIDEO_FRAME_MS) {
          s.lastSample = now;
          sample();
          fresh = true;
        }

        if (s.anim) {
          const live = setOffsets(now);
          paint();
          if (!live) {
            s.settled = true;
            if (resolveMode) {
              // settled → fade the canvas away; the rAF loop ends right here
              // (zero idle cost), the CSS transition carries the reveal
              beginFade();
              return;
            }
          }
          schedule();
          return;
        }

        if (liveVideo) {
          if (fresh) {
            s.colOff.fill(0);
            paint();
          }
          schedule();
          return;
        }

        if (breathe && !s.static && s.settled && !s.faded) {
          if (now - s.lastBreathe >= BREATHE_FRAME_MS) {
            s.lastBreathe = now;
            setOffsets(now);
            paint();
          }
          schedule();
        }
        // nothing left to animate — the loop ends here, zero idle cost
      }

      function kick() {
        if (!s.imgReady || !s.cols) return;
        if (s.static) {
          if (!s.started) {
            s.started = true;
            s.colOff.fill(0);
            paint();
          }
          return;
        }
        if (!s.inView) return;
        if (!s.started) {
          s.started = true;
          s.anim = { kind: "in", start: performance.now(), ms: 0 };
        }
        schedule();
      }

      // theme changes and resizes while settled; mid-animation frames repaint
      // themselves on the next tick
      function repaintCurrent() {
        if (!s.sampled || !s.started) return;
        if (!s.settled && !s.static) return;
        s.colOff.fill(0);
        paint();
      }

      function layout(rect: { width: number; height: number }) {
        const w = rect.width;
        const h = rect.height;
        if (!w || !h) return;
        let c = cell;
        let cols = Math.ceil(w / c);
        let rows = Math.ceil(h / c);
        if (cols * rows > MAX_CELLS) {
          c = cell * Math.sqrt((cols * rows) / MAX_CELLS);
          cols = Math.ceil(w / c);
          rows = Math.ceil(h / c);
        }
        const dpr = window.devicePixelRatio || 1;
        cvs!.width = Math.round(w * dpr);
        cvs!.height = Math.round(h * dpr);
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        s.w = w;
        s.h = h;
        s.cellPx = c;
        s.cols = cols;
        s.rows = rows;
        if (s.lum.length !== cols * rows) s.lum = new Float32Array(cols * rows);
        if (s.colOff.length !== cols) s.colOff = new Float32Array(cols);
        if (s.phases.length !== cols) {
          s.phases = new Float32Array(cols);
          for (let i = 0; i < cols; i++) s.phases[i] = Math.random() * Math.PI * 2;
        }
        sampler.width = cols;
        sampler.height = rows;
        if (s.imgReady) {
          sample();
          kick();
          repaintCurrent();
        }
      }

      img.onload = () => {
        s.imgReady = true;
        if (s.cols) {
          sample();
          kick();
        }
      };
      img.src = src;

      resolveTones();
      s.play = schedule;
      s.vidCtl = (on) => {
        if (resolveMode) {
          // simple version (every manifest video is currently null): the
          // visible <video> layer under the canvas plays directly, no
          // canvas sampling; poster = the still, so pausing holds a frame
          if (!vid || !s.inView) return;
          if (on) vid.play().catch(() => {});
          else vid.pause();
          return;
        }
        if (!useVideo || !vid || !s.inView) return;
        if (on) {
          vid.play().catch(() => {});
          schedule();
        } else {
          vid.pause();
        }
      };

      const ro = new ResizeObserver((entries) => layout(entries[0].contentRect));
      ro.observe(wrap);

      const io = new IntersectionObserver(
        ([entry]) => {
          s.inView = entry.isIntersecting;
          if (s.inView) {
            if ((useVideo || resolveMode) && vid && videoAutoPlay) vid.play().catch(() => {});
            kick();
          } else {
            if (vid) vid.pause();
            stop();
          }
        },
        { threshold: 0.15 }
      );
      io.observe(wrap);

      const mo = new MutationObserver(() => {
        resolveTones();
        // once a fade-out has begun, keep the canvas's last frame — a later
        // scramble repaints with the fresh tones anyway, and repainting an
        // invisible (or mid-fade) canvas here would flash
        if (s.faded) return;
        repaintCurrent();
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      if (vid) {
        vid.muted = true;
        if (!useVideo || !videoAutoPlay) vid.pause();
      }

      return () => {
        ro.disconnect();
        io.disconnect();
        mo.disconnect();
        stop();
        s.play = null;
        s.vidCtl = null;
        img.onload = null;
      };
    }, [s, src, video, cell, transition, resolveMode, breathe, autoContrast, videoAutoPlay]);

    useImperativeHandle(
      ref,
      () => ({
        scramble(duration = 150) {
          if (s.static || !s.settled || !s.inView || s.anim) return;
          const cvs = canvasRef.current;
          if (s.faded && cvs) {
            // snap back over the colour layer with no ramp — the transition
            // re-attaches when the settle fades out again
            cvs.style.transition = "none";
            cvs.style.opacity = "1";
            s.faded = false;
          }
          s.anim = { kind: "scramble", start: performance.now(), ms: duration };
          s.play?.();
        },
        playVideo() {
          s.vidCtl?.(true);
        },
        pauseVideo() {
          s.vidCtl?.(false);
        },
      }),
      [s]
    );

    return (
      <div ref={wrapRef} className={`relative overflow-hidden bg-bg ${className ?? ""}`}>
        {resolveMode ? (
          // the real image, revealed when the canvas above it fades out;
          // it carries the accessible name in this mode
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {video && resolveMode ? (
          <video
            ref={videoRef}
            src={video}
            poster={src}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : null}
        {/* bg-bg in resolve mode covers the colour layers until the first
            dither paint lands; it fades away with the canvas */}
        <canvas
          ref={canvasRef}
          {...(resolveMode
            ? { "aria-hidden": true as const }
            : { role: "img", "aria-label": alt })}
          className={`relative block h-full w-full ${resolveMode ? "bg-bg" : ""}`}
        />
        {video && !resolveMode ? (
          <video
            ref={videoRef}
            src={video}
            poster={src}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            className="hidden"
            aria-hidden="true"
          />
        ) : null}
      </div>
    );
  }
);
