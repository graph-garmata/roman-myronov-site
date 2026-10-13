"use client";

import { useEffect, useRef, useState } from "react";

// Home's sky, drawn the way clouds.psd builds it: the sky gradient, the
// clouds drifting over it, then a fine grain over everything in linear light
// (30%), as if printed. The PSD's Black & White adjustment is baked into the
// images, which leaves the blend; linear light doesn't exist in CSS, so small
// WebGL shaders do the composite each frame with Photoshop's formula.
//
// The clouds are the PSD's seven layers flattened in place (scaled to 0.6 of
// the 5632×2239 original), so they move as one and keep the designed spacing.
// The image is a seamless tile: it's cut narrower than the PSD and the clouds
// past the cut wrap round to its start, so the loop has no gap (the few that
// met there were nudged apart). It comes as two opaque images — brightness
// premultiplied by coverage, and the coverage — so no browser's alpha
// handling can fringe the edges.
//
// For depth, a few bigger, blurred clouds pass at FRONT_SPEED times the
// drift — in front of the figure, on a second canvas (.sky-front) layered
// between it and the labels. The field behind never changes, so the sky
// stays evenly filled. (A test with three of the PSD's clouds, mirrored.)
// The front clouds get the same grain as the sky, so both read as one print.
//
// The grain moves too, like film: it's re-dealt at GRAIN_FPS, a flicker over
// the clouds' smooth drift.
//
// Everything is placed in PSD coordinates, which cover the screen like
// background-size: cover, centred, then zoomed in by SKY_ZOOM so the top row
// of clouds bleeds off the top edge as the bottom row does — the same fit as
// the CSS sky beneath (see .sky), so the canvas fades in over it without a
// jump. Without WebGL the sky shows a still frame of the same composite.
const PSD_W = 5632;
const PSD_H = 2239;
// The cloud tiles' scale relative to the PSD.
const CLOUD_SCALE = 0.6;
// How far past cover the PSD is zoomed (kept in step with .sky in the CSS).
const SKY_ZOOM = 1.15;

// Drift, in tile px per second (rightward): one lap is ~2 minutes.
const DRIFT_SPEED = 22;
// The front layer's speed relative to the field behind it.
const FRONT_SPEED = 2;
// Rectangle 1, the grain: its mean and spread at the PSD's own resolution.
const GRAIN_MEAN = 0.5607;
const GRAIN_STD = 0.0676;
// How often the grain is re-dealt.
const GRAIN_FPS = 12;
// The clouds are soft; past 1.5× there's nothing more to see, only more to draw.
const MAX_DPR = 1.5;

const IMAGES = {
  sky: "/images/sky/sky.webp",
  clouds: "/images/sky/clouds.webp",
  cloudsAlpha: "/images/sky/clouds-alpha.webp",
  front: "/images/sky/front.webp",
  frontAlpha: "/images/sky/front-alpha.webp",
};
type ImageName = keyof typeof IMAGES;

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Shared by both layers: placement in PSD coordinates, and the print — the
// grain applied to a grey value.
const COMMON = `#version 300 es
precision highp float;
uniform float uHeight;    // canvas px
uniform vec2 uOrigin;     // canvas px of the PSD's top-left corner
uniform float uScale;     // canvas px per PSD px
uniform float uGrainStd;  // grain spread at this pixel size
uniform float uSeed;      // grain deal, changes GRAIN_FPS times a second
out vec4 outColor;

// Dave Hoskins' hash: white noise, fixed per pixel.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 screenPx() { return vec2(gl_FragCoord.x, uHeight - gl_FragCoord.y); }
vec2 toPsd(vec2 px) { return (px - uOrigin) / uScale; }

// A cloud tile sampled at a PSD position, drifted by \`drift\` tile px.
vec2 tileCoord(vec2 psd, float drift, vec2 tile) {
  return vec2(psd.x * ${CLOUD_SCALE} - drift, psd.y * ${CLOUD_SCALE}) / tile;
}

float printed(float L, vec2 px) {
  // Rectangle 1: grain in linear light, 30%. Three hashes sum to a roughly
  // normal spread (std 0.5 before scaling).
  vec2 q = px + uSeed * vec2(61.7, 37.3);
  float n = hash(q) + hash(q + 113.0) + hash(q + 271.0) - 1.5;
  float g = ${GRAIN_MEAN} + n * 2.0 * uGrainStd;
  return mix(L, clamp(L + 2.0 * g - 1.0, 0.0, 1.0), 0.3);
}
`;

// Behind the figure: the sky and the cloud field.
const BACK_FRAG = `${COMMON}
uniform sampler2D uSky, uClouds, uCloudsAlpha;
uniform vec2 uTile;
uniform float uDrift;

void main() {
  vec2 px = screenPx();
  vec2 psd = toPsd(px);
  float L = texture(uSky, psd / vec2(${PSD_W}.0, ${PSD_H}.0)).r;
  vec2 tc = tileCoord(psd, uDrift, uTile);
  L = L * (1.0 - texture(uCloudsAlpha, tc).r) + texture(uClouds, tc).r;
  outColor = vec4(vec3(printed(L, px)), 1.0);
}`;

// In front of the figure: the front clouds alone, on transparent.
const FRONT_FRAG = `${COMMON}
uniform sampler2D uFront, uFrontAlpha;
uniform vec2 uTile;
uniform float uDrift;

void main() {
  vec2 px = screenPx();
  vec2 psd = toPsd(px);
  vec2 tc = tileCoord(psd, uDrift, uTile);
  float a = texture(uFrontAlpha, tc).r;
  if (a < 0.002) { outColor = vec4(0.0); return; }
  float L = clamp(texture(uFront, tc).r / a, 0.0, 1.0);
  outColor = vec4(vec3(printed(L, px)) * a, a);
}`;

type Source = ImageBitmap | HTMLImageElement;

function load(src: string) {
  return new Promise<Source>((resolve, reject) => {
    const img = new Image();
    // Decoded off the main thread where possible. (Not img.decode(): it waits
    // for the page to be shown, so a background tab would come up empty.)
    img.onload = () =>
      "createImageBitmap" in window
        ? createImageBitmap(img).then(resolve, () => resolve(img))
        : resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

/** One canvas drawing one full-screen shader. Throws if WebGL2 or the
 *  shader isn't available. */
function createLayer(canvas: HTMLCanvasElement, frag: string, transparent: boolean) {
  const gl = canvas.getContext("webgl2", { alpha: transparent, antialias: false });
  if (!gl) throw new Error("webgl2");
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("link");
  gl.useProgram(program);

  // One triangle that covers the screen.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const locations = new Map<string, WebGLUniformLocation | null>();
  const u = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name)!;
  };
  let units = 0;

  return {
    gl,
    canvas,
    u,
    texture(name: string, src: Source, repeat: boolean) {
      const unit = units++;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, src);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(u(name), unit);
    },
    // Fit the PSD to this canvas: cover, centred, zoomed by SKY_ZOOM.
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      const s = Math.max(w / PSD_W, h / PSD_H) * SKY_ZOOM;
      gl.uniform1f(u("uHeight"), h);
      gl.uniform2f(u("uOrigin"), (w - PSD_W * s) / 2, (h - PSD_H * s) / 2);
      gl.uniform1f(u("uScale"), s);
      // White noise averages down as each screen pixel covers more of the PSD.
      gl.uniform1f(u("uGrainStd"), GRAIN_STD * Math.min(1, s));
    },
    draw(drift: number, seed: number) {
      gl.uniform1f(u("uDrift"), drift);
      gl.uniform1f(u("uSeed"), seed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/** The sky (behind the figure) and the front clouds (in front of it). Home
 *  places them: the sky first, the front clouds in their own layer — see
 *  .sky and .sky-front. `active` shows the sky; `frontActive` the front
 *  clouds, which also step aside for the eye's blackout. */
export default function CloudSky({
  active,
  frontActive,
}: {
  active: boolean;
  frontActive: boolean;
}) {
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const wakeRef = useRef<(() => void) | null>(null);
  // No WebGL (or it was lost): show the still frame instead.
  const [still, setStill] = useState(false);

  useEffect(() => {
    activeRef.current = active;
    if (active) wakeRef.current?.();
  }, [active]);

  useEffect(() => {
    const backWrap = backRef.current;
    const frontWrap = frontRef.current;
    if (!backWrap || !frontWrap) return;

    // Fresh canvases for every run of this effect: cleanup loses the old
    // contexts to free them, and a canvas hands back its lost context for
    // good — so a remount (or Strict Mode's rerun) reusing one would be stuck
    // on the still frame.
    const backCanvas = document.createElement("canvas");
    const frontCanvas = document.createElement("canvas");
    backCanvas.className = "sky__clouds";
    frontCanvas.className = "sky-front__clouds";
    backWrap.appendChild(backCanvas);
    frontWrap.appendChild(frontCanvas);

    let back: ReturnType<typeof createLayer>;
    let front: ReturnType<typeof createLayer>;
    try {
      back = createLayer(backCanvas, BACK_FRAG, false);
      front = createLayer(frontCanvas, FRONT_FRAG, true);
    } catch {
      backCanvas.remove();
      frontCanvas.remove();
      setStill(true);
      return;
    }
    const layers = [back, front];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tileW = 1;
    let frontW = 1;
    let ready = false;
    let t = 0;
    let raf = 0;
    let last = 0;
    let disposed = false;

    const draw = () => {
      if (!ready) return;
      // A new grain deal each grain frame, numbered so it's steady in between.
      const seed = Math.floor(t * GRAIN_FPS) % 997;
      back.draw((t * DRIFT_SPEED) % tileW, seed);
      front.draw((t * DRIFT_SPEED * FRONT_SPEED) % frontW, seed);
    };

    const frame = (now: number) => {
      raf = 0;
      // Clamped, so a frame after a stall (background tab) doesn't jump.
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      t += dt;
      draw();
      // Keep going only while the sky is shown; `wake` restarts it.
      if (activeRef.current) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (reduced || disposed || !ready || raf) return;
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      ready = false;
      setStill(true);
    };
    layers.forEach((l) => l.canvas.addEventListener("webglcontextlost", onLost));

    const ro = new ResizeObserver(() => {
      layers.forEach((l) => l.resize());
      draw();
    });
    ro.observe(backCanvas);
    ro.observe(frontCanvas);
    layers.forEach((l) => l.resize());

    const names = Object.keys(IMAGES) as ImageName[];
    let sources: Source[] = [];
    Promise.all(names.map((n) => load(IMAGES[n])))
      .then((loaded) => {
        sources = loaded;
        if (disposed || layers.some((l) => l.gl.isContextLost())) return;
        const img = Object.fromEntries(names.map((n, i) => [n, loaded[i]])) as Record<
          ImageName,
          Source
        >;
        back.texture("uSky", img.sky, false);
        back.texture("uClouds", img.clouds, true);
        back.texture("uCloudsAlpha", img.cloudsAlpha, true);
        front.texture("uFront", img.front, true);
        front.texture("uFrontAlpha", img.frontAlpha, true);
        tileW = img.clouds.width;
        frontW = img.front.width;
        back.gl.uniform2f(back.u("uTile"), img.clouds.width, img.clouds.height);
        front.gl.uniform2f(front.u("uTile"), img.front.width, img.front.height);
        ready = true;
        draw();
        layers.forEach((l) => l.canvas.classList.add("is-ready"));
        wake();
      })
      .catch(() => {
        if (!disposed) setStill(true);
      });

    return () => {
      disposed = true;
      wakeRef.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      layers.forEach((l) => {
        l.canvas.removeEventListener("webglcontextlost", onLost);
        l.dispose();
        l.canvas.remove();
      });
      sources.forEach((s) => "close" in s && s.close());
    };
  }, []);

  return (
    <>
      <div
        className={`sky${active ? "" : " is-hidden"}${still ? " is-still" : ""}`}
        aria-hidden
        ref={backRef}
      />
      {/* Wrapped like the sky's canvas: Safari sizes a bare absolutely
          positioned canvas short of the screen's bottom edge. */}
      <div
        className={`sky-front${frontActive && !still ? "" : " is-hidden"}`}
        aria-hidden
        ref={frontRef}
      />
    </>
  );
}
