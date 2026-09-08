# Runtime contracts and Swift type safety

Swift type safety answers questions such as “is this value a valid member of
this type?” It does not answer “will iOS grant this resource in the current
world?” Permissions, hardware routes, background execution policy, contention,
network state, disk state, and process lifetime exist outside the compiler.

The engineering goal is not to eliminate runtime failure. It is to make every
expected runtime outcome explicit and ensure the compiler helps route it. In
Swift 6, an app-owned throwing boundary should declare its concrete failure with
typed throws, or return a typed `Result` when that composes better with the API.

## Boundary to product model

Use this shape:

```text
Apple throwing API
        |
        v
one framework-error classifier + sanitized diagnostics
        |
        v
owned exhaustive error enum exposed through throws(Failure) or Result
        |
        +--> retry only with a bounded, state-changing repair
        +--> request permission or foreground continuation
        +--> cancel cleanly
        +--> fail visibly and durably
```

An invariant is a condition the program keeps true, such as “there is at most
one capture owner” or “a foreground continuation never retains an empty audio
file.” A typed error is evidence used to choose the transition that preserves
those invariants; it is not itself proof that the operation cannot fail.

## Contain type erasure

Many Apple and Objective-C throwing APIs still surface `any Error`. That is an
interop fact, not permission for untyped product logic. Catch it once beside the
framework call, convert it to a concrete app-owned error, and never expose the
original `Error` or `NSError` from that adapter.

An unavoidable `[String: Any]`, Objective-C callback, forced cast, or
`@unchecked Sendable` belongs in the same kind of private adapter. State the
invariant that makes it safe and return a checked concrete type. Product state,
policy, retries, and user-facing routing must not inspect raw domain strings,
integers, localized descriptions, or dynamic casts.

Compile framework-enum adapters with warnings as errors. An exhaustive switch
must spell every case in the installed SDK and finish with `@unknown default`.
That combination turns a newly imported SDK case into a build failure instead
of silently sending a known case down the unknown route.

## State-machine checklist

- Give transitional states names. Do not overload one Boolean for idle,
  starting, paused, and failed.
- Identify who owns state: app, extension, actor, process, or durable store.
- Include an operation/session identifier so stale callbacks are harmless.
- Roll back or finalize durable resources before crossing process, scene, or
  foreground boundaries.
- Reload shared state after that boundary.
- Define idempotency for duplicate taps, callbacks, and system retries.
- Preserve a recoverable artifact only after it contains verified user data.
  Header-only or zero-sample files are not recovery evidence.

## Retry classification

Require evidence for each retry:

| Failure kind | Normal action |
| --- | --- |
| Policy refusal in unchanged state | Change route/state or fail; never loop |
| Documented transient state | Bounded retry after a relevant repair |
| User permission | Ask through the system-owned permission flow |
| Cancellation or stale operation | Stop quietly and preserve current owner |
| Programmer/configuration error | Fail loudly in development and surface it |
| Unknown framework error | Preserve diagnostics and fail safely |

Tests must cover the “unknown” case so a future SDK error cannot silently enter
the retry path.
