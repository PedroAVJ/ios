---
name: internal-testflight
description: Deliver an iOS app build to an App Store Connect internal TestFlight group when the user requests remote iPhone testing or internal beta delivery. Verify upload, Apple processing, tester access, and remote backend reachability; do not apply to unrelated mobile development.
---

# Internal TestFlight delivery

Treat **available to the intended internal tester on the iPhone** as the delivery outcome. User requests to deliver through internal TestFlight authorize normal build, upload, and group assignment; do not insert redundant permission pauses. Preserve genuine Apple account, role, new legal-agreement, export-compliance, signing, and tester-access requirements. Never accept agreements on the user's behalf unless separately authorized.

## 1. Establish the delivery contract

- Read repository instructions and existing build/release configuration. Identify app, Apple team, bundle ID, version/build number, target/scheme or Expo/EAS project, intended internal group, and intended tester from existing evidence. Do not guess IDs or widen the tester list.
- Check current app and server behavior on a phone away from the development Mac. `localhost`, `127.0.0.1`, simulator host aliases, and a Mac LAN address will not make a TestFlight app remotely usable. Use an existing authenticated reachable backend or an existing private network path that the iPhone can access. Verify login and a representative persisted action from the remote path. Do not create a public unauthenticated bridge or weaken access controls. If backend delivery is a separate authorized task, complete it through its declared release path.
- Check installed Xcode/CLI and current project settings. Prefer the repository's existing release pipeline or Expo/EAS configuration, then Xcode's Archive/Distribute App workflow. Do not introduce a new CI service or signing strategy simply to upload one build.

## 2. Discover access and signing safely

- Read only non-secret account/team and signing metadata from Xcode project, `xcodebuild -list`, selected `xcodebuild -showBuildSettings` keys, `xcode-select -p`, and `security find-identity -v -p codesigning` when useful. Inspect existing CI/EAS credential *presence* and profile names without printing tokens, private keys, provisioning profile content, `.env` values, or complete build logs that may contain secrets.
- Confirm the App Store Connect app record matches bundle ID and the signed team's account. A TestFlight upload requires an Apple Developer Program account and an authorized App Store Connect role. Reuse configured credentials/session; do not start account recovery or repeatedly restart a live authentication challenge.
- Increment the build string for a new upload and preserve the app's versioning convention. Confirm release configuration uses its intended production or test backend, entitlements, and privacy settings. Build and run appropriate existing checks before upload.

## 3. Archive and upload

- Native Xcode path: select the app scheme and an iOS device destination, Product > Archive, then Organizer > Distribute App > App Store Connect > Upload. Choose **TestFlight Internal Only** when this build is expressly limited to internal testing and the current Xcode offers it. Review the selected team, signing, bundle ID, version/build, and upload options before submission. The internal-only designation cannot be used for external testers or App Store customers.
- For a repository with a trusted scripted path, use its existing `xcodebuild archive` and `xcodebuild -exportArchive` configuration, or existing Expo/EAS build and submission profiles. Inspect the installed tool's actual flags and export options; do not invent a generic `ExportOptions.plist`, credentials, profile name, or upload command. Keep signing secrets in their configured secure store and out of terminal output.
- Resolve actionable validation, provisioning, metadata, or compatibility errors. Stop if Apple requires a human agreement, missing role, unavailable credential, or an unapproved security change. Report the exact blocker.

## 4. Verify Apple and tester delivery

- Read back the uploaded build in the **correct app** under App Store Connect > TestFlight. Record bundle ID, version/build string, upload time, and Apple processing/status. An upload-success response alone is not TestFlight availability; wait for processing and address any compliance or beta information prompts.
- Under **Internal Testing**, identify or create the intended internal group, add the processed build, fill “What to Test” when requested, and verify the intended internal App Store Connect tester is in the group. Confirm build-to-group association and tester eligibility by readback. Internal testers must be App Store Connect users with app access; do not silently switch to external testing or share a public invite link.
- Where possible, confirm the intended tester can see/install that exact version in TestFlight on the iPhone. If device access is unavailable, state that group/build readback is verified and device installation remains unverified. Verify the remotely reachable backend independently; TestFlight distribution does not solve backend network access.

## Report precise status

Use the strongest observed state only: **blocked** (reason/action), **archived**, **uploaded/processing**, **processed**, **assigned to internal group**, **available to tester** (only with tester eligibility and build association), or **installed and remote flow verified** (device evidence). Include exact version/build and the remaining gap. Do not call a build “shipped” based on local tests, archive creation, or upload alone.

## Apple sources

- [Xcode distribution](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)
- [Upload builds and processing](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds)
- [Add internal testers and builds](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers)
- [Add testers to builds](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-testers-to-builds)
- [Build statuses](https://developer.apple.com/help/app-store-connect/reference/app-build-statuses/)

Recheck Apple documentation and installed Xcode when an option, role, or upload rule affects the current release; these surfaces change.
