"use client";

import { useEffect, useState } from "react";

/**
 * Reveal — on-load intro: content starts hidden below a mask and slides up
 * into place. Each Reveal triggers itself on mount (rAF, with a timeout
 * fallback for background tabs), so it animates reliably no matter when it
 * mounts — including lines produced later by RevealLines. `delay` staggers
 * the cascade via transition-delay.
 */
export default function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const timer = setTimeout(() => setShown(true), 150);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  return (
    <span className="reveal">
      <span
        className={`reveal__i${shown ? " is-shown" : ""}`}
        style={{ transitionDelay: `${delay}s` }}
      >
        {children}
      </span>
    </span>
  );
}
