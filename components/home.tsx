"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Clock from "@/components/clock";
import Roll from "@/components/roll";
import Reveal from "@/components/reveal";
import { ArrowIcon } from "@/components/home-button";
import { caseOrder } from "@/lib/cases";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Archive", href: "/archive" },
  { label: "Dump", href: "/dump" },
];

const contactLinks: {
  label: string;
  href: string;
  download?: boolean;
  direction?: "down";
}[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/roman-myronov/" },
  { label: "CV", href: "/cv.pdf", download: true, direction: "down" },
  { label: "Behance", href: "https://www.behance.net/graph_garmata" },
  { label: "Denormalized", href: "https://denormalized.co" },
];

// When swapping between Cases and Contact, the open panel slides out for
// this long before the requested one slides in — a slight overlap so the
// swap reads as one motion rather than a hard stop. (Slide-out is 0.65s.)
const PANEL_SWAP_DELAY = 450;

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
  // Projects and Contact are independent now — both can be open at once
  // (Contact's link list makes room for Projects' case list by shifting
  // over to column 3; see the CSS for .contact-links / .contact-cta).
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactRevealKey, setContactRevealKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const homeRef = useRef<HTMLDivElement>(null);

  // .home should never actually scroll — it's the fixed, full-viewport
  // shell. The off-screen lists and the nav's always-present × icon
  // (positioned past its label) both sit outside the visible box by
  // design, which is enough for some browsers' scroll-anchoring heuristic
  // to nudge scrollLeft on a layout change (e.g. toggling a panel). Stomp
  // it back to 0 whenever that could happen.
  useLayoutEffect(() => {
    const el = homeRef.current;
    if (el) {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    }
  }, [projectsOpen, contactOpen]);

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

  // Cases and Contact are mutually exclusive. Clicking one while the other
  // is open closes that one first, then opens the requested panel once the
  // slide-out has (mostly) cleared.
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (swapTimer.current) clearTimeout(swapTimer.current);
    },
    []
  );

  // Bump the reveal key on every open so "Any inquiries?"/the email replay
  // their mask reveal each time, instead of only on first mount.
  const openContact = () => {
    setContactRevealKey((k) => k + 1);
    setContactOpen(true);
  };

  const toggleProjects = () => {
    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (projectsOpen) {
      setProjectsOpen(false);
    } else if (contactOpen) {
      setContactOpen(false);
      swapTimer.current = setTimeout(() => setProjectsOpen(true), PANEL_SWAP_DELAY);
    } else {
      setProjectsOpen(true);
    }
  };

  const toggleContact = () => {
    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (contactOpen) {
      setContactOpen(false);
    } else if (projectsOpen) {
      setProjectsOpen(false);
      swapTimer.current = setTimeout(openContact, PANEL_SWAP_DELAY);
    } else {
      openContact();
    }
  };

  // Clock/colophon slide from their resting spot (row 3, bottom-aligned —
  // the grid's bottom edge) up to row 2 when Contact opens. The distance
  // depends on their own rendered height, so it's measured against a pair
  // of zero-size anchors placed at row 2 in the same grid, rather than
  // guessed as a fixed constant.
  const clockRef = useRef<HTMLDivElement>(null);
  const colophonRef = useRef<HTMLDivElement>(null);
  const clockAnchorRef = useRef<HTMLSpanElement>(null);
  const colophonAnchorRef = useRef<HTMLSpanElement>(null);
  const [clockShift, setClockShift] = useState({ x: 0, y: 0 });
  const [colophonShift, setColophonShift] = useState({ x: 0, y: 0 });

  // Measure with offsetTop/offsetLeft (the layout box, which ignores CSS
  // transforms) rather than getBoundingClientRect (which reflects any
  // in-flight transition). That makes the shift a pure function of the grid
  // geometry, so it can be read at any time — even mid-animation — and never
  // drifts after a few quick open/close cycles.
  const measure = useCallback(() => {
    const c = clockRef.current;
    const ca = clockAnchorRef.current;
    if (c && ca)
      setClockShift({ x: ca.offsetLeft - c.offsetLeft, y: ca.offsetTop - c.offsetTop });
    const p = colophonRef.current;
    const pa = colophonAnchorRef.current;
    if (p && pa)
      setColophonShift({ x: pa.offsetLeft - p.offsetLeft, y: pa.offsetTop - p.offsetTop });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure);
    }
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div
      ref={homeRef}
      className={`home${projectsOpen ? " is-open" : ""}${contactOpen ? " is-contact-open" : ""}${loaded ? " is-loaded" : ""}`}
    >
      <div className="home__inner">
        <h1 className="intro">
          <Reveal delay={0.05}>Roman Myronov</Reveal>
          <Reveal delay={0.12}>Designer and Art Director</Reveal>
        </h1>

        <ul className="cases" aria-hidden={!projectsOpen}>
          {caseOrder.map((c, i) => (
            <li
              key={c.slug}
              style={{ transitionDelay: projectsOpen ? `${0.06 + i * 0.035}s` : "0s" }}
            >
              <Link
                href={`/case/${c.slug}`}
                className="cases__item"
                tabIndex={projectsOpen ? 0 : -1}
              >
                <Roll>{c.name}</Roll>
              </Link>
            </li>
          ))}
        </ul>

        {/* Same slide-from-left slot as .cases — attaches at column 1 by
            default, or column 3 if the case list is already open (making
            room instead of overlapping it). */}
        <ul className="contact-links" aria-hidden={!contactOpen}>
          {contactLinks.map((link, i) => (
            <li
              key={link.label}
              style={{ transitionDelay: contactOpen ? `${0.06 + i * 0.035}s` : "0s" }}
            >
              <a
                href={link.href}
                className="cases__item"
                tabIndex={contactOpen ? 0 : -1}
                {...(link.download
                  ? { download: true }
                  : { target: "_blank", rel: "noreferrer" })}
              >
                <span className="cases__item-inner">
                  <Roll>{link.label}</Roll>
                  <span className="cases__arrow" aria-hidden>
                    <ArrowIcon flipped down={link.direction === "down"} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <nav className="nav" aria-label="Primary">
          <ul>
            <li>
              <button
                type="button"
                className={`nav__toggle${projectsOpen ? " is-open" : ""}`}
                aria-expanded={projectsOpen}
                onClick={toggleProjects}
              >
                <span className="nav__toggle-inner">
                  <Reveal delay={0.1}>
                    <Roll>Projects</Roll>
                  </Reveal>
                  <span
                    className={`nav__x${projectsOpen ? " is-open" : ""}`}
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
            <li>
              <button
                type="button"
                className={`nav__toggle${contactOpen ? " is-open" : ""}`}
                aria-expanded={contactOpen}
                onClick={toggleContact}
              >
                <span className="nav__toggle-inner">
                  <Reveal delay={0.16 + navLinks.length * 0.06}>
                    <Roll>Contact</Roll>
                  </Reveal>
                  <span className={`nav__x${contactOpen ? " is-open" : ""}`} aria-hidden>
                    <CloseIcon />
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </nav>

        <div
          className="clock body"
          ref={clockRef}
          style={contactOpen ? { transform: `translate(${clockShift.x}px, ${clockShift.y}px)` } : undefined}
        >
          <Reveal delay={0.2}>
            <span>Local Time</span>
          </Reveal>
          <Reveal delay={0.25}>
            <Clock />
          </Reveal>
        </div>
        <span
          ref={clockAnchorRef}
          aria-hidden
          className="contact-anchor"
          style={{ gridColumn: "1 / span 1", gridRow: 2, alignSelf: "start" }}
        />

        <div
          className="colophon body"
          ref={colophonRef}
          style={
            contactOpen
              ? { transform: `translate(${colophonShift.x}px, ${colophonShift.y}px)` }
              : undefined
          }
        >
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
        <span
          ref={colophonAnchorRef}
          aria-hidden
          className="contact-anchor contact-anchor--colophon"
          style={{ gridRow: 2, alignSelf: "start" }}
        />

        <div className="contact-cta" aria-hidden={!contactOpen}>
          <p className="contact-cta__label">
            <Reveal key={`label-${contactRevealKey}`} delay={0.1}>
              Any inquiries?
            </Reveal>
          </p>
          <a
            className="email-link"
            href="mailto:roman@denormalized.co"
            tabIndex={contactOpen ? 0 : -1}
          >
            <Reveal key={`email-${contactRevealKey}`} delay={0.18}>
              <Roll>roman@denormalized.co</Roll>
            </Reveal>
          </a>
        </div>
      </div>

      {/* ---- Centered figure ---- */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="figure" src="/images/figure.png" alt="" />
    </div>
  );
}
