# Digital validation for Apple-platform behavior

Digital validation should prove the logic and integration you control. It does
not need a physical device to assert what the app does after a framework emits
a documented error.

## Required layers

1. **Pure policy tests** inject each owned failure and lifecycle state. Assert
   the exact route, retry count and delay, rollback, and terminal state.
2. **Framework-contract tests** compile references to the current typed Apple
   symbols and, where useful, assert documented raw values such as
   `cannotStartRecording == 561145187` in the iOS test target.
   Exercise every current framework enum case through the adapter, including
   documented generic cases such as `AVAudioSession.ErrorCode.unspecified`.
3. **Target compilation** builds the real app, widgets, keyboards, intents, and
   other extensions. This catches availability and target-membership errors a
   platform-neutral unit test misses.
4. **Build-for-testing** compiles the XCTest bundle against the actual simulator
   SDK even if the local CoreSimulator service is unhealthy.
5. **Structural invariants** reject known lossy APIs or forbidden routes when a
   future edit could still compile. Keep these checks narrow and semantic.
   For a framework-enum boundary, reject equality chains and catch-all
   `default`; require an exhaustive switch plus `@unknown default`.
6. **Simulator execution**, when available, exercises deterministic UI,
   persistence, scene transitions, and injected failures.
7. **Release checks** validate signing, entitlements, native fingerprints,
   upload lineage, and production deployment separately.

Set `SWIFT_TREAT_WARNINGS_AS_ERRORS = YES` on first-party Swift targets, or run
an equivalent dedicated compiler contract with `-warnings-as-errors`. This is
what makes Swift's warning for a newly added SDK enum case stop the release.

## Failure-injection example

```swift
func testBackgroundPolicyRefusalRequestsForeground() {
    XCTAssertEqual(
        StartPolicy.action(
            for: .cannotStartRecording,
            lifecycle: .background
        ),
        .continueInForeground
    )
}

func testUnknownFailureNeverEntersRetryLoop() {
    XCTAssertEqual(
        StartPolicy.action(for: .other, lifecycle: .background),
        .fail
    )
}
```

Also prove the foreground case does not request foreground recursively and that
the transient case exhausts its bounded budget.

## Simulator boundary

The simulator is useful, but it is not a model of every iPhone subsystem. It
may use the Mac microphone, omit real Bluetooth routing, keep different process
timing, and fail to reproduce background resource policy. Therefore:

- use it for code paths the simulator actually executes;
- inject hardware/policy outcomes for deterministic branching tests;
- never describe simulator success as proof of physical microphone behavior;
- never make a physical device a prerequisite for proving pure error routing,
  compiling native targets, or shipping when the product's release contract
  accepts those digital gates.

Report exactly which layer passed and which external behavior remains
unobserved.
