"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/reveal";
import RevealLines from "@/components/reveal-lines";
import type { CaseStudy } from "@/lib/cases";

function ArrowIcon() {
  return (
    <svg
      className="case-home__arrow-icon"
      viewBox="0 0 38.1928 36.3373"
      fill="none"
      aria-hidden
    >
      {/* shaft (drawn from the right toward the tip) */}
      <path
        d="M38.19 18.5 L3.53 18.5"
        stroke="currentColor"
        strokeWidth="4"
        pathLength="1"
      />
      {/* arrowhead */}
      <path
        d="M19.69 1.42 L2.83 18.15 L19.69 34.92"
        stroke="currentColor"
        strokeWidth="4"
        pathLength="1"
      />
    </svg>
  );
}

export default function CasePage({ study }: { study: CaseStudy }) {
  const descRef = useRef<HTMLDivElement>(null);
  const talentsRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // The image container starts 52px below whichever is taller — the problem
  // description or the talents list. Both live in the fixed hero, so their
  // viewport-relative bottoms are scroll-independent.
  useLayoutEffect(() => {
    const measure = () => {
      const d = descRef.current?.getBoundingClientRect().bottom ?? 0;
      const t = talentsRef.current?.getBoundingClientRect().bottom ?? 0;
      setOffset(Math.max(d, t) + 52);
    };
    measure();
    window.addEventListener("resize", measure);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure);
    }
    return () => window.removeEventListener("resize", measure);
  }, [study]);

  // Trigger the reveal on the first client paint. rAF gives a smooth start
  // when visible; the timeout guarantees it fires even in a background tab
  // (where rAF is paused) so the text can never get stuck hidden.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setLoaded(true));
    const timer = setTimeout(() => setLoaded(true), 120);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  // Slight 3D tilt: each image rotates on the X axis as it enters and leaves
  // the viewport, sitting flat when centered.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>(".case-tilt").forEach((block) => {
        const r = block.getBoundingClientRect();
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        const clamped = Math.max(-1, Math.min(1, progress));
        const angle = (clamped * 6).toFixed(2);
        block.style.transform = `perspective(1400px) rotateX(${angle}deg)`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [study, offset]);

  return (
    <div className={`case${loaded ? " is-loaded" : ""}`}>
      {/* ---- Fixed hero (background) ---- */}
      <div className="case-hero">
        <h1 className="case-name">
          <Reveal delay={0.05}>{study.name}</Reveal>
        </h1>
        <p className="case-scope">
          <RevealLines text={study.scope} baseDelay={0.1} step={0.05} />
        </p>

        <span className="case-label case-label--talents">
          <Reveal delay={0.12}>Talents involved</Reveal>
        </span>
        <div className="case-talents" ref={talentsRef}>
          {study.talents.map((t, i) => (
            <Reveal key={t.name} delay={0.18 + i * 0.05}>
              {t.name} ({t.role})
            </Reveal>
          ))}
        </div>

        <span className="case-label case-label--problem">
          <Reveal delay={0.12}>Problem</Reveal>
        </span>
        <div className="case-desc" ref={descRef}>
          <RevealLines text={study.problem} baseDelay={0.18} step={0.04} />
        </div>
      </div>

      {/* ---- Scrolling image container (over the hero) ---- */}
      <div className="case-scroll" style={{ paddingTop: offset }}>
        <div className="case-container">
          {study.blocks.map((block, i) => {
            if (block.type === "full") {
              return (
                <div className="case-block case-block--full case-tilt" key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={block.src} alt={block.alt ?? ""} />
                </div>
              );
            }
            if (block.type === "grid") {
              return (
                <div className="case-block case-block--grid case-tilt" key={i}>
                  {block.images.map((img, j) => (
                    <div className="case-block__cell" key={j}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.alt ?? ""} />
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <div className="case-block case-block--copy" key={i}>
                <span className="case-block__label">{block.label}</span>
                <p className="case-block__text">{block.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Fixed Home: draws a back-arrow on hover, blends over imagery ---- */}
      <Link href="/" className="case-home">
        <span className="case-home__arrow" aria-hidden>
          <ArrowIcon />
        </span>
        <span className="case-home__label">Home</span>
      </Link>
    </div>
  );
}
