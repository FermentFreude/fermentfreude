# /project:debug — Diagnose and fix issues

## Input

$ARGUMENTS = description of the issue

## Environment Isolation

|        | Local Dev                     | Staging                       | Production               |
| ------ | ----------------------------- | ----------------------------- | ------------------------ |
| DB     | `fermentfreude-staging`       | `fermentfreude-staging`       | `fermentfreude`          |
| R2     | `fermentfreude-media-staging` | `fermentfreude-media-staging` | `fermentfreude-media`    |
| URL    | localhost:3000                | Vercel preview                | fermentfreude.vercel.app |
| Branch | `feature/*`                   | `staging`                     | `main`                   |

**First question:** Which environment is the bug in?

## Common Issues

### Broken images after deploy

- **Cause:** Images exist in staging R2 but not production R2
- **Fix:** Upload images through production `/admin`, not via seed script
- **Check:** Does `R2_PUBLIC_URL` + path return 200?

### Content reverted / missing

- **Cause:** Seed script overwrote admin-managed data
- **Fix:** Re-enter content in `/admin`. Update seed to not overwrite.
- **Check:** Look at `updatedAt` — was it a seed run or manual save?

### EN showing DE text

- **Cause:** Bilingual ID mismatch — EN save created new array IDs instead of reusing DE IDs
- **Fix:** Re-run seed with correct `mergeHeroSliderEN()` pattern
- **Check:** Compare array item IDs between DE and EN locales

### TypeScript errors

- **Cause:** Schema changed but types not regenerated
- **Fix:** `pnpm generate:types && npx tsc --noEmit`

### Admin panel field missing

- **Cause:** Field added to schema but `pnpm generate:importmap` not run
- **Fix:** `pnpm generate:importmap`

### 500 error on page load

- **Cause:** Usually a null reference — CMS field not seeded or component not guarding
- **Fix:** Add `?? DEFAULT_VALUE` fallback in component

## Workflow

1. **Identify environment** — local, staging, or production?
2. **Check logs** — browser console, terminal, Vercel logs
3. **Reproduce** — can you trigger it consistently?
4. **Diagnose** — read relevant files, check DB state
5. **Fix** — minimal change, same as `/project:fix`
6. **Validate** — `npx tsc --noEmit`
7. **Don't expand scope** — fix the bug, nothing else
