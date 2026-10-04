"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Clock from "@/components/clock";
import Roll from "@/components/roll";
import Reveal from "@/components/reveal";
import { ArrowIcon } from "@/components/home-button";
import ArchiveList from "@/components/archive-list";
import Eye, { type EyeHandle } from "@/components/eye";
import { usePageCover } from "@/components/page-transition";
import { visibleCases } from "@/lib/cases";

// Archive is no longer its own page — it opens as a right-side panel here.
// (The /archive route is kept as a fallback for now.)
const archiveItems = [
  { name: "Linen" },
  { name: "wcf2023" },
  { name: "Boko" },
  { name: "Clever" },
  { name: "RMJM" },
  { name: "Soho" },
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

// Closing Archive waits this long — for its words to slide out (0.5s) —
// before the eye starts backing out of its blackout, so the white words and
// the reopening white wedges never overlap.
const ARCHIVE_RESTORE_DELAY = 420;

// The load reveal is two-step: each black label box draws in left→right
// (.hl::before, staggered by --box-delay), then its copy rises out of the
// mask once the box is mostly drawn — BOX_LEAD seconds after the box starts.
const BOX_LEAD = 0.45;
const boxDelay = (d: number) => ({ "--box-delay": `${d}s` }) as CSSProperties;

function CloseIcon() {
  return (
    <svg className="nav__x-icon" viewBox="0 0 38 38" fill="none" aria-hidden>
      <path
        d="M0.62 1 L37.39 37.77"
        stroke="currentColor"
        strokeWidth="4"
        pathLength="1"
      />
      <path
        d="M37.39 1 L0.62 37.77"
        stroke="currentColor"
        strokeWidth="4"
        pathLength="1"
      />
    </svg>
  );
}

// The name and title, one label box per line. Where the column is too narrow
// for a phrase (mobile), it's measured into the rows it actually wraps to and
// each row gets its own box — a box is exactly one line tall, so wrapped copy
// would otherwise spill out below it.
const INTRO = ["Roman Myronov", "Designer and Art Director"];

function Intro() {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [rows, setRows] = useState(INTRO);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const compute = () => {
      const next: string[] = [];
      el.querySelectorAll<HTMLElement>(".intro__measure-line").forEach((line) => {
        let top = 0;
        let cur: string[] = [];
        line.querySelectorAll<HTMLElement>("span").forEach((w) => {
          if (cur.length && Math.abs(w.offsetTop - top) > 1) {
            next.push(cur.join(" "));
            cur = [];
          }
          if (!cur.length) top = w.offsetTop;
          cur.push(w.textContent!.trim());
        });
        if (cur.length) next.push(cur.join(" "));
      });
      setRows((prev) =>
        prev.length === next.length && prev.every((r, i) => r === next[i]) ? prev : next
      );
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    if ("fonts" in document) document.fonts.ready.then(compute);
    return () => ro.disconnect();
  }, []);

  return (
    <h1 className="intro">
      <span className="intro__measure" aria-hidden ref={measureRef}>
        {INTRO.map((phrase) => (
          <span key={phrase} className="intro__measure-line">
            {phrase.split(" ").map((w, i) => (
              <span key={i}>{w} </span>
            ))}
          </span>
        ))}
      </span>
      {/* Stacked top-over-bottom, like .nav li, so a box's stroke never
          covers the descenders of the row above. */}
      {rows.map((row, i) => (
        <span
          key={i}
          className="hl hl--line"
          style={{ ...boxDelay(0.05 + i * 0.07), zIndex: rows.length - i }}
        >
          <Reveal delay={0.05 + i * 0.07 + BOX_LEAD}>{row}</Reveal>
        </span>
      ))}
    </h1>
  );
}

// The case hover preview only exists for a real hovering pointer.
const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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

  // Case hover preview: a small looping film that tracks the cursor, top-left
  // corner pinned to the pointer (see .case-preview). Position/slug are only
  // ever set on show/move and deliberately left in place on hide, same
  // reasoning as the footnote preview — resetting them would snap the
  // still-visible, mid-transition-out film back to (0,0)/blank instead of
  // letting it shrink in place. Cases without a preview yet still show the
  // (empty) frame, just with nothing inside.
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState<{ top: number; left: number } | null>(null);
  const [previewShown, setPreviewShown] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const showPreview = (slug: string, x: number, y: number) => {
    if (!canHover()) return;
    setPreviewPos({ top: y, left: x });
    setPreviewSlug(slug);
    setPreviewShown(true);
  };

  // Every case's film sits stacked in the frame, so sliding between cases
  // swaps instantly instead of waiting on a fresh load. They're only mounted
  // once the cases list is first opened, so Home itself doesn't pull ~2MB of
  // video nobody may hover — and never on touch, which has no hover at all
  // (a tap's emulated mouseenter would only flash the frame mid-navigation).
  const [previewsArmed, setPreviewsArmed] = useState(false);
  const previewVideos = useRef(new Map<string, HTMLVideoElement>());

  // Each hover plays its film from the start; the rest stay paused. On hide
  // the film keeps running through the scale-out, then pauses.
  useEffect(() => {
    const videos = previewVideos.current;
    videos.forEach((v, slug) => {
      if (slug !== previewSlug) v.pause();
    });
    const v = previewSlug ? videos.get(previewSlug) : undefined;
    if (!v) return;
    if (previewShown) {
      v.currentTime = 0;
      v.play().catch(() => {});
      return;
    }
    const t = setTimeout(() => v.pause(), 500);
    return () => clearTimeout(t);
  }, [previewSlug, previewShown]);
  const movePreview = (x: number, y: number) => setPreviewPos({ top: y, left: x });
  const hidePreview = () => setPreviewShown(false);

  // Hovering any nav tab or case link opens the eye. Leaving closes it after
  // a short grace period, so sliding between stacked items doesn't blink it
  // shut.
  // Mouse only — touch has no hover to anchor the open/close to; there the
  // eye only opens for a blackout (see blackout() in components/eye.tsx).
  const [eyeOpen, setEyeOpen] = useState(false);
  const eyeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eyeHover = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (eyeTimer.current) clearTimeout(eyeTimer.current);
      setEyeOpen(true);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (eyeTimer.current) clearTimeout(eyeTimer.current);
      eyeTimer.current = setTimeout(() => setEyeOpen(false), 120);
    },
  };
  useEffect(
    () => () => {
      if (eyeTimer.current) clearTimeout(eyeTimer.current);
    },
    []
  );

  // Leaving Home by a link plays the eye's blackout in place of the curtain
  // (opening the eye first if it isn't hovered open); the curtain then
  // reveals the next page as usual.
  const eyeRef = useRef<EyeHandle>(null);
  const [leaving, setLeaving] = useState(false);
  usePageCover(() => {
    const done = eyeRef.current?.blackout() ?? null;
    if (done) {
      setLeaving(true);
      setPreviewShown(false);
    }
    return done;
  });

  // Closing the cases list should always dismiss any lingering preview,
  // even if the pointer never left the link (e.g. closed via the toggle).
  useEffect(() => {
    if (!projectsOpen) setPreviewShown(false);
    else if (canHover()) setPreviewsArmed(true);
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

  // Archive is a black takeover. Opening it plays the eye's blackout first
  // (opening the eye if it isn't hovered open — touch, keyboard) and only
  // brings the list in once the screen is black; closing plays the blackout
  // backwards, so Home reappears through the iris. `archiveArmed` covers the wait
  // for the blackout, so the tab already reads as open and a second click
  // cancels it; the token drops a blackout that was cancelled mid-way.
  const [archiveArmed, setArchiveArmed] = useState(false);
  const archiveToken = useRef(0);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
    },
    []
  );
  const openArchive = () => {
    if (restoreTimer.current) clearTimeout(restoreTimer.current);
    const token = ++archiveToken.current;
    const done = eyeRef.current?.blackout();
    if (!done) {
      setArchiveOpen(true);
      return;
    }
    setArchiveArmed(true);
    done.then(() => {
      if (token !== archiveToken.current) return;
      setArchiveArmed(false);
      setArchiveOpen(true);
    });
  };
  const closeArchive = () => {
    archiveToken.current++;
    setArchiveArmed(false);
    const wasOpen = archiveOpen;
    setArchiveOpen(false);
    if (restoreTimer.current) clearTimeout(restoreTimer.current);
    // Still mid-blackout (the list never came in)? Turn straight round.
    if (!wasOpen) eyeRef.current?.restore();
    else
      restoreTimer.current = setTimeout(
        () => eyeRef.current?.restore(),
        ARCHIVE_RESTORE_DELAY
      );
  };
  const archiveActive = archiveOpen || archiveArmed;

  // Projects (left), Archive (right) and Contact are mutually exclusive — at
  // most one open at a time. Opening one while another is open slides that one
  // out first, then slides the requested one in after the swap delay.
  type Panel = "projects" | "archive" | "contact";
  const openPanel = (name: Panel) => {
    if (name === "projects") setProjectsOpen(true);
    else if (name === "archive") openArchive();
    else openContact();
  };
  const togglePanel = (name: Panel, isOpen: boolean) => {
    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (isOpen) {
      if (name === "projects") setProjectsOpen(false);
      else if (name === "archive") closeArchive();
      else setContactOpen(false);
      return;
    }
    if (projectsOpen || archiveActive || contactOpen) {
      setProjectsOpen(false);
      if (archiveActive) closeArchive();
      setContactOpen(false);
      swapTimer.current = setTimeout(() => openPanel(name), PANEL_SWAP_DELAY);
    } else {
      openPanel(name);
    }
  };

  const toggleProjects = () => togglePanel("projects", projectsOpen);
  const toggleArchive = () => togglePanel("archive", archiveActive);
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
      className={`home${projectsOpen ? " is-open" : ""}${archiveOpen ? " is-archive-open" : ""}${contactOpen ? " is-contact-open" : ""}${loaded ? " is-loaded" : ""}${leaving ? " is-leaving" : ""}`}
    >
      <div className="home__inner">
        <Intro />

        {/* Archive's lead line — the same copy the /archive page shows,
            revealed with the shared mask animation when Archive opens. Mounted
            only while open so the reveal replays on every open. */}
        <p className="archive-lead-home" aria-hidden={!archiveOpen}>
          {archiveOpen && (
            <Reveal delay={0.05}>A collection of old but precious works</Reveal>
          )}
        </p>

        <ul className="cases" aria-hidden={!projectsOpen}>
          {visibleCases.map((c, i) => (
            <li
              key={c.slug}
              style={{ transitionDelay: projectsOpen ? `${0.06 + i * 0.035}s` : "0s" }}
            >
              <Link
                href={`/case/${c.slug}`}
                className="cases__item"
                tabIndex={projectsOpen ? 0 : -1}
                {...eyeHover}
                onMouseEnter={(e) => showPreview(c.slug, e.clientX, e.clientY)}
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
                {...eyeHover}
                className={`nav__toggle${projectsOpen ? " is-open" : ""}`}
                aria-expanded={projectsOpen}
                onClick={toggleProjects}
                style={boxDelay(0.1)}
              >
                <span className="nav__toggle-inner">
                  <Reveal delay={0.1 + BOX_LEAD}>
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
              <Link href="/about" {...eyeHover} className="nav__link" style={boxDelay(0.16)}>
                <Reveal delay={0.16 + BOX_LEAD}>
                  <Roll>About</Roll>
                </Reveal>
              </Link>
            </li>
            <li>
              <button
                type="button"
                {...eyeHover}
                className={`nav__toggle${archiveActive ? " is-open" : ""}`}
                aria-expanded={archiveActive}
                onClick={toggleArchive}
                style={boxDelay(0.22)}
              >
                <span className="nav__toggle-inner">
                  <Reveal delay={0.22 + BOX_LEAD}>
                    <Roll>Archive</Roll>
                  </Reveal>
                  <span
                    className={`nav__x${archiveActive ? " is-open" : ""}`}
                    aria-hidden
                  >
                    <CloseIcon />
                  </span>
                </span>
              </button>
            </li>
            <li>
              <Link href="/dump" {...eyeHover} className="nav__link" style={boxDelay(0.28)}>
                <Reveal delay={0.28 + BOX_LEAD}>
                  <Roll>Dump</Roll>
                </Reveal>
              </Link>
            </li>
            <li>
              <button
                type="button"
                {...eyeHover}
                className={`nav__toggle${contactOpen ? " is-open" : ""}`}
                aria-expanded={contactOpen}
                onClick={toggleContact}
                style={boxDelay(0.34)}
              >
                <span className="nav__toggle-inner">
                  <Reveal delay={0.34 + BOX_LEAD}>
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
          className="clock body hl"
          ref={clockRef}
          style={{
            ...boxDelay(0.2),
            ...(contactOpen
              ? { transform: `translate(${clockShift.x}px, ${clockShift.y}px)` }
              : undefined),
          }}
        >
          <Reveal delay={0.2 + BOX_LEAD}>
            <span>Local Time</span>
          </Reveal>
          <Reveal delay={0.25 + BOX_LEAD}>
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
          className="colophon body hl"
          ref={colophonRef}
          style={{
            ...boxDelay(0.2),
            ...(contactOpen
              ? { transform: `translate(${colophonShift.x}px, ${colophonShift.y}px)` }
              : undefined),
          }}
        >
          <div className="colophon__text">
            <Reveal delay={0.2 + BOX_LEAD}>
              <span>©RM</span>
            </Reveal>
            <Reveal delay={0.25 + BOX_LEAD}>
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

      {/* ---- Eye: opens behind the figure while a nav tab or case is hovered ---- */}
      {/* Kept shut over an Archive opened without the blackout (touch,
          keyboard) — a held blackout keeps itself open regardless. */}
      <Eye ref={eyeRef} open={eyeOpen && !archiveOpen} />

      {/* ---- Centered figure ---- */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="figure" src="/images/figure-cutout.webp" alt="" />

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
            {previewsArmed &&
              visibleCases.map(
                (c) =>
                  c.preview && (
                    <video
                      key={c.slug}
                      ref={(el) => {
                        if (el) previewVideos.current.set(c.slug, el);
                        else previewVideos.current.delete(c.slug);
                      }}
                      className={c.slug === previewSlug ? "is-active" : undefined}
                      poster={c.preview.poster}
                      muted
                      loop
                      playsInline
                      preload="auto"
                    >
                      <source src={c.preview.webm} type="video/webm" />
                      <source src={c.preview.mp4} type="video/mp4" />
                    </video>
                  )
              )}
          </span>,
          document.body
        )}
    </div>
  );
}
