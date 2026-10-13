"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// The image's width (kept in step with .about-footnote__image), and its
// minimum distance from the screen's right edge.
const IMAGE_W = 280;
const EDGE = 8;

/** A footnote's preview: a still, or a looping film (.mp4), with its shape
 *  as width / height. */
export type FootnoteMedia = { src: string; ratio: number };

/**
 * FootnoteImage — wraps a footnote mark; hovering it (or tapping it, on
 * touch) scale-reveals a preview image whose top-left corner sits on the
 * mark's centre, growing out of that corner. Where the screen is too narrow
 * for the full image to the mark's right (phones), it shrinks to fit rather
 * than leaving the mark. Rendered via a portal into <body> so it
 * escapes the reveal-lines masks (which clip overflow) that would otherwise
 * crop it. Any scroll puts it away — it's fixed to the screen, so it would
 * otherwise come loose from the mark (and on touch nothing else hides it).
 * A film plays only while shown, from its first frame each time.
 */
export default function FootnoteImage({
  children,
  media,
}: {
  children: React.ReactNode;
  media: FootnoteMedia;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = media.src.endsWith(".mp4");
  // Position is only ever set on show, and deliberately left in place on
  // hide — resetting it would snap the (still-visible, mid-transition-out)
  // image to the (0,0) CSS default, which reads as an unwanted jump to the
  // top-left corner of the viewport instead of a smooth shrink in place.
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      const left = r.left + r.width / 2;
      const width = Math.min(IMAGE_W, window.innerWidth - left - EDGE);
      setPos({ top: r.top + r.height / 2, left, width });
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
    } else {
      // Held through the scale-out, then parked.
      const t = window.setTimeout(() => video.pause(), 500);
      return () => window.clearTimeout(t);
    }
  }, [shown]);

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

  return (
    <span
      ref={ref}
      className="about-footnote"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {mounted &&
        // Rendered unconditionally (not gated on `pos`) so the element
        // already exists in the DOM before the first hover — otherwise the
        // very first show mounts the node and adds is-shown in the same
        // commit, and a just-inserted element has no prior frame to
        // transition from, so it snaps straight to scale(1) with no
        // animation instead of scaling in.
        createPortal(
          <span
            className={`about-footnote__image${isVideo ? " about-footnote__image--film" : ""}${shown ? " is-shown" : ""}`}
            style={
              pos
                ? {
                    top: pos.top,
                    left: pos.left,
                    width: pos.width,
                    height: pos.width / media.ratio,
                  }
                : undefined
            }
            aria-hidden
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={media.src}
                muted
                loop
                playsInline
                preload="auto"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.src} alt="" />
            )}
          </span>,
          document.body
        )}
    </span>
  );
}
