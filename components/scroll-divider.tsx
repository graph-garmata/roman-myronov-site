"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ScrollDivider — a horizontal rule that draws in left-to-right (trim-path
 * style, via scaleX) when it scrolls into view. IntersectionObserver, once.
 */
export default function ScrollDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`about-divider${shown ? " is-shown" : ""}`}
      aria-hidden
    />
  );
}
