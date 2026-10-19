# Remotion: setup and first render

Remotion renders React components frame by frame in headless Chrome and encodes with ffmpeg. Docs: https://www.remotion.dev/docs. Tested with `remotion` 4.0.536, Node 24.

**Licence first.** Before going on, state the Remotion licence plainly (see `SKILL.md`, "Remotion licence") and get the user's answer. Free for individuals, non-profits and for-profits with up to 3 employees; a Company License is required above that.

## Requirements

- Node 18+ is the documented minimum for Remotion; use the Node 22+ that `motion-setup` already checked.
- ffmpeg: Remotion 4 bundles its own ffmpeg binaries for rendering, so a system ffmpeg is only needed for `ffprobe` checks and stills sheets.
- Chrome: no system Chrome is needed. On the first render or still, Remotion downloads **Chrome Headless Shell** (about 100 MB) into `node_modules/.remotion`. To fetch it up front, run `npx remotion browser ensure` inside the project. To use an existing Chromium or Chrome headless shell instead (for example Playwright's, `~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`; tested), add `--browser-executable=/path/to/chromium` to any render or still command.
- Disk: allow about 300 MB for the Chrome Headless Shell download (99 MB zip plus 190 MB unpacked), about 490 MB for `node_modules`, and a few hundred MB of temp frames while rendering. A full disk shows up as `ENOSPC` during the download, or as a render that hangs at low CPU: run `df -h . "$TMPDIR"` before the first render. Delete the zip and `node_modules/.remotion` after an `ENOSPC` and retry.
- Disk-backed temp dir: Remotion writes frames to the temp dir. Where `/tmp` is RAM-backed, set `TMPDIR` first (`export TMPDIR=$HOME/.cache/motion-tmp; mkdir -p "$TMPDIR"`).

## Scaffold

```bash
cp -r "${CLAUDE_SKILL_DIR}/../../templates/remotion-hello" ./motion-hello
cd motion-hello
npm install
```

`npm install` may warn that esbuild's postinstall script is not covered by `allowScripts`; the render works regardless.

The template pins exact versions in `package.json`; do not run `npm install remotion@latest`. All `@remotion/*` packages must share one version.

## Render to mp4

```bash
npx remotion render src/index.ts hello out/hello.mp4 --concurrency=2
```

- `src/index.ts` is the entry file, `hello` the composition id (`src/Root.tsx`), `out/hello.mp4` the output.
- `--concurrency=2` keeps memory low (each worker is one Chrome tab). Raise it on a machine with 8 GB or more free; the default is half the CPU cores.
- H.264, yuv420p and PNG frames are set in `remotion.config.ts`; the clip is 1920x1080, 30 fps, 120 frames, no audio.

Verify with the `ffprobe` line from `SKILL.md`.

## Live preview (optional)

`npx remotion studio src/index.ts --port=<free port>` opens Remotion Studio with a timeline you can scrub. Pick a free port yourself; stop the studio when done.

## Troubleshooting

- **"Target crashed" / out of memory:** lower `--concurrency`, close other browsers, set `TMPDIR` on disk.
- **Chrome download fails or is blocked:** install Chromium and pass `--browser-executable`.
- **Font looks wrong (fallback sans):** the render started before the font loaded; fonts must be loaded through `loadFont` from `@remotion/fonts` with a `staticFile()` URL, as the template does.
- **Version mismatch error:** every `remotion` and `@remotion/*` dependency must have the identical exact version.
- Stop any leftover `remotion studio` or Chrome process when finished (`pgrep -fa 'chrome|remotion'`).
