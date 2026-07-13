"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * FootnoteImage — wraps a footnote mark; hovering it scale-reveals a preview
 * image (anchored top-left, per the Figma spec) positioned just under the
 * mark. Rendered via a portal into <body> so it escapes the reveal-lines
 * masks (which clip overflow) that would otherwise crop it.
 */
export default function FootnoteImage({
  children,
  src,
}: {
  children: React.ReactNode;
  src: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Position is only ever set on show, and deliberately left in place on
  // hide — resetting it would snap the (still-visible, mid-transition-out)
  // image to the (0,0) CSS default, which reads as an unwanted jump to the
  // top-left corner of the viewport instead of a smooth shrink in place.
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 8, left: r.left });
    setShown(true);
  };
  const hide = () => setShown(false);

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
            className={`about-footnote__image${shown ? " is-shown" : ""}`}
            style={pos ? { top: pos.top, left: pos.left } : undefined}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
          </span>,
          document.body
        )}
    </span>
  );
}
