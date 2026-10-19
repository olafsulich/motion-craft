---
name: motion-setup
description: Set up a motion-graphics rendering pipeline and prove it with a hello-world clip. Use when the user wants to make an animation, motion graphic, kinetic-type or UI clip as an mp4 and has not rendered anything yet, or when a render fails on a fresh machine. Checks Node, ffmpeg, free disk and a headless Chrome route, picks the renderer (HyperFrames by default, Remotion optional), copies the hello template, and renders it to mp4.
---

# motion-setup

Goal: get from nothing to a rendered `hello.mp4` before any creative work, so later failures are about the clip and not the machine.

## 1. Preflight

Run these and report a table of found / missing / version. Fix or ask before going on.

| Need | Check | Notes |
|---|---|---|
| Node | `node -v` | 22 or newer (HyperFrames requires 22+; 24 was used to test this plugin). |
| ffmpeg + ffprobe | `ffmpeg -version`, `ffprobe -version` | Both must be on PATH. Install with the system package manager (`apt install ffmpeg`, `brew install ffmpeg`). |
| Free disk | `df -h . "${TMPDIR:-/tmp}"` | **Warn below about 2 GB free** on both the project disk and the temp disk. Needs: HyperFrames about 400 MB (`node_modules` 120 MB + Chrome 260 MB) and it refuses to render below 1 GB free; Remotion about 800 MB (`node_modules` 490 MB + Chrome 300 MB) plus temp frames. On a full disk Remotion's Chrome download dies with `ENOSPC` and a render can hang at low CPU instead of failing. Free space first; do not delete caches you did not create. |
| Memory | `free -h` | Aim for 4 GB free RAM. Close other browsers before rendering. |
| Chrome | Nothing to install. Optional: `command -v google-chrome chromium chromium-browser`, `ls ~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`; on macOS look in `/Applications` | **Neither renderer needs a system Chrome**: each downloads its own Chrome Headless Shell on first use (HyperFrames about 115 MB via `npx hyperframes browser ensure`, Remotion about 100 MB on first render or `npx remotion browser ensure`). **Fallback if the download is blocked or the disk is too small:** Remotion accepts an existing headless shell or Chromium with `--browser-executable=/path/to/binary` on every render and still command (tested with Playwright's `chrome-headless-shell`). A system Chrome route for HyperFrames is untested; see its reference. |
| Temp dir | `echo $TMPDIR` | If a render dies with "Target crashed" or runs out of space, point `TMPDIR` at a real disk directory (many systems back `/tmp` with RAM). |

Do not install anything globally without asking.

## 2. Pick the renderer

Detect first: a `hyperframes` or `remotion` dependency in an existing `package.json`, or a project already using one. If there is none, ask once:

- **HyperFrames (default).** HTML/CSS/GSAP clips rendered by headless Chrome and ffmpeg. Apache-2.0, no per-render fees. Details: [references/hyperframes.md](references/hyperframes.md).
- **Remotion (optional).** React components rendered by headless Chrome and ffmpeg. Details: [references/remotion.md](references/remotion.md). **Read the licence note below before choosing it.**

If the user has no preference, use HyperFrames.

### Remotion licence (state this plainly whenever Remotion is picked)

Remotion is free for individuals, for-profit organisations with up to 3 employees, non-profits, and evaluation. A for-profit organisation with more than 3 employees needs a paid Company License. Making videos commercially is allowed under either; copying or modifying Remotion to sell your own derivative is not. The licence is announced to change in Remotion 5.0. Source: https://www.remotion.dev/docs/license and https://github.com/remotion-dev/remotion/blob/main/LICENSE.md (pricing: https://www.remotion.pro/license). Ask the user whether their organisation qualifies; do not decide for them. If it does not, suggest HyperFrames.

## 3. Scaffold the hello project

The plugin ships one identical ~4 s clip per renderer (a spring with tiny overshoot, a camera zoom, a shape morph, kinetic type). Copy the template into the user's working directory; never edit it in place:

```bash
# HyperFrames (use remotion-hello for Remotion). Claude Code substitutes ${CLAUDE_SKILL_DIR};
# in a shell you run yourself, write out the plugin's path instead (the repo root has templates/).
cp -r "${CLAUDE_SKILL_DIR}/../../templates/hyperframes-hello" ./motion-hello
cd motion-hello
npm install                      # warns about esbuild's postinstall: harmless
npx hyperframes browser ensure   # HyperFrames only: fetch its headless Chrome (Remotion fetches on first render)
```

The clip is specified in `docs/HELLO-SPEC.md` at the repo root. Every later command in this skill and its reference runs from inside `./motion-hello`. Use `${CLAUDE_SKILL_DIR}/../../templates/remotion-hello` for Remotion, and see its reference for `--browser-executable` and `TMPDIR`.

## 4. Render to mp4

Follow the render command in the chosen reference. Expect 1920x1080, 30 fps, 120 frames, silent mp4. Then verify:

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -of default=nw=1 out/hello.mp4
```

Report the file path, size and render time (about 14 to 21 s for the hello clip). The `out/` directory is created by the renderer or `mkdir -p out`. If the file is missing or has the wrong size, use the troubleshooting section of the reference before retrying; change one thing per retry.

## 5. Hand over

Tell the user the pipeline works, where the project is, and what comes next: plan the real clip with the `motion-direction` skill, then review it with `motion-stills-loop`. Close any browser the renderer left running.
