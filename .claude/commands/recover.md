# /project:recover — Stop and diagnose fresh

## When to run

The same problem persists after one corrective attempt already failed. Not for the first fix attempt — for when that attempt didn't work and the instinct is to try another quick patch.

## Why this exists

A second patch on top of a failed first patch is usually guessing, not diagnosing — it burns tool calls and context without fixing the root cause. Stopping here is cheaper than three more guesses. See "Working With Claude — Session Efficiency" in `CLAUDE.md`.

## Input

$ARGUMENTS = what was being fixed and what the failed attempt was

## Workflow

1. **Stop.** Do not attempt a third variation of the same patch.
2. **State plainly what was tried and why it didn't work** — one or two sentences, not a re-explanation of the whole task
3. **Re-read from the actual source, not assumption**
   - Re-read the file(s) involved fresh — don't trust your memory of them from earlier in the session
   - Check the real error/log output again, don't paraphrase from before
   - Check `CLAUDE.md` and `docs/AGENTS.md` for a rule that the first attempt may have violated (e.g. `Promise.all` on MongoDB Atlas M0, missing `context: { skipAutoTranslate: true }`, bilingual ID mismatch)
4. **Form a different hypothesis** — if the second theory is a minor variation of the first, that's a sign the actual root cause hasn't been found yet
5. **If still unclear after this pass** — say so explicitly and ask the user rather than attempting a third blind fix

## Rules

- Never stack a third patch attempt without a genuinely new diagnosis
- Don't silently revert to guessing — narrate the diagnosis shift
- If the failure revealed a bigger structural problem, report it; don't scope-creep into fixing it here
