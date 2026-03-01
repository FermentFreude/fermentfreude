# CLAUDE.md — FermentFreude

> This file is auto-read by Claude Code at session start. It is the single-file context for the entire project.

## Stack

| Layer           | Technology                  | Notes                                                                                              |
| --------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 15 (App Router)     | `src/app/(app)/` = frontend, `src/app/(payload)/` = admin                                          |
| CMS             | Payload CMS 3.x             | Collections, globals, blocks, hooks                                                                |
| Database        | MongoDB Atlas M0            | **No transactions** — sequential writes only, never `Promise.all` for mutations                    |
| File storage    | Cloudflare R2               | S3-compatible via `@payloadcms/storage-s3`                                                         |
| Payments        | Stripe                      | `@payloadcms/plugin-ecommerce`                                                                     |
| Styling         | TailwindCSS 4 + shadcn/ui   | Design tokens in `docs/DESIGN_SYSTEM.md`                                                           |
| Fonts           | Neue Haas Grotesk (Typekit) | `font-sans` = body, `font-display` = headings/nav/buttons. **Never** Geist, Inter, or system fonts |
| Locales         | `de` (default) + `en`       | All text fields: `localized: true`                                                                 |
| Package manager | pnpm                        |                                                                                                    |

## Environment Variables (names only — never values)

```
DATABASE_URL                        # MongoDB Atlas connection string
PAYLOAD_SECRET                      # Random secret (min 24 chars)
PAYLOAD_PUBLIC_SERVER_URL            # Full URL with https:// (matches NEXT_PUBLIC_SERVER_URL)
NEXT_PUBLIC_SERVER_URL               # Full URL with https:// (baked at build time!)
PREVIEW_SECRET                       # Draft preview secret
PREVIEW_PASSWORD                     # Coming-soon gate password
R2_BUCKET                            # fermentfreude-media (prod) / fermentfreude-media-staging (staging)
R2_ACCESS_KEY_ID                     # Cloudflare R2 API token
R2_SECRET_ACCESS_KEY                 # Cloudflare R2 API secret
R2_ENDPOINT                          # https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_URL                        # CDN URL for serving images (different per bucket!)
STRIPE_SECRET_KEY                    # sk_test_ (dev) / sk_live_ (prod)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   # pk_test_ (dev) / pk_live_ (prod)
STRIPE_WEBHOOKS_SIGNING_SECRET       # whsec_
DEEPL_API_KEY                        # Auto-translation DE→EN
```

**CRITICAL:** `NEXT_PUBLIC_*` vars are baked in at **build time**. Changing them in Vercel requires a full redeploy **without cache**.

## Environments & Branches

| Environment      | Database                | R2 Bucket                     | R2 Public URL                   | Branch      | Deploys to                                                      | Who uses it     |
| ---------------- | ----------------------- | ----------------------------- | ------------------------------- | ----------- | --------------------------------------------------------------- | --------------- |
| **Production**   | `fermentfreude`         | `fermentfreude-media`         | `pub-c70f47169a...r2.dev`       | `main`      | `fermentfreude.vercel.app` (auto)                               | Founders (live) |
| **Staging**      | `fermentfreude-staging` | `fermentfreude-media-staging` | `pub-0cf8a1c18a...r2.dev`       | `staging`   | `fermentfreude-git-staging-raphaellas-projects.vercel.app`      | Dev testing     |
| **Local dev**    | `fermentfreude-staging` | `fermentfreude-media-staging` | `pub-0cf8a1c18a...r2.dev`       | `feature/*` | `localhost:3000`                                                | You & Alaa      |

**Branch flow:** `feature/*` → PR into `staging` → test → merge `staging` → `main`

**Rules:**
- **Never push directly to `main`.** Always: feature → staging → main
- **Never run `pnpm seed` against production** unless intentionally populating it
- Local dev is completely isolated from production — break things freely!

## Seeding Production

When production DB is empty and you're ready to populate it, temporarily change 3 values in your local `.env`:

```
DATABASE_URL=...fermentfreude?...          (remove -staging)
R2_BUCKET=fermentfreude-media              (remove -staging)
R2_PUBLIC_URL=https://pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev  (production bucket URL)
```

Run `pnpm seed`, then **immediately change them back** to staging values.

## Content & Image Management (Staging → Production)

**Production admin is the source of truth for content.** After the initial bootstrap, never overwrite production data with a full sync.

### Prerequisites (already installed)

- `mongodump` / `mongorestore` / `mongoexport` / `mongoimport` (MongoDB Database Tools via Homebrew)
- `rclone` (`brew install rclone`) — configured in `~/.config/rclone/rclone.conf` with remotes `r2-staging` and `r2-prod`

### When to do what

| Scenario | Action | Touches production DB? |
|---|---|---|
| Code-only change (components, styles, fixes) | Merge PR staging → main | No |
| New page with seed script | Point `.env` to prod, run `pnpm seed <page>`, switch back | Adds only |
| Final images for existing pages | Upload directly in `fermentfreude.vercel.app/admin` | Yes (safe) |
| Need specific staging images on production | Selective copy (see below) | Adds/updates only |

### Selective image copy (staging → production)

**Step 1 — Copy specific R2 files** (use `rclone copy`, never `rclone sync`):

```bash
# Single file
rclone copy r2-staging:fermentfreude-media-staging/media/filename.webp r2-prod:fermentfreude-media/media/

# Entire folder
rclone copy r2-staging:fermentfreude-media-staging/media/new-folder/ r2-prod:fermentfreude-media/media/new-folder/
```

**Step 2 — Copy the MongoDB media documents** (metadata only):

```bash
# Export specific media docs from staging
mongoexport --uri="<staging-connection-string>" --db=fermentfreude-staging \
  --collection=media \
  --query='{"filename": {"$in": ["image1.webp", "image2.webp"]}}' \
  --out=/tmp/selected-media.json

# Import into production (upsert = update if exists, insert if new)
mongoimport --uri="<prod-connection-string>" --db=fermentfreude \
  --collection=media --mode=upsert --file=/tmp/selected-media.json

# Clean up
rm /tmp/selected-media.json
```

### DANGER — Never do these on production

- `rclone sync` staging → production (deletes production-only files)
- `mongorestore --drop` (wipes entire collection before restoring)
- `pnpm seed --force` on all pages (overwrites existing content)

### Best practice

Use staging for **code + layout testing** with placeholder images. Once code is merged to production, upload **final images** directly in `fermentfreude.vercel.app/admin`. This avoids cross-DB syncing entirely.

## Project Structure

```
src/
├── app/(app)/              # Frontend routes (dynamic [slug]/page.tsx renders all CMS pages)
├── app/(payload)/          # Payload admin (auto-generated, don't edit)
├── access/                 # Permission rules (adminOnly, adminOrSelf, publicAccess, etc.)
├── blocks/                 # Content blocks — one block = one section
│   └── RenderBlocks.tsx    # Maps block slugs → React components
├── collections/            # Payload collections (Categories, Media, Pages/, Products/, Users/)
├── components/             # React components (UI, Header, Footer, Cart, Media, etc.)
├── fields/                 # Reusable field definitions (hero.ts, link.ts, linkGroup.ts)
├── globals/                # Header.ts, Footer.ts + hooks/
├── heros/                  # Hero components + config
│   ├── RenderHero.tsx      # Routes hero.type → component
│   └── HeroSlider/         # Main hero: index.tsx, slide-data.ts, seed.ts
├── hooks/                  # Lifecycle hooks (autoTranslate, revalidate)
├── lib/                    # Utils (generate-meta, cn())
├── plugins/                # Plugin config (ecommerce, seo, storage-s3)
├── providers/              # Context providers (Auth, Theme, Locale, Ecommerce)
├── scripts/                # Seed scripts (one per page)
│   ├── seed-all.ts         # Registry — run all or one: pnpm seed [page]
│   └── seed-image-utils.ts # optimizedFile(), readLocalFile(), IMAGE_PRESETS
├── utilities/              # Helper functions
├── payload-types.ts        # Auto-generated types (never edit manually)
└── payload.config.ts       # Main Payload config
```

## Hero System (Home Page)

4 slides in fixed order. Slider starts on index 0 (basics).

| #   | slideId    | panelColor | bgColor   | Link                  |
| --- | ---------- | ---------- | --------- | --------------------- |
| 1   | `basics`   | `#000000`  | `#AEB1AE` | `/workshops/basics`   |
| 2   | `lakto`    | `#555954`  | `#D2DFD7` | `/workshops/lakto`    |
| 3   | `kombucha` | `#555954`  | `#F6F0E8` | `/workshops/kombucha` |
| 4   | `tempeh`   | `#737672`  | `#F6F3F0` | `/workshops/tempeh`   |

**Key files:**

- Schema: `src/fields/hero.ts` — defines `heroSlides` array field
- Defaults: `src/heros/HeroSlider/slide-data.ts` — `DEFAULT_SLIDES` (English fallbacks)
- Component: `src/heros/HeroSlider/index.tsx` — animated full-viewport slider
- Seed builder: `src/heros/HeroSlider/seed.ts` — `buildHeroSlider()` + `mergeHeroSliderEN()`
- Seed script: `src/scripts/seed-home.ts` — uploads images, saves DE→IDs→EN

## 12 Non-Negotiable Rules

1. **Every visible text = CMS field.** Hardcoded defaults are fallbacks only.
2. **All text fields: `localized: true`.** Both `de` and `en`, always.
3. **Seed BOTH languages.** Always `context: { skipRevalidate: true, skipAutoTranslate: true }`.
4. **Bilingual seeding — reuse IDs.** Save DE first → read back IDs → save EN with same IDs. Sequential writes only.
5. **Hardcoded defaults in English.** `const resolved = cmsValue ?? DEFAULT_VALUE`.
6. **Admin = non-coder friendly.** Use `admin.description`, `admin.condition`, clear labels.
7. **Images → Payload Media → R2.** Use `<Media resource={...} />`. No image → `<div className="bg-[#ECE5DE]" />`. Never `<img src="/assets/...">`.
8. **Optimize images before upload.** Use `optimizedFile()` with presets: `hero` (1920px), `card` (1200px), `logo` (600px).
9. **One block = one section.** Editors compose pages from blocks in `/admin`.
10. **After every schema change:** `pnpm generate:types` → `pnpm generate:importmap` → `npx tsc --noEmit` → re-run seed.
11. **Seed scripts:** one per page (`seed-<page>.ts`), registered in `seed-all.ts`. **Non-destructive by default** — skips pages that already have content. Use `--force` to overwrite.
12. **No per-page route files.** Dynamic `[slug]/page.tsx` renders all CMS pages.

## Bilingual Seeding Pattern

```typescript
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

// 1. Save DE first (Payload generates IDs for arrays/blocks)
const saved = await payload.update({
  collection: 'pages',
  id: pageId,
  locale: 'de',
  data: { hero: deHero, layout: deBlocks },
  context: ctx,
})

// 2. Read back to capture generated IDs
const doc = await payload.findByID({ collection: 'pages', id: pageId, locale: 'de', depth: 0 })

// 3. Build EN data reusing those exact IDs (use mergeHeroSliderEN pattern)
const enHero = mergeHeroSliderEN(doc.hero, enHeroData)

// 4. Save EN with same IDs
await payload.update({
  collection: 'pages',
  id: pageId,
  locale: 'en',
  data: { hero: enHero, layout: enBlocks },
  context: ctx,
})
```

**Critical:** Never `Promise.all` for writes on MongoDB Atlas M0.

## Image Rules

- Every image field: `type: 'upload', relationTo: 'media'`
- Render: `<Media resource={...} />` from `@/components/Media` — never `<img>`
- Type guard: `typeof image === 'object' && image !== null && 'url' in image`
- No image → `<div className="bg-[#ECE5DE]" />`
- Hero images: always set `priority`
- Seed scripts use `optimizedFile()` from `src/scripts/seed-image-utils.ts` — never raw PNGs
- **Never overwrite admin-managed images in seed scripts**

## DeepL Auto-Translation

- `autoTranslateCollection` / `autoTranslateGlobal` hooks translate DE→EN on save
- For **production editors only**, not development
- All seed scripts MUST use `context: { skipAutoTranslate: true }`
- Manual English edits are never overwritten by DeepL

## Commands

```bash
pnpm dev                    # Dev server (localhost:3000)
pnpm build                  # Production build
pnpm start                  # Production server
pnpm lint                   # ESLint
pnpm lint:fix               # Auto-fix
pnpm generate:types         # Regenerate Payload types
pnpm generate:importmap     # Regenerate import map (after component changes)
npx tsc --noEmit            # Type-check (must be zero errors)
pnpm seed                   # Seed ALL pages (skips pages with existing content)
pnpm seed home              # Seed one page (skips if content exists)
pnpm seed home --force      # Force overwrite existing content
pnpm test:int               # Integration tests (vitest)
pnpm test:e2e               # E2E tests (playwright)
pnpm stripe-webhooks        # Forward Stripe webhooks locally
```

## After Every Code Change

```bash
pnpm generate:types         # Always
pnpm generate:importmap     # Only if components changed
npx tsc --noEmit            # Must pass with zero errors
```

## Adding a New Block

1. Create `src/blocks/MyBlock/config.ts` — schema with localized fields + `admin.description`
2. Create `src/blocks/MyBlock/Component.tsx` — English defaults, `<Media resource={...} />`
3. Register in `src/collections/Pages/index.ts` → `layout.blocks` array
4. Register in `src/blocks/RenderBlocks.tsx` → `blockComponents` map
5. `pnpm generate:types && pnpm generate:importmap`
6. Add seed if needed (bilingual, registered in `seed-all.ts`)
7. `npx tsc --noEmit` → zero errors

## Security

- **Never** include `.env` values in any file, commit, or comment
- Reference env vars by name only
- `.env` is gitignored — keep it that way
- Use `overrideAccess: false` when passing `user` to Local API
- Always pass `req` to nested operations in hooks
- Validate all incoming data

## Admin Dashboard

David & Marcel (founders) are non-coders who manage content via `/admin`.

- Every field must have a clear `label` and `admin.description`
- Use `admin.condition` to show fields only when relevant
- Required fields must always have seeded data
- They should never need developer help for content changes

## Detailed Docs

- `docs/##INSTRUCTIONS.md` — Canonical rules (single source of truth)
- `docs/AGENTS.md` — Payload CMS patterns, security, hooks, queries
- `docs/SETUP.md` — Full technical reference (providers, theme, locale, API)
- `docs/DESIGN_SYSTEM.md` — Typography, spacing, color tokens
- `docs/TRANSLATION.md` — DeepL hooks, locale system
- `docs/SECURITY.md` — Auth, GDPR, payments, incident response
- `docs/DEVELOPMENT.md` — Dev workflow, troubleshooting
- `docs/ACCESSIBILITY.md` — WCAG 2.1 AA compliance
- `docs/PERFORMANCE.md` — Lighthouse 90+, Core Web Vitals
