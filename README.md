# motion-craft

A Claude Code plugin that helps you direct and render polished motion-graphics clips (UI and announcement animations with kinetic type) as mp4 files. You need Claude Code and nothing else. The plugin does not ship a renderer: it sets one up for you and adds the part that is usually missing, which is direction and review.

Skills:

| Skill | What it does |
|---|---|
| `motion-setup` | Checks Node, ffmpeg and free disk, picks the renderer, copies a hello-world clip and renders it to mp4. |
| `motion-direction` | Turns an idea into a treatment and keeps the clip from looking like generic AI animation. |
| `motion-stills-loop` | Plan, render key stills, review, get your approval, then render the full clip. |

Renderers: **HyperFrames** (default; HTML/CSS/GSAP, Apache-2.0) or **Remotion** (optional; React, see the licence note).

## Install

In Claude Code, from a local clone (or a repository URL / `owner/repo` once it is hosted):

```
/plugin marketplace add /path/to/motion-craft
/plugin install motion-craft@motion-craft
```

The same in a shell: `claude plugin marketplace add /path/to/motion-craft` and `claude plugin install motion-craft@motion-craft`. Skills are namespaced: `/motion-craft:motion-setup`, `/motion-craft:motion-direction`, `/motion-craft:motion-stills-loop`. Claude also loads them on its own when you ask for an animation.

## Quick start

Ask Claude: "Set up motion-craft and render the hello clip." It runs `motion-setup`, which asks which renderer you want.

**HyperFrames (default)**

1. Preflight: Node 22+, ffmpeg and ffprobe, at least 2 GB free disk (HyperFrames refuses to render below 1 GB; it needs about 400 MB). No system Chrome needed.
2. The skill copies `templates/hyperframes-hello/` to `./motion-hello`, runs `npm install` and `npx hyperframes browser ensure` (downloads about 115 MB of headless Chrome once), then `npx hyperframes check` and `npm run render`.
3. Result: a 1920x1080, 30 fps, 4 s `out/hello.mp4` in about 15 s. Commands: `skills/motion-setup/references/hyperframes.md`. The CLI sends anonymous telemetry; opt out with `npx hyperframes telemetry disable`.

**Remotion**

1. Same preflight, with more disk: allow about 800 MB (`node_modules` 490 MB, Chrome 300 MB) plus temp frames. A full disk makes the Chrome download fail with `ENOSPC` or a render hang at low CPU. The skill first asks whether your organisation may use Remotion for free (see below).
2. It copies `templates/remotion-hello/` to `./motion-hello`, runs `npm install`, then `npx remotion render src/index.ts hello out/hello.mp4 --concurrency=2`. The first render downloads about 100 MB of Chrome Headless Shell; if that is blocked, add `--browser-executable=/path/to/chrome-headless-shell` or Chromium.
3. Same output in about 20 s. Commands: `skills/motion-setup/references/remotion.md`.

Then ask for your own clip: "Make a 10 s announcement clip for X." `motion-direction` writes a treatment, `motion-stills-loop` shows you stills before the full render.

The hello clip is specified in [docs/HELLO-SPEC.md](docs/HELLO-SPEC.md). Both templates follow it (headline 96 px on a 1040 px card).

## Licence

- This plugin: MIT, see [LICENSE](LICENSE).
- HyperFrames: Apache-2.0, no per-render fees.
- **Remotion has its own licence.** Free for individuals, for-profit organisations with up to 3 employees, non-profits and evaluation; a paid Company License is required for larger for-profit organisations. Check https://www.remotion.dev/docs/license (pricing: https://www.remotion.pro/license). The plugin does not grant or replace it.

Status: v0.1.
