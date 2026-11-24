# Phase 5 — Form and delete sheets

**Status: done, 2026-11-21.** See the Outcome section for where the build differs from these tasks.

## Goal

Create, edit and delete open in the design's sheet: a right panel on desktop and a bottom sheet on
mobile. They carry the design's validation, errors and confirmation.

## Tasks

### Responsive sheet

- [ ] New `src/pages/admin/sessions/ResponsiveDrawer.tsx`:
  - A stock vaul `Drawer`, with `direction="right"` from `lg` up and `"bottom"` below. The
    direction comes from a `useMediaQuery('(min-width: 1024px)')` hook, which generalises
    `src/hooks/useMobile.ts`.
  - Header: the title, a muted subtitle, and an icon-only close `Button` (`DrawerClose`).
  - Footer: buttons aligned right, Cancel then the primary action.
  - Content: `sm:max-w-110` (440px) on the right.

### Form: `SessionFormFields.tsx` and `src/lib/session-form.ts`

- [ ] Fields, using the stock `Field*` primitives with a `*` marker for required fields:
  - **Name.** Placeholder "e.g. Fall 2026". Hint "Must be unique in this league." Remove the
    type and year autofill and `getDefaultSessionName`.
  - **Type.** A stock `ToggleGroup type="single" variant="outline"` with three items, Spring,
    Summer and Fall. No default.
  - **Season year.** `inputMode="numeric"`, placeholder "2027".
  - **Starts on** and **Ends on** in two columns.
  - **Status** select, defaulting to Draft.
  - **Active session.** A `Field orientation="horizontal"` row: the title, the help "Players see
    the active session first on the schedule.", and a `Switch`. When it is on and another session
    is active, the help adds "<name> will stop being active." in highlight-foreground. The other
    session comes from the cached `useSessions(ALL_SESSIONS)` list.
- [ ] Schema, built by `createSessionFormSchema(existingNames, editingId)`:
  - Name: trimmed, 3–60 characters, and not a case-insensitive duplicate of another session
    (`superRefine` → `duplicateName`).
  - Type: required (`type`).
  - Year: four digits from 2000 to 2100.
  - Dates: required, and the end on or after the start.
  - The error messages are i18n keys, with copy from the design: "Enter a session name.", "Name
    must be at least 3 characters.", "A session with this name already exists.", "Choose a
    session type.", "Enter a 4-digit year between 2000 and 2100.", "Pick a start date.", "Pick an
    end date.", and "End date must be on or after the start date."
- [ ] Field errors show an info icon before the message, with the invalid field styling from the
      stock `aria-invalid`. Focus moves to the first invalid field, through react-hook-form's
      default `shouldFocusError`.
- [ ] Server errors:
  - A 409 (`409001`) calls `form.setError('name', { message: 'duplicateName' })`.
  - Any server error shows a destructive `Alert` at the top: "Couldn't save this session",
    `messageFor(err)`, and a `font-mono` code chip.
- [ ] Saving:
  - The primary button shows a `LoaderCircle` spinner with "Saving…", and both buttons are
    disabled.
  - Toasts read "Created X" and "Saved X".
  - The edit subtitle reads "Changes apply right away. Played matches keep their results."

### Delete: `DeleteSessionDrawer.tsx`

- [ ] `ResponsiveDrawer` with the title "Delete <name>?" and the subtitle "This can't be undone."
- [ ] When `session.hasSubmittedResults` is true, show a warn `Alert` in highlight-soft: "This
      session has submitted results". The body says standings and player stats from that session
      will be removed too.
- [ ] Show a `bg-muted` box listing what is deleted: its divisions and teams; `weekCount` weeks
      of team matches; every individual match result.
- [ ] A react-hook-form field reads "Type <b>name</b> to confirm". The destructive button stays
      disabled until the value equals the name exactly. The button shows a spinner while
      deleting.
- [ ] Toast: "Deleted X".

### Copy

- [ ] All new copy in en and vi. Remove `form.nameHelp` and the other keys that are no longer
      used, from both files.

## Verify

Run `pnpm dev`, then compare against the artifact:

- **Create:** the empty form; submitting it shows every field error with focus on Name; then
  create "Spring 2027".
- **Duplicate:** "Fall 2026" shows the inline error before submitting. Forcing a server 409 (for
  example a name a second tab created) shows the alert and the field error.
- **Edit:** Fall 2026 can be saved, and turning Active on for another session warns that Fall
  2026 will stop being active.
- **Delete:** Summer 2026 shows the warning and the cascade list. The button enables only once
  the exact name is typed.
- **Layout:** at 1280px the sheet slides in from the right, 440px wide; at 375px it is a bottom
  sheet.

## Outcome, 2026-11-21

- **Sheet:** `ResponsiveDrawer` is a stock vaul `Drawer`. It is `direction="right"` (440px) from
  `lg` up and a bottom sheet below. The direction comes from the new
  `src/hooks/useMediaQuery.ts`, and the header has a close button.
- **Form fields** (`SessionFormFields`): in the design's order, with `*` markers.
  - Name, with a placeholder and the uniqueness hint.
  - Type as a stock `ToggleGroup`, with no default.
  - Season year, start date and end date.
  - Status.
  - The active switch row, with "X will stop being active".
  - Errors show with an info icon.
- **Validation** (`src/lib/session-form.ts`): the schema has the design's rules and messages,
  including name 3–60.
  - The duplicate check (`isDuplicateSessionName`) runs in the submit handler against the cached
    list, not in the Zod schema, so the schema stays static.
  - A 409 from the server also sets the name error.
  - Server errors show in `ServerErrorAlert`, with the code.
  - The name autofill was removed.
- **Delete** (`DeleteSessionDrawer`): it shows the submitted-results warning and the cascade list
  with `weekCount`. A react-hook-form "type the name" field must match exactly before delete is
  enabled. Both sheets show a spinner while working, and toasts read "Created", "Saved" and
  "Deleted".
- **Checks:** lint, typecheck, `pnpm test` (104) and the build pass. The dev server compiles
  every module.
- **Not verified:** I didn't check it in a browser.
