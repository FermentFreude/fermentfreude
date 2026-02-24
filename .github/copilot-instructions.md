# Copilot Instructions — FermentFreude

> **Canonical rules live in `docs/##INSTRUCTIONS.md`.** This file is a summary for GitHub Copilot. Read the full docs for detailed patterns.

**Stack:** Next.js 15 (App Router) · Payload CMS 3.x · MongoDB Atlas M0 · Cloudflare R2 · Stripe · TailwindCSS 4 · shadcn/ui
**Locales:** `de` (default, German) and `en` (English). DeepL auto-translation hooks exist but are skipped in seeds.
**Full docs:** `docs/##INSTRUCTIONS.md` (project rules), `docs/AGENTS.md` (Payload patterns), `docs/DESIGN_SYSTEM.md` (design tokens)

---

## Infrastructure

| Layer                | Technology                                 | Detail                                                                                                           |
| -------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Database**         | MongoDB Atlas M0                           | Free tier — **no transactions**. Sequential writes only, never `Promise.all` for mutations.                      |
| **File storage**     | Cloudflare R2 via `@payloadcms/storage-s3` | S3-compatible API. Env: `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_PUBLIC_URL`. |
| **Media collection** | `src/collections/Media.ts`                 | Upload field, `alt` (text, required, localized), `caption` (richText, localized). Public read.                   |
| **Payments**         | Stripe via `@payloadcms/plugin-ecommerce`  | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOKS_SIGNING_SECRET`.                     |
| **Fonts**            | Neue Haas Grotesk (Adobe Typekit)          | `font-sans` = body, `font-display` = headings/nav/buttons. **Never** Geist, Inter, or system fonts.              |

## Environments

| Environment    | Database                 | R2 Bucket                       | Deploys from                        |
| -------------- | ------------------------ | ------------------------------- | ----------------------------------- |
| **Production** | `fermentfreude`          | `fermentfreude-media`           | `main` branch (auto via Vercel)     |
| **Staging**    | `fermentfreude-staging`  | `fermentfreude-media-staging`   | `staging` branch (preview)          |

- Local `.env` should point to **staging** values for safe development.
- **Never** develop against production database locally.
- Seed scripts run against whichever DB your `.env` points to — be careful.

---

## 12 Non-Negotiable Rules

1. **Every visible text = CMS field.** Hardcoded defaults are fallbacks, not the source of truth.
2. **All text fields are `localized: true`.** Both `de` and `en`, always.
3. **Seed BOTH languages.** Every seed: `locale: 'de'` + `locale: 'en'`. Always `context: { skipRevalidate: true, skipAutoTranslate: true }`.
4. **Bilingual seeding — reuse IDs.** Save DE first → read back IDs → save EN with same IDs. Sequential writes only.
5. **Hardcoded defaults in English.** `const resolved = cmsValue ?? DEFAULT_VALUE`.
6. **Admin = non-coder friendly.** Editors control everything from `/admin`. Use `admin.description`, `admin.condition`, clear labels.
7. **Images → Payload Media → Cloudflare R2.** Never static `/assets/` paths in rendered output. Use `<Media resource={...} />`. No image → `<div className="bg-[#ECE5DE]" />`.
8. **Optimize images before upload.** Use `optimizedFile()` from `src/scripts/seed-image-utils.ts`. Presets: `hero` (1920px), `card` (1200px), `logo` (600px). Never raw PNGs.
9. **One block = one section.** Never bundle multiple sections. Editors compose pages from blocks in `/admin`.
10. **After every schema change:** `pnpm generate:types` → `pnpm generate:importmap` → `npx tsc --noEmit` → re-run seed.
11. **Seed scripts:** one per page (`src/scripts/seed-<page>.ts`), registered in `seed-all.ts`. Run all: `pnpm seed`. Run one: `pnpm seed home`.
12. **No per-page route files.** Dynamic `[slug]/page.tsx` renders all CMS pages. Only dedicated routes for non-CMS pages (checkout, account, cart).

---

## Branch Strategy

| Branch      | Purpose                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------- |
| **`main`**  | Production — auto-deploys to Vercel. **Never push directly.** Only merge from `staging`. |
| **`staging`** | Integration branch. Alaa merges feature branches here first. Test, then merge → `main`.  |

**Workflow:**
1. Create feature branch from `staging`: `git checkout -b feature/xyz staging`
2. Push feature branch, open PR into `staging`
3. After review + CI passes, merge into `staging`
4. Test on staging (local or preview deploy)
5. When ready for production, merge `staging` → `main`

---

## Quick Checklist

- [ ] Localized field with `label` + `admin.description`?
- [ ] English default fallback in component?
- [ ] CMS data overrides default?
- [ ] Images use `<Media resource={...} />`?
- [ ] Seed uses `optimizedFile()`?
- [ ] Both locales seeded with ID reuse?
- [ ] Types regenerated + zero TS errors?
- [ ] Block is small & focused?
- [ ] Block registered in `Pages/index.ts` + `RenderBlocks.tsx`?
- [ ] Seed registered in `seed-all.ts`?
