# orka features

Feature map for the motion-craft repo. Each entry: how to reach it, how to drive it, how to prove it, when it was last proven. This repo has no UI and no package.json: every feature is a file or a shell command.

Staleness: `orka` re-proves any entry whose commit is older than HEAD. The entries below were proven against HEAD `771c898ae4ec513d0267e1a243ffcbf0a6166478` with the job's changes uncommitted in the worktree, so re-prove them after the commit.

## plugin-removed
- reach: repo root, `git diff --cached --name-status`
- drive: none
- prove: `.claude-plugin/` absent (`ls -d .claude-plugin` fails) and `git diff --cached --name-status` lists `D .claude-plugin/marketplace.json` and `D .claude-plugin/plugin.json`
- last verified: 2026-10-21 at 771c898 (uncommitted changes). Proof: `results/verifier-proof.txt`

## readme-install
- reach: `README.md`, section `## Install`
- drive: read the section; run its two copy blocks literally (see `install-sim`)
- prove: the section names `~/.claude/skills/` and `<project>/.claude/skills/`, names `.claude/templates/`, and says skills are invoked as `/motion-setup`, `/motion-direction`, `/motion-stills-loop`. `grep -niE 'plugin|marketplace|namespac|motion-craft:' README.md` returns nothing.
- last verified: 2026-10-21 at 771c898 (uncommitted changes). Proof: `results/verifier-proof.txt`

## install-copy-resolves
- reach: the README copy commands, run in a scratch directory with `HOME` overridden (the real `~/.claude` is not touched)
- drive: `results/install-sim.sh` (copies `skills/*` and `templates/` as the README says, then runs the `cp -r "${CLAUDE_SKILL_DIR}/../../templates/<t>"` line from `skills/motion-setup/SKILL.md` with `CLAUDE_SKILL_DIR` set to the installed skill folder)
- prove: both `hyperframes-hello` and `remotion-hello` resolve for the per-project and global installs, and each copy is identical to `templates/<t>`. A skill copied without `templates/` fails (negative control).
- last verified: 2026-10-21 at 771c898 (uncommitted changes). Proof: `results/install-sim.txt`
- limit: `CLAUDE_SKILL_DIR` is set by hand in the simulation. Claude Code's own substitution inside a SKILL.md bash block is not tested here (NOTES.md already lists it as assumed).

## skills-wording-only
- reach: `git diff 771c898 -- skills/`
- drive: read the diff
- prove: one file changed (`skills/motion-setup/SKILL.md`), 3 insertions and 3 deletions, all prose; no command or path changed except the wording around `${CLAUDE_SKILL_DIR}`. Each of the three skills still has its hyperframes and remotion references.
- last verified: 2026-10-21 at 771c898 (uncommitted changes). Proof: `results/verifier-proof.txt`

## refs-no-plugin-wording
- reach: `grep -rniIE 'plugin|marketplace|motion-craft:' --exclude-dir=.git .`
- drive: run the grep
- prove: all hits are in `docs/BUILD-BRIEF.md`, which carries the `Superseded on packaging` banner on line 3. `NOTES.md`, the skills and the template READMEs have no hits. `NOTES.md` records the decision and links https://code.claude.com/docs/en/skills.
- last verified: 2026-10-21 at 771c898 (uncommitted changes). Proof: `results/verifier-proof.txt`

## project-checks (npm test, npm run check)
- reach: repo root
- drive: none
- prove: not applicable. There is no `package.json`, so neither script exists. Recorded as skipped, not as a pass.
- last verified: 2026-10-21 at 771c898
