# motion-hello (Remotion)

The motion-craft hello clip, built to `docs/HELLO-SPEC.md` of the plugin repo: 1920x1080, 30 fps, 120 frames, silent.

```bash
npm install
npx remotion render src/index.ts hello out/hello.mp4 --concurrency=2
```

Deviations from the spec: spring is the closed form in `src/helpers.ts` (not `spring()`); Inter is the latin subset only (SIL OFL, `public/fonts/OFL.txt`). The 132 px headline is wider than the 880 px card, as the spec's numbers imply.
