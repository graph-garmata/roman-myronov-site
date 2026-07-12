import Link from "next/link";
import Reveal from "@/components/reveal";

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

/**
 * Fixed Home button: reveals on load, draws a back-arrow on hover. White +
 * mix-blend-mode:difference so it reads correctly on any background (black on
 * the white About page, white over dark imagery on case pages).
 */
export default function HomeButton() {
  return (
    <Link href="/" className="case-home">
      <span className="case-home__arrow" aria-hidden>
        <ArrowIcon />
      </span>
      <span className="case-home__label">
        <Reveal delay={0.05}>Home</Reveal>
      </span>
    </Link>
  );
}
