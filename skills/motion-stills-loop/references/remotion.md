# Remotion: stills and full render

Run all commands inside the project (the folder with `package.json`). `src/index.ts` is the entry, `hello` the composition id; use your own composition id for your own clip.

## Single-frame stills (frame-accurate)

```bash
npx remotion still src/index.ts hello stills/f0090.png --frame=90
```

- `--frame` is zero-based and exact: it renders frame 90 and nothing else. Frame = seconds x fps.
- Add `--scale=0.5` for a quick low-resolution look; leave it out for the review size.
- PNG is the default for stills; add `--image-format=jpeg` only for smaller review files.
- Each call starts Chrome once (a few seconds). To make a set, loop in the shell:

```bash
mkdir -p stills
for f in 0 30 66 90 119; do
  npx remotion still src/index.ts hello "stills/f$(printf %04d $f).png" --frame=$f
done
```

Then build the contact sheet and phone sheet with the ffmpeg commands from `SKILL.md`.

To look at motion, render a strip of consecutive frames the same way (for example frames 54 to 78 step 2).

If your clip does not start at frame 0 or uses `<Sequence>`, `--frame` is the frame of the composition, not of the sequence.

## Full render

```bash
npx remotion render src/index.ts hello out/hello.mp4 --concurrency=2
```

Render only after the user approved the stills. To re-check one range of a long clip without rendering everything, add `--frames=60-90` (inclusive) and a different output name.

## Check the result

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames:format=duration -of default=nw=1 out/hello.mp4
ffmpeg -y -ss 2.5 -i out/hello.mp4 -frames:v 1 check.png
```

Compare `check.png` with the still for frame 75 (`2.5 x 30`).

## Determinism in Remotion

Drive everything from `useCurrentFrame()`. Do not use `Date.now()`, `Math.random()` (use `random('seed')` from `remotion`), CSS transitions or CSS animations, or `useEffect` timers for motion. Load fonts and images with `delayRender`/`continueRender` (or `loadFont`, `<Img>`), so the frame is not captured early.

Clean up when done: `pgrep -fa 'chrome|remotion'` and kill leftovers that you started.
