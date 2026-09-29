# iOS plugin

Codex and Claude guidance for modern Apple-platform engineering.

The plugin teaches agents to inspect the current Xcode SDK, choose APIs that
preserve meaningful runtime failures, translate Apple framework errors into
exhaustive product states, model app and extension lifecycle explicitly,
validate behavior digitally, and route native changes through signed binary
delivery when required.

It includes focused guidance for Swift type safety, App Intents dynamic
foreground continuation, AVFoundation capture startup, simulator boundaries,
privacy-safe telemetry, and production verification.

The `internal-testflight` skill delivers an app build to an App Store Connect
internal TestFlight group and reports only the strongest verified upload,
processing, group-assignment, and tester-availability state.

## Install

From the Package Manager marketplace:

```sh
codex plugin add ios@package-manager
claude plugin install ios@package-manager
```

## Validate

```sh
npm test
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py .
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/ios-development
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/internal-testflight
claude plugin validate .
git diff --check
```
