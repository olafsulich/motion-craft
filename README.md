# motion-craft

A Claude Code plugin that helps you direct and render polished motion-graphics clips (UI and announcement animations with kinetic type) as mp4 files. You need Claude Code and nothing else. The plugin does not ship a renderer: it sets one up for you and adds the part that is usually missing, which is direction and review.

Skills:

| Skill | What it does |
|---|---|
| `motion-setup` | Checks Node, ffmpeg and Chrome/Chromium, picks the renderer, copies a hello-world clip and renders it to mp4. |
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

1. Preflight: Node 22+, ffmpeg, Chrome or Chromium.
2. The skill copies `templates/hyperframes-hello/` to `./motion-hello`, installs dependencies and renders it.
3. Result: a 1920x1080, 30 fps, 4 s `hello.mp4`. Commands: `skills/motion-setup/references/hyperframes.md`.

**Remotion**

1. Same preflight. The skill first asks whether your organisation may use Remotion for free (see below).
2. It copies `templates/remotion-hello/` to `./motion-hello`, installs and renders.
3. Same output. Commands: `skills/motion-setup/references/remotion.md`.

Then ask for your own clip: "Make a 10 s announcement clip for X." `motion-direction` writes a treatment, `motion-stills-loop` shows you stills before the full render.

The hello clip is specified in [docs/HELLO-SPEC.md](docs/HELLO-SPEC.md). Both templates follow it.

## Licence

- This plugin: MIT, see [LICENSE](LICENSE).
- HyperFrames: Apache-2.0, no per-render fees.
- **Remotion has its own licence.** Free for individuals, for-profit organisations with up to 3 employees, non-profits and evaluation; a paid Company License is required for larger for-profit organisations. Check https://www.remotion.dev/docs/license (pricing: https://www.remotion.pro/license). The plugin does not grant or replace it.

Status: v0.1.
