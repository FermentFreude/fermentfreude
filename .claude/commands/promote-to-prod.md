# /project:promote-to-prod — Merge staging → main (production deploy)

## Pre-flight Checklist (ALL must pass)

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `pnpm build` — passes without errors
- [ ] Staging tested (Vercel preview or local)
- [ ] No pending seed scripts that haven't been tested
- [ ] Images were uploaded through **production** admin (`/admin`), not local seed
- [ ] No `.env` values in any committed file
- [ ] Both DE and EN content verified in staging

## Workflow

1. **Run checks**

   ```bash
   npx tsc --noEmit
   pnpm build
   ```

2. **Confirm with user** — show what commits are in staging but not in main

3. **Merge**

   ```bash
   git checkout main
   git pull origin main
   git merge staging
   git push origin main
   ```

4. **Verify** — Vercel auto-deploys from main. Check the production URL.

5. **Summarize** what went live (list of features/fixes)

## NEVER do these

- Never run `pnpm seed` on production
- Never push directly to main without going through staging
- Never deploy if tsc or build fails
- Never assume staging images exist in production R2 (they're separate buckets)
