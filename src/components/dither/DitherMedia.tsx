"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type DitherMediaHandle = {
  scramble: (duration?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  /** scrub mode only: drive the left-to-right print from scroll (0..1) */
  setProgress: (p: number) => void;
  /** arm the pointer wake — only ripples once the colour has locked */
  enableWake: () => void;
  disableWake: () => void;
};

type DitherMediaProps = {
  src: string;
  video?: string | null;
  alt: string;
  className?: string;
  /** CSS px per dither cell */
  cell?: number;
  transition?: "materialize" | "none" | "scrub";
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

// scrub print
const FRONTIER = 8; // columns of live flicker just behind the print front
const LOCK_P = 0.98; // progress at which the colour "signal locks"

// pointer wake
const WAKE_PEAK = NOISE_AMP * 0.35; // deposited energy at the cursor
const WAKE_RADIUS = 14; // columns of gaussian spread each side
const WAKE_DECAY = 0.88; // per-frame energy falloff
const WAKE_FLOOR = 0.02; // energy below which a column heals and the loop ends

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
    const scrubMode = transition === "scrub";
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
      energy: new Float32Array(0), // per-column wake energy
      ink: "#000",
      bg: "#fff",
      faded: false, // resolve mode: fade-out has begun (or finished)
      static: false,
      imgReady: false,
      sampled: false,
      inView: false,
      started: false,
      settled: false,
      // scrub
      lastP: -1, // last progress applied (monotonic); re-applied on relayout
      pendingP: 0, // progress awaiting the next coalesced paint
      locked: false, // scrub reached LOCK_P; colour is showing
      scrubRaf: 0,
      // wake
      waking: false,
      wakeRaf: 0,
      anim: null as null | { kind: "in" | "scramble"; start: number; ms: number },
      raf: 0,
      tick: 0,
      lastBreathe: 0,
      lastSample: 0,
      play: null as null | (() => void),
      vidCtl: null as null | ((on: boolean) => void),
      applyProgress: null as null | ((p: number) => void),
      wakeCtl: null as null | ((on: boolean) => void),
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
      s.lastP = -1;
      s.locked = false;
      s.waking = false;
      cvs.style.transition = "";
      cvs.style.opacity = "";
      cvs.style.backgroundColor = "";

      if (resolveMode && s.static) {
        // reduced motion (or transition="none"): show the colour <img>
        // immediately and never paint the canvas — covers scrub too
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
        if (s.scrubRaf) {
          cancelAnimationFrame(s.scrubRaf);
          s.scrubRaf = 0;
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

      // ------------------------------------------------------------------
      // scrub: scroll drives the same left-to-right print, one coalesced
      // paint per frame, monotonic (reverse scroll holds), locks to colour.
      // ------------------------------------------------------------------
      function paintScrub() {
        s.scrubRaf = 0;
        if (!s.sampled) return;
        const { cols, colOff } = s;
        const p = s.pendingP;
        s.tick++;
        const edge = FRONTIER / cols;
        for (let c = 0; c < cols; c++) {
          const cp = c / cols;
          if (cp > p) colOff[c] = -9; // ahead of the front — unstarted
          else if (cp > p - edge) colOff[c] = (flick(c, s.tick) * 2 - 1) * NOISE_AMP;
          else colOff[c] = 0; // settled
        }
        paint();
      }

      function lockToColour() {
        if (s.locked) return;
        s.locked = true;
        s.settled = true;
        if (s.scrubRaf) {
          cancelAnimationFrame(s.scrubRaf);
          s.scrubRaf = 0;
        }
        // one final fully-settled paint so the fade never starts from a frame
        // the delta guard skipped, then hand over to the colour layer once
        if (s.sampled) {
          s.colOff.fill(0);
          paint();
        }
        beginFade();
      }

      function applyProgress(p: number) {
        if (s.static || s.locked) return;
        if (p < 0) p = 0;
        else if (p > 1) p = 1;
        if (p < s.lastP) return; // MONOTONIC — reverse scroll holds
        if (p >= LOCK_P) {
          s.lastP = 1;
          s.started = true;
          lockToColour();
          return;
        }
        // skip micro-moves smaller than a single column
        if (s.started && p - s.lastP < 1 / Math.max(1, s.cols)) return;
        s.lastP = p;
        s.started = true;
        s.pendingP = p;
        if (!s.scrubRaf && s.inView) s.scrubRaf = requestAnimationFrame(paintScrub);
      }

      // re-apply the stored progress with one coalesced paint (relayout,
      // img load, remount, or coming back into view)
      function reapplyProgress() {
        if (s.lastP < 0 || s.locked) return;
        s.pendingP = s.lastP;
        if (!s.scrubRaf && s.inView) s.scrubRaf = requestAnimationFrame(paintScrub);
      }

      // ------------------------------------------------------------------
      // wake: pointer deposits gaussian energy per column; a private paint
      // path clears each energized column (colour shows through) and inks
      // only the dither lines, healing behind the cursor. Own rAF, own
      // termination — returns to zero when the last energy drains.
      // ------------------------------------------------------------------
      function depositEnergy(clientX: number) {
        if (s.cols < 2) return;
        const rect = cvs!.getBoundingClientRect();
        if (!rect.width) return;
        const col = Math.floor(((clientX - rect.left) / rect.width) * s.cols);
        const sig2 = 2 * (WAKE_RADIUS / 2) ** 2;
        const lo = Math.max(0, col - WAKE_RADIUS);
        const hi = Math.min(s.cols - 1, col + WAKE_RADIUS);
        for (let c = lo; c <= hi; c++) {
          const d = c - col;
          const e = s.energy[c] + WAKE_PEAK * Math.exp(-(d * d) / sig2);
          s.energy[c] = e > 1 ? 1 : e;
        }
        if (!s.waking) startWake();
      }

      function startWake() {
        s.waking = true;
        // the canvas element carries an opaque bg-bg class and resolve paint()
        // fills an opaque backing — neither lets colour through. Clear the old
        // plate to transparent BEFORE showing it, so no dither flashes.
        cvs!.style.transition = "none";
        cvs!.style.backgroundColor = "transparent";
        ctx!.clearRect(0, 0, s.w, s.h);
        cvs!.style.opacity = "1";
        if (!s.wakeRaf) s.wakeRaf = requestAnimationFrame(wakeFrame);
      }

      function wakeFrame() {
        s.wakeRaf = 0;
        const { cols, rows, lum, cellPx, energy } = s;
        const lw = cellPx * LINE_W;
        const inset = (cellPx - lw) / 2;
        s.tick++;
        ctx!.fillStyle = s.ink;
        let maxE = 0;
        for (let c = 0; c < cols; c++) {
          const e = energy[c];
          if (e < WAKE_FLOOR) {
            if (e > 0) {
              // just drained — heal this column back to pure colour
              ctx!.clearRect(c * cellPx, 0, cellPx + 1, s.h);
              energy[c] = 0;
            }
            continue;
          }
          ctx!.clearRect(c * cellPx, 0, cellPx + 1, s.h);
          const bx = BX[c & 3] * 4;
          const x = c * cellPx + inset;
          const off = (flick(c, s.tick) * 2 - 1) * e;
          for (let r = 0; r < rows; r++) {
            const th = (bx + BY[r & 3] + 0.5) / 16;
            if (lum[r * cols + c] < th + off) {
              ctx!.fillRect(x, r * cellPx, lw, cellPx + 0.3);
            }
          }
          energy[c] = e * WAKE_DECAY;
          if (energy[c] > maxE) maxE = energy[c];
        }
        if (maxE < WAKE_FLOOR) {
          endWake();
          return;
        }
        s.wakeRaf = requestAnimationFrame(wakeFrame);
      }

      function endWake() {
        if (s.wakeRaf) {
          cancelAnimationFrame(s.wakeRaf);
          s.wakeRaf = 0;
        }
        s.waking = false;
        s.energy.fill(0);
        // fully healed → colour is showing. Snap back to the resting locked
        // state (invisible canvas, opaque backing restored) with no flash:
        // content is already transparent, so opacity 0 is a visual no-op.
        ctx!.clearRect(0, 0, s.w, s.h);
        cvs!.style.transition = "none";
        cvs!.style.opacity = "0";
        cvs!.style.backgroundColor = "";
      }

      let wakeMove: ((e: PointerEvent) => void) | null = null;
      function setWake(on: boolean) {
        if (on) {
          if (wakeMove) return;
          const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
          if (!fine || reduced) return;
          wakeMove = (e: PointerEvent) => {
            // never before the colour lock, never off-screen
            if (!s.settled || !s.faded || !s.inView) return;
            depositEnergy(e.clientX);
          };
          wrap!.addEventListener("pointermove", wakeMove, { passive: true });
        } else {
          if (wakeMove) {
            wrap!.removeEventListener("pointermove", wakeMove);
            wakeMove = null;
          }
          if (s.waking) endWake();
        }
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
        if (scrubMode) {
          // no clock-driven sweep — scroll owns the print; just re-settle the
          // current scrub frame (e.g. after coming back into view)
          reapplyProgress();
          return;
        }
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
        if (scrubMode && !s.locked) {
          reapplyProgress();
          return;
        }
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
        if (s.energy.length !== cols) s.energy = new Float32Array(cols);
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
      s.applyProgress = applyProgress;
      s.wakeCtl = setWake;
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
            if (s.waking) endWake();
            stop();
          }
        },
        { threshold: 0.15 }
      );
      io.observe(wrap);

      const mo = new MutationObserver(() => {
        resolveTones();
        // once a fade-out has begun (or a wake is rippling) keep the canvas's
        // current frame — repainting an invisible or mid-wake canvas flashes
        if (s.faded || s.waking) return;
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
        setWake(false);
        stop();
        if (s.wakeRaf) {
          cancelAnimationFrame(s.wakeRaf);
          s.wakeRaf = 0;
        }
        s.play = null;
        s.vidCtl = null;
        s.applyProgress = null;
        s.wakeCtl = null;
        img.onload = null;
      };
    }, [s, src, video, cell, transition, scrubMode, resolveMode, breathe, autoContrast, videoAutoPlay]);

    useImperativeHandle(
      ref,
      () => ({
        scramble(duration = 150) {
          if (s.static || !s.settled || !s.inView || s.anim || s.waking) return;
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
        setProgress(p: number) {
          s.applyProgress?.(p);
        },
        enableWake() {
          s.wakeCtl?.(true);
        },
        disableWake() {
          s.wakeCtl?.(false);
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
