"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CaseStudy } from "@/lib/cases";

export default function CasePage({ study }: { study: CaseStudy }) {
  const descRef = useRef<HTMLDivElement>(null);
  const talentsRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

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
  }, []);

  return (
    <div className="case">
      {/* ---- Fixed hero (background) ---- */}
      <div className="case-hero">
        <h1 className="case-name">{study.name}</h1>
        <p className="case-scope">{study.scope}</p>

        <span className="case-label case-label--talents">Talents involved</span>
        <div className="case-talents" ref={talentsRef}>
          {study.talents.map((t) => (
            <p key={t.name}>
              {t.name} ({t.role})
            </p>
          ))}
        </div>

        <span className="case-label case-label--problem">Problem</span>
        <div className="case-desc" ref={descRef}>
          {study.problem}
        </div>
      </div>

      {/* ---- Scrolling image container (over the hero) ---- */}
      <div className="case-scroll" style={{ paddingTop: offset }}>
        <div className="case-container">
          {study.blocks.map((block, i) => {
            if (block.type === "full") {
              return (
                <div className="case-block case-block--full" key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={block.src} alt={block.alt ?? ""} />
                </div>
              );
            }
            if (block.type === "grid") {
              return (
                <div className="case-block case-block--grid" key={i}>
                  {block.images.map((img, j) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={j} src={img.src} alt={img.alt ?? ""} />
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

      {/* ---- Fixed Home (always visible, blends over imagery) ---- */}
      <Link href="/" className="case-home">
        Home
      </Link>
    </div>
  );
}
