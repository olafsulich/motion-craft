# Notes

## Open questions

1. **Final name.** `motion-craft` is a working name. Renaming means changing `plugin.json`, `marketplace.json` (entry and marketplace `name` must stay identical to the manifest name) and the README install lines.
2. **GitHub account / hosting.** Which account or organisation hosts the marketplace repo; until decided, install is from a local path. Not created, not pushed.
3. **Lambda / cloud rendering.** Out of scope for v0.1. Remotion Lambda and HyperFrames cloud/Lambda options exist (HyperFrames Lambda support is reported only by an aggregator, unverified); accounts, secrets and cost would land on the user.
4. **Support promise.** As-is examples, or tracking upstream HyperFrames/Remotion CLI changes?
5. **`npx skills add`** as a skills-only install path: untested for this repo layout.
6. **Remotion 5.0 licence.** LICENSE.md says terms change in 5.0; re-check on each major release.

## Facts not verified (as of 2026-10-19)

- Minimum Node version for Remotion and whether each renderer downloads its own Chrome: left to the renderer references; not checked here.
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
