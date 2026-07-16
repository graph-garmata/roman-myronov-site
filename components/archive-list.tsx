"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import Lenis from "lenis";

// However few items exist, repeat them enough that one lap is comfortably
// longer than the viewport — a list of two or three items still reads as a
// real scroll, not an obvious tiny loop.
const MIN_LAP_ITEMS = 12;

function buildLap(items: string[]) {
  if (items.length === 0) return [];
  const repeats = Math.max(1, Math.ceil(MIN_LAP_ITEMS / items.length));
  return Array.from({ length: repeats }, () => items).flat();
}

// ── Scroll distortion ─────────────────────────────────────────────────────
// The WHOLE list scales vertically as one block — no per-line wave. As a
// scroll begins the column briefly COMPRESSES (scaleY < 1, the wind-up),
// then STRETCHES (scaleY > 1) while it's moving, then settles back to 1 — a
// single squash-then-stretch motion, exactly the storyboard. The pivot is
// the CURSOR: transform-origin tracks the pointer's Y, so the line under the
// cursor stays put while everything above/below it scales around it.
//
// `stretch` (the scaleY) is a spring pulled toward a velocity-based target
// (1 + STRETCH_PER_VELOCITY·(speed − floor)). On its own that only ever
// stretches; the compress comes from an ONSET KICK — the moment a scroll
// starts (speed rises from rest), the spring is given a downward shove
// (ONSET_KICK, scaled by how hard the gesture is). That shove carries
// `stretch` below 1 first (the wind-up), then the spring pulls it up to the
// stretch target and back to 1.
//
// STRETCH_SPEED_FLOOR is what makes the *ending bite*: once the scroll slows
// past it, the target is already 1, so the stretch collapses home crisply
// instead of trailing Lenis's long, slow velocity coast. Friction is set just
// below the overshoot threshold, so the return ends on a tiny recoil (a
// fraction below 1, then home) — a snap, not the previous soft ooze — with no
// secondary wobble.
const STRETCH_PER_VELOCITY = 0.019; // stretch target gained per px/frame of speed
const STRETCH_SPEED_FLOOR = 5; // speed below which there's no stretch (bites the tail)
const MAX_STRETCH = 0.7; // ceiling (scaleY ≤ 1 + this)
const MAX_SQUASH = 0.24; // floor   (scaleY ≥ 1 − this)
const SPRING_STIFFNESS = 0.18; // how hard the spring pulls toward its target
const SPRING_FRICTION = 0.3; // damping — just above the overshoot threshold
const ONSET_KICK = 0.22; // downward shove at gesture start → the compress
const ONSET_REF_SPEED = 22; // speed (px/frame) at which the kick is at full strength
const ONSET_ARM_SPEED = 0.5; // re-arm the kick once the list is this slow again
const ONSET_FIRE_SPEED = 3; // speed that counts as a new gesture starting
const REST_EPS = 0.0015; // below this (and near-still), park and clear

/**
 * ArchiveList — an endlessly scrollable list. One lap (the items, repeated
 * until comfortably long) is rendered three times back to back; a Lenis
 * instance scoped to this element (rather than the window) drives its
 * scroll. Each frame the scroll wraps by one lap when it reaches the
 * leading/trailing copy (so it loops forever), and the whole column is
 * squashed/stretched around the cursor per the model documented above.
 */
export default function ArchiveList({ items }: { items: string[] }) {
  const lap = buildLap(items);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stretchRef = useRef<HTMLDivElement>(null);
  const lapRef = useRef<HTMLDivElement>(null);
  const lapHeight = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);
  // Cursor Y in viewport pixels — the pivot for the scale. Defaults to the
  // list's vertical centre until the pointer first moves over it.
  const cursorY = useRef(0);

  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    const lapEl = lapRef.current;
    if (!scroller || !lapEl) return;
    lapHeight.current = lapEl.offsetHeight;
    const rect = scroller.getBoundingClientRect();
    if (!cursorY.current) cursorY.current = rect.top + rect.height / 2;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(lapHeight.current, { immediate: true });
    } else {
      scroller.scrollTop = lapHeight.current;
    }
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure);
    }
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const content = stretchRef.current;
    if (!scroller || !content) return;

    const lenis = new Lenis({
      wrapper: scroller,
      content,
      // Without this it defaults to `window`, so this instance would react
      // to wheel/touch input anywhere on the page (fighting the global
      // instance in components/smooth-scroll.tsx) instead of only when the
      // cursor is over the list itself.
      eventsTarget: scroller,
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    lenisRef.current = lenis;
    measure();

    const onPointerMove = (e: PointerEvent) => {
      cursorY.current = e.clientY;
    };
    scroller.addEventListener("pointermove", onPointerMove);

    // Seamless loop: teleport back by one lap whenever the scroll crosses into
    // the leading or trailing copy. `scrollTo(..., { immediate: true })` looks
    // like the obvious tool for this, but it calls Lenis's internal reset()
    // and snaps velocity to exactly 0 — mid-fling that reads as the whole list
    // suddenly slamming to a stop. So instead this shifts every absolute
    // position field Lenis tracks (including its in-flight tween) by the same
    // delta; velocity is a difference of those fields, so it's preserved and
    // the coast continues straight through the teleport.
    const shiftScrollBy = (delta: number) => {
      const internals = lenis as unknown as {
        animatedScroll: number;
        targetScroll: number;
        animate: { from: number; to: number; value: number };
      };
      internals.animatedScroll += delta;
      internals.targetScroll += delta;
      internals.animate.from += delta;
      internals.animate.to += delta;
      internals.animate.value += delta;
      scroller.scrollTop += delta;
    };
    lenis.on("scroll", ({ scroll }: Lenis) => {
      const h = lapHeight.current;
      if (!h) return;
      if (scroll <= 0) shiftScrollBy(h);
      else if (scroll >= h * 2) shiftScrollBy(-h);
    });

    let rafId = 0;
    let stretch = 1; // current scaleY of the whole column
    let springVel = 0; // its velocity (for the spring)
    let armed = true; // ready to fire an onset kick on the next gesture
    let parked = false;
    const raf = (time: number) => {
      lenis.raf(time);

      const speed = Math.abs(lenis.velocity);

      // Onset kick: the frame a fresh gesture starts, shove the spring down so
      // the column compresses before it stretches. Re-arms once the list has
      // slowed back down, so every distinct scroll gets its own wind-up.
      if (armed && speed > ONSET_FIRE_SPEED) {
        springVel -= ONSET_KICK * Math.min(speed / ONSET_REF_SPEED, 1);
        armed = false;
      } else if (speed < ONSET_ARM_SPEED) {
        armed = true;
      }

      const target =
        1 +
        Math.min(
          Math.max(0, speed - STRETCH_SPEED_FLOOR) * STRETCH_PER_VELOCITY,
          MAX_STRETCH
        );
      springVel += (target - stretch) * SPRING_STIFFNESS;
      springVel *= 1 - SPRING_FRICTION;
      stretch += springVel;
      if (stretch > 1 + MAX_STRETCH) stretch = 1 + MAX_STRETCH;
      else if (stretch < 1 - MAX_SQUASH) stretch = 1 - MAX_SQUASH;

      if (
        Math.abs(stretch - 1) < REST_EPS &&
        Math.abs(springVel) < REST_EPS &&
        speed < 0.02
      ) {
        if (!parked) {
          content.style.transform = "";
          stretch = 1;
          springVel = 0;
          parked = true;
        }
        rafId = requestAnimationFrame(raf);
        return;
      }
      parked = false;

      // Pivot the scale on the cursor: the origin is the pointer's position
      // expressed in the content's own coordinates (its top is at scroll 0,
      // which sits `scrollTop` above the wrapper's top edge).
      const rect = scroller.getBoundingClientRect();
      const originY = cursorY.current - rect.top + scroller.scrollTop;
      content.style.transformOrigin = `50% ${originY.toFixed(1)}px`;
      content.style.transform = `scaleY(${stretch.toFixed(4)})`;

      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      scroller.removeEventListener("pointermove", onPointerMove);
      lenisRef.current = null;
      lenis.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure]);

  if (lap.length === 0) return null;

  return (
    <div className="archive-list" ref={scrollerRef} data-lenis-prevent>
      <div className="archive-list__stretch" ref={stretchRef}>
        {[0, 1, 2].map((copy) => (
          <div
            className="archive-list__lap"
            ref={copy === 1 ? lapRef : undefined}
            key={copy}
          >
            {lap.map((name, i) => (
              <p className="archive-list__item" key={`${name}-${i}`}>
                {name}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
