# HyperFrames: motion recipes

How to build the decisions in `motion-direction` in a HyperFrames project. The working example is `templates/hyperframes-hello/index.html`; read it first, it is about 200 lines. Spec of that clip: `docs/HELLO-SPEC.md`.

## The pattern: one pure function, baked into a paused timeline

HyperFrames drives a **paused GSAP timeline** registered as `window.__timelines["<composition id>"]` and seeks it to `frame / fps` seconds for every frame. Easing built from the GSAP tween vocabulary does not give a controlled spring, so write the motion as plain functions of the frame number and bake the result into the timeline with `set` calls:

```js
const FPS = 30, FRAMES = 120;
const tl = gsap.timeline({ paused: true });
for (let f = 0; f < FRAMES; f++) {
  const at = f === 0 ? 0 : (f - 0.5) / FPS;   // frame f owns [f - 0.5, f + 0.5) frames
  const s = state(f);                          // pure: frame number in, property values out
  tl.set("#card", s.card, at);
  tl.set("#cam", s.cam, at);
}
tl.set("#root", { opacity: 1 }, FRAMES / FPS); // pads the timeline to the full duration
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0);
```

Why half a frame: a seek to exactly `f / 30` can land a hair before or after a tween that starts at `f / 30` because of floating point. Starting each state half a frame early makes every seek inside that frame, including `snapshot --at 1.0`, land on the right state. Rules that keep it deterministic: the timeline is created with `{ paused: true }`, there are no timers, no `Math.random`, no CSS `animation` or `transition`, no `Date.now`. Run `npx hyperframes check` after every edit; it lints the composition.

Cost: about `elements x frames` tweens. Fine for a few elements over 10 s; for long clips emit a `set` only when an element's state changed from the previous frame.

Properties GSAP animates well here: `x`, `y`, `scale`, `opacity`, `width`, `height`, `borderRadius`, and SVG attributes via `attr: {...}`. Centre things with `xPercent: -50, yPercent: -50` on an element placed at its anchor point with `left` / `top`.

## Spring with a tiny overshoot

Closed-form damped oscillator, 0 to 1, `n` = frames since the move started:

```js
// stiffness k, damping c, unit mass: omega0 = sqrt(k), zeta = c / (2 * sqrt(k))
const spring = (n, k = 256, c = 24) => {
  if (n <= 0) return 0;
  const w0 = Math.sqrt(k), z = c / (2 * w0), wd = w0 * Math.sqrt(1 - z * z), s = n / FPS;
  return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + (z * w0 / wd) * Math.sin(wd * s));
};
```

Overshoot is `exp(-pi * z / sqrt(1 - z * z))`: `z = 0.75` gives 2.8 %, `z = 0.6` gives 9.5 % (too bouncy for the house style), `z >= 1` has none. Keep `z` between about 0.7 and 0.8 for the 2 to 5 % the direction skill asks for. Settling time scales with `1 / omega0`, so the three personalities from `motion-direction` are the same `z` with a slower `omega0`. These are starting values derived by time-scaling, not measured:

| Personality | Feel | `k` | `c` | Rough settle |
|---|---|---|---|---|
| snappy | about 0.35 s | 256 | 24 | 0.35 s (the hello clip) |
| smooth | about 0.55 s | 100 | 15 | 0.55 s |
| heavy | about 0.85 s | 42 | 9.7 | 0.85 s |

Apply it as `value = from + (to - from) * spring(f - start)`; for an entrance, rise `y = 56 * (1 - spring(f - start))` and fade `opacity = clamp01((f - start) / 5)` so the text is readable before it settles.

## Camera zoom

One wrapper around the whole scene, scaled about the frame centre:

```css
#cam { position: absolute; inset: 0; transform-origin: 960px 540px; }
```

```js
tl.set("#cam", { scale: camera(f) }, at);   // camera(f) is a piecewise function of the frame
```

Pushes use `easeInOutCubic`, the slow drift under a held state is linear. Choose the scale so the hero is half to three quarters of the 1920 px width (hello: 880 px card x 1.2 = 55 %). Put the camera on its own element, never on `#root`, so the page background does not scale.

## Shape morph

Morph one element, do not cross-fade two. Animate `width`, `height` and `borderRadius` together, driven by one eased progress `m`, with the element centred by `xPercent/yPercent: -50` so it grows about its centre:

```js
const m = easeInOutCubic(clamp01((f - 54) / 24));
const h = lerp(520, 180, m);
tl.set("#card", { width: lerp(880, 960, m), height: h, borderRadius: Math.min(lerp(44, 90, m), h / 2) }, at);
```

Clamp the radius to `height / 2` or CSS will fall back to a different curve at the end. Use `box-sizing: border-box` so the 2 px border stays inside the size. For arbitrary shapes (icon to icon) animate SVG path data with a library such as flubber; it was not tested here.

## Line draw-on

An SVG `line` or `path` with a dash the length of the stroke, then move the offset:

```html
<line x1="720" y1="700" x2="1200" y2="700" stroke="#ff6b2c" stroke-width="4"
      stroke-linecap="round" stroke-dasharray="480 480" stroke-dashoffset="480" opacity="0"/>
```

```js
const len = 480 * easeOutCubic(clamp01((f - 22) / 18));
tl.set("#draw", { opacity: len > 0 ? 1 : 0, attr: { "stroke-dashoffset": 480 - len } }, at);
```

Hide the line while `len` is 0: a round cap on a zero-length dash still paints a dot. For a path, take the length from `path.getTotalLength()` once at load.

## Staggered rows

Give each row its own start frame and the same spring; keep the gaps uneven:

```js
const starts = [72, 75, 80];                 // uneven gaps (3 then 5 frames); the hello clip uses 72, 76, 80
rows.forEach((id, i) => tl.set(id, { y: 40 * (1 - spring(f - starts[i])), opacity: clamp01((f - starts[i]) / 5) }, at));
```

Words of one headline sit in a `display: flex; gap: 0.28em` row so their positions are laid out once by the browser and only transforms move per frame.

## Type

Bundle the font in the project (`fonts/*.woff2` and an `@font-face` with a relative URL); do not use a CDN or a system fallback. After `snapshot` or `render`, check the log line `Fonts: N loaded`. Set `line-height: 1` and `letter-spacing: -0.02em` for headlines. Measure the headline against its container: at 132 px Inter 700, "Motion, directed." is about 1060 px wide, wider than the 880 px card in the hello clip (see the template README).

## Audio and SFX

Not part of the hello clip. HyperFrames mixes `<audio>` elements placed on the timeline into the mp4:

```html
<audio id="sfx1" src="assets/tick.wav" data-start="0.2" data-duration="0.06" data-track-index="2" data-volume="0.4"></audio>
```

Every `<audio>` needs a unique `id`: `check` fails with `media_missing_id` otherwise (the renderer finds media by id). Verified: two 60 ms ticks at 0.2 s and 0.4667 s produce an AAC track with sound only in those windows (`ffmpeg -ss 0.2 -t 0.1 -i out.mp4 -af volumedetect -f null -`). `data-start` and `data-duration` are seconds (frame / 30), `data-volume` is gain (1 = 0 dB), `data-fade-in` / `data-fade-out` are clip-edge fades in seconds, `data-track-index` is the Studio lane and does not control mixing. Per the house style: a soft tick on the main moves, a low whoosh across a camera move, well below any voice or music, added in a separate pass after the picture is approved. Ducking, buses and effects: the HyperFrames audio skill (`npx hyperframes skills`) and `npx hyperframes docs data-attributes`. Sourcing sounds is up to the user (own files, or `ffmpeg` synthesis); check each file's licence.
