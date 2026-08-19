"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Initializes Lenis smooth scrolling for the whole document. Renders nothing —
 * Lenis drives the native window scroll, so scroll listeners (e.g. the case
 * page tilt) keep working.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      // `lerp` rather than `duration` + `easing`. A duration-based tween
      // restarts from scratch on every wheel event, and Safari's trackpad
      // momentum delivers a long tail of them — so the scroll target kept
      // being re-set mid-flight, which read as sticking and tugging. Chrome
      // fires coarser wheel events, which is why it only showed in Safari.
      // lerp smooths continuously toward the target instead, so a stream of
      // small deltas is absorbed rather than restarting the animation.
      // Lower = looser and slower, higher = snappier; 0.1 is close to the
      // old coast without the re-targeting.
      lerp: 0.1,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
