"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Clock from "@/components/clock";
import Roll from "@/components/roll";
import Reveal from "@/components/reveal";
import { caseOrder } from "@/lib/cases";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Archive", href: "/archive" },
  { label: "Dump", href: "/dump" },
  { label: "Contact", href: "/contact" },
];

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

  // Trigger the reveal animation once, on the first client paint. rAF gives a
  // smooth start when visible; the timeout guarantees it fires even in a
  // background tab (where rAF is paused) so text can't get stuck hidden.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setLoaded(true));
    const timer = setTimeout(() => setLoaded(true), 120);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
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
            {caseOrder.map((c, i) => (
              <li
                key={c.slug}
                style={{ transitionDelay: open ? `${0.06 + i * 0.035}s` : "0s" }}
              >
                <Link
                  href={`/case/${c.slug}`}
                  className="cases__item"
                  tabIndex={open ? 0 : -1}
                >
                  <Roll>{c.name}</Roll>
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
