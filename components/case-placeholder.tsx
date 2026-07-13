"use client";

import Reveal from "@/components/reveal";
import RevealLines from "@/components/reveal-lines";
import Roll from "@/components/roll";
import HomeButton, { CaseNav } from "@/components/home-button";
import { getAdjacentCases, type CaseMeta } from "@/lib/cases";

const BEHANCE_URL = "https://www.behance.net/";

export default function CasePlaceholder({ meta }: { meta: CaseMeta }) {
  const { previous, next } = getAdjacentCases(meta.slug);

  return (
    <div className="case">
      <div className="case-hero">
        <h1 className="case-name">
          <Reveal delay={0.05}>{meta.name}</Reveal>
        </h1>
        <p className="case-scope">
          <RevealLines
            text="Whoopsie. The project is underway. Working hard to let you see it here"
            baseDelay={0.1}
            step={0.05}
          />
        </p>

        <span className="case-label case-label--problem">
          <Reveal delay={0.12}>Meanwhile you can find it here</Reveal>
        </span>
        <a
          className="case-behance"
          href={BEHANCE_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Reveal delay={0.16}>
            <Roll>Behance</Roll>
          </Reveal>
        </a>
      </div>

      <HomeButton />
      <CaseNav
        previousHref={`/case/${previous.slug}`}
        nextHref={`/case/${next.slug}`}
      />
    </div>
  );
}
