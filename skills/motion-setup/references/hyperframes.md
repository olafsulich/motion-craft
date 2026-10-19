# HyperFrames: setup, scaffold, render

HyperFrames (HeyGen, Apache-2.0, no per-render fees) renders an HTML page to mp4: headless Chrome steps a paused GSAP timeline one frame at a time and ffmpeg encodes the frames. Docs: https://github.com/heygen-com/hyperframes and `npx hyperframes docs <topic>`. Tested here with `hyperframes` 0.8.174, `gsap` 3.15.0, Node 24, Linux x64.

## 1. Preflight notes specific to HyperFrames

| Need | HyperFrames behaviour |
|---|---|
| Node | 22 or newer (`engines` in its package.json). |
| ffmpeg, ffprobe | On PATH. |
| Chrome | **None needed on PATH.** The renderer uses its own `chrome-headless-shell` (about 114 MB download, about 260 MB unpacked, cached in `~/.cache/hyperframes/chrome`). Fetch it up front: `npx hyperframes browser ensure` (about 7 s). Do not trust `npx hyperframes doctor` on this point: it also reports "Archive extractor not found" when `unzip` is missing, yet the download still unpacks. |
| Disk | **At least 1 GB free on the disk that holds the output file**, or `render` stops with "Low disk space" before drawing a frame. `node_modules` is about 120 MB. |
| Memory | The hello render peaked at about 0.5 GB RSS (one worker). Each extra worker is another Chrome (about 256 MB). On a small box pass `--workers 1`. |
| Telemetry | The CLI sends anonymous usage telemetry. Tell the user; opt out with `npx hyperframes telemetry disable`. |

Do not install anything globally. Everything below is local to the project (`npx` runs the pinned local copy).

## 2. Scaffold from the template

```bash
cp -r "${CLAUDE_SKILL_DIR}/../../templates/hyperframes-hello" ./motion-hello
cd motion-hello
npm install                      # about 3 s with a warm npm cache, about 120 MB of node_modules
npx hyperframes browser ensure   # one-off Chrome headless shell download
npx hyperframes check            # lint + runtime + layout + motion + contrast, about 7 s
```

`check` must end with "Check passed". The template pins `hyperframes` and `gsap` to exact versions in `package.json`, so re-renders stay identical; change the pins deliberately (`npx hyperframes@latest upgrade --project . --check` shows the delta).

Layout: `index.html` is the composition (one root element with `data-composition-id`, `data-width`, `data-height`, `data-duration`), `fonts/` holds the bundled Inter files, `hyperframes.json` is the project config. GSAP is loaded from `node_modules`, not a CDN, so renders work offline. Live preview with reload: `npx hyperframes preview --port <free port> --no-open`; stop it with `npx hyperframes preview --stop`.

## 3. Render to mp4

```bash
mkdir -p out
npm run render        # = hyperframes render --output out/hello.mp4
```

Measured: 14 s wall for the 120-frame hello clip (11.6 s of it frame capture, which the CLI prints itself), 469 KB output, one worker, software GL. Heavier pages, big images and more workers change that.

Useful flags (all in `npx hyperframes render --help`): `--fps 30`, `--quality draft|looks|delivery` (default `looks`, CRF 16; `draft` while iterating), `--workers N`, `--output path`, `--quiet`.

Verify:

```bash
ffprobe -v error -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate,nb_frames:format=duration -of default=nw=1 out/hello.mp4
```

Expected: `h264`, `yuv420p`, 1920x1080, `30/1`, `nb_frames=120`, `duration=4.000000`.

Frame `f` is shown at `t = f / fps` seconds. The 4 s hello clip has frames 0 to 119.

## 4. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Low disk space ... 0.0 GB free at <output dir>` | The guard checks the output directory's disk and wants at least 1 GB. Free space, or render to a disk that has it with `--output /path/on/that/disk/hello.mp4` and copy the small mp4 back. |
| `Chrome Headless Shell is required` | Run `npx hyperframes browser ensure`. If it cannot download, see `npx hyperframes browser --help` and `npx hyperframes docs troubleshooting` for pointing it at an installed Chrome (not tested here). |
| Render dies with "Target crashed" or out of space | Point `TMPDIR` at a real disk directory; relocate the frame cache with `--frames-cache-dir <dir>` or `HYPERFRAMES_EXTRACT_CACHE_DIR`. |
| `check` reports layout or contrast issues | Fix the composition and rerun `check`. Do not render until it passes. |
| Text drawn in a fallback font | The `@font-face` URL is wrong. `snapshot` prints `Fonts: N loaded`; N must match your font files. |
| A render hangs on a loaded machine | Lower `--workers`; raise `--player-ready-timeout` (ms). |

Before handing over, stop any preview server and check that no `chrome-headless-shell` process of yours is left (`pgrep -fa chrome-headless-shell`).
