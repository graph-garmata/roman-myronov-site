"use client";

import { type Ref, useEffect, useId, useImperativeHandle, useRef } from "react";

// Geometry from the Figma frame (Layer_1, 1728×936): a full-bleed almond
// with a starburst iris the full height of the eye, centred.
const W = 1728;
const H = 936;
const CX = W / 2;
const CY = 468;
const IRIS_W = 935.341;

// How far the iris can travel from centre, in viewBox units — read off the
// reference clip (≈10% of the width sideways, ≈13% of the height vertically).
const MAX_DX = 175;
const MAX_DY = 120;

// Follow/lid smoothing, per second. Higher = snappier.
const FOLLOW_RATE = 7;
const LID_RATE = 9;

// Idle blinks while open: a quick shut-and-open every few seconds, now and
// then doubled up. Times in seconds.
const BLINK_CLOSE = 0.09;
const BLINK_OPEN = 0.16;
const BLINK_GAP_MIN = 2.5;
const BLINK_GAP_MAX = 6;
const DOUBLE_BLINK_CHANCE = 0.2;

// Where both lids meet when shut: a curve sagging well below the centre
// line, pinned at the corners. Opening, the top lid sweeps all the way up
// through the centre (flipping from a sag to an arch) while the bottom lid
// only drops the last stretch to the edge — like a real eye.
const CLOSED_Y = 800;

// Blackout (Layer_2): the page-leave transition. Times in seconds, read off
// the reference clip at 30fps.
//  - A black disc grows out from behind the iris, accelerating, until it
//    covers the screen (not clipped by the lids).
//  - Meanwhile the iris's 12 white wedges collapse one by one, sweeping
//    counterclockwise from 11 o'clock round to 1 o'clock; each closes onto
//    its own counterclockwise edge, leaving the iris solid black.
const DISC_DUR = 0.6;
const WEDGE_START = 0.2;
const WEDGE_STAGGER = 0.066;
const WEDGE_DUR = 0.24;
const BLACKOUT_DUR = 1.2;

// The iris's black rays are 15° wide every 30°, so the white wedges between
// them are too, centred on 15°, 45°, … (clockwise from 12 o'clock). Listed
// in collapse order: 345°, 315°, … 15°.
const WEDGE_HALF = 7.5;
const wedgeCentres = Array.from({ length: 12 }, (_, k) => 345 - 30 * k);

// A thin triangle from the iris centre out past its rim (the iris clip
// rounds it off), spanning a1→a2 degrees clockwise from 12 o'clock.
const wedgePath = (a1: number, a2: number) => {
  const R = 600;
  const pt = (a: number) => {
    const r = (a * Math.PI) / 180;
    return `${(CX + R * Math.sin(r)).toFixed(2)} ${(CY - R * Math.cos(r)).toFixed(2)}`;
  };
  return `M${CX} ${CY}L${pt(a1)}L${pt(a2)}Z`;
};

const easeInCubic = (t: number) => t * t * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export type EyeHandle = {
  /** Plays the blackout if the eye is open enough to see (or is already
   *  black, or mid-restore — then it turns back round); resolves once the
   *  screen is fully black, and holds it there. Returns null (and does
   *  nothing) if the eye is closed. */
  blackout: () => Promise<void> | null;
  /** Plays a held (or still-running) blackout backwards — wedges reopen,
   *  the disc shrinks back into the iris — and resolves once the eye is
   *  back to normal. Returns null if there's no blackout to undo. */
  restore: () => Promise<void> | null;
};

// The almond from Layer_1, with each lid's curve depth driven by `open`
// (0 = shut along CLOSED_Y, 1 = the full Figma shape). This is the lid: it
// clips both the sclera and the iris, so the iris is revealed rather than
// squashed as the eye opens.
const lidPath = (open: number) => {
  const t = CLOSED_Y - CLOSED_Y * open;
  const b = CLOSED_Y + (H - CLOSED_Y) * open;
  return (
    `M${W} ${CY}C${W} ${CY} 1341.17 ${b} ${CX} ${b}` +
    `C386.826 ${b} 0 ${CY} 0 ${CY}` +
    `C0 ${CY} 386.826 ${t} ${CX} ${t}` +
    `C1341.17 ${t} ${W} ${CY} ${W} ${CY}Z`
  );
};

/**
 * Eye — opens while `open` is true and its iris follows the cursor across
 * the whole viewport. Driven by a single rAF loop that only runs while
 * something is still moving; the lid, iris and blackout are written straight
 * to the DOM rather than through React state.
 */
export default function Eye({ open, ref }: { open: boolean; ref?: Ref<EyeHandle> }) {
  const uid = useId().replace(/:/g, "");
  const lidRef = useRef<SVGPathElement>(null);
  const irisRef = useRef<SVGGElement>(null);
  const discGroupRef = useRef<SVGGElement>(null);
  const discRef = useRef<SVGCircleElement>(null);
  const wedgeRefs = useRef<(SVGPathElement | null)[]>([]);
  const openRef = useRef(open);
  const kick = useRef<() => void>(() => {});
  const api = useRef<EyeHandle>({ blackout: () => null, restore: () => null });

  useImperativeHandle(
    ref,
    () => ({
      blackout: () => api.current.blackout(),
      restore: () => api.current.restore(),
    }),
    []
  );

  useEffect(() => {
    openRef.current = open;
    kick.current();
  }, [open]);

  useEffect(() => {
    const target = { x: 0, y: 0 };
    const iris = { x: 0, y: 0 };
    // Where the cursor would have the iris look — tracked even while the
    // gaze is held (blackout), so it can pick the cursor back up after.
    const pointer = { x: 0, y: 0 };
    let lid = 0;
    let blinkStart = -1;
    let raf = 0;
    let last = 0;

    // Blackout timeline position, 0 → BLACKOUT_DUR seconds, and which way
    // it's playing (+1 forward into black, -1 back out). `active` holds from
    // the first forward frame until a restore fully plays out — including
    // while it sits finished at full black.
    let active = false;
    let dir = 1;
    let pos = 0;
    let pending: { dir: number; resolve: () => void } | null = null;
    let fallback: ReturnType<typeof setTimeout>;

    const drawBlackout = (e: number, irisT: string) => {
      discGroupRef.current?.setAttribute("transform", irisT);
      // Grow to the farthest viewBox corner from the iris — the svg box
      // always covers the screen, so that covers the screen too.
      const ix = CX + iris.x;
      const iy = CY + iris.y;
      const rEnd = Math.hypot(Math.max(ix, W - ix), Math.max(iy, H - iy)) + 4;
      const r0 = IRIS_W / 2;
      const dp = easeInCubic(clamp01(e / DISC_DUR));
      discRef.current?.setAttribute("r", e <= 0 ? "0" : (r0 + (rEnd - r0) * dp).toFixed(2));
      wedgeCentres.forEach((c, k) => {
        const w = wedgeRefs.current[k];
        if (!w) return;
        const wp = easeInOutCubic(clamp01((e - WEDGE_START - k * WEDGE_STAGGER) / WEDGE_DUR));
        w.setAttribute(
          "d",
          wp >= 1 ? "" : wedgePath(c - WEDGE_HALF, c + WEDGE_HALF - 2 * WEDGE_HALF * wp)
        );
      });
    };

    // Reaching either end settles the blackout and resolves whoever asked
    // for that end. Back at 0 it's fully undone: disc gone, wedges whole.
    const settle = () => {
      if (dir < 0) {
        active = false;
        pos = 0;
        // Backed out with the iris centred; only now does it go back to
        // following the cursor (easing over, via the usual follow).
        target.x = pointer.x;
        target.y = pointer.y;
        start();
      } else {
        pos = BLACKOUT_DUR;
      }
      clearTimeout(fallback);
      if (pending && pending.dir === dir) {
        pending.resolve();
        pending = null;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const f = 1 - Math.exp(-FOLLOW_RATE * dt);
      const l = 1 - Math.exp(-LID_RATE * dt);
      iris.x += (target.x - iris.x) * f;
      iris.y += (target.y - iris.y) * f;
      // Held open through the blackout, even if the pointer wanders off.
      const wantOpen = openRef.current || active;
      lid += ((wantOpen ? 1 : 0) - lid) * l;
      // Snap the last sliver shut — a sub-pixel slit still antialiases into
      // a visible hairline across the screen.
      if (!wantOpen && lid < 0.004) lid = 0;

      // Blink: ease the lid shut, then back open, on top of the hover state.
      let blink = 1;
      if (blinkStart >= 0) {
        const e = (now - blinkStart) / 1000;
        if (e < BLINK_CLOSE) blink = 1 - (e / BLINK_CLOSE) ** 2;
        else if (e < BLINK_CLOSE + BLINK_OPEN)
          blink = 1 - (1 - (e - BLINK_CLOSE) / BLINK_OPEN) ** 2;
        else blinkStart = -1;
      }
      let shown = lid * blink;
      if (shown < 0.004) shown = 0;

      lidRef.current?.setAttribute("d", lidPath(shown));
      const irisT = `translate(${iris.x.toFixed(2)} ${iris.y.toFixed(2)})`;
      irisRef.current?.setAttribute("transform", irisT);

      let blackoutRunning = false;
      if (active) {
        pos = Math.min(BLACKOUT_DUR, Math.max(0, pos + dir * dt));
        drawBlackout(pos, irisT);
        if ((dir > 0 && pos >= BLACKOUT_DUR) || (dir < 0 && pos <= 0)) settle();
        else blackoutRunning = true;
      }

      const settled =
        Math.abs(target.x - iris.x) < 0.1 &&
        Math.abs(target.y - iris.y) < 0.1 &&
        Math.abs((wantOpen ? 1 : 0) - lid) < 0.001 &&
        blinkStart < 0 &&
        !blackoutRunning;
      if (settled) {
        raf = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    kick.current = start;

    // Track the pointer even while closed, so the eye opens already looking
    // at the cursor (i.e. at the nav tab that opened it).
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.x = nx * MAX_DX;
      pointer.y = ny * MAX_DY;
      if (active) return; // gaze holds still through the blackout
      target.x = pointer.x;
      target.y = pointer.y;
      if (openRef.current || lid > 0.001) start();
    };
    window.addEventListener("pointermove", onMove);
    start();

    // Only blinks an eye that's fully open — never mid-open or closing.
    let blinkTimer: ReturnType<typeof setTimeout>;
    const blinkNow = () => {
      if (!openRef.current || lid < 0.95 || active) return false;
      blinkStart = performance.now();
      start();
      return true;
    };
    const scheduleBlink = () => {
      const gap = BLINK_GAP_MIN + Math.random() * (BLINK_GAP_MAX - BLINK_GAP_MIN);
      blinkTimer = setTimeout(() => {
        if (blinkNow() && Math.random() < DOUBLE_BLINK_CHANCE) {
          blinkTimer = setTimeout(() => {
            blinkNow();
            scheduleBlink();
          }, (BLINK_CLOSE + BLINK_OPEN) * 1000 + 120);
          return;
        }
        scheduleBlink();
      }, gap * 1000);
    };
    scheduleBlink();

    // Sets the blackout playing towards one end, picking up from wherever it
    // is now (so a quick toggle turns it round mid-way instead of jumping).
    // The timeout settles it even if rAF is paused (background tab), so
    // nothing awaiting it can ever hang.
    const play = (d: number) => {
      dir = d;
      active = true;
      blinkStart = -1;
      // A superseded request is simply dropped (never resolved): whatever
      // was waiting on it — opening Archive, say — was cancelled by this.
      clearTimeout(fallback);
      return new Promise<void>((resolve) => {
        pending = { dir: d, resolve };
        const left = d > 0 ? BLACKOUT_DUR - pos : pos;
        fallback = setTimeout(() => {
          drawBlackout(d > 0 ? BLACKOUT_DUR : 0, irisRef.current?.getAttribute("transform") ?? "");
          settle();
        }, left * 1000 + 400);
        start();
      });
    };

    // Only an eye that's mostly open can black out — otherwise the caller
    // falls back to its plain version (the curtain, a background fade).
    api.current = {
      blackout: () => {
        if (active && dir > 0 && pos >= BLACKOUT_DUR) return Promise.resolve();
        if (!active && lid < 0.5) return null;
        return play(1);
      },
      // Backs out looking straight ahead. From full black the iris can just
      // be recentred (it's all black — nothing to see move); from part-way
      // it eases there.
      restore: () => {
        if (!active) return null;
        target.x = 0;
        target.y = 0;
        if (pos >= BLACKOUT_DUR) {
          iris.x = 0;
          iris.y = 0;
        }
        return play(-1);
      },
    };

    return () => {
      clearTimeout(fallback);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      clearTimeout(blinkTimer);
    };
  }, []);

  return (
    <svg
      className="eye"
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
    >
      <defs>
        <clipPath id={`${uid}-lid`}>
          <path ref={lidRef} d={lidPath(0)} />
        </clipPath>
        <clipPath id={`${uid}-iris`}>
          <ellipse cx={CX} cy={CY} rx={IRIS_W / 2} ry={CY} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}-lid)`}>
        <rect width={W} height={H} fill="#ffffff" />
      </g>
      {/* Blackout disc — between the sclera and the iris, unclipped by the
          lids. r=0 (nothing) until the blackout starts. */}
      <g ref={discGroupRef}>
        <circle ref={discRef} cx={CX} cy={CY} r={0} fill="#000000" />
      </g>
      <g clipPath={`url(#${uid}-lid)`}>
        <g ref={irisRef}>
          <g clipPath={`url(#${uid}-iris)`}>
            {/* The iris's white wedges, drawn explicitly (rather than being
                the sclera showing through) so the blackout can collapse them
                over the disc. Identical to the sclera until then. */}
            {wedgeCentres.map((c, k) => (
              <path
                key={c}
                ref={(el) => {
                  wedgeRefs.current[k] = el;
                }}
                d={wedgePath(c - WEDGE_HALF, c + WEDGE_HALF)}
                fill="#ffffff"
              />
            ))}
            <image
              href="/images/eye/iris.svg"
              x={CX - IRIS_W / 2}
              y={0}
              width={IRIS_W}
              height={H}
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
