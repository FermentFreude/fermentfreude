# /project:remember — Save or restore multi-session feature state

## When to run

- `/project:remember save` — a feature spans multiple sessions and work is pausing before it's done
- `/project:remember restore` — returning to a feature that has a saved state

## Input

$ARGUMENTS = `save <feature-slug> [notes]` or `restore <feature-slug>`

If no feature-slug is given on save, derive a short kebab-case one from the feature being worked on (e.g. `backlog-board`, `booking-credit-model`).

## Storage

One file per feature: `.claude/memory/<feature-slug>.md`. This is separate from `docs/` — it's session scratch state for one in-progress feature, not project documentation. Once the feature ships, fold anything worth keeping long-term into the relevant `docs/*.md` and delete the memory file.

## Workflow — save

1. **Write `.claude/memory/<feature-slug>.md`** with:
   ```markdown
   # <Feature name>
   **Status:** what's done vs. what's left
   **Branch:** current git branch
   **Files touched:** list of files created/modified so far
   **Next step:** the exact next action to take on restore
   **Open questions:** anything blocked on a founder/user decision
   **Gotchas:** anything non-obvious discovered this session (a schema quirk, a rejected approach and why)
   ```
2. Keep it short — this is a handoff note to a future session, not a full changelog
3. Confirm the file was written and where

## Workflow — restore

1. **Read `.claude/memory/<feature-slug>.md`**
2. **Verify it's still accurate** before acting on it:
   - `git log` / `git status` — has anything changed since this was saved?
   - Re-read the files it lists as touched — don't assume they're still in that state
3. **Summarize the restored state back to the user** in a few lines before continuing
4. **Continue from "Next step"** — don't re-plan the whole feature from scratch

## Rules

- If restoring and the file doesn't exist, say so — don't fabricate a plausible-sounding state
- Don't let memory files accumulate indefinitely — once a feature ships, delete its file (its useful parts should already be in `docs/` via `/project:imprint` or normal doc updates)
- Never put secrets or `.env` values in a memory file
