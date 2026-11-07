# Phase 5 — Tests

## Goal
The three pieces of pure logic in this feature are covered, and the end-to-end question has an
answer that does not depend on a real Google account.

## Tasks
- [ ] Vitest — `next` sanitising: rejects `//evil.com`, `https://evil.com`,
      `javascript:alert(1)` and `../../etc`; accepts `/`, `/matches/1`, `/admin/players`;
      returns `/` for absent or malformed storage; clears on read.
- [ ] Vitest — member-ID normalising: trims surrounding whitespace, strips non-digits,
      rejects the wrong length (see Open question 3 in `plan.md` before fixing the length).
- [ ] Vitest — error-code → message mapping for `40005`, `40006`, `40007`, including the
      fallback for an unmodelled code.
- [ ] Extend the Go integration test as listed in `plan-1-member-link-api.md`.

## Implementation notes

**Playwright is not in this plan, and the original plan's version of it could not have worked.**
It proposed driving the sign-in flow end to end, but real Google sign-in cannot be automated
from a test — there is no password in this system and the consent screen is Google's. What
*can* be automated is everything after a session exists, by injecting a `sid` cookie for a
seeded user, which is exactly how the API was verified end to end on 2026-11-07: insert a
`sessions` row, set `sid` and `csrf`, and drive the app. That is worth doing, and it is a new
dependency, so **ask before adding it**.

**The three Vitest items are the high-value ones** because they are pure functions guarding a
security boundary and a data-entry path — the kind of thing that is cheap to test and
expensive to get wrong. `//evil.com` in particular is the case a hand-rolled check passes.

**Do not test the preview against live data.** The preview's return shape depends on Open
question 1; a test asserting a full name today would have to be rewritten if the answer is
"first name and team only".

## Verify
- `pnpm test` covers all three pure pieces and stays green.
- The Go integration test still passes on a re-run, not only on a freshly seeded database.
