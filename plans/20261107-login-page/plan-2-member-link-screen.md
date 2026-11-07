# Phase 2 — The linking step, and the gate that enforces it

**Status: UI done, 2026-11-07. Waiting on two endpoints to be exercisable.** The screen, the
preview card, the pure id logic and the gate are all built and green; the gate is deliberately
inert until the API sends `playerId`.

## Goal
A signed-in user with no linked player is taken to `/onboarding`, claims their member ID with
a preview before anything is written, and lands where they were going.

## Tasks
- [x] Replace the `/onboarding` stub with the linking step:
      - "Signed in as {email}" and a way out (sign out, for the wrong Google account);
      - member ID input — `inputMode="numeric"`, trims whitespace, digits only;
      - preview fires on blur, or as soon as the ID reaches full length;
      - `MemberPreviewCard`: initials avatar, "{name} · SL {n}", team number and name, and a
        captain marker when `isCaptain`;
      - "This is me · continue" — the one primary, disabled until a preview exists with
        `alreadyLinked: false`.
- [x] `useMemberPreview` and `useLinkMember` in the existing hooks layer; the two endpoints go
      in `src/api/leagueAPI.ts`, which is the only place that talks HTTP.
- [x] Skeleton while previewing; spinner on the primary while linking.
- [x] The gate, in `RequireAuth`: signed in, `playerId === null`, and not already on
      `/onboarding` → redirect to `/onboarding`, carrying `next`.
- [x] After a successful link, invalidate the `me` query so the gate re-evaluates, then
      navigate to `next`.
- [x] Copy for `40005` / `40006` / `40007` in `en.json` and `vi.json`, keyed by code like
      every other error.
- [x] Accessibility: real `<label for>`, the error tied to the input with `aria-describedby`
      and `role="alert"`, focus moved to the error when it appears, 44px targets.

## Implementation notes

**The gate goes in `RequireAuth` because there is no middleware to put it in.** That component
already owns the session check and already has the `/api/v1/me` response in hand, so the
decision costs nothing extra and lives in one place. A second guard component would mean two
things that can disagree about whether a user is linked.

**Invalidate `me` before navigating, not after.** The gate reads `playerId` from the cached
`me` query; navigating first means the gate sees the stale `null` and bounces the user straight
back to `/onboarding`. This is the single most likely bug in this phase.

**`alreadyLinked` with `linkedToMe` is a redirect, not an error.** A user who taps the primary
twice, or comes back on the browser's back button, is already linked — sending them to `next`
is correct, and showing "this ID belongs to someone else" would be a lie about their own
account.

**Preview before write, always.** The whole point of the step is that a mistyped digit shows
someone else's name rather than silently linking to them. The primary stays disabled until a
preview has actually come back.

**The error copy must not name the other account.** "This member ID is linked to another
account. Ask your league admin." is the whole message — identifying who holds it would leak
exactly what the preview is already being careful about.

## Verify
- Signed in with no linked player: every route redirects to `/onboarding`, including a deep
  link to `/matches/{id}`.
- `00000000` shows "we can't find that member ID" under the input, and the primary stays
  disabled.
- A valid unlinked ID shows the right name, skill level and team before anything is written.
- Confirming lands on `/` by default, and on `next` when one was carried.
- A member ID held by another account shows the "linked to another account" message, and the
  database still shows the original owner.
- Tapping the primary twice does not produce an error on the second tap.
- After linking as the captain of 03209, their own night shows "Start match"; a night they
  are not in does not.
- A linked user never sees `/onboarding` again.
- Keyboard only: the input is reachable and labelled, and an error moves focus to itself.


---

## Outcome, 2026-11-07

### Files
`src/lib/member-id.ts` + `member-id.test.ts` (8 tests), `src/hooks/useMemberLink.ts`,
`src/components/auth/MemberPreviewCard.tsx`, a rewritten `src/pages/OnboardingPage.tsx`, the
gate in `src/components/RequireAuth.tsx`, and `MemberPreview` plus three error codes in the
contract.

### Four decisions worth knowing

**`displayName`, not `fullName`.** An 8-digit id is guessable and the seeded ids are
sequential, so how much of a real person's name the preview reveals is a privacy decision that
belongs to the server. The card renders whatever string it is handed, so narrowing it to a
first name later changes no frontend code. **This answers Open question 1 by making it a
server-side setting rather than a UI commitment.**

**The gate is inert until the API opts in.** `playerId` is `string | null | undefined`, and
`needsMemberLink()` acts **only** on an explicit `null`. Absent means "the endpoint has not
shipped yet", so deploying this UI ahead of the backend cannot strand every user on the
linking screen — which a naive `!user.playerId` would have done to everyone, immediately.

**Invalidate `me` and wait, then navigate.** The hook's `onSuccess` awaits
`invalidateQueries`, and TanStack Query v5 awaits that before the call site's `onSuccess`
runs. The gate reads `playerId` from the cached `me`, so navigating first would bounce the
user straight back here. This was called out in the plan as the most likely bug and the code
is written specifically to avoid it.

**The preview is not fired per keystroke.** It runs on blur, or the moment the id reaches
full length. Every keystroke would be a request for an id nobody has finished typing.

### Assumption carried, not resolved

**`MEMBER_ID_LENGTH = 8`** drives `maxLength` and the auto-preview trigger, but a shorter id
can still be previewed on blur (`isLookupableMemberId`, minimum 4), so a league that numbers
differently is not locked out. Open question 2 stays open; when it is answered, the constant
and possibly a `CHECK` are the only change sites.

### Also removed
The dead `onboarding` i18n block — three keys belonging to the stub this screen replaced.
Both locales are at 140 keys with zero drift.

### Verify — passing
- `pnpm typecheck`, `pnpm lint --max-warnings=0`, **50 tests**, `pnpm build`.
- `member-id` tests: spaces, hyphens, dots and letters all stripped; over-length truncated;
  empty for input with no digits.
- `/onboarding` serves and every new module compiles.
- The gate cannot loop: `/onboarding` is inside `RequireAuth` and exempt by path.

### Not verified
Everything that needs the two endpoints: that a real preview renders, that a taken id is
refused, that linking lands the user on the schedule, and that a linked captain then sees
"Start match". Also unverified in a browser: the focus-moves-to-error behaviour.
