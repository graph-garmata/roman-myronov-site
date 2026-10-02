"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Reveal from "@/components/reveal";
import RevealLines from "@/components/reveal-lines";
import HomeButton, { CaseNav } from "@/components/home-button";
import { getAdjacentCases } from "@/lib/cases";
import type { CaseCell, CaseStudy, CaseVideo } from "@/lib/cases";

// How far outside the viewport a block still counts as "near" — used to skip
// tilt math for anything far off-screen. Generous so tilt-in/out is never
// abrupt; it costs nothing to keep a block eligible, since the tilt loop only
// writes when the angle actually changes.
const NEAR_MARGIN = "800px 0px 800px 0px";

// Mounting a Vimeo embed is a burst: the iframe loads Vimeo's player, fetches
// a manifest and spins up a decoder. That happens well before the block is on
// screen, so the burst doesn't land as you scroll into it.
const VIMEO_MOUNT_MARGIN = "1200px 0px 1200px 0px";

// Playback, by contrast, runs only while a block is actually in the viewport —
// no margin at all. Nothing decodes off screen, so at most one or two films are
// ever running instead of every one you happen to be scrolling past. Applies to
// self-hosted <video> and Vimeo alike.
const PLAY_MARGIN = "0px";

// How long a mounted embed survives after leaving the mount band, so a scroll
// that overshoots and comes straight back doesn't have to refetch it.
const RECLAIM_MS = 5000;

/** Makes the sound toggle trail the cursor while it's over the film, so the
 * whole frame becomes the click target; on leave it eases back to its corner.
 * Position is a translate from the button's resting spot, computed from layout
 * offsets (unaffected by the transform itself). Mouse/trackpad only — on touch
 * the button just stays put. */
function useMagnetic(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const btn = ref.current;
    const area = btn?.parentElement;
    if (!btn || !area) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0, ty = 0; // target offset
    let x = 0, y = 0; // current offset
    let raf = 0;

    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) {
        x = tx;
        y = ty;
        raf = 0;
      } else raf = requestAnimationFrame(tick);
      btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = area.getBoundingClientRect();
      // Rect can be slightly scaled by the block's tilt; map back to layout px.
      const sx = area.offsetWidth / r.width || 1;
      const sy = area.offsetHeight / r.height || 1;
      tx = (e.clientX - r.left) * sx - (btn.offsetLeft + btn.offsetWidth / 2);
      ty = (e.clientY - r.top) * sy - (btn.offsetTop + btn.offsetHeight / 2);
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };

    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    return () => {
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      btn.style.transform = "";
    };
  }, [ref]);
}

/** Plays a <video> only while it's actually in the viewport; pauses it
 * otherwise — so having many videos on a page doesn't mean many simultaneous
 * decodes. The poster holds the frame until it starts. */
function VideoCell({ video }: { video: CaseVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const soundRef = useRef<HTMLButtonElement>(null);
  useMagnetic(soundRef);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else {
          el.pause();
          // Scrolling away is the same as turning it off — otherwise sound
          // jumps back at you when the block returns.
          setMuted(true);
        }
      },
      { rootMargin: PLAY_MARGIN }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <video
        ref={ref}
        className="case-video"
        poster={video.poster}
        loop
        // Autoplay is only allowed while muted, so playback always starts
        // silent; `sound` films can then be unmuted by the viewer.
        muted={muted}
        playsInline
        preload="metadata"
        aria-label={video.alt ?? ""}
      >
        <source src={video.webm} type="video/webm" />
        <source src={video.mp4} type="video/mp4" />
      </video>
      {video.sound && (
        <button
          ref={soundRef}
          type="button"
          className="case-sound"
          aria-pressed={!muted}
          aria-label={muted ? "Unmute video" : "Mute video"}
          onClick={() => setMuted((m) => !m)}
        >
          {muted ? "Sound on" : "Sound off"}
        </button>
      )}
    </>
  );
}

/** Vimeo background-loop embed. Mounting and playback are driven by two
 * separate bands (see VIMEO_MOUNT_MARGIN / PLAY_MARGIN): the iframe is
 * built well ahead of arrival so its setup cost lands off screen, playback
 * runs only while the block is actually in the viewport, and the embed is
 * torn out of the document once it's comfortably away. A case page that's
 * never opened still loads no Vimeo JS at all. */
function VimeoCell({ vimeoId, alt }: { vimeoId: string; alt?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let mounted = false;
    let wantPlay = false;
    let loading = false;
    let player: import("@vimeo/player").default | null = null;
    let reclaim = 0;

    const create = () => {
      if (player || loading) return;
      loading = true;
      import("@vimeo/player").then(({ default: Player }) => {
        loading = false;
        // The user may have scrolled clear of the mount band while the SDK
        // was loading — don't mount an embed nobody is heading toward.
        if (cancelled || !mounted) return;
        player = new Player(el, {
          id: Number(vimeoId),
          background: true,
          autoplay: wantPlay,
          loop: true,
          muted: true,
        });
        // `background` implies autoplay, so hold it until the play band.
        if (!wantPlay) player.pause().catch(() => {});
      });
    };

    // Tears the iframe out of the document, not just the playback. Pausing
    // leaves a live cross-origin subframe behind, and the compositor pays
    // for every one of those on every scroll — with a dozen films on the
    // page that is the difference between smooth and sticky.
    const teardown = () => {
      const p = player;
      player = null;
      p?.destroy().catch(() => {});
    };

    const mountIo = new IntersectionObserver(
      ([entry]) => {
        mounted = entry.isIntersecting;
        window.clearTimeout(reclaim);
        if (mounted) create();
        else reclaim = window.setTimeout(teardown, RECLAIM_MS);
      },
      { rootMargin: VIMEO_MOUNT_MARGIN }
    );

    const playIo = new IntersectionObserver(
      ([entry]) => {
        wantPlay = entry.isIntersecting;
        if (wantPlay) player?.play().catch(() => {});
        else player?.pause().catch(() => {});
      },
      { rootMargin: PLAY_MARGIN }
    );

    mountIo.observe(el);
    playIo.observe(el);
    return () => {
      cancelled = true;
      window.clearTimeout(reclaim);
      mountIo.disconnect();
      playIo.disconnect();
      teardown();
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
  const { previous, next } = getAdjacentCases(study.slug);

  // The image container starts below whichever is taller — the problem
  // description or the talents list — by 52px on desktop or 104px on mobile
  // (matches the .case-hero mobile breakpoint in globals.css). Both live in
  // the fixed hero, so their viewport-relative bottoms are scroll-independent.
  useLayoutEffect(() => {
    const measure = () => {
      const d = descRef.current?.getBoundingClientRect().bottom ?? 0;
      const t = talentsRef.current?.getBoundingClientRect().bottom ?? 0;
      const gap = window.matchMedia("(max-width: 700px)").matches ? 104 : 52;
      setOffset(Math.max(d, t) + gap);
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
          // Only pay for a compositor layer while the block is in play —
          // a permanent will-change on every block means the browser holds
          // a texture for the whole page, and the tall screenshot blocks
          // are big enough for that to hurt.
          el.classList.toggle("is-near", entry.isIntersecting);
        });
      },
      { rootMargin: NEAR_MARGIN }
    );
    blocks.forEach((b) => io.observe(b));

    const REVEAL_MS = 950;
    const start = performance.now();
    let raf = 0;
    // Last angle written per block, so we can skip no-op style writes.
    const written = new WeakMap<HTMLElement, string>();

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rt = Math.min(1, (performance.now() - start) / REVEAL_MS);
      const eased = 1 - Math.pow(1 - rt, 3);
      const revealing = rt < 1;

      // Two passes. Reading a rect after writing a transform forces a
      // synchronous style recalc, so interleaving them costs one layout
      // flush per block per frame — fine at five blocks, not at thirty.
      const active: { block: HTMLElement; isRevealBlock: boolean; top: number; height: number }[] = [];
      blocks.forEach((block) => {
        const isRevealBlock = block.dataset.reveal !== undefined;
        if (!near.has(block) && !(isRevealBlock && revealing)) return;
        const r = block.getBoundingClientRect();
        active.push({ block, isRevealBlock, top: r.top, height: r.height });
      });

      active.forEach(({ block, isRevealBlock, top, height }) => {
        const progress = Math.max(-1, Math.min(1, (top + height / 2 - vh / 2) / vh));
        let angle = progress * 6;
        if (isRevealBlock) angle = 90 * (1 - eased) + angle * eased;
        // 0.1° is under the visible threshold, and quantizing lets us drop
        // writes entirely when the angle hasn't really moved. Each write
        // re-rasterizes the block, which is expensive when it wraps a
        // cross-origin Vimeo iframe.
        const next = `perspective(1400px) rotateX(${angle.toFixed(1)}deg)`;
        if (written.get(block) === next) return;
        written.set(block, next);
        block.style.transform = next;
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
                  // Inline so it beats the 16:10 fallback in the stylesheet.
                  style={block.ratio ? { aspectRatio: block.ratio } : undefined}
                >
                  <Media cell={block.cell} />
                </div>
              );
            }
            if (block.type === "grid") {
              return (
                <div className="case-block case-block--grid case-tilt" key={i}>
                  {block.cells.map((cell, j) => (
                    <div
                      className="case-block__cell"
                      key={j}
                      // Each cell holds its own source shape; the row's height
                      // follows from the cells rather than being locked ahead.
                      style={cell.ratio ? { aspectRatio: cell.ratio } : undefined}
                    >
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

      {/* ---- Fixed Home + Previous/Next: reveal on load, draw an arrow on hover ---- */}
      <HomeButton />
      <CaseNav
        previousHref={`/case/${previous.slug}`}
        nextHref={`/case/${next.slug}`}
      />
    </div>
  );
}
