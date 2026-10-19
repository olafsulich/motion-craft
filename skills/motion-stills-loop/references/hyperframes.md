# HyperFrames: stills and full render

Run everything from the project directory (the one with `index.html` and `node_modules`). Frame `f` is shown at `t = f / fps` seconds (30 fps unless the composition says otherwise).

## Single-frame stills

`hyperframes snapshot` loads the composition in headless Chrome, seeks the timeline to each requested instant and saves a PNG at the composition size (1920x1080). Chrome does not repaint anything else, so a still takes about 4 s for the whole batch.

```bash
mkdir -p stills
FRAMES="30 66 119"                                   # frame numbers from the plan
AT=$(for f in $FRAMES; do awk -v f=$f -v fps=30 'BEGIN{printf "%.6f,", f/fps}'; done | sed 's/,$//')
npx hyperframes snapshot --no-end --at "$AT" --output stills/raw
i=0; for f in $FRAMES; do mv stills/raw/frame-$(printf %02d $i)-*.png "stills/f$(printf %04d $f).png"; i=$((i+1)); done
rm -rf stills/raw
```

Notes, all checked on 0.8.174:

- `--at` takes comma-separated seconds and captures "at that exact instant, not snapped to a frame". Pass `frame / fps` with 6 decimals.
- Without `--no-end` the CLI adds an extra end-of-timeline frame and a different set of files; always pass `--no-end` when you list exact frames.
- Output names are `frame-NN-at-<seconds>s.png` in the order of `--at`, plus `contact-sheet.jpg`. The loop above renames them to `fNNNN.png`, which is what the `motion-stills-loop` contact-sheet commands expect. To re-shoot one moment without clearing the folder, use `--keep` (it names the file `at-<seconds>s.png`).
- Look at the line `Fonts: N loaded` in the output; if it is lower than your font count the text is in a fallback font.
- A still is the paused timeline at that instant. It matches the same frame of the mp4 up to video compression (measured 41 to 46 dB PSNR on the hello clip).
- `--zoom '<css selector>'` or `--zoom x,y,w,h` crops a high-density region, useful to check a 2 px border or a line cap.

A strip of consecutive frames around a spring or morph: set `FRAMES` to `"54 58 62 66 70 74 78"` and run the same block.

## Checks that are cheaper than a render

```bash
npx hyperframes check      # lint, runtime errors, layout, motion, contrast; must end "Check passed"
```

Run it before stills and before the full render.

## Full render

```bash
mkdir -p out
npm run render             # hyperframes render --output out/<name>.mp4, default 30 fps, quality "looks" (CRF 16)
```

Use `--quality draft` while iterating on motion and the default for the approved render. After it:

```bash
ffprobe -v error -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate,nb_frames:format=duration -of default=nw=1 out/hello.mp4
ffmpeg -v error -y -i out/hello.mp4 -vf "select=eq(n\,66)" -vframes 1 check-f66.png     # frame 66 of the mp4
```

Compare `check-f66.png` with `stills/f0066.png` by eye or with `ffmpeg -i a.png -i b.png -lavfi psnr -f null -`; expect a PSNR above 40 dB. A lower value means the composition is not a pure function of the frame (a timer, a random value, a CSS animation).

Render time, measured on the hello clip: 14 s wall for 120 frames (about 0.1 s per frame at 1080p, one worker). Render only one clip at a time on a small machine; the renderer needs at least 1 GB of free disk at the output path.

Afterwards stop any preview server (`npx hyperframes preview --stop`) and make sure no `chrome-headless-shell` process is left.
