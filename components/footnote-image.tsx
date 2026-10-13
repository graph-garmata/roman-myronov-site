"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// The image's width (kept in step with .about-footnote__image), and its
// minimum distance from the screen's edges.
const IMAGE_W = 280;
const EDGE = 8;
// How long each still holds in a switching preview.
const SWITCH_MS = 250;

/** A footnote's preview: a still, a looping film (.mp4, with its first
 *  frame as `poster`), or a list of stills it switches between, with its
 *  shape as width / height — and optionally a site the mark links to. */
export type FootnoteMedia = {
  src: string | string[];
  ratio: number;
  poster?: string;
  href?: string;
};

/**
 * FootnoteImage — wraps a footnote mark; hovering it (or tapping it, on
 * touch) scale-reveals a preview whose top corner sits on the mark's
 * centre, growing out of that corner toward the roomier side: rightward
 * (top-left corner on the mark) from the screen's left half, leftward
 * (top-right corner) from its right half. Where even that side is narrower
 * than the full image (phones), it shrinks to fit rather than leaving the
 * mark. Rendered via a portal into <body> so it
 * escapes the reveal-lines masks (which clip overflow) that would otherwise
 * crop it. Any scroll puts it away — it's fixed to the screen, so it would
 * otherwise come loose from the mark (and on touch nothing else hides it).
 * A film plays only while shown, from its first frame each time; a list of
 * stills hard-cuts from one to the next while shown, from the first.
 *
 * With an `href` the mark is also a link (new tab). On touch the first tap
 * only shows the preview, as on the other marks; a tap while it's shown
 * follows the link.
 */
export default function FootnoteImage({
  children,
  media,
}: {
  children: React.ReactNode;
  media: FootnoteMedia;
}) {
  const ref = useRef<HTMLElement>(null);
  // Whether the preview was already up when the current tap began.
  const tapOnShown = useRef<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frames = Array.isArray(media.src) ? media.src : null;
  const isVideo = !frames && (media.src as string).endsWith(".mp4");
  const [frame, setFrame] = useState(0);
  // Whether the film has put a frame of its own on screen yet.
  const [filmReady, setFilmReady] = useState(false);
  // Position is only ever set on show, and deliberately left in place on
  // hide — resetting it would snap the (still-visible, mid-transition-out)
  // image to the (0,0) CSS default, which reads as an unwanted jump to the
  // top-left corner of the viewport instead of a smooth shrink in place.
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    origin: string;
  } | null>(null);
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      const x = r.left + r.width / 2;
      const rightward = x <= window.innerWidth / 2;
      const room = rightward ? window.innerWidth - x - EDGE : x - EDGE;
      const width = Math.min(IMAGE_W, room);
      setPos({
        top: r.top + r.height / 2,
        left: rightward ? x : x - width,
        width,
        origin: rightward ? "top left" : "top right",
      });
    }
    setShown(true);
  };
  const hide = () => setShown(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shown) {
      video.currentTime = 0;
      video.play().catch(() => {});
      if (!filmReady) {
        // Until its first frame is presented the poster still stands in —
        // a film that's never played can paint nothing on its first show.
        const ready = () => setFilmReady(true);
        if (typeof video.requestVideoFrameCallback === "function") {
          video.requestVideoFrameCallback(ready);
        } else {
          (video as HTMLVideoElement).addEventListener("playing", ready, { once: true });
        }
      }
    } else {
      // Held through the scale-out, then parked.
      const t = window.setTimeout(() => video.pause(), 500);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  // Restarts from the first still on each show; on hide the current one
  // stays put through the scale-out.
  useEffect(() => {
    if (!frames || !shown) return;
    setFrame(0);
    const t = window.setInterval(
      () => setFrame((f) => (f + 1) % frames.length),
      SWITCH_MS
    );
    return () => window.clearInterval(t);
  }, [frames, shown]);

  useEffect(() => {
    if (!shown) return;
    const opts = { passive: true, capture: true };
    window.addEventListener("scroll", hide, opts);
    window.addEventListener("wheel", hide, opts);
    window.addEventListener("touchmove", hide, opts);
    return () => {
      window.removeEventListener("scroll", hide, opts);
      window.removeEventListener("wheel", hide, opts);
      window.removeEventListener("touchmove", hide, opts);
    };
  }, [shown]);

  const preview =
    mounted &&
    // Rendered unconditionally (not gated on `pos`) so the element
    // already exists in the DOM before the first hover — otherwise the
    // very first show mounts the node and adds is-shown in the same
    // commit, and a just-inserted element has no prior frame to
    // transition from, so it snaps straight to scale(1) with no
    // animation instead of scaling in.
    createPortal(
      <span
        className={`about-footnote__image${frames ? " about-footnote__image--switch" : ""}${isVideo ? " about-footnote__image--film" : ""}${shown ? " is-shown" : ""}`}
        style={
          pos
            ? {
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.width / media.ratio,
                transformOrigin: pos.origin,
              }
            : undefined
        }
        aria-hidden
      >
        {frames ? (
          // All stacked and loaded up front, so each cut is instant.
          frames.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className={i === frame ? "is-on" : undefined} />
          ))
        ) : isVideo ? (
          <>
            {media.poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.poster} alt="" />
            )}
            <video
              ref={videoRef}
              className={filmReady ? "is-ready" : undefined}
              src={media.src as string}
              muted
              loop
              playsInline
              preload="auto"
            />
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.src as string} alt="" />
        )}
      </span>,
      document.body
    );

  if (media.href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        className="about-footnote about-footnote--link"
        href={media.href}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={show}
        onMouseLeave={hide}
        onPointerDown={(e) => {
          tapOnShown.current = e.pointerType === "mouse" ? null : shown;
        }}
        onClick={(e) => {
          if (tapOnShown.current === false) {
            e.preventDefault();
            show();
          }
          tapOnShown.current = null;
        }}
      >
        {children}
        {preview}
      </a>
    );
  }

  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className="about-footnote"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {preview}
    </span>
  );
}
