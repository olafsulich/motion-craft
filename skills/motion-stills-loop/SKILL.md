---
name: motion-stills-loop
description: Review a motion-graphics clip as still frames before spending time on the full render. Use after any edit to an animation clip, before saying a clip is done, or when the user asks to preview, check or approve motion. Plans key frames, renders them as single PNG stills, reviews them at full and phone size, gets the user's approval, and only then renders the full mp4.
---

# motion-stills-loop

Full renders take minutes; stills take seconds. Look first, render last, and never report a clip as good without having looked at its frames.

Single-frame commands per renderer: [references/hyperframes.md](references/hyperframes.md) and [references/remotion.md](references/remotion.md) (see "Stills"). Direction rules to judge against: the `motion-direction` skill.

## The loop

### 1. Plan the key frames

From `treatment.md`, list one frame per beat at the moment the beat reads best (after its entrance settles), plus the first and last frame, plus the middle of every morph or camera move. Write them as frame numbers (`frame = seconds x fps`). A 10 s clip typically needs 6 to 10 stills.

### 2. Render the stills

Render only those frames as PNG into `stills/` using the reference for the chosen renderer. Name files by frame: `stills/f0090.png`. Then build two overview images if ffmpeg is available:

```bash
# contact sheet: all stills in a grid
ffmpeg -y -pattern_type glob -i 'stills/f*.png' -vf "scale=640:-1,tile=3x" -frames:v 1 stills/contact-sheet.png
# phone-size check: same frames at 360 px wide
ffmpeg -y -pattern_type glob -i 'stills/f*.png' -vf "scale=360:-1,tile=4x" -frames:v 1 stills/phone-sheet.png
```

### 3. Look and score

Open the PNGs (read the images; do not judge from code). For each still, answer in a line:

- Is there one clear hero? What is the viewer meant to read?
- Does all text read in the phone sheet? Any text clipped, off-margin or under 28 px at 1080p?
- Is the camera framing the hero at roughly half to three quarters of the width?
- Only one accent colour? No shadows or glows? Borders thin?
- Does it look directed or generic (see `motion-direction`, section 3)?

Score the set 1 to 10, name the three worst problems, fix exactly those, re-render only the affected stills, repeat until the score is 8 or better. Also check motion, not just poses: render a strip of consecutive frames (for example 12 frames around a morph or spring) to catch pops, overshoot that is too large, or a stagger that is too even.

### 4. Ask for approval

Show the contact sheet path and your score, list what you changed in the last round, and ask the user to approve or redirect. Do not start the full render before a yes. Copy changes, new beats or a new palette send you back to step 1.

### 5. Full render

Render the mp4 with the command in the reference. Afterwards:

1. `ffprobe` the file: resolution, fps, duration match the plan.
2. Extract two or three frames from the mp4 (for example `ffmpeg -ss 2.5 -i out.mp4 -frames:v 1 check.png`) and compare them with the approved stills.
3. Report the path, duration, size and render time. Close any browser the renderer left running.

## Determinism

Animation must be a pure function of the frame number: no timers, `Date.now`, `Math.random` without a seed, or CSS animations running on the wall clock. If two renders of the same frame differ, fix that before judging anything else.
