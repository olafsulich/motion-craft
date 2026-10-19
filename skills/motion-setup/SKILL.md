---
name: motion-setup
description: Set up a motion-graphics rendering pipeline and prove it with a hello-world clip. Use when the user wants to make an animation, motion graphic, kinetic-type or UI clip as an mp4 and has not rendered anything yet, or when a render fails on a fresh machine. Checks Node, ffmpeg and Chrome/Chromium, picks the renderer (HyperFrames by default, Remotion optional), copies the hello template, and renders it to mp4.
---

# motion-setup

Goal: get from nothing to a rendered `hello.mp4` before any creative work, so later failures are about the clip and not the machine.

## 1. Preflight

Run these and report a table of found / missing / version. Fix or ask before going on.

| Need | Check | Notes |
|---|---|---|
| Node | `node -v` | 22 or newer (HyperFrames requires 22+; 24 was used to test this plugin). |
| ffmpeg + ffprobe | `ffmpeg -version`, `ffprobe -version` | Both must be on PATH. Install with the system package manager (`apt install ffmpeg`, `brew install ffmpeg`). |
| Chrome or Chromium | `command -v google-chrome chromium chromium-browser`; on macOS look in `/Applications` | Frames are painted by headless Chrome. If none is installed, the renderer reference says whether the renderer downloads its own. |
| Memory and disk | `free -h`, `df -h .` | Aim for 4 GB free RAM and a few GB free disk. Close other browsers before rendering. |
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

- HyperFrames: copy `${CLAUDE_SKILL_DIR}/../../templates/hyperframes-hello/` (repo root: `templates/hyperframes-hello/`) to `./motion-hello`.
- Remotion: copy `${CLAUDE_SKILL_DIR}/../../templates/remotion-hello/` (repo root: `templates/remotion-hello/`) to `./motion-hello`.

The clip is specified in `docs/HELLO-SPEC.md` at the repo root. Then install dependencies as the renderer reference says (`npm install` inside `motion-hello`).

## 4. Render to mp4

Follow the render command in the chosen reference. Expect 1920x1080, 30 fps, 120 frames, silent mp4. Then verify:

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -of default=nw=1 out/hello.mp4
```

Report the file path, size and render time. If the file is missing or has the wrong size, use the troubleshooting section of the reference before retrying; change one thing per retry.

## 5. Hand over

Tell the user the pipeline works, where the project is, and what comes next: plan the real clip with the `motion-direction` skill, then review it with `motion-stills-loop`. Close any browser the renderer left running.
