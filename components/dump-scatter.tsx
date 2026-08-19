"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export type DumpMedia = {
  _id: string;
  type: "image" | "video";
  url: string;
  caption?: string | null;
};

type Placement = {
  leftPct: number;
  topPct: number;
  rotate: number;
  width: number;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// Matches --ease in globals.css so the lightbox reads like the rest of the site.
const EASE = [0.65, 0, 0.15, 1] as const;

// Must mirror the max-width/max-height on .dump-focus__flier media in
// globals.css — the opening flight is computed from them rather than measured,
// so the two have to agree.
const FOCUS_MAX_W = (vw: number) => Math.min(vw * 0.88, 1600);
const FOCUS_MAX_H = (vh: number) => vh * 0.86;

/**
 * The transform that would drop the centred lightbox media back exactly over
 * its thumbnail in the pile. Motion animates *from* this to identity on open
 * and back to it on close, so the item reads as travelling out of the pile and
 * returning to the same spot.
 *
 * Everything is derived rather than measured: the flier is always centred in
 * the viewport, and its rendered size is a contain-fit of the media's intrinsic
 * size — so there's no dependency on the lightbox having been laid out yet.
 */
type Flight = { x: number; y: number; scale: number; rotate: number };

function computeFlight(
  source: HTMLElement,
  placement: Placement,
): Flight | null {
  const media = source.querySelector("img, video");
  const intrinsicW =
    media instanceof HTMLImageElement
      ? media.naturalWidth
      : media instanceof HTMLVideoElement
        ? media.videoWidth
        : 0;
  const intrinsicH =
    media instanceof HTMLImageElement
      ? media.naturalHeight
      : media instanceof HTMLVideoElement
        ? media.videoHeight
        : 0;
  // Media hasn't reported a size yet — skip the flight rather than animate
  // from a bogus scale; the lightbox still opens, just without travelling.
  if (!intrinsicW || !intrinsicH) return null;

  const fit = Math.min(
    1,
    FOCUS_MAX_W(window.innerWidth) / intrinsicW,
    FOCUS_MAX_H(window.innerHeight) / intrinsicH,
  );
  const rect = source.getBoundingClientRect();
  return {
    // A rect's centre is unchanged by rotation about that centre, so this is
    // the thumbnail's true centre even though it sits at an angle.
    x: rect.left + rect.width / 2 - window.innerWidth / 2,
    y: rect.top + rect.height / 2 - window.innerHeight / 2,
    // placement.width is the thumbnail's unrotated layout width, which is what
    // the bounding rect's width is not.
    scale: placement.width / (intrinsicW * fit),
    rotate: placement.rotate,
  };
}

// Bounded ranges keep the pile "casually scattered" rather than chaotic:
// rotation stays gentle, sizes stay legible. Tuned for desktop — mobile gets a
// sparser treatment later (see the Dump spec).
function makePlacement(): Placement {
  return {
    leftPct: rand(4, 72),
    topPct: rand(6, 68),
    rotate: rand(-15, 15),
    width: rand(180, 340),
  };
}

export default function DumpScatter({ items }: { items: DumpMedia[] }) {
  // Placements are generated *after* mount (never during SSR) so server and
  // client markup match, then reshuffled on every refresh — intentional.
  const [placements, setPlacements] = useState<Placement[] | null>(null);
  // Per-item z-index. The most recently touched item bumps above the rest so
  // you can dig through the pile and uncover what's underneath.
  const [zById, setZById] = useState<Record<string, number>>({});
  // Highest z handed out so far. A ref rather than state: it's only read inside
  // the pointer handler, so keeping it out of render lets bringToFront do one
  // plain state update instead of nesting setZById inside a setTopZ updater —
  // updaters must be pure, and StrictMode double-invokes them in dev.
  const topZ = useRef(0);
  // The item currently opened in the lightbox, if any, plus the transform that
  // maps the centred lightbox back onto its thumbnail (see computeFlight).
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  // The thumbnail stays hidden until the lightbox has finished flying home, so
  // the item never appears in two places at once.
  const [hiddenId, setHiddenId] = useState<string | null>(null);
  const focused = items.find((it) => it._id === focusedId) ?? null;

  useEffect(() => {
    setPlacements(items.map(makePlacement));
    setZById(Object.fromEntries(items.map((it, i) => [it._id, i + 1])));
    topZ.current = items.length;
  }, [items]);

  const bringToFront = (id: string) => {
    // Already on top — bail out so the second click of a double-click doesn't
    // trigger a pointless re-render.
    if (zById[id] === topZ.current) return;
    const next = (topZ.current += 1);
    setZById((m) => ({ ...m, [id]: next }));
  };

  // Double-click lifts an item out of the pile and into the lightbox;
  // double-clicking it again (or Escape, or the backdrop) sends it home.
  const toggleFocus = (
    id: string,
    source: HTMLElement,
    placement: Placement,
  ) => {
    if (focusedId === id) {
      setFocusedId(null);
      return;
    }
    // Set the flight before the id so the lightbox mounts already knowing where
    // to start from — otherwise its first frame lands at the centre.
    setFlight(computeFlight(source, placement));
    setHiddenId(id);
    setFocusedId(id);
  };

  useEffect(() => {
    if (!focusedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedId]);

  if (items.length === 0) {
    return (
      <div className="dump-canvas dump-canvas--empty">
        <p className="lead">
          Nothing dumped yet. Upload images or short videos as “Dump item” in
          the Studio and they’ll scatter here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="dump-canvas">
        {placements &&
          items.map((item, i) => {
            const p = placements[i];
            return (
              <motion.div
                key={item._id}
                className="dump-item"
                drag
                dragMomentum={false}
                // onPointerDown fires immediately on touch, before a drag starts,
                // so a plain tap also brings the item to the front.
                onPointerDown={() => bringToFront(item._id)}
                onDoubleClick={(e) =>
                  toggleFocus(item._id, e.currentTarget as HTMLElement, p)
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  left: `${p.leftPct}%`,
                  top: `${p.topPct}%`,
                  width: p.width,
                  rotate: p.rotate,
                  zIndex: zById[item._id] ?? 1,
                  // visibility rather than opacity: instant, and it doesn't
                  // fight the mount fade above.
                  visibility: hiddenId === item._id ? "hidden" : "visible",
                }}
              >
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    draggable={false}
                  />
                ) : (
                  // Raw <img>: sources are dynamic Sanity file-asset URLs sized by
                  // CSS here, so next/image adds no value. draggable={false} stops
                  // the browser's native image-drag ghost from fighting Motion.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.caption ?? ""}
                    draggable={false}
                  />
                )}
              </motion.div>
            );
          })}
      </div>

      {/* Lightbox: the chosen item, centred and unrotated at the asset's full
          resolution, over a dimmed pile. Dismiss by double-clicking it again,
          clicking the backdrop, or pressing Escape. */}
      <AnimatePresence onExitComplete={() => setHiddenId(null)}>
        {focused && (
          <>
            <motion.div
              className="dump-backdrop"
              onClick={() => setFocusedId(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            />
            <div className="dump-focus">
              <motion.div
                className="dump-focus__flier"
                onDoubleClick={() => setFocusedId(null)}
                // Start on the thumbnail, fly to centre, and retrace the same
                // path on the way out. Without a flight (media size unknown)
                // it just fades.
                initial={flight ?? { opacity: 0 }}
                animate={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
                exit={flight ?? { opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                {focused.type === "video" ? (
                  <video
                    src={focused.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    draggable={false}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={focused.url}
                    alt={focused.caption ?? ""}
                    draggable={false}
                  />
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
