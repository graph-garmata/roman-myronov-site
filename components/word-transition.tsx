"use client";

import { useEffect, useRef, useState } from "react";

// The motion ("word transition" reference clip):
//  1. The page name, white on black and stretched to fill the whole
//     viewport, grows in from the right edge (a sliver → full width).
//  2. A rectangle in the destination page's own colour grows in from the
//     right, squeezing the word into the left edge until it's gone and the
//     screen is the new page's ground.
// The two are one continuous movement, timed by a single speed curve (the
// hand-drawn speed graph): a fast burst for the grow-in, a slow — never
// stopped — trough where one hands over to the other, and a second burst for
// the squeeze-out. Points are (time, speed), both normalised.
const TOTAL = 1.0; // seconds
const SPEED: [number, number][] = [
  [0, 0], [0.034, 0.077], [0.08, 0.205], [0.098, 0.325], [0.108, 0.632],
  [0.119, 0.838], [0.13, 0.923], [0.145, 0.937], [0.17, 0.906],
  [0.193, 0.752], [0.214, 0.598], [0.246, 0.462], [0.289, 0.359],
  [0.342, 0.256], [0.416, 0.179], [0.48, 0.145], [0.538, 0.14],
  [0.597, 0.15], [0.639, 0.179], [0.713, 0.274], [0.788, 0.436],
  [0.814, 0.615], [0.841, 0.821], [0.862, 0.94], [0.904, 1], [0.931, 0.966],
  [0.942, 0.855], [0.947, 0.632], [0.95, 0.376], [0.958, 0.256],
  [0.973, 0.188], [1, 0.094],
];
// Handover point: the trough between the two bursts (its slowest moment).
const SPLIT_T = 0.538;

// Integrates SPEED into distance-travelled, then turns each half into a CSS
// linear() easing (sampled evenly in time) for its own animation. Each half
// is renormalised to 0→1, so the grow-in finishes exactly as the squeeze
// starts, at the same (slow) speed.
function buildEasings(samples = 48) {
  const speedAt = (t: number) => {
    let i = 1;
    while (i < SPEED.length - 1 && SPEED[i][0] < t) i++;
    const [t0, v0] = SPEED[i - 1];
    const [t1, v1] = SPEED[i];
    return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1);
  };
  const N = 2000;
  const dist = [0];
  for (let k = 1; k <= N; k++) {
    const a = speedAt((k - 1) / N);
    const b = speedAt(k / N);
    dist.push(dist[k - 1] + (a + b) / 2 / N);
  }
  const at = (t: number) => dist[Math.round(t * N)] / dist[N];
  const easing = (from: number, to: number) => {
    const d0 = at(from);
    const d1 = at(to);
    const stops = Array.from({ length: samples + 1 }, (_, k) =>
      ((at(from + ((to - from) * k) / samples) - d0) / (d1 - d0)).toFixed(4)
    );
    return `linear(${stops.join(", ")})`;
  };
  return { inEase: easing(0, SPLIT_T), outEase: easing(SPLIT_T, 1) };
}

const IN_DUR = TOTAL * SPLIT_T;
const OUT_START = IN_DUR;
const OUT_DUR = TOTAL - IN_DUR;
// Fallbacks for browsers without linear() (pre-2023): close enough curves.
const IN_EASE_FALLBACK = "cubic-bezier(0.3, 0.6, 0.2, 1)";
const OUT_EASE_FALLBACK = "cubic-bezier(0.8, 0, 0.6, 1)";

// Tracking from the AE comp (-46, i.e. thousandths of an em); only the
// size:tracking proportion matters, since the word is stretched to fit.
const TRACKING_EM = -0.046;
const SIZE = 100; // reference size the measurements are taken at

// Lays the word out at SIZE with the tracking applied per glyph (SVG
// letter-spacing isn't reliable across browsers): each glyph starts at the
// measured advance of the text before it — kerning included — plus the
// accumulated tracking. The box runs from the first glyph's ink left to the
// last glyph's ink right, and from the cap line down to the baseline — so
// stretched to the viewport, the caps touch the top edge and the baseline
// sits on the bottom one, descenders and overshoots falling just outside.
function layout(label: string, fontFamily: string) {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || !label) return null;
  ctx.font = `400 ${SIZE}px ${fontFamily}`;
  const chars = Array.from(label);
  const xs = chars.map(
    (_, i) => ctx.measureText(chars.slice(0, i).join("")).width + i * TRACKING_EM * SIZE
  );
  const first = ctx.measureText(chars[0]);
  const lastChar = ctx.measureText(chars[chars.length - 1]);
  const left = xs[0] - first.actualBoundingBoxLeft;
  const right = xs[xs.length - 1] + lastChar.actualBoundingBoxRight;
  const cap = ctx.measureText("H").actualBoundingBoxAscent;
  if (!(right > left) || !cap) return null;
  return { xs: xs.map((x) => x.toFixed(2)).join(" "), viewBox: `${left} ${-cap} ${right - left} ${cap}` };
}

/**
 * WordTransition — full-screen overlay for arriving at a named page (About,
 * Dump). Starts black, so it picks up seamlessly from whatever blacked the
 * screen out (the eye's blackout or the curtain), and ends fully in `color`,
 * the destination's own background, so lifting it reveals the page with no
 * seam. `onDone` fires once that colour covers the screen.
 */
export default function WordTransition({
  label,
  color,
  onDone,
}: {
  label: string;
  color: string;
  onDone: () => void;
}) {
  const inRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  const [fit, setFit] = useState<{ xs: string; viewBox: string; fontFamily: string } | null>(
    null
  );

  useEffect(() => {
    const fontFamily = getComputedStyle(document.body).fontFamily;
    const m = layout(label, fontFamily);
    setFit(m ? { ...m, fontFamily } : { xs: "0", viewBox: "0 -70 250 70", fontFamily });
  }, [label]);

  useEffect(() => {
    if (!fit) return;
    const word = inRef.current;
    const wordOut = outRef.current;
    const rect = rectRef.current;
    if (!word || !wordOut || !rect) return;
    const ms = (s: number) => s * 1000;
    const linear = CSS.supports("animation-timing-function", "linear(0, 1)");
    const { inEase, outEase } = linear
      ? buildEasings()
      : { inEase: IN_EASE_FALLBACK, outEase: OUT_EASE_FALLBACK };
    const anims = [
      word.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: ms(IN_DUR),
        easing: inEase,
        fill: "both",
      }),
      // The word squeezes to the left exactly as fast as the rectangle
      // grows from the right — same timing, mirrored — so the two always
      // meet edge to edge.
      wordOut.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], {
        delay: ms(OUT_START),
        duration: ms(OUT_DUR),
        easing: outEase,
        fill: "both",
      }),
      rect.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        delay: ms(OUT_START),
        duration: ms(OUT_DUR),
        easing: outEase,
        fill: "both",
      }),
    ];
    let fired = false;
    const finish = () => {
      if (fired) return;
      fired = true;
      done.current();
    };
    anims[2].finished.then(finish, () => {});
    // Animations stall in a background tab; never let navigation hang on it.
    const t = setTimeout(finish, ms(OUT_START + OUT_DUR) + 400);
    return () => {
      clearTimeout(t);
      anims.forEach((a) => a.cancel());
    };
  }, [fit]);

  return (
    <div className="word-transition" aria-hidden>
      <div ref={outRef} className="word-transition__out">
        <div ref={inRef} className="word-transition__in">
          {fit && (
            <svg viewBox={fit.viewBox} preserveAspectRatio="none">
              <text x={fit.xs} y={0} fontSize={SIZE} fill="#ffffff" style={{ fontFamily: fit.fontFamily }}>
                {label}
              </text>
            </svg>
          )}
        </div>
      </div>
      <div ref={rectRef} className="word-transition__rect" style={{ background: color }} />
    </div>
  );
}
