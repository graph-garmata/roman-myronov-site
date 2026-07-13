"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import FootnoteImage from "@/components/footnote-image";

// Matches a word carrying an inline footnote marker, e.g. "studios{2},"
// -> prefix "studios", mark "{2}", suffix ",".
const MARK_RE = /^(.*?)(\{\d+\})(.*)$/;

// Footnotes that reveal a preview image on hover.
const FOOTNOTE_IMAGES: Record<string, string> = {
  "1": "/images/about-roman.png",
};

function Word({ word }: { word: string }) {
  const m = word.match(MARK_RE);
  if (!m) return <>{word}</>;
  const [, pre, mark, post] = m;
  const n = mark.slice(1, -1);
  const markEl = <span className="about-serif">{mark}</span>;
  const image = FOOTNOTE_IMAGES[n];
  return (
    <>
      {pre}
      {image ? <FootnoteImage src={image}>{markEl}</FootnoteImage> : markEl}
      {post}
    </>
  );
}

/**
 * ScrollRevealLines — reveals wrapping text one visual row at a time as it
 * scrolls into view (IntersectionObserver, once). Same line-measuring
 * technique as the case page's RevealLines, but scroll- rather than
 * mount-triggered, and words may carry an inline "{n}" footnote marker
 * (rendered small, as a superscript index).
 */
export default function ScrollRevealLines({
  text,
  className = "",
  baseDelay = 0,
  step = 0.05,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  step?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[][] | null>(null);
  const [shown, setShown] = useState(false);
  const words = text.split(/\s+/).filter(Boolean);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const compute = () => {
      const spans = el.querySelectorAll<HTMLElement>("span[data-w]");
      if (spans.length !== words.length) return;
      const rows: string[][] = [];
      let curTop: number | null = null;
      let cur: string[] = [];
      spans.forEach((s, i) => {
        const t = s.offsetTop;
        if (curTop === null || Math.abs(t - curTop) <= 1) {
          cur.push(words[i]);
          curTop = curTop ?? t;
        } else {
          rows.push(cur);
          cur = [words[i]];
          curTop = t;
        }
      });
      if (cur.length) rows.push(cur);
      setLines((prev) =>
        prev &&
        prev.length === rows.length &&
        prev.every(
          (l, i) => l.length === rows[i].length && l.every((w, j) => w === rows[i][j])
        )
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

  useEffect(() => {
    const el = containerRef.current;
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
    <span
      ref={containerRef}
      className={`reveal-lines${className ? " " + className : ""}`}
    >
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
          <span className="sreveal" key={i}>
            <span
              className={`sreveal__i${shown ? " is-shown" : ""}`}
              style={{ transitionDelay: `${baseDelay + i * step}s` }}
            >
              {line.map((w, j) => (
                <span key={j}>
                  {j > 0 ? " " : ""}
                  <Word word={w} />
                </span>
              ))}
            </span>
          </span>
        ))
      )}
    </span>
  );
}
