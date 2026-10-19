# Brief: build the motion-craft Claude Code plugin (v0.1): HyperFrames + Remotion versions

Olaf's decision: build the outsider skills plugin with BOTH a HyperFrames and a Remotion version. No half-day port test.

Read first (in ~/projects/motion-lab, on these branches; use `git show <branch>:<path>`):
- research/OUTSIDER-SKILLS-PLAN.md on orca/20261019065836851-plan-skills-that-help-ot
- research/RENDERER-COMPARISON.md on orca/20261019074247515-research-hyperframes-vs-
- research/SKILLS-SPLIT-PROPOSAL.md and docs/understanding/ on orca/20261019062655098-understand-motion-lab-no
Use motion-lab as the source of taste and process, but copy NO engine code. The plugin has to work for someone who has only Claude Code.

## Persona
A developer with Claude Code and nothing else. They want a polished motion-graphics clip (UI or announcement, kinetic type) as an mp4.

## Build v0.1 in this repo (~/projects/motion-craft)
A Claude Code plugin laid out like a marketplace repo (`.claude-plugin/plugin.json` + `marketplace.json`, `skills/<name>/SKILL.md`, with references and templates beside them). Check the current Claude Code plugin and skill format against the official docs, and cite them.

Skills (the first release from the plan):
1. `motion-setup`: preflight (Node, ffmpeg, Chrome or Chromium), asks or detects the renderer (HyperFrames is the default, Remotion is optional), scaffolds a hello-world project, and renders it to mp4. It must also state Remotion's license terms plainly (company license above 3 employees) when Remotion is picked.
2. `motion-direction`: house-style direction as neutral, publishable guidance. Shot intent, one hero object, big kinetic type, springs with a tiny overshoot, a camera that frames each state to roughly half to three quarters of the width, shape morphs, lines that draw on, staggered rows, one accent colour, thin borders, no drop shadows, no generic "AI animation" look, subtle SFX. No Olaf branding and no personal names.
3. `motion-stills-loop`: plan, then key stills for review, then approval, then the full render. It includes how to render single frames in each renderer.

Each skill keeps the renderer-agnostic content in SKILL.md and puts renderer specifics in `references/hyperframes.md` and `references/remotion.md` (spring helper, camera zoom, morph, draw-on, frame-accurate stills, audio). Add templates `templates/hyperframes-hello/` and `templates/remotion-hello/`: one short (~4 s) clip showing a spring and overshoot, a camera zoom, a shape morph and kinetic type, with the same look in both.

README: what it is, install (marketplace add + install), quick start for each renderer, and the licence note. MIT for the plugin unless the docs suggest otherwise. Put open questions in `NOTES.md` (final name, GitHub account, Lambda/cloud rendering), not in the README.

## Proof (required)
In a scratch dir outside the repo (`/tmp` is RAM-backed, so use `~/scratch/motion-craft-proof/`), follow `motion-setup` exactly as an outsider would, for BOTH renderers. Render both hello clips to mp4 and save 3 stills from each (start, middle, end) into `previews/` in the repo. Report the render times and any skill steps that were wrong, and fix them.

## Rules
- Low concurrency: the VPS has 7.7 GB RAM and runs other jobs. At most 2 workers at once and one render at a time. Close browsers and kill leftover Chrome when done.
- Don't touch motion-lab. Commit on the job branch; don't push anywhere, and don't create a GitHub repo.
- Report: the file tree, the stills paths, the render times for each renderer, and anything that blocked.
