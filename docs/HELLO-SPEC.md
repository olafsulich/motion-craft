# Hello clip: renderer-neutral spec

One 4-second clip, built twice (HyperFrames, Remotion) so both look the same. Every value below is exact. Where a renderer cannot match a value, note the deviation in the template README; do not change the spec silently.

## Output

| Item | Value |
|---|---|
| Resolution | 1920 x 1080 |
| Frame rate | 30 fps |
| Length | 120 frames (frame 0 to 119), 4.000 s |
| Container | mp4, H.264, yuv420p, no audio |
| Pure function of the frame | `t = frame / 30` seconds. No timers, no randomness, no CSS animation on the wall clock. |

Coordinates are pixels in the 1920x1080 frame, origin top-left. The scene centre is C = (960, 540).

## Look

| Token | Hex |
|---|---|
| Ground | `#0B0D10` (solid, no gradient) |
| Surface (card and pill fill) | `#14181D` |
| Border | `#2A313A`, 2 px, solid, inside the shape |
| Text | `#F2F4F7` |
| Accent (the only accent) | `#FF6B2C` |

Rules: no drop shadows, no glows, no blur. Font: **Inter** (SIL OFL), headline weight 700, pill text weight 600. Load the font file locally (bundle it in the template); do not rely on a CDN or a system fallback. Letter-spacing -0.02 em on both lines. Text is centred on the shape centre, vertically centred on its cap height box (line-height 1).

## Helpers (use the closed forms so both versions match)

- `clamp01(x)` limits x to 0..1. `lerp(a,b,p) = a + (b-a)p`.
- `easeOutCubic(x) = 1 - (1-x)^3`, `easeInCubic(x) = x^3`, `easeInOutCubic(x) = x<0.5 ? 4x^3 : 1 - (-2x+2)^3 / 2`.
- **Spring** `S(n)`, with `n` = frames since the start frame (S = 0 for n <= 0). Damped harmonic oscillator, unit mass, from 0 to 1:
  - stiffness 256 (omega0 = 16 rad/s), damping 24 (zeta = 0.75), so omega_d = 16 * sqrt(1 - 0.75^2) = 10.583 rad/s.
  - with `s = n / 30`: `S = 1 - exp(-12 s) * (cos(10.583 s) + (12 / 10.583) * sin(10.583 s))`.
  - Overshoot is 2.8 % of the travel (peak at about 0.30 s, 9 frames). Settles within 0.4 % by about 0.7 s.
  - In Remotion this equals `spring({frame: n, fps: 30, config: {mass: 1, stiffness: 256, damping: 24, overshootClamping: false}})`; the template may use the closed form above instead if the two differ visibly.

## Timeline

### Camera

The whole scene (everything below) sits in one wrapper scaled about C. Camera scale `K(f)`:

| Frames | K |
|---|---|
| 0 to 54 | `lerp(1.00, 1.20, easeInOutCubic((f-0)/54))` |
| 54 to 78 | `lerp(1.20, 1.12, easeInOutCubic((f-54)/24))` |
| 78 to 119 | `lerp(1.12, 1.18, (f-78)/41)` (linear drift) |

Framing check: hero is 880 x 1.20 = 1056 px (55 % of width) at f54, and 960 x 1.12 = 1075 px (56 %) at f78, 1133 px (59 %) at f119.

### Beat 1: card and headline (frames 6 to 58)

- **Card** (hero): rounded rectangle centred on C, 880 x 520, radius 44, fill Surface, border Border.
  - Enters at frame 6: `scale = 0.86 + 0.14 * S(f-6)`, `translateY = 60 * (1 - S(f-6))` px, `opacity = clamp01((f-6)/6)`.
- **Headline** "Motion, directed." two words, Inter 700, 132 px, centred on C, words separated by a 0.28 em space, vertical centre at y = 520.
  - Word 1 "Motion," colour Text, starts frame 14. Word 2 "directed." colour Accent, starts frame 19.
  - Each word: `translateY = 56 * (1 - S(f-start))` px, `opacity = clamp01((f-start)/5)`.
- **Draw-on line**: 4 px tall, Accent, round caps, horizontal from x = 720 to x = 1200 at y = 700. Draws left to right from frame 22 to 40: `length = 480 * easeOutCubic(clamp01((f-22)/18))`.
- **Exit** (frames 50 to 58): headline words and the line fade and lift. Word 1 and the line: `p = easeInCubic(clamp01((f-50)/8))`; word 2: `p = easeInCubic(clamp01((f-52)/8))`. `opacity = 1 - p`, `translateY = -24 * p` px (added to the resting position). Nothing but the card remains visible at frame 58.

### Beat 2: shape morph (frames 54 to 78)

Card becomes pill, centred on C throughout. `m = easeInOutCubic(clamp01((f-54)/24))`:

- width `lerp(880, 960, m)`, height `lerp(520, 180, m)`, corner radius `min(lerp(44, 90, m), height / 2)`.
- Fill and border unchanged. Pill is 960 x 180, radius 90 from frame 78.

### Beat 3: pill text (frames 72 to 119)

Text "Straight to mp4." Inter 600, 72 px, centred on C, words separated by a 0.28 em space. Three words, each: `translateY = 40 * (1 - S(f-start))` px, `opacity = clamp01((f-start)/5)`:

| Word | Colour | Start frame |
|---|---|---|
| "Straight" | Text | 72 |
| "to" | Text | 76 |
| "mp4." | Accent | 80 |

Frames 100 to 119: hold (only the camera drift moves).

## Which element shows when

| Frames | Visible |
|---|---|
| 0 to 5 | ground only |
| 6 to 57 | card (becoming a pill from 54), headline, line |
| 58 to 71 | card morphing to pill, no text |
| 72 to 119 | pill with text |

## Stills (for previews and for comparing the two versions)

| Name | Frame | Shows |
|---|---|---|
| start | 30 | card at rest, both words in, line mid-draw |
| middle | 66 | morph at its midpoint (m = 0.5): about 920 x 350, radius 67, no text |
| end | 119 | pill at rest with all three words |

Comparison frames for a pixel diff of the two versions: 12, 30, 48, 66, 84, 119. Expect only anti-aliasing and text-rasterisation differences; a visible difference in position, size, colour or timing is a bug in one version.

## Audio

None in the hello clip. (If added later: a soft tick on frame 6, 14 and 72, and a low whoosh across 54 to 78, each well below dialogue level.)
