---
name: motion-direction
description: Turn a vague animation idea into a directed motion treatment before any code is written, and keep clips from looking like generic AI animation. Use when the user wants a motion-graphics, UI-animation, announcement or kinetic-type clip, asks how something should move, or when a clip feels flat, floaty or generic. Covers shot intent, one hero object, big type, springs with a tiny overshoot, camera framing, shape morphs, draw-on lines, staggers, one accent colour, and subtle sound.
---

# motion-direction

Write the treatment first, in words. Only then build. A clip without a treatment drifts into the same fade-up-and-blur on every element.

Renderer mechanics (spring helper, camera, morph, draw-on, audio) live in [references/hyperframes.md](references/hyperframes.md) and [references/remotion.md](references/remotion.md). This file is about decisions.

## 1. Interview, then write the treatment

Ask only what you cannot infer, one question at a time, each with your recommended answer: the message in one sentence, the audience, the duration (default 6 to 15 s), the format (16:9 default), and the exact on-screen copy. Never invent copy: keep all text in one `copy.json` (or equivalent) that the user fills or approves, and use `TODO:` placeholders until they do.

Save `treatment.md` next to the project with:

1. **Idea:** one sentence.
2. **Per beat:** the state on screen, why it exists (what the viewer should understand), the energy (fast, slow, hold), and the camera.
3. **Palette and type:** the tokens below, filled in.
4. **Sound:** where cues land, if any.

Show the treatment and get a yes before building. Then use `motion-stills-loop`.

## 2. House style

**Shot intent.** Every shot answers "what should the viewer see next, and why?" If you cannot say, cut it.

**One hero object.** One thing is the subject of each beat (a card, a number, a cursor). Everything else supports it or waits. Never animate five things with equal weight.

**Big kinetic type.** Type is the main visual. Headline at least 96 px on a 1080p frame, one idea per line, tight tracking, a weight contrast between headline and body. Reveal by words, not whole paragraphs, rising a short distance with a spring. Body text never below 28 px at 1080p; it must still read at phone width (about 360 px wide).

**Springs with a tiny overshoot.** Motion that arrives settles with a spring whose overshoot is about 2 to 5 percent of the travel. Never linear, never bouncy or floaty. Use at most three motion personalities per clip (for example snappy, smooth, heavy) and reuse them so the clip feels like one hand made it. Starting values: snappy about 0.35 s, smooth about 0.55 s, heavy about 0.85 s.

**Camera frames each state.** Treat the whole scene as one wrapper and move it: a slow push (about 2 to 3 percent per second) while something reads, a deliberate move when the subject changes. Scale so the current hero fills roughly half to three quarters of the frame width. A camera that does not move for a reason is decoration; hold still instead.

**Shape morphs.** When one object becomes another (card into pill, dot into check), morph the shape itself, with size, corner radius and position moving together, instead of cross-fading two objects.

**Lines draw on.** Strokes (underlines, connectors, check marks, borders of diagrams) draw along their path rather than fading in. Ease out.

**Staggered rows.** Lists and rows enter one after another, 3 to 6 frames at 30 fps apart, with a deliberately uneven rhythm, never the same delay for everything. Lead with the most important item.

**One accent colour.** Neutral dark or light ground, neutral text, a single accent used for the one thing to look at. No gradients of accents, no rainbow.

**Thin borders, no drop shadows.** Separate surfaces with a 1 to 2 px border in a slightly lighter tone of the ground. No drop shadows, glows or blur halos.

**Subtle sound.** Optional and quiet: a soft tick or whoosh on the main moves, under the voice or music if any, never louder than the content. Silence is a valid choice. Sound is added in a separate pass, after the picture is approved.

## 3. Avoid the generic AI-animation look

Reject a draft that shows these:

- The same fade, rise and blur on every element.
- Uniform stagger delays and no hold: it never rests, so nothing stands out.
- Floaty easing, large bounce, glow, bokeh, lens flare, particle confetti used as filler.
- Centred cards on a gradient with soft shadows.
- Small text, text hugging the frame edge (keep about 5 percent margin), or text clipped by its container.
- Movement for its own sake: any move you cannot justify in the treatment.

Prefer: scale contrast between big and small, cuts on motion, negative space, a clear fast / slow / hold rhythm, and a camera with a reason.

## 4. Tokens to fix before building

| Token | Default |
|---|---|
| Frame | 1920x1080, 30 fps (60 fps only if the content needs it) |
| Ground / surface / border | near-black graphite, one step lighter surface, one more step for the border |
| Text / muted text | near-white / mid grey |
| Accent | one hue, chosen with the user |
| Fonts | one family with two or three weights, under an open licence the user may use |
| Springs | the three personalities above |

Write the chosen values into `treatment.md`; the renderer reference shows how to expose them as variables.
