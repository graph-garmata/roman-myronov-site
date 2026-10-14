"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import FootnoteImage, { type FootnoteMedia } from "@/components/footnote-image";
import { splitWords } from "@/lib/typography";

// Matches a word carrying an inline footnote marker, e.g. "studios{2},"
// -> prefix "studios", mark "{2}", suffix ",".
const MARK_RE = /^(.*?)(\{\d+\})(.*)$/;

// Footnotes that reveal a preview on hover.
const FOOTNOTE_IMAGES: Record<string, FootnoteMedia> = {
  "1": { src: "/images/about-roman.png", ratio: 280 / 380 },
  "2": {
    src: ["fedoriv", "twid"].map((n) => `/images/footnote-agencies/${n}.webp`),
    ratio: 1,
  },
  "3": {
    src: ["noomo", "tbwa"].map((n) => `/images/footnote-agencies/${n}.webp`),
    ratio: 1,
  },
  "4": {
    src: "/images/footnote-denormalized.mp4",
    poster: "/images/footnote-denormalized-poster.jpg",
    ratio: 560 / 448,
    href: "https://denormalized.co",
  },
  "6": { src: "/images/footnote-prjctr.webp", ratio: 560 / 594, href: "https://prjctr.com" },
};

// `plain`: the measuring copy — same type, no hover preview.
function Word({ word, plain = false }: { word: string; plain?: boolean }) {
  const m = word.match(MARK_RE);
  if (!m) return <>{word}</>;
  const [, pre, mark, post] = m;
  const n = mark.slice(1, -1);
  const markEl = <span className="about-serif">{mark}</span>;
  const image = plain ? undefined : FOOTNOTE_IMAGES[n];
  return (
    <>
      {pre}
      {image ? <FootnoteImage media={image}>{markEl}</FootnoteImage> : markEl}
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
  triggerMargin = "-12%",
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  step?: number;
  /** How far above the screen's bottom edge the text must rise to reveal.
   *  Text near the page's end may never get that high — pass "0px". */
  triggerMargin?: string;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[][] | null>(null);
  const [shown, setShown] = useState(false);
  const words = splitWords(text);

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
      { rootMargin: `0px 0px ${triggerMargin} 0px` }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [triggerMargin]);

  return (
    <span
      ref={containerRef}
      className={`reveal-lines${className ? " " + className : ""}`}
    >
      <span className="reveal-lines__measure" aria-hidden ref={measureRef}>
        {words.map((w, i) => (
          // Set exactly as the shown text is (small footnote marks
          // included), and unbreakable within a word (no wrapping at
          // hyphens), so rows break where they will when shown.
          <span data-w key={i}>
            <span className="reveal-lines__word">
              <Word word={w} plain />
            </span>{" "}
          </span>
        ))}
      </span>
      {lines === null ? (
        <span className="reveal-lines__pending" aria-hidden>
          {words.join(" ")}
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
