# Repository guidance

- This repository is the canonical source for the `ios` plugin.
- Keep Codex and Claude plugin metadata synchronized at the same version.
- Keep guidance general to Apple-platform engineering. Incident-specific facts
  belong in the affected product repository, not here.
- Verify current installed SDK declarations and official Apple documentation
  before encoding version-sensitive behavior.
- Prefer typed/throwing framework boundaries and exhaustive owned enums over
  Boolean or string-based failure handling.
- Digital tests must prove error routing, target compilation, and forbidden
  lossy paths. Never claim a simulator reproduces physical-device policy.
- Run `npm test`, both plugin/skill validators, `git diff --check`, and
  `claude plugin validate .` before publishing.
- Release through both Package Manager catalogs and verify installation
  in Codex and Claude.
