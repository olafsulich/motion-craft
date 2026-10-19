# Notes

## Open questions

1. **Final name.** `motion-craft` is a working name. Renaming means changing `plugin.json`, `marketplace.json` (entry and marketplace `name` must stay identical to the manifest name) and the README install lines.
2. **GitHub account / hosting.** Which account or organisation hosts the marketplace repo; until decided, install is from a local path. Not created, not pushed.
3. **Lambda / cloud rendering.** Out of scope for v0.1. Remotion Lambda and HyperFrames cloud/Lambda options exist (HyperFrames Lambda support is reported only by an aggregator, unverified); accounts, secrets and cost would land on the user.
4. **Support promise.** As-is examples, or tracking upstream HyperFrames/Remotion CLI changes?
5. **`npx skills add`** as a skills-only install path: untested for this repo layout.
6. **Remotion 5.0 licence.** LICENSE.md says terms change in 5.0; re-check on each major release.

## Facts not verified (as of 2026-10-19)

- Remotion's default Chrome Headless Shell download was never completed end to end (the proof disk was full); the `--browser-executable` fallback with Playwright's headless shell is what was tested. Remotion's minimum Node is documented as 18+; the proof ran on Node 24.
- HyperFrames with a system Chrome instead of its own headless shell: untested (it downloads its own, which was verified).
- Pixel diff of the two hello clips: only three stills compared (PSNR 35.1 dB start, 35.4 dB end, identical middle); the six-frame comparison in the spec was not run.
- Verified in the proofs: HyperFrames needs Node 22+ and no system Chrome (own headless shell); Remotion needs no system Chrome per its docs.
- `${CLAUDE_SKILL_DIR}` use inside SKILL.md body is documented for running bundled scripts; its use for template paths inside prose is assumed, not tested.
- `claude plugin validate` was not run in this pass.
- Skill `name` length limit: the skills page states none.

## Documentation checked

- Plugins overview: https://code.claude.com/docs/en/plugins (manifest at `.claude-plugin/plugin.json`; skills run as `/<plugin>:<skill>`)
- Create a marketplace: https://code.claude.com/docs/en/plugin-marketplaces (marketplace.json requires `name`, `owner`, `plugins`; each entry needs `name` and `source`; relative path source; `/plugin marketplace add`, `/plugin install name@marketplace`)
- Marketplace reference: https://code.claude.com/docs/en/plugins/marketplace-reference
- Manifest reference: https://code.claude.com/docs/en/plugins/manifest-reference
- Skills: https://code.claude.com/docs/en/skills (SKILL.md frontmatter: `name`, `description` etc.; `description` + `when_to_use` truncated at 1,536 chars; keep SKILL.md under 500 lines; link supporting files)
- Remotion licence: https://www.remotion.dev/docs/license and https://raw.githubusercontent.com/remotion-dev/remotion/main/LICENSE.md (read 2026-10-19: free for individuals, for-profits up to 3 employees, non-profits, evaluation; Company License otherwise; Remotion 5.0 changes). Pricing: https://www.remotion.pro/license
- HyperFrames: https://github.com/heygen-com/hyperframes (Apache-2.0, Node 22+)

## Proof fixes

Both proof logs (`docs/PROOF-hyperframes.md`, `docs/PROOF-remotion.md`) proposed fixes. Status after integration:

Applied (13):

1. HF/RM: Chrome row says no system Chrome needed for either renderer, with download sizes and the `--browser-executable` fallback (`motion-setup/SKILL.md`).
2. HF/RM: disk row replaced by a `df -h . "$TMPDIR"` check that warns below about 2 GB, with per-renderer budgets, the HyperFrames 1 GB guard and the Remotion ENOSPC / low-CPU hang (`motion-setup/SKILL.md`).
3. HF/RM: section 3 has explicit `cp`, `npm install`, `browser ensure`; says `${CLAUDE_SKILL_DIR}` is substituted by Claude Code but must be written out in a user shell.
4. HF/RM: section 4 states commands run from `./motion-hello` and that `out/` is created by the renderer or `mkdir -p out`.
5. HF/RM: `motion-stills-loop/SKILL.md` step 2 says the reference command produces zero-padded `fNNNN.png` names and the globs depend on them.
6. HF/RM: README quick starts match SKILL.md and the references: disk figures, `browser ensure`, first-render download, `--browser-executable`, telemetry opt-out.
7. HF/RM: HELLO-SPEC headline overflow: headline 96 px (the `motion-direction` minimum) and card 1040 px wide (morph `lerp(1040, 960, m)`, middle still 1000 x 350). Headline is about 873 px wide, about 83 px margin per side. Both templates changed, 3 stills each re-rendered.
8. NOTES "Facts not verified" updated (above).
9. Reference lines contradicted by the spec change fixed: `motion-direction/references/hyperframes.md` (3 lines) and `remotion.md` (1 line).
10. Template READMEs: the overflow notes replaced with the corrected values.
11. HF items 1 to 4 and 6 and Remotion items 1 to 5 were already fixed in the references by the proof workers; unchanged here.
12. README says the hello clip follows the corrected values.
13. Remotion "state Remotion downloads its own Chrome": in the Chrome row.

Per-item accounting. HF = `docs/PROOF-hyperframes.md` "Steps that were wrong", RM = `docs/PROOF-remotion.md` "Wrong or missing steps". Each item by number:

- HF 1 (preflight asks for Chrome): applied: skills/motion-setup/references/hyperframes.md:11
- HF 2 (1 GB disk guard): applied: skills/motion-setup/references/hyperframes.md:12 and :57
- HF 3 (stills naming): applied: skills/motion-stills-loop/references/hyperframes.md:13
- HF 4 (`hyperframes doctor` reports missing `unzip` and a failed Chrome check): applied: skills/motion-setup/references/hyperframes.md:11
- HF 5 (headline overflow): applied: docs/HELLO-SPEC.md:57 (96 px headline, 1040 px card), templates/hyperframes-hello/README.md:20
- HF 6 (`<audio>` needs an `id`, `media_missing_id`): applied: skills/motion-direction/references/hyperframes.md:118
- RM 1 (Chrome download dies on a full disk): applied: skills/motion-setup/references/remotion.md:12
- RM 2 (render hangs at low CPU on a full disk): applied: skills/motion-setup/references/remotion.md:12
- RM 3 (official Chrome download unverified; `--browser-executable` fallback): applied: skills/motion-setup/references/remotion.md:11 and :46
- RM 4 (npm warning about esbuild's postinstall / `allowScripts`): applied: skills/motion-setup/references/remotion.md:23
- RM 5 (`--browser-executable` not mentioned near the render line): applied: skills/motion-setup/references/remotion.md:11 and :46 (render commands stay minimal on purpose)
- RM 6 (headline wider than the card): applied: docs/HELLO-SPEC.md:57, templates/remotion-hello/README.md:10

Rejected:

- Headline-fix option "wider card only": at 132 px the text is about 1200 px, which would need a card of about 1300 px (68 % of frame width, over the 55 % hero framing guidance at camera 1.2). Rejected for the smaller type plus modest widening.
- Headline-fix option "104 px on the 880 px card" from the HyperFrames log: it was based on an estimate of 1060 px at 132 px. Measured width is about 1200 px (both stills), so 104 px would be about 945 px and still overhang. Rejected.
- "Pixel diff against the HyperFrames version" (Remotion deviations): partially done (3 stills), full six-frame diff left open above.
