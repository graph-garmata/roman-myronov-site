"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Reveal from "@/components/reveal";

/**
 * RevealLines — reveals wrapping text one visual row at a time. It measures
 * where the text breaks (via a hidden copy), then renders each rendered line
 * in its own Reveal mask with a staggered delay. Re-measures on resize.
 */
export default function RevealLines({
  text,
  baseDelay = 0,
  step = 0.05,
}: {
  text: string;
  baseDelay?: number;
  step?: number;
}) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[] | null>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const compute = () => {
      const spans = el.querySelectorAll<HTMLElement>("span[data-w]");
      if (spans.length !== words.length) return;
      const rows: string[] = [];
      let curTop: number | null = null;
      let cur: string[] = [];
      spans.forEach((s, i) => {
        const t = s.offsetTop;
        if (curTop === null || Math.abs(t - curTop) <= 1) {
          cur.push(words[i]);
          curTop = curTop ?? t;
        } else {
          rows.push(cur.join(" "));
          cur = [words[i]];
          curTop = t;
        }
      });
      if (cur.length) rows.push(cur.join(" "));
      setLines((prev) =>
        prev && prev.length === rows.length && prev.every((l, i) => l === rows[i])
          ? prev
          : rows
      );
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    if ("fonts" in document) document.fonts.ready.then(compute);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span className="reveal-lines">
      <span className="reveal-lines__measure" aria-hidden ref={measureRef}>
        {words.map((w, i) => (
          <span data-w key={i}>
            {w}{" "}
          </span>
        ))}
      </span>
      {lines === null ? (
        <span className="reveal-lines__pending" aria-hidden>
          {text}
        </span>
      ) : (
        lines.map((line, i) => (
          <Reveal key={i} delay={baseDelay + i * step}>
            {line}
          </Reveal>
        ))
      )}
    </span>
  );
}
