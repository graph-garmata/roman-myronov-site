"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Clock from "@/components/clock";
import Roll from "@/components/roll";
import Reveal from "@/components/reveal";
import { ArrowIcon } from "@/components/home-button";
import ArchiveList from "@/components/archive-list";
import { caseOrder } from "@/lib/cases";

// Archive is no longer its own page — it opens as a right-side panel here.
// (The /archive route is kept as a fallback for now.)
const archiveItems = [
  { name: "Linen" },
  { name: "wcf2023" },
  { name: "Boko" },
  { name: "Specialty" },
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
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactRevealKey, setContactRevealKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const homeRef = useRef<HTMLDivElement>(null);

  // Case hover preview: a small still that tracks the cursor, top-left
  // corner pinned to the pointer (see .case-preview). Position/src are only
  // ever set on show/move and deliberately left in place on hide, same
  // reasoning as the footnote preview — resetting them would snap the
  // still-visible, mid-transition-out image back to (0,0)/blank instead of
  // letting it shrink in place. Cases without a cover yet still show the
  // (empty) frame, just with no image inside.
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState<{ top: number; left: number } | null>(null);
  const [previewShown, setPreviewShown] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const showPreview = (cover: string | undefined, x: number, y: number) => {
    setPreviewPos({ top: y, left: x });
    setPreviewSrc(cover ?? null);
    setPreviewShown(true);
  };
  const movePreview = (x: number, y: number) => setPreviewPos({ top: y, left: x });
  const hidePreview = () => setPreviewShown(false);

  // Closing the cases list should always dismiss any lingering preview,
  // even if the pointer never left the link (e.g. closed via the toggle).
  useEffect(() => {
    if (!projectsOpen) setPreviewShown(false);
  }, [projectsOpen]);

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
  }, [projectsOpen, archiveOpen, contactOpen]);

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

  // Arriving from another page's nav (e.g. /?contact=1 or /?projects=1 from
  // the Archive nav) opens the matching panel on load, then strips the flag
  // so a later refresh starts clean.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("contact") === "1") openContact();
    else if (params.get("projects") === "1") setProjectsOpen(true);
    else return;
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.hash
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Projects (left), Archive (right) and Contact are mutually exclusive — at
  // most one open at a time. Opening one while another is open slides that one
  // out first, then slides the requested one in after the swap delay.
  type Panel = "projects" | "archive" | "contact";
  const openPanel = (name: Panel) => {
    if (name === "projects") setProjectsOpen(true);
    else if (name === "archive") setArchiveOpen(true);
    else openContact();
  };
  const togglePanel = (name: Panel, isOpen: boolean) => {
    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (isOpen) {
      if (name === "projects") setProjectsOpen(false);
      else if (name === "archive") setArchiveOpen(false);
      else setContactOpen(false);
      return;
    }
    if (projectsOpen || archiveOpen || contactOpen) {
      setProjectsOpen(false);
      setArchiveOpen(false);
      setContactOpen(false);
      swapTimer.current = setTimeout(() => openPanel(name), PANEL_SWAP_DELAY);
    } else {
      openPanel(name);
    }
  };

  const toggleProjects = () => togglePanel("projects", projectsOpen);
  const toggleArchive = () => togglePanel("archive", archiveOpen);
  const toggleContact = () => togglePanel("contact", contactOpen);

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
      className={`home${projectsOpen ? " is-open" : ""}${archiveOpen ? " is-archive-open" : ""}${contactOpen ? " is-contact-open" : ""}${loaded ? " is-loaded" : ""}`}
    >
      <div className="home__inner">
        <h1 className="intro">
          <Reveal delay={0.05}>Roman Myronov</Reveal>
          <Reveal delay={0.12}>Designer and Art Director</Reveal>
        </h1>

        {/* Archive's lead line — the same copy the /archive page shows,
            revealed with the shared mask animation when Archive opens. Mounted
            only while open so the reveal replays on every open. */}
        <p className="archive-lead-home" aria-hidden={!archiveOpen}>
          {archiveOpen && (
            <Reveal delay={0.05}>A collection of old but precious works</Reveal>
          )}
        </p>

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
                onMouseEnter={(e) => showPreview(c.cover, e.clientX, e.clientY)}
                onMouseMove={(e) => movePreview(e.clientX, e.clientY)}
                onMouseLeave={hidePreview}
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

        {/* Archive — slides in from the right (mirror of the Projects list on
            the left). Kept mounted so its internal scroll/distortion is ready;
            hidden and non-interactive until opened. */}
        <div className="archive-panel" aria-hidden={!archiveOpen}>
          <ArchiveList items={archiveItems} open={archiveOpen} />
        </div>

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
            <li>
              <Link href="/about" className="nav__link">
                <Reveal delay={0.16}>
                  <Roll>About</Roll>
                </Reveal>
              </Link>
            </li>
            <li>
              <button
                type="button"
                className={`nav__toggle${archiveOpen ? " is-open" : ""}`}
                aria-expanded={archiveOpen}
                onClick={toggleArchive}
              >
                <span className="nav__toggle-inner">
                  <Reveal delay={0.22}>
                    <Roll>Archive</Roll>
                  </Reveal>
                  <span
                    className={`nav__x${archiveOpen ? " is-open" : ""}`}
                    aria-hidden
                  >
                    <CloseIcon />
                  </span>
                </span>
              </button>
            </li>
            <li>
              <Link href="/dump" className="nav__link">
                <Reveal delay={0.28}>
                  <Roll>Dump</Roll>
                </Reveal>
              </Link>
            </li>
            <li>
              <button
                type="button"
                className={`nav__toggle${contactOpen ? " is-open" : ""}`}
                aria-expanded={contactOpen}
                onClick={toggleContact}
              >
                <span className="nav__toggle-inner">
                  <Reveal delay={0.34}>
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
      <img className="figure" src="/images/figure.webp" alt="" />

      {/* Rendered via a portal into <body> so it escapes .home's
          overflow:hidden regardless of stacking context, same reasoning as
          FootnoteImage. Kept unconditionally mounted (once client-side) so
          the very first hover has a prior frame to scale in from. */}
      {mounted &&
        createPortal(
          <span
            className={`case-preview${previewShown ? " is-shown" : ""}`}
            style={previewPos ? { top: previewPos.top, left: previewPos.left } : undefined}
            aria-hidden
          >
            {previewSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewSrc} alt="" />
            )}
          </span>,
          document.body
        )}
    </div>
  );
}
