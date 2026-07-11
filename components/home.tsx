"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Clock from "@/components/clock";

const cases = [
  "Luminar",
  "Denormalized",
  "Specialty",
  "Prostir",
  "Estyl",
  "Volta",
  "Grail",
  "Townie",
  "Genie",
];

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Archive", href: "/archive" },
  { label: "Dump", href: "/dump" },
  { label: "Contact", href: "/contact" },
];

/**
 * Roll — hover effect: the visible word slides down out of a mask while an
 * identical duplicate slides down into its place from above.
 */
function Roll({ children }: { children: React.ReactNode }) {
  return (
    <span className="roll">
      <span className="roll__inner">
        <span className="roll__line">{children}</span>
        <span className="roll__line" aria-hidden>
          {children}
        </span>
      </span>
    </span>
  );
}

/**
 * Reveal — on-load intro: content starts hidden below a mask and slides up
 * into place. `delay` staggers each row for the cascade effect.
 */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span className="reveal">
      <span className="reveal__i" style={{ transitionDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  );
}

function CloseIcon() {
  return (
    <svg className="nav__x-icon" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M2 2 L38 38"
        stroke="currentColor"
        strokeWidth="4"
        pathLength="1"
      />
      <path
        d="M38 2 L2 38"
        stroke="currentColor"
        strokeWidth="4"
        pathLength="1"
      />
    </svg>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Trigger the reveal animation once, on the first client paint.
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`home${open ? " is-open" : ""}${loaded ? " is-loaded" : ""}`}>
      <div className="home__inner">
        {/* ---- Top band ---- */}
        <div className="grid home__top">
          <h1 className="intro">
            <Reveal delay={0.05}>Roman Myronov</Reveal>
            <Reveal delay={0.12}>Designer and Art Director</Reveal>
          </h1>

          <ul className="cases" aria-hidden={!open}>
            {cases.map((name, i) => (
              <li
                key={name}
                style={{ transitionDelay: open ? `${0.06 + i * 0.035}s` : "0s" }}
              >
                <Link
                  href={`/case/${name.toLowerCase()}`}
                  className="cases__item"
                  tabIndex={open ? 0 : -1}
                >
                  <Roll>{name}</Roll>
                </Link>
              </li>
            ))}
          </ul>

          <nav className="nav" aria-label="Primary">
            <ul>
              <li>
                <button
                  type="button"
                  className="nav__projects"
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                >
                  <span className="nav__projects-inner">
                    <Reveal delay={0.1}>
                      <Roll>Projects</Roll>
                    </Reveal>
                    <span
                      className={`nav__x${open ? " is-open" : ""}`}
                      aria-hidden
                    >
                      <CloseIcon />
                    </span>
                  </span>
                </button>
              </li>
              {navLinks.map((link, i) => (
                <li key={link.href}>
                  <Link href={link.href} className="nav__link">
                    <Reveal delay={0.16 + i * 0.06}>
                      <Roll>{link.label}</Roll>
                    </Reveal>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ---- Bottom band ---- */}
        <div className="grid home__bottom">
          <div className="clock body">
            <Reveal delay={0.2}>
              <span>Local Time</span>
            </Reveal>
            <Reveal delay={0.25}>
              <Clock />
            </Reveal>
          </div>

          <div className="colophon body">
            <div className="colophon__text">
              <Reveal delay={0.2}>
                <span>©RM</span>
              </Reveal>
              <Reveal delay={0.25}>
                <span>2026</span>
              </Reveal>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="colophon__mark"
              src="/images/duck.svg"
              alt=""
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>

      {/* ---- Centered figure ---- */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="figure" src="/images/figure.png" alt="" />
    </div>
  );
}
