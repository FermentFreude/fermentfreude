# /project:fix — Surgical fix

## Input

$ARGUMENTS = what needs to be fixed

## Workflow

1. **Read** only the relevant files — don't explore the whole codebase
2. **Diagnose** the issue — understand root cause before changing anything
3. **Make the minimal change** — touch only what's needed
4. **No seeds.** Fixes don't reseed unless explicitly asked
5. **No side effects.** Don't refactor adjacent code

6. **Validate**

   ```bash
   pnpm generate:types      # if schema was touched
   npx tsc --noEmit         # must pass
   ```

7. **Show diff** — summarize exactly what changed and why
8. **Commit** with message: `fix: [short description]`

## Rules

- Don't add new files unless the fix requires it
- Don't change seeds
- Don't modify unrelated blocks or components
- If the fix reveals a larger problem, report it but don't fix it in this PR
