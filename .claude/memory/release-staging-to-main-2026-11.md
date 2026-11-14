# Release: staging → main (Home, Gutschein, payment fix) — status 2026-11-10

**Ready, nothing pushed to main.** Local branch `promote/staging-to-main-2026-11` (commit 84010a6, on top of origin/main + staging e89a5bc). tsc / eslint / 56 tests pass; `pnpm build` passed on the earlier identical merge. To redo: worktree from origin/main, merge origin/staging, resolve conflicts in favour of staging (voucher/confirm/route.ts, Orders/stripeWebhooks.ts, plugins/index.ts, seed-brevo-templates.ts, CLAUDE.md, middleware.ts).

Staging has everything: David's copy, voucher hero, tagline fix, footer links, maintenance page (#168–#171). Not included: Alaa's chat (branch `feature/chatbot-assistant`, folder ~/Desktop/fermentfreude-chatbot, fixes for off-topic answers still to do).

## Release day (needs Rafaela's go for each production step)
1. Allow read-only look at production (it was blocked once) → match workshops/products by slug (IDs may differ), list images used.
2. Backups: mongodump of prod + copy of prod R2 bucket.
3. Maintenance ON: Vercel prod env `MAINTENANCE_MODE=true` + `PREVIEW_PASSWORD`, redeploy. Not at 06:00 UTC (reminder cron). Team opens /maintenance, enters password, then admin + site work.
4. PR promote branch → main, wait for build.
5. Copy content to prod (script with dry-run, DB-name guard): home + voucher page content, footer links, only the images they use (real files into prod bucket, prod URLs). Don't overwrite what David edited in prod admin; don't touch prices (Tempeh stays 5,90 until David changes it).
6. Test as team: every workshop page (dates, location, seats), booking → confirmation email, voucher purchase + PDF email, voucher redeemed on a full cart (free live-Stripe test; creates a real booking to cancel), shop order, roster, Home + Gutschein DE/EN phone/desktop.
7. Maintenance OFF: remove both vars, redeploy.
8. Rollback: Vercel previous production deployment + backups.

## CLEANUP — later, NOT in the release (few days after, separate step)
- Audit (read-only): every media doc/R2 file not referenced by any page, global, product, workshop, email template, or old page version; plus orphan R2 files with no media doc.
- Rafaela reviews the list; backup first; delete in small batches, never automatic.
- Also: leftover old content (hidden HomeTempehStory block data, test orders via existing cleanup-test-orders.ts with its DB guard).
- Production still has old LinkedIn admin-dashboard link in Footer → fix in prod admin (or via the content copy): https://www.linkedin.com/company/fermentfreude-og/

## STATUS 2026-11-11 (Rafaela said "go ahead" with prep; release itself still needs her explicit go)
- Prod audit done (read-only, approved by Rafaela): prod Home = old blocks (edited 2 Oct), no drafts; prod Tempeh price is ALREADY 6,40 (David set it) → copy must never touch prices; prod has real data (68 users, 49 orders) → selective copy only, never mirror.
- Backup of prod DB: ~/Desktop/fermentfreude-backups/prod-before-release-2026-11-11 (17 MB, taken 11:37 CET). Take a fresh one right before the real run.
- Scripts (untracked in main folder, run from there): `src/scripts/prod-readonly-audit.ts` (read-only), `src/scripts/promote-home-voucher-to-prod.ts` (dry-run default; `--apply`; production needs BOTH `--apply --production`; `TARGET_DATABASE_URL=<uri>`; matches workshops/products by slug, images by filename; 4 sponsor-logo ids dangle in both DBs and are kept unchanged).
- Rehearsal DONE on scratch DB `fermentfreude-rehearsal` (restore of the backup; uri in scratchpad rehearsal-uri.txt): pages identical to staging DE+EN (home 266 values, voucher 131), footer equal, price stayed 640, orders unchanged. Files were skipped in rehearsal (`--no-files`): 16 new images (2.55 MB) + 7 repairs get copied only in the real run. DROP the rehearsal DB after the release.
- Vercel CLI is logged in (user raphaelavazq, team teamfermentfreude, project fermentfreude). Production env has NO PREVIEW_PASSWORD / MAINTENANCE_MODE (site public). Plan: set both on production (inert until next deploy) → merge `promote/staging-to-main-2026-11` via PR → new code goes live already in maintenance → backup → run promote script with --apply --production → test → remove both vars + redeploy. Password saved to a local file, never in chat.
- Chat bot (Alaa, `feature/chatbot-assistant`) is NOT in the promote branch (verified: 0 chat files).

## RELEASED 2026-11-11 (done, site open)
- PR #172 merged into main (9f67446). Maintenance armed first (MAINTENANCE_MODE + PREVIEW_PASSWORD on Vercel prod), merge deployed closed, backup `prod-right-before-content-copy-2026-11-11`, promote script applied with `--apply --production` (16 images created, 7 repaired, Home + voucher DE/EN, footer links). Script bug found+fixed on the way: empty size variants ("…/media/null") are skipped.
- Reopened: env vars removed, `vercel redeploy` of the production deployment → aliased to www.fermentfreude.at. Verified as customer: all pages 200, new Home/Gutschein content, new LinkedIn link, Tempeh price 6,40.
- Cleanup done: password file deleted, scratch DB fermentfreude-rehearsal dropped. Backups stay in ~/Desktop/fermentfreude-backups/.
- STILL OPEN: (1) combined cart voucher + workshop in ONE payment — NOT built, voucher has its own checkout (/api/voucher/checkout); Rafaela wants it as the next project; (2) Alaa's chat (feature/chatbot-assistant) needs the off-topic fix before any release; (3) image/content CLEANUP of production (audit first, she approves, backup, batches); (4) promote + audit scripts are untracked in the main folder (not committed); (5) .claude/settings.local.json has old DB passwords in plain text; (6) Stripe webhook answered 200 to an empty POST (not blocked) — worth a look.

## 2026-11-11 UI polish released (PR #173 → staging, #174 → main, 389f26c)
Centred PointsRow content (Tempeh Zubereitung, Home Gutschein slide, gastro banner, Warum Fermentation, Gutschein "So funktioniert's" 2×2 on phones), workshop dates sorted + vertically centred, new Natürlich picture (public/fermentation/tempeh-pan-chef.webp, from her pasted 1200×1105 PNG; broccoli-chef.webp now unused), no rule above Partner heading. Verified live.
STILL PENDING (live-DB writes, need her explicit OK): (a) production Home DE tagline is blank ("  ") since an admin save at 12:40 on 11 Nov → restore "Fermentiert.\nFunktional.\nFür dich." on the product slide; (b) footer brand spelling on PRODUCTION (`patch-footer-brand-spelling.ts --production`; staging already done). Still open from before: voucher+workshop in ONE cart (not built), live Stripe test purchases by Rafaela, Alaa's chat fix, production image cleanup.
