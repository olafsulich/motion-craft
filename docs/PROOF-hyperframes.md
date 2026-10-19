# Proof log: HyperFrames version

Date: 2026-10-19. Machine: 4 vCPU, 7.6 GB RAM, Node v24.20.0, ffmpeg N-127142 (2026-10-03), no Chrome on PATH, Linux x64. `hyperframes` 0.8.174, `gsap` 3.15.0. Proof dir: `~/scratch/motion-craft-proof/hyperframes/motion-hello` (outside the repo, on disk, not `/tmp`). Every render and still command ran under `flock ~/scratch/motion-craft-proof/.render.lock`.

## Commands run (as an outsider, from the references)

```bash
export CLAUDE_SKILL_DIR=<repo>/skills/motion-setup
cp -r "${CLAUDE_SKILL_DIR}/../../templates/hyperframes-hello" ./motion-hello && cd motion-hello
npm install
npx hyperframes browser ensure
npx hyperframes check
mkdir -p out
flock ~/scratch/motion-craft-proof/.render.lock npm run render      # hyperframes render --output out/hello.mp4
# stills: the FRAMES="30 66 119" block from skills/motion-stills-loop/references/hyperframes.md, wrapped in flock
ffprobe -v error -show_entries stream=width,height,r_frame_rate,nb_frames:format=duration -of default=nw=1 out/hello.mp4
```

## Numbers

| Step | Time |
|---|---|
| `npm install` (76 packages, 121 MB `node_modules`) | 3.9 s (npm cache just emptied by the orchestrator, so cold) |
| `npx hyperframes browser ensure` (first run, downloads Chrome Headless Shell 152.0.7977.30, 114 MB, 262 MB unpacked) | 7.3 s |
| `npx hyperframes check` | 7.0 s |
| Stills, 3 frames in one call | 4.3 s (measured on a free lock; the final run waited about 3 min for the lock held by the other worker) |
| Full render, `npm run render` | **20.8 s wall** (`/usr/bin/time`), of which the CLI reports "rendered in 11.5 s"; peak RSS 491 MB, one worker, software GL |
| Earlier render of the same project to `/dev/shm` (disk was full) | 14.1 s wall, 11.6 s reported |

ffprobe of `out/hello.mp4` (469.0 KB, h264, yuv420p):

```
width=1920
height=1080
r_frame_rate=30/1
nb_frames=120
duration=4.000000
```

Stills: `previews/hyperframes/start.png` (frame 30), `middle.png` (frame 66), `end.png` (frame 119). Each still matches the same frame of the mp4 at 40.9, 46.4 and 44.4 dB PSNR (video compression only). Visual check: the middle still is 1066 x 405 px at camera 1.16 (spec: 920 x 350 at m = 0.5), the end still is a 1133 px pill (960 x 1.18).

Audio (not in the hello clip, tested in a throwaway copy): two 60 ms ticks via `<audio>` give an AAC track, sound only at 0.2 s (max -32 dB), -91 dB at 1.5 s.

Disk use: `node_modules` 121 MB, Chrome cache 262 MB (`~/.cache/hyperframes`), mp4 469 KB, stills 80 KB. `/` hit 100 % full twice during the run (other jobs plus my first exploratory install of 126 MB), which blocked writes and rendering until the orchestrator cleaned the npm cache. After the render I deleted the proof's `node_modules`, the audio test and the `/dev/shm` copies.

## Steps that were wrong, and the fix

1. **Preflight asks for Chrome or Chromium; HyperFrames needs none.** The renderer downloads its own headless shell (`npx hyperframes browser ensure`). Fixed in `motion-setup/references/hyperframes.md` (preflight table). SKILL.md proposal below.
2. **"A few GB free disk" is vague; the renderer enforces 1 GB at the output path.** With less, `render` exits with "Low disk space" before drawing a frame (it was hit for real: 0.0 GB free). Fixed in the reference (preflight and troubleshooting, with the `--output` workaround).
3. **Stills naming.** `motion-stills-loop` expects `stills/f0090.png`; `hyperframes snapshot` writes `frame-NN-at-<s>s.png`, adds an unrequested end-of-timeline frame unless `--no-end` is passed, and also writes `contact-sheet.jpg`. Fixed with a copy-paste block in `motion-stills-loop/references/hyperframes.md` that converts frames to seconds, passes `--no-end` and renames to `fNNNN.png`.
4. **`npx hyperframes doctor` reports a missing archive extractor (`unzip`) and a failed Chrome check although the Chrome download works without `unzip`.** Documented in the reference so an outsider does not install packages for nothing.
5. **HELLO-SPEC cannot be met without an overflow.** "Motion, directed." at Inter 700 / 132 px on one line is about 1060 px wide; the card is 880 px. Implemented exactly as specified; documented in `templates/hyperframes-hello/README.md`. Needs a spec decision (below).
6. Found while testing my own reference: an `<audio>` element without `id` makes `check` fail (`media_missing_id`; the renderer would not find it). Added to the audio section before it shipped.

Template issue found and fixed on the way: `hyperframes docs gsap` and `init` load GSAP from a CDN; the template loads the pinned `gsap` from `node_modules` so renders work offline. The first `npm install` prints an npm warning that esbuild's postinstall is not approved (`install-scripts`); everything works regardless.

## Proposed SKILL.md/README fixes

- `motion-setup/SKILL.md` preflight, Chrome row: "Chrome or Chromium: not required for HyperFrames (it downloads its own headless shell, about 115 MB); required on PATH only if the reference for the chosen renderer says so."
- `motion-setup/SKILL.md` preflight, disk row: "At least 1 GB free on the output disk (HyperFrames refuses to render below that); `node_modules` plus Chrome is about 400 MB." Replace "a few GB".
- `motion-setup/SKILL.md` section 3: add `npm install` and the renderer's browser fetch step explicitly, and say that the copy source is `${CLAUDE_SKILL_DIR}/../../templates/<renderer>-hello` (worked as written in the proof when the variable is exported; inside Claude Code it is substituted).
- `motion-setup/SKILL.md` section 4: the ffprobe line works unchanged (`out/hello.mp4` matches the template's `npm run render`).
- `motion-stills-loop/SKILL.md` step 2: state that the reference gives the command that produces `stills/fNNNN.png`; the glob in the contact-sheet command only matches that naming.
- `README.md` quick start, HyperFrames: add `npx hyperframes browser ensure`, the 1 GB disk note, and that anonymous CLI telemetry can be disabled with `npx hyperframes telemetry disable`.
- `docs/HELLO-SPEC.md` (both versions): decide the headline overflow. Smallest change: headline 104 px (about 840 px wide, still above the 96 px minimum in `motion-direction`) or a wider card; the Remotion version needs the same change.
- `NOTES.md`: HyperFrames Chrome handling and Node version are now verified (Node 22+, own headless shell). `${CLAUDE_SKILL_DIR}` in prose is still untested inside Claude Code.

## Re-render after integrate

HELLO-SPEC changed (headline 96 px, card 1040 px wide, morph 1040 to 960; middle still 1000 x 350). The HyperFrames template was updated to the same values and the clip re-rendered in `~/scratch/motion-craft-proof/` under `flock ~/scratch/motion-craft-proof/.render.lock`. Full render `npm run render` (flock-wrapped): **13.9 s wall** (CLI: rendered in 12.0 s), peak RSS 492 MB, 418 KB mp4, ffprobe 1920x1080, 30/1, 120 frames. Fresh `npm install`, `browser ensure` (Chrome already cached) and `check` passed. Stills via the reference `FRAMES="30 66 119"` block: start, middle, end replaced. The headline now spans about 873 px inside the 1040 px card (x 523 to 1395 at frame 30 of the HyperFrames still, card edges at 373 and 1547). The earlier numbers above describe the pre-integrate clip. Cross-renderer PSNR of the new stills: start 35.1 dB, middle identical, end 35.4 dB (anti-aliasing only). node_modules and frames were deleted afterwards.
