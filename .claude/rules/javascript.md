---
paths:
  - '**/*.{js,mjs,ts,tsx}'
---

# JavaScript Rules

These override the shared rules in `~/.claude/rules` where they conflict.

`[lint]` is enforced by `pnpm lint`. Everything else is checked in review.

## Errors

- No empty or silent `catch`. If a failure is genuinely expected, narrow to it and say why:

  ```ts
  try {
    await navigator.share(payload);
  } catch (error: unknown) {
    // The user dismissed the share sheet: not a failure.
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }

    throw error;
  }
  ```

- Show errors through `messageFor(err)`, never `err.message`.

## Async

- `[lint]` No floating promises. Await them, or mark deliberate fire-and-forget with `void`.
- `void` does not handle a rejection. Every async path that sets a loading flag must also clear
  it on failure, or the UI sticks in its loading state.
- `[lint]` No promise-returning function where a `void` callback is expected.
- Prefer `async`/`await` to `.then` chains.

## Cleanup

Anything started in an effect or subscription must be stopped: timers, listeners, observers,
object URLs. Return the cleanup from the effect that started it.

## Data

- Never mutate parameters or state. Copy, then change the copy.
- Use `Set` and `Map` for membership and lookup in code that runs repeatedly.
- Array methods are the default; do not rewrite `.map` as a `for` loop without a measured reason.

## Control flow

- Guard clauses over nesting.
- Name non-obvious numbers and strings as constants.
- Browser storage and URL params are untrusted input: validate what you read back.
