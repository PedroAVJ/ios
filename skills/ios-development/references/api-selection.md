# Apple API selection

## “Deprecated” has two meanings

An API is formally deprecated when the installed SDK annotates it as such. An
API can also be functionally obsolete for a particular requirement even when
Apple keeps it available for compatibility. State which meaning applies.

Use this selection order:

1. Verify minimum deployment targets and every target that compiles the file.
2. Inspect the current SDK declaration, availability annotations, and error
   contract. Confirm material semantics in official Apple documentation.
3. List the product decisions that depend on the result. If different failure
   reasons require different actions, reject APIs that collapse them into a
   Boolean, nil, or undocumented side channel.
4. Prefer the narrowest current API with an observable, typed contract. Add an
   availability adapter at one boundary rather than spreading version checks.
5. Preserve compatibility only where it still serves a supported OS version or
   installed extension. Delete accidental dual paths.

## Lossless boundary pattern

```swift
enum AudioDiagnosticDomain: Equatable, Sendable {
    case osStatus
    case avfaudio
    case other
}

struct AudioDiagnostic: Equatable, Sendable {
    let domain: AudioDiagnosticDomain
    let code: Int
}

enum CaptureStartFailure: Error, Equatable, Sendable {
    case policy(AudioDiagnostic)
    case sessionInactive(AudioDiagnostic)
    case unavailable(AudioDiagnostic)
    case mediaServices(AudioDiagnostic)
    case busy(AudioDiagnostic)
    case invalidConfiguration(AudioDiagnostic)
    case missingEntitlement(AudioDiagnostic)
    case systemRecording(AudioDiagnostic)
    case expiredSession(AudioDiagnostic)
    case unspecified(AudioDiagnostic)
    case invalidNoError(AudioDiagnostic)
    case unknown(AudioDiagnostic)
}

private func classify(_ error: NSError) -> CaptureStartFailure {
    let diagnostic = AudioDiagnostic(
        domain: switch error.domain {
        case NSOSStatusErrorDomain: .osStatus
        case "com.apple.coreaudio.avfaudio": .avfaudio
        default: .other
        },
        code: error.code
    )
    guard let code = AVAudioSession.ErrorCode(rawValue: error.code) else {
        return .unknown(diagnostic)
    }
    switch code {
    case .none: .invalidNoError(diagnostic)
    case .mediaServicesFailed: .mediaServices(diagnostic)
    case .isBusy: .busy(diagnostic)
    case .incompatibleCategory, .badParam:
        .invalidConfiguration(diagnostic)
    case .cannotInterruptOthers, .cannotStartPlaying,
         .cannotStartRecording, .insufficientPriority:
        .policy(diagnostic)
    case .missingEntitlement: .missingEntitlement(diagnostic)
    case .siriIsRecording: .systemRecording(diagnostic)
    case .resourceNotAvailable: .unavailable(diagnostic)
    case .unspecified: .unspecified(diagnostic)
    case .expiredSession: .expiredSession(diagnostic)
    case .sessionNotActive: .sessionInactive(diagnostic)
    @unknown default: .unknown(diagnostic)
    }
}

func startCapture() throws(CaptureStartFailure) {
    do {
        try audioEngine.start()
    } catch {
        throw classify(error as NSError)
    }
}
```

Apple's untyped throw and `NSError` conversion exist only in this adapter. The
rest of the app receives `CaptureStartFailure` through typed throws, so raw
codes cannot accidentally acquire new meanings. Keep the whitelisted
domain/code only as typed diagnostic context or serialize it at the telemetry
call site. Compile this switch with warnings as errors: if a future SDK adds a
known case, Swift stops the build until the adapter handles it explicitly.

## Reject these designs

- Retrying a `false` result without knowing why it was false.
- Branching on `localizedDescription` or console text.
- Treating a permission denial, background-policy refusal, and resource race as
  the same “microphone unavailable” state.
- Calling a compatibility API “modern” merely because it is not annotated
  deprecated.
- Introducing a custom wrapper that still exposes only `Bool` and therefore
  preserves the information loss.
