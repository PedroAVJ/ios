---
name: ios-development
description: Engineer, review, debug, test, and ship modern iOS, iPadOS, watchOS, and Apple-platform code with current SDK evidence, typed framework failures, explicit lifecycle state, App Intents, AVFoundation, extensions, Swift concurrency, digital validation, native binary routing, and privacy-safe telemetry. Use whenever work involves Swift, SwiftUI, UIKit, Xcode, Apple frameworks, Expo native iOS code, App Intents, widgets, Live Activities, audio sessions, simulators, signing, TestFlight, or choosing between old and modern Apple APIs.
---

# iOS Development

Treat the installed SDK and the repository as executable contracts. Swift's
type safety prevents type confusion; it cannot promise that hardware, user
permission, process state, or operating-system policy will allow an operation.
Choose framework boundaries that expose those runtime outcomes precisely, then
make the product handle them exhaustively. In Swift 6 code, make app-owned
decision-bearing throwing boundaries use typed throws or a typed `Result`.

## Start from current evidence

1. Read the repository's `AGENTS.md`, deployment contract, minimum OS versions,
   target memberships, entitlements, and existing tests before changing code.
2. Inspect the declarations in the Xcode SDK actually used by the project. Use
   official Apple documentation when API behavior, availability, or migration
   guidance is material. Do not infer modernity from an API's age or from the
   absence of an Apple `deprecated` annotation.
3. Trace the real entry point through lifecycle state and the final framework
   call. Preserve the exact framework error domain and code in bounded,
   privacy-safe diagnostics.
4. Read [API selection](references/api-selection.md) before replacing an Apple
   API and [runtime contracts](references/runtime-contracts.md) when designing
   the product abstraction around it.

## Make invalid product states hard to express

- Prefer a throwing API, `Result`, typed delegate callback, or explicit status
  object whenever product behavior depends on why an operation failed. A
  Boolean or sentinel is acceptable only when every failure has the same safe
  response.
- Catch Apple's untyped `Error` at exactly one adapter and immediately translate
  it into an app-owned error. The adapter itself may accept `any Error` or
  `NSError`; nothing decision-bearing on its product side may expose either.
- Use Swift 6 typed throws (`throws(Failure)`) or `Result<Success, Failure>` on
  app-owned boundaries. Do not erase an owned failure back to `any Error` before
  a caller chooses its product transition.
- When Apple provides an error enum, switch over every case in the installed SDK
  and include `@unknown default`. Do not replace that switch with equality
  chains or a catch-all `default`, because both let a current case disappear
  into an unknown bucket. Compile these switches with warnings as errors so a
  future SDK case makes the build fail until it receives an explicit route.
- Switch exhaustively over the owned enum too. Separate policy refusal, transient
  state, cancellation, user permission, unavailable resource, and programmer
  error when they require different actions.
- Keep whitelisted framework domain/code metadata in a typed diagnostic value
  for telemetry, but do not pass raw integers, domain strings, localized
  descriptions, or framework errors through product decisions.
- Represent relevant lifecycle as data: foreground, inactive, background,
  suspended or relaunched; starting, active, paused, stopping, and terminal.
  Make transitions atomic and idempotent where multiple processes or extensions
  share state.
- Retry only a failure documented or observed to be transient, with a bounded
  attempt count and a state-changing repair between attempts. A retry of the
  same policy-forbidden request is a loop, not recovery.
- Treat `Any`, `AnyObject`, `any Error`, `NSError`, forced casts,
  `unsafeBitCast`, and `@unchecked Sendable` as framework-boundary escape
  hatches. Use one only when an Apple or Objective-C signature genuinely
  requires it, keep it private to the adapter, document the invariant that
  makes it safe, and expose a concrete checked type on the other side.

## App Intents and microphone work

Read [audio and App Intents](references/audio-app-intents.md) for this domain.
The essential rules are:

- Use `AVAudioEngine.start()` when startup behavior depends on the thrown
  `AVAudioSession.ErrorCode`; do not base reason-specific recovery on
  `AVAudioRecorder.record()` returning `false`.
- A background `cannotStartRecording`, `cannotInterruptOthers`, or
  `insufficientPriority` result is a policy route. Stop the empty attempt and
  continue in the foreground if the product permits that experience. Do not
  blindly recreate recorders in the same background state.
- On iOS 26+, declare both `.background` and `.foreground(.dynamic)` in an
  intent's `supportedModes`, then call `continueInForeground` only when the
  typed failure requires it. For older supported systems, isolate the
  `ForegroundContinuableIntent` compatibility path from extension targets
  where Apple marks it unavailable.
- Roll back partial durable state before foreground continuation, then reload
  current shared state when the continuation executes. Never capture a stale
  snapshot across a process or scene transition.

## Prove the behavior digitally

Read [digital validation](references/digital-validation.md). Physical hardware
is not required to prove error classification and routing:

- Inject every typed framework outcome into pure policy tests and assert the
  exact product action, retry budget, and terminal state.
- Compile the real app and every extension target against the current SDK.
  Build the iOS test bundle so availability, target-membership, and Apple error
  symbols are checked even when no simulator runtime is healthy.
- Add structural tests for critical framework choices and forbidden lossy
  paths when a regression could compile successfully.
- Use a simulator for deterministic lifecycle and UI behavior it actually
  models. Do not claim that simulated microphone, Bluetooth, suspension, or
  system-policy behavior reproduces physical hardware.
- Add privacy-safe telemetry at the throwing boundary: operation, lifecycle
  state, owned failure, whitelisted framework domain/code, chosen action, and
  attempt count. Never log audio, transcript text, file paths, device names,
  or user-assigned accessory identifiers.

## Ship

Follow the repository's declared production path. For native changes, compare
the native fingerprint and route users to a new signed binary when required;
an OTA update cannot replace native Swift. Keep source merge, deployment,
binary upload, Apple processing, and end-user acceptance as distinct states.
Do not require or operate a physical device unless the user explicitly asks.
