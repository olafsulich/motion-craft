# hyperframes-hello

The 4 s hello clip (spring with overshoot, camera zoom, shape morph, kinetic type), built with HyperFrames. Spec: `docs/HELLO-SPEC.md` at the plugin root. Commands: `skills/motion-setup/references/hyperframes.md`.

```bash
npm install
npx hyperframes browser ensure
npm run check
npm run render      # out/hello.mp4, 1920x1080, 30 fps, 120 frames, no audio
```

Pinned: `hyperframes` 0.8.174, `gsap` 3.15.0. Fonts: Inter 600 and 700 (latin subset, SIL OFL, `fonts/OFL.txt`).

## How it works

`index.html` holds one pure function `state(frame)` that returns every animated value from the closed forms in the spec. The page bakes it into one paused GSAP timeline with a `set` per element per frame, and registers it as `window.__timelines["main"]`. Nothing runs on the wall clock.

## Deviations and open points

- Headline 96 px on a 1040 px card, as in the corrected spec: the headline is about 873 px wide and fits with about 83 px per side.
- The draw-on line is an SVG line with round caps, so it extends 2 px past x = 720 and x = 1200.
- Rows are laid out with a flex `gap: 0.28em` rather than literal space characters.
- Fonts are the Fontsource latin subset of Inter 5.3.0, not the full family.
