# Proof log: Remotion hello clip

Date 2026-10-19. Machine: Linux VPS, Node 24.20.0, 7.7 GB RAM. Remotion 4.0.536 (all `@remotion/*` the same), React 19.3.1. Proof dir: `~/scratch/motion-craft-proof/remotion/motion-hello` (copied from `templates/remotion-hello`, then followed `skills/motion-setup/SKILL.md` + `references/remotion.md`).

## Commands run (every render/still wrapped in `flock ~/scratch/motion-craft-proof/.render.lock`)

```bash
export TMPDIR=$HOME/.cache/motion-tmp            # disk-backed temp
cp -r templates/remotion-hello ./motion-hello && cd motion-hello
npm install                                      # 16.7 s wall (17 s npm), 258 packages
B=~/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
flock ~/scratch/motion-craft-proof/.render.lock npx remotion render src/index.ts hello out/hello.mp4 --concurrency=2 --browser-executable=$B   # 18 s wall
flock ... npx remotion still src/index.ts hello stills/start.png  --frame=30  --browser-executable=$B
flock ... npx remotion still src/index.ts hello stills/middle.png --frame=66  --browser-executable=$B
flock ... npx remotion still src/index.ts hello stills/end.png    --frame=119 --browser-executable=$B   # 3 stills: 28 s total (about 9 s each, includes bundling)
```

## Numbers

| Item | Value |
|---|---|
| Install | 16.7 s |
| Render wall time (120 frames, concurrency 2, PNG frames, warm Chrome) | **18 s** (includes bundling; no lock wait) |
| Single still | about 9 to 15 s (bundle + Chrome start each time) |
| Output | 202 kB |
| ffprobe | `codec_name=h264 width=1920 height=1080 pix_fmt=yuv420p r_frame_rate=30/1 nb_frames=120 duration=4.000000` |
| Disk | `node_modules` 489 MB; official Chrome Headless Shell download needs about 300 MB more (not completed, see below) |

Stills: `previews/remotion/start.png` (frame 30), `middle.png` (66), `end.png` (119). Viewed: card at rest with both words and the line mid-draw; morph about 920x350 with no text; pill with all three words.

## Wrong or missing steps found (6) and how they were fixed

1. **Chrome download dies on a full disk.** The first render started the Headless Shell download (99 MB) and crashed with `ENOSPC` while unpacking; the root disk was at 100 % (other jobs). Fixed in `motion-setup/references/remotion.md`: disk budget (about 300 MB Chrome, 490 MB node_modules, temp frames), `df` check, cleanup after `ENOSPC`.
2. **A render on a full disk hangs at low CPU instead of failing,** holding the render lock for minutes. Same fix: the `df` check and a note that a hang at low CPU can mean a full disk. (Killed it, retried once after space was freed; second run took 18 s.)
3. **The official Chrome download was never verified end to end** because of 1. The reference now documents `--browser-executable` with an existing headless shell (tested with Playwright's `chrome-headless-shell` 153) as the fallback. Unknown: whether the default download path works on this machine with free disk.
4. **npm warns about esbuild's postinstall (`allowScripts`).** The render works anyway; a note was added to the reference.
5. **Reference had no command that mentioned `--browser-executable` in the render line.** Added to the Chrome bullet and troubleshooting; the render commands in the references stay minimal (the flag is only needed with a system Chromium).
6. **HELLO-SPEC geometry: the 132 px headline is wider than the 880 px card** (about 1180 px of text; it overhangs the card at frame 30 in `start.png`). The template follows the spec exactly, so the overhang is in the clip. Decision needed (spec owner): shrink the headline, widen the card, or accept it. Not changed here.

## Deviations from HELLO-SPEC

- Spring uses the closed form (`S(n)` in `src/helpers.ts`), as the spec allows, not `spring()`. Not diffed numerically against `spring()`.
- Border is a real 2 px CSS border with `box-sizing: border-box` (inside the shape). The line is an SVG `<line>` with round caps; at length 0 it is not drawn.
- Font Inter 600/700 latin subset woff2 from `@fontsource/inter` 5.3.0 (SIL OFL, licence file shipped in `public/fonts/OFL.txt`); non-latin glyphs are not covered.
- Pixel diff against the HyperFrames version was not run.

## Proposed SKILL.md/README fixes (not applied; outside my scope)

- `motion-setup/SKILL.md` preflight: the "Memory and disk" row should say "about 1 GB free disk for Remotion (node_modules 490 MB + Chrome 300 MB), `df -h . $TMPDIR`", and mention that a render that hangs at low CPU may mean a full disk.
- `motion-setup/SKILL.md` section 1, Chrome row: say that Remotion downloads its own Chrome Headless Shell (so "none installed" is fine for Remotion) and that `--browser-executable` is the fallback.
- `motion-setup/SKILL.md` section 4: the ffprobe line uses `out/hello.mp4`; Remotion writes `out/hello.mp4` too, but the `out/` directory is created by the renderer. Fine, but state that the reference's command must be run from `./motion-hello`.
- `motion-setup/SKILL.md` section 3: `${CLAUDE_SKILL_DIR}` is not expanded in a shell the user runs; give the plain `cp -r` with the resolved path, as in the reference.
- `motion-stills-loop/SKILL.md` step 2: the glob-based contact-sheet command orders files alphabetically, which matches frame order only with zero-padded names; keep `f0090.png`-style names.
- README Remotion quick start: add the disk figure and "first render downloads about 100 MB".
- NOTES.md: update "Facts not verified": Remotion needs no system Chrome (downloads Headless Shell 157); `--browser-executable` fallback tested; add the open spec question from item 6.

## Cleanup

Chrome processes started by this job were killed after the stills; `node_modules` and `out/` in the scratch dir were removed after the proof except `out/hello.mp4`. Disk during the proof: root at 99 to 100 % until the orchestrator cleaned the npm cache; this job's scratch peaked at about 0.5 GB.

## Re-render after integrate

HELLO-SPEC changed (headline 96 px, card 1040 px wide, morph 1040 to 960; middle still 1000 x 350). The Remotion template was updated to the same values and the clip re-rendered in `~/scratch/motion-craft-proof/` under `flock ~/scratch/motion-craft-proof/.render.lock`. Full render (`--concurrency=2 --browser-executable=<Playwright headless shell>`, flock-wrapped): **20.8 s wall**, 179 kB mp4, ffprobe 1920x1080, 30/1, 120 frames. Fresh `npm install` (258 packages). 3 stills via `remotion still`: start, middle, end replaced. The headline now spans about 873 px inside the 1040 px card (x 523 to 1395 at frame 30 of the HyperFrames still, card edges at 373 and 1547). The earlier numbers above describe the pre-integrate clip. Cross-renderer PSNR of the new stills: start 35.1 dB, middle identical, end 35.4 dB (anti-aliasing only). node_modules and frames were deleted afterwards.
