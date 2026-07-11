"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/reveal";
import RevealLines from "@/components/reveal-lines";
import type { CaseCell, CaseStudy, CaseVideo } from "@/lib/cases";

// How far outside the viewport a block still counts as "near" — used both to
// start/stop playback (video/Vimeo) and to skip tilt math for anything far
// off-screen. Generous so play/pause and tilt-in/out never happen abruptly.
const NEAR_MARGIN = "800px 0px 800px 0px";

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

/** Plays a <video> only while it's near the viewport; pauses it otherwise —
 * so having many videos on a page doesn't mean many simultaneous decodes. */
function VideoCell({ video }: { video: CaseVideo }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { rootMargin: NEAR_MARGIN }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="case-video"
      poster={video.poster}
      loop
      muted
      playsInline
      preload="metadata"
      aria-label={video.alt ?? ""}
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}

/** Vimeo background-loop embed. The Player SDK (and the iframe it injects)
 * is only created once the block is near the viewport, then paused/resumed
 * on visibility — so far-off or unopened case pages never load Vimeo's
 * embed JS or start a video stream for nothing. */
function VimeoCell({ vimeoId, alt }: { vimeoId: string; alt?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let visible = false;
    let loading = false;
    let player: import("@vimeo/player").default | null = null;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (player) {
            player.play().catch(() => {});
          } else if (!loading) {
            loading = true;
            import("@vimeo/player").then(({ default: Player }) => {
              loading = false;
              // The user may have scrolled away while the SDK was loading —
              // re-check visibility before starting playback.
              if (cancelled) return;
              player = new Player(el, {
                id: Number(vimeoId),
                background: true,
                autoplay: visible,
                loop: true,
                muted: true,
              });
            });
          }
        } else {
          player?.pause().catch(() => {});
        }
      },
      { rootMargin: NEAR_MARGIN }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      player?.destroy();
    };
  }, [vimeoId]);

  return <div className="case-vimeo" ref={ref} role="img" aria-label={alt ?? ""} />;
}

function Media({ cell }: { cell: CaseCell }) {
  if (cell.kind === "video") return <VideoCell video={cell.video} />;
  if (cell.kind === "vimeo") return <VimeoCell vimeoId={cell.vimeoId} alt={cell.alt} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={cell.src} alt={cell.alt ?? ""} loading="lazy" decoding="async" />;
}

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
  }, [study]);

  // Image motion:
  //  - every block tilts slightly on the X axis as it enters/leaves view;
  //  - the first block additionally flips in from 90° (edge-on, invisible)
  //    on load, then settles into its scroll tilt.
  // Blocks are queried once (not per frame) and an IntersectionObserver
  // tracks which ones are near the viewport, so tilt math is skipped for
  // anything far away — this is what keeps the cost flat as more blocks
  // (images/videos) are added to a case page.
  useEffect(() => {
    const blocks = Array.from(
      document.querySelectorAll<HTMLElement>(".case-tilt")
    );
    if (blocks.length === 0) return;

    const near = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) near.add(el);
          else near.delete(el);
        });
      },
      { rootMargin: NEAR_MARGIN }
    );
    blocks.forEach((b) => io.observe(b));

    const REVEAL_MS = 950;
    const start = performance.now();
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rt = Math.min(1, (performance.now() - start) / REVEAL_MS);
      const eased = 1 - Math.pow(1 - rt, 3);
      const revealing = rt < 1;

      blocks.forEach((block) => {
        const isRevealBlock = block.dataset.reveal !== undefined;
        if (!near.has(block) && !(isRevealBlock && revealing)) return;
        const r = block.getBoundingClientRect();
        const progress = Math.max(
          -1,
          Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)
        );
        let angle = progress * 6;
        if (isRevealBlock) angle = 90 * (1 - eased) + angle * eased;
        block.style.transform = `perspective(1400px) rotateX(${angle.toFixed(2)}deg)`;
      });

      // Keep animating through the first-block entrance regardless of
      // scroll; afterwards, only re-run when the user actually scrolls.
      if (revealing) raf = requestAnimationFrame(update);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [study, offset]);

  return (
    <div className="case">
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
                <div
                  className="case-block case-block--full case-tilt"
                  key={i}
                  data-reveal={i === 0 ? "" : undefined}
                >
                  <Media cell={block.cell} />
                </div>
              );
            }
            if (block.type === "grid") {
              return (
                <div className="case-block case-block--grid case-tilt" key={i}>
                  {block.cells.map((cell, j) => (
                    <div className="case-block__cell" key={j}>
                      <Media cell={cell} />
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
