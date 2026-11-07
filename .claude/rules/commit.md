# Commit Rules

## 1. Never commit unless asked

**Do not run `git commit` unless the request for it is explicit.**

Finish the work, leave it in the working tree, and say what changed.

## 2. What counts as explicit

Explicit:

- "commit this"
- "commit the fix"
- "commit and push"
- "make a commit for each phase"

Not explicit:

- "do the migration"
- "carry on" / "continue" / "yes"
- approving a plan
- a plan that itself describes commits — describing them is not authorising them
- finishing a phase, a task, or a whole piece of work

If the instruction does not name committing, it is not permission to commit.

## 3. The same rule covers the rest of git

Anything that writes history or leaves the machine needs the same explicit ask:

- `git push` — strongest case, since it is the one that publishes
- `git tag`
- `git commit --amend`
- `git rebase`
- `git reset`
- `git checkout -b` / branch creation

## 4. What to do instead

When the work is done:

1. Leave the files modified and **unstaged**. Do not run `git add`.
2. Report which files changed and what still needs verifying.
3. If a commit looks like the obvious next step, offer it and wait for an answer.

## 5. Do not work around the rule

Do not reach for `git stash`, `git worktree`, a scratch branch, or any other
history-writing command as a way to "save progress" without committing. The
working tree is where unfinished work belongs.
