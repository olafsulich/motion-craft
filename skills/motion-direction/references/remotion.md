# Remotion: house-style recipes

Every recipe is a pure function of `useCurrentFrame()` (30 fps). The working versions are in `templates/remotion-hello/src/` (`helpers.ts`, `Hello.tsx`); copy the idea, not the numbers, and fill your tokens from `treatment.md`. Docs: https://www.remotion.dev/docs/spring, https://www.remotion.dev/docs/interpolate, https://www.remotion.dev/docs/audio.

## Tokens as constants

```ts
const GROUND = '#0B0D10', SURFACE = '#14181D', BORDER = '#2A313A', TEXT = '#F2F4F7', ACCENT = '#FF6B2C';
```

One module (`tokens.ts`) per clip. No other colours.

## Spring with a tiny overshoot

Remotion's `spring()` takes `config: {mass, stiffness, damping, overshootClamping}`. For an overshoot of about 3 percent use mass 1, stiffness 256, damping 24 (damping ratio 0.75):

```ts
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
const frame = useCurrentFrame(); const {fps} = useVideoConfig();
const p = spring({frame: frame - start, fps, config: {mass: 1, stiffness: 256, damping: 24}}); // 0 -> 1.03 -> 1
```

Personalities (all unclamped): snappy `{stiffness: 256, damping: 24}`; smooth `{stiffness: 120, damping: 20}`; heavy `{stiffness: 80, damping: 20, mass: 1.5}`. Check each curve's overshoot in stills before reusing it. If you need exact, engine-independent numbers, use the closed form in `helpers.ts` (`S(n)`), which gives the identical curve without a runtime call.

`spring()` returns 0 before `start`; keep the clip at rest there. Drive translate, scale and opacity from `p`: `translateY(${56 * (1 - p)}px)`, `scale(${0.86 + 0.14 * p})`.

## Camera zoom

Put the whole scene in one wrapper and scale it about the frame centre:

```tsx
<AbsoluteFill style={{transform: `scale(${K})`, transformOrigin: '960px 540px'}}>{scene}</AbsoluteFill>
```

Build `K` with `interpolate(frame, [0, 54, 78, 119], [1, 1.2, 1.12, 1.18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)})` for eased moves, or a plain linear `interpolate` for a drift. Pick `K` so the hero is half to three quarters of the frame width.

## Shape morph

Animate width, height and radius of one element together, centred on a fixed point, instead of cross-fading two shapes:

```tsx
const m = interpolate(frame, [54, 78], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
const w = 880 + 80 * m, h = 520 - 340 * m, r = Math.min(44 + 46 * m, h / 2);
<div style={{position: 'absolute', left: 960 - w / 2, top: 540 - h / 2, width: w, height: h, borderRadius: r, boxSizing: 'border-box', border: `2px solid ${BORDER}`}} />
```

Keep the border inside the box (`box-sizing: border-box`). For arbitrary path-to-path morphs use `interpolatePath` from `@remotion/paths` (add it at the same version as `remotion`).

## Line draw-on

Draw an SVG stroke by its length; ease out:

```tsx
const len = 480 * Easing.out(Easing.cubic)(clamp01((frame - 22) / 18)); // clamp01 from helpers.ts
{len > 0 && <line x1={720} y1={700} x2={720 + len} y2={700} stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />}
```

Skip rendering at length 0, because a round cap draws a dot. For curved paths use `evolvePath(progress, d)` from `@remotion/paths`, or `strokeDasharray`/`strokeDashoffset` with `getLength(d)`.

## Staggered rows

Give each row its own start frame and the same spring; make the offsets uneven and lead with the main item:

```tsx
const starts = [0, 4, 9, 13, 19];            // frames, deliberately uneven
rows.map((r, i) => <Row key={i} p={spring({frame: frame - base - starts[i], fps, config})} />)
```

Kinetic type works the same way: one `inline-block` span per word, each with its own start (see `Word` in `Hello.tsx`). Keep words in a flex row with `gap: 0.28em`; hidden words still hold their space, so the line does not shift as words arrive.

## Fonts

Bundle the font file in `public/fonts/` and load it with `loadFont` from `@remotion/fonts` and `staticFile()` inside `delayRender`/`continueRender`; never rely on a CDN or a system font (see `useFonts` in `Hello.tsx`). Use an open-licence family and ship its licence file.

## Audio and SFX

Add sound in a separate pass after the picture is approved. In Remotion, place short clips with `<Sequence>` and `<Audio>`:

```tsx
import {Audio, Sequence, staticFile} from 'remotion';
<Sequence from={6}><Audio src={staticFile('sfx/tick.wav')} volume={0.25} /></Sequence>
<Sequence from={54}><Audio src={staticFile('sfx/whoosh.wav')} volume={(f) => 0.2 * Math.min(1, f / 6)} /></Sequence>
```

Cues land on the frame of the move (a tick on each hero entrance, a low whoosh across a morph or camera move), well below any voice or music. Put the files in `public/sfx/`; use clips you have the right to use. A render with `<Audio>` writes an AAC track automatically; the silent hello clip has none. Check levels by ear or with `ffmpeg -i out/clip.mp4 -af volumedetect -f null -`.
