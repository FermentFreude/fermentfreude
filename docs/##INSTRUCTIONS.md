# Developer Instructions — FermentFreude

> **This is the single source of truth.** All other instruction files (`.github/copilot-instructions.md`, `.cursorrules`, `docs/AGENTS.md`) inherit from this document.

**Project:** FermentFreude — Next.js 15 (App Router) + Payload CMS 3.x + Stripe
**Goal:** Implement features with senior full-stack discipline: minimal code, clear separation of concerns, secure by default, accessible UI.

---

## 1 — Infrastructure

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   MongoDB Atlas M0                   │
│                                                      │
│  Stores: TEXT data only                              │
│  • Page titles, slugs, block content                 │
│  • Product names, prices, descriptions               │
│  • User accounts, orders                             │
│  • Media RECORDS (filename, alt, dimensions,         │
│    URL pointing to where the file lives)             │
│                                                      │
│  Does NOT store: actual image files                  │
└─────────────────────────────────────────────────────┘
          ↕  Payload CMS reads/writes
┌─────────────────────────────────────────────────────┐
│               Cloudflare R2 (S3-compatible)          │
│                                                      │
│  Stores: the actual image BYTES                      │
│  • Every uploaded photo, logo, banner                │
│  • Served globally via CDN URL:                      │
│    https://<R2_PUBLIC_URL>/media/<filename>.webp      │
│                                                      │
│  10 GB free tier — no egress fees                    │
└─────────────────────────────────────────────────────┘
```

### What Lives Where

| Layer | Technology | Configuration |
|-------|-----------|---------------|
| **Database** | MongoDB Atlas M0 (free tier) | `@payloadcms/db-mongodb` (Mongoose adapter). **No transactions** — always sequential writes, never `Promise.all` for mutations. |
| **File storage** | Cloudflare R2 | `@payloadcms/storage-s3` (S3-compatible API). Configured in `src/plugins/index.ts`. |
| **Media collection** | `src/collections/Media.ts` | `slug: 'media'`, upload with `alt` (text, required, localized) and `caption` (richText, localized). Public read. |
| **Payments** | Stripe | `@payloadcms/plugin-ecommerce` with `stripeAdapter()`. |
| **Fonts** | Neue Haas Grotesk | Adobe Typekit. `font-sans` = body (Text), `font-display` = headings/nav/buttons (Display Pro). |
| **Locales** | `de` (default) + `en` | Bidirectional fallback. DeepL auto-translation hooks in production. |

### Environments

| Environment | Database | R2 Bucket | Deploys from |
|-------------|----------|-----------|-------------|
| **Production** | `fermentfreude` | `fermentfreude-media` | `main` branch (auto via Vercel) |
| **Staging** | `fermentfreude-staging` | `fermentfreude-media-staging` | `staging` branch (preview) |

- Local `.env` should point to **staging** values for safe development.
- **Never** develop against production database locally.
- Seed scripts run against whichever DB your `.env` points to — be careful.

### Environment Variables (R2)

```bash
# Production
R2_BUCKET=fermentfreude-media
R2_PUBLIC_URL=https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev

# Staging (use these in local .env)
R2_BUCKET=fermentfreude-media-staging
R2_PUBLIC_URL=https://pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev

# Shared credentials (same API token for both buckets)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| **`main`** | Production — auto-deploys to Vercel. **Never push directly.** Only merge from `staging`. |
| **`staging`** | Integration branch. Feature branches merge here first. Test, then merge → `main`. |

**Workflow:**
1. Create feature branch from `staging`: `git checkout -b feature/xyz staging`
2. Push feature branch, open PR into `staging`
3. After review + CI passes, merge into `staging`
4. Test on staging (local or preview deploy)
5. When ready for production, merge `staging` → `main`

### Why Not Vercel Blob?

The project migrated from Vercel Blob to Cloudflare R2 because:
- **10 GB free storage** (vs 500 MB on Vercel Blob Hobby)
- **Zero egress fees** — no surprise bills for image traffic
- **CDN-served globally** — fast from any location
- **S3-compatible API** — uses the standard `@payloadcms/storage-s3` plugin

### How Image Serving Works

1. Editor uploads image in `/admin` → Payload sends bytes to R2 via S3 API
2. MongoDB stores a media record (filename, alt text, dimensions, R2 URL)
3. Frontend renders `<Media resource={...} />` → Next.js `<Image>` with the R2 URL
4. Browser fetches the image from the R2 CDN

---

## 2 — Operating Principles

### Build Like a Senior

- **Minimize new files.** Reuse existing modules/components whenever possible.
- Add a new file **only if** the file truly doesn't exist and the responsibility is new.

### Separation of Concerns

- **UI**: presentation + interaction only (in `src/components/` or `src/app/(app)/`)
- **Domain logic**: pure functions (validation, mapping) in `src/utilities/`
- **Data access**: Payload queries, Stripe calls in service modules
- **Side effects**: webhooks, email — isolated and auditable

### Fewer Moving Parts

- Avoid new dependencies unless absolutely necessary.
- If a feature can be done with existing tooling (Payload, Next.js, Stripe), do that.

---

## 3 — Before Writing Code (mandatory)

### Step A — Analyze First

1. **Where does the feature belong?**
   - Payload schema? → `src/collections/` or `src/globals/`
   - Page/UI? → `src/app/(app)/` or `src/components/`
   - API/webhook? → `src/app/(payload)/` or `src/endpoints/`

2. **Search the codebase for:**
   - existing patterns in similar collections (Products, Pages)
   - existing components in `src/components/`
   - existing utilities in `src/utilities/`
   - existing blocks in `src/blocks/`

3. **Propose the smallest change set.**

### Step B — Confirm Integration Points

- Payload collections/globals involved
- External systems (Stripe, Brevo, DeepL)
- Data flow: **CMS → API → UI** (or webhook → handler → persistence)

---

## 4 — File & Code Organization

### Project Structure

```
src/
├── app/
│   ├── (app)/              # Frontend routes
│   └── (payload)/          # Payload admin (auto-generated, don't edit)
├── access/                 # Permission rules
├── blocks/                 # Content blocks (one block = one section)
├── collections/            # Content types (Categories, Media, Pages, Products/, Users/)
├── components/             # React components
├── endpoints/              # Custom API endpoints
├── fields/                 # Reusable field definitions (link, slug, hero)
├── fonts/                  # Font files
├── globals/                # Global settings (Footer, Header)
├── heros/                  # Hero components (HeroSlider, HeroCarousel, etc.)
├── hooks/                  # Lifecycle hooks
├── lib/                    # Utility libs (generate-meta, utils)
├── plugins/                # Plugin configuration (ecommerce, seo, storage)
├── providers/              # Context providers (Auth, HeaderTheme, Theme)
├── scripts/                # Seed scripts (one per page)
├── utilities/              # Helper functions
├── payload-types.ts        # Auto-generated types (don't edit manually)
└── payload.config.ts       # Main Payload config
```

### File Naming Conventions

- Collections: `PascalCase.ts` (e.g., `Workshops.ts`)
- Components: `PascalCase/index.tsx` or `PascalCase.tsx`
- Utilities: `kebab-case.ts` (e.g., `format-workshop-date.ts`)
- API routes: `route.ts` in folder
- Seed scripts: `seed-<page>.ts` in `src/scripts/`

---

## 5 — Block Architecture — One Block = One Section (CRITICAL)

Every content block must represent **one self-contained page section**, not an entire page.

### Rules

1. **One block = one section.** A block handles exactly one concern: a CTA, text, team grid, slider, contact form. Never bundle multiple sections into one block.
2. **Editors compose pages from blocks.** Pages are built by adding blocks to the `layout` field in `/admin`.
3. **Blocks are reusable across pages.** Design for reuse, not for a specific page.
4. **No per-page route files.** The dynamic `[slug]/page.tsx` renders ALL CMS pages. Never create `src/app/(app)/about/page.tsx`.
5. **Block size guide:**
   - ✅ Good (40–120 lines config): `CallToAction`, `Content`, `WorkshopSlider`, `TeamGrid`, `ContactForm`
   - ❌ Bad (500+ lines): monolith blocks that bundle hero + story + team + sponsors + form

### How to Add a New Block

1. Create config: `src/blocks/MyBlock/config.ts`
2. Create component: `src/blocks/MyBlock/Component.tsx`
3. Register in `src/collections/Pages/index.ts` → `layout.blocks` array
4. Register in `src/blocks/RenderBlocks.tsx` → `blockComponents` map
5. Generate types: `pnpm generate:types && pnpm generate:importmap`
6. Seed data: add to relevant page seed script, register in `src/scripts/seed-all.ts`

---

## 6 — CMS-Editable with Hardcoded Defaults Pattern

### The Three-Layer Approach

1. **Schema** — Add editable fields to the Payload collection or global.
2. **Hardcoded Defaults** — Component defines English defaults. Site works with empty DB.
3. **CMS Override** — CMS data always wins: `const resolved = cmsValue ?? DEFAULT_VALUE`
4. **Seed Script** — Populates CMS with defaults for both locales.

### Component Pattern

```typescript
// 1. Define defaults (English)
const DEFAULT_TITLE = 'Discover the Art of Fermentation'

// 2. Render: CMS overrides default
const title = cmsData?.title ?? DEFAULT_TITLE
```

---

## 7 — Images & Media (Cloudflare R2)

### NEVER Use Static File Paths

This project stores all images in **Cloudflare R2** via `@payloadcms/storage-s3`. Static file paths (`/assets/images/...`) do NOT work in production.

### Rules

- Every image field: `type: 'upload', relationTo: 'media'`
- Render with: `<Media resource={...} />` (from `@/components/Media`). **Never** `<img src="/assets/...">`
- No image set? Render: `<div className="bg-[#ECE5DE]" />`
- Type guard for resolved media: `typeof image === 'object' && image !== null && 'url' in image`
- Hero/above-fold images: always set `priority` on `<Media>` component
- Source images for seeding live in `public/assets/images/` — used only by seed scripts, never served directly

### Image Optimization for Seeds

- **Always use `optimizedFile()`** from `src/scripts/seed-image-utils.ts`
- **Never upload raw PNGs** from design tools (often 5–25 MB each)
- `optimizedFile()` converts to WebP + resizes (typically 80–90% savings)
- Presets:
  - `IMAGE_PRESETS.hero` — full-width banners (max 1920px, quality 80)
  - `IMAGE_PRESETS.card` — product photos, cards, portraits (max 1200px, quality 80)
  - `IMAGE_PRESETS.logo` — sponsor logos, icons (max 600px, quality 80)
- Use `readLocalFile()` only for SVGs (cannot be rasterized)

---

## 8 — Bilingual & Admin-Ready Rules (NEVER SKIP)

These rules apply to **every** new feature, section, field, or content block — no exceptions.

### A — Every Visible Text is a CMS Field

- Every piece of visible content (text, images, links, labels, button text) MUST be a field in the Payload schema.
- Never rely on hardcoded-only text.

### B — All Text Fields Are Localized

- Every text, textarea, and richText field MUST have `localized: true`.
- Locales: `de` (default / German) and `en` (English).

### C — Seed BOTH Languages — Always

- Every seed script MUST populate both `locale: 'de'` and `locale: 'en'`.
- Always pass `context: { skipRevalidate: true, skipAutoTranslate: true }`.
- After seeding, all fields must appear pre-filled and editable in `/admin` for both languages.

### D — Bilingual Seeding — Reuse IDs Across Locales

- Arrays, blocks, and nested items are NOT localized — only text fields inside them are.
- Payload auto-generates IDs for array items and blocks on each save.
- **Seed order:**
  1. Save DE first (Payload generates IDs)
  2. Read back the saved document to capture all generated IDs
  3. Save EN reusing those exact same IDs
- Skipping this orphans DE localized text when EN creates new IDs.
- Save ALL sections (hero + layout blocks) together per locale.
- **Sequential writes** (no `Promise.all`) on MongoDB Atlas M0 to avoid WriteConflict.

### E — Hardcoded Defaults in English

- Component defaults are English.
- CMS always wins: `const resolved = cmsValue ?? DEFAULT_VALUE`

### F — Admin Dashboard = Non-Coder Friendly

- Editors control everything from `/admin` without developer help.
- Use `admin.condition` to show fields only when relevant.
- Use `admin.description` to explain every non-obvious field.
- Use clear `label` values on every field.
- Required fields must always have seeded data.

### G — DeepL Auto-Translation

- `autoTranslateCollection` / `autoTranslateGlobal` hooks auto-translate DE → EN via DeepL on save.
- These are for **production editors**, NOT for development seeding.
- All seed scripts MUST use `context: { skipAutoTranslate: true }`.

### H — After Every Schema Change

1. `pnpm generate:types` — update TypeScript types
2. `pnpm generate:importmap` — if components changed
3. `npx tsc --noEmit` — verify zero TypeScript errors
4. Re-run the relevant seed script

---

## 9 — Next.js Best Practices (App Router — Next.js 15)

### Server vs Client Components

- Default to **server components** (no `'use client'` directive).
- Use client components only for: stateful UI, browser-only APIs, React hooks.

### Data Fetching

- Fetch in server components using Payload Local API:
  ```typescript
  import { getPayload } from 'payload'
  import config from '@payload-config'
  const payload = await getPayload({ config })
  const data = await payload.find({ collection: 'products' })
  ```
- Never expose secrets in client code.

### Route Groups

- `(app)` — Frontend pages visible to users
- `(payload)` — Admin panel (auto-generated, don't modify)

---

## 10 — Styling (TailwindCSS 4 + shadcn/ui)

- Use Tailwind utility classes directly in JSX.
- Use `cn()` from `src/lib/utils.ts` for conditional classes.
- Use shadcn/ui components (Button, Input, Label, Select, etc.) from `src/components/ui/`.
- Typography/spacing tokens defined in `docs/DESIGN_SYSTEM.md` — **never** hardcode font sizes or spacing.
- Ensure WCAG AA contrast (4.5:1 minimum).

### Typography

| Tailwind class | Font | Usage |
|---------------|------|-------|
| `font-sans` | `neue-haas-grotesk-text` | Body text, paragraphs, labels |
| `font-display` | `neue-haas-grotesk-display-pro` | Headings, nav links, buttons |

**Never use Geist, Inter, or system fonts.**

---

## 11 — Security Requirements

- Validate all incoming data (API routes, webhooks, forms).
- Use environment variables for secrets — never commit `.env`.
- Apply least privilege (Payload roles: admin, customer).
- When passing `user` to Local API, ALWAYS set `overrideAccess: false`.
- Always pass `req` to nested operations in hooks for transaction safety.

---

## 12 — Accessibility (WCAG 2.1 AA)

- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`.
- Labels for every input.
- Keyboard navigation (Tab, Enter, Escape).
- Visible focus states.
- Proper heading hierarchy (H1 → H2 → H3).
- Alt text for meaningful images; empty alt for decorative.
- Buttons are `<button>`, not `<div>`.

---

## 13 — Performance & SEO

- Use Next.js `<Image>` / `<Media>` — not `<img>`.
- Set `priority` on hero/above-fold images.
- Lazy load below-fold components with `dynamic()`.
- Use `metadata` export in App Router pages.
- Use `generateMeta` from `src/lib/generate-meta.ts`.

---

## 14 — Seed Scripts

### Pattern

- One script per page: `src/scripts/seed-<page>.ts`
- Registered in `src/scripts/seed-all.ts` (scripts map + allOrder array)
- Run all: `pnpm seed` | Run one: `pnpm seed about`
- Each seed populates hero + layout blocks for both locales

### Seed Script Template

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  const payload = await getPayload({ config })
  const ctx = { skipRevalidate: true, skipAutoTranslate: true }

  // 1. Save DE first
  await payload.updateGlobal({
    slug: 'my-global',
    locale: 'de',
    data: { /* German values */ },
    context: ctx,
  })

  // 2. Save EN (reuse IDs from DE save)
  await payload.updateGlobal({
    slug: 'my-global',
    locale: 'en',
    data: { /* English values */ },
    context: ctx,
  })

  payload.logger.info('✓ Seeded successfully (DE + EN)!')
  process.exit(0)
}

seed()
```

Run with: `set -a && source .env && set +a && npx tsx src/scripts/seed-<feature>.ts`

---

## 15 — Testing & Commands

```bash
pnpm dev                  # Development server
pnpm build                # Production build
pnpm start                # Production server
pnpm lint                 # ESLint check
pnpm lint:fix             # Auto-fix issues
pnpm generate:types       # Regenerate Payload types
pnpm generate:importmap   # Regenerate import map
pnpm test:int             # Integration tests
pnpm test:e2e             # E2E tests
pnpm seed                 # Seed ALL pages
pnpm seed home            # Seed one page
```

---

## 16 — Checklist Before Finishing Any Feature

- [ ] Schema field added with `localized: true`, `label`, and `admin.description`?
- [ ] Component has English hardcoded default as fallback?
- [ ] Component reads CMS data and overrides default?
- [ ] All images use `<Media resource={...}>` — no static `/assets/` paths?
- [ ] Seed script uses `optimizedFile()` for image uploads?
- [ ] Seed script populates DE and EN with ID reuse?
- [ ] Seed script uses `skipAutoTranslate: true`?
- [ ] Types regenerated (`pnpm generate:types`)?
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)?
- [ ] Admin panel shows the field, pre-filled, editable?
- [ ] New block is small & focused (one section)?
- [ ] Block registered in Pages `layout.blocks` array AND `RenderBlocks.tsx`?
- [ ] Seed script registered in `seed-all.ts`?

---

_Last Updated: February 20, 2026_
_Project: FermentFreude Digital Ecosystem_
_Stack: Next.js 15 + Payload CMS 3.x + TailwindCSS 4 + shadcn/ui + Cloudflare R2 + Stripe_
