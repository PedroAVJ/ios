# Audio, background execution, and App Intents

## Capture startup

`AVAudioRecorder.record()` returns a Boolean. That is sufficient only when all
rejections receive the same action. When the app must distinguish operating-
system policy from transient route state, use a throwing startup boundary such
as `AVAudioEngine.start()` and classify the resulting
`AVAudioSession.ErrorCode`.

Important codes include:

| Apple error | Meaning for routing |
| --- | --- |
| `cannotStartRecording` (`!rec`, 561145187) | Commonly a background recording policy refusal |
| `cannotInterruptOthers` (`!int`) | Current audio ownership cannot be interrupted |
| `insufficientPriority` (`!pri`) | The session lacks priority for the requested operation |
| `sessionNotActive` (`inac`) | The session is not active; a bounded activation/route repair may be valid |
| `resourceNotAvailable` (`!res`) | Requested audio resource is unavailable |
| `unspecified` (`what`) | A documented typed case whose product route must be chosen explicitly from lifecycle evidence |

Read the installed `CoreAudioTypes/AudioSessionTypes.h` and the current Apple
documentation before assuming the list is complete. Exhaustively switch over
every current `AVAudioSession.ErrorCode`, including `.unspecified`, then use
`@unknown default` only for cases introduced by a future SDK. Compile that
adapter with warnings as errors. Convert the framework code to an owned enum
once; do not compare magic numbers throughout the product.

An audio tap must stop accepting buffers before the engine stops, remove its
tap once, close/finalize the output file, and only then publish the file as a
durable artifact or deactivate the session. Make stop and cleanup idempotent.

## Dynamic foreground continuation

For an intent that normally works in the background but may need UI or a
foreground-only resource:

```swift
@available(iOS 26.0, *)
static var supportedModes: IntentModes {
    [.background, .foreground(.dynamic)]
}
```

On the typed policy failure, roll back the empty attempt and call
`continueInForeground(_:alwaysConfirm:)`. After it returns, reload durable
state and repeat the action. Do not set `openAppWhenRun` merely to hide a bad
background path; foregrounding is a deliberate error route.

For iOS 18-25, `ForegroundContinuableIntent` and
`requestToContinueInForeground` are the compatibility mechanism. Apple marks
that protocol unavailable to application extensions, so isolate conformance
and calls with target compilation conditions while keeping the shared intent
declaration available to WidgetKit where required.

The foreground retry must not recursively request foreground again. If the
same policy error occurs after continuation, surface it with telemetry.

## Telemetry

At minimum record:

- app lifecycle state;
- session activation state and route categories, without device names;
- framework domain/code and owned failure case;
- action chosen: foreground, bounded repair, cancel, or fail;
- attempt and short-lived correlation ID;
- whether any sample was written before cleanup.

This makes a runtime failure diagnosable without retaining audio or transcript
content.
