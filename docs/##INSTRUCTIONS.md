# Developer Instructions for Claude

**Project:** Fermentfreude — Next.js 15 (App Router) + Payload CMS 3.x + Stripe  
**Goal:** Implement features with senior full-stack discipline: minimal code, clear separation of concerns, secure by default, accessible UI.

---

## 1) Operating Principles

### Build like a senior

- **Minimize new files.** Reuse existing modules/components whenever possible.
- Add a new file **only if**:
  - the file truly doesn't exist already **and**
  - the responsibility is new and clearly separated.

### Separation of concerns

- **UI**: presentation + basic interaction only (in `src/components/` or `src/app/(app)/`)
- **Domain logic**: pure functions (validation, mapping, calculations) in `src/utilities/`
- **Data access**: Payload queries, Stripe calls in service modules
- **Side effects**: webhooks, email sending, isolated and auditable

### Fewer moving parts

- Avoid new dependencies unless absolutely necessary.
- If a feature can be done with existing tooling (Payload, Next.js, Stripe), do that.

---

## 2) Before Writing Code (mandatory)

### Step A — Analyze first

1. **Identify where the feature belongs:**
   - Payload schema change? → `src/collections/` or `src/globals/`
   - Next page/UI change? → `src/app/(app)/` or `src/components/`
   - API route/webhook change? → `src/app/(payload)/` or `src/endpoints/`

2. **Search the codebase for:**
   - existing patterns in similar collections (Products, Pages)
   - existing components in `src/components/`
   - existing utilities in `src/utilities/`
   - existing blocks in `src/blocks/`

3. **Propose the smallest change set.**

### Step B — Confirm integration points

- Payload collections/globals involved
- Any external systems involved (Stripe, Brevo, booking tool)
- Data flow: **CMS → API → UI** (or webhook → handler → persistence)

---

## 3) File & Code Organization Rules

### Fermentfreude Project Structure (Payload 3.0)

```
src/
├── app/
│   ├── (app)/              # Frontend routes (products, cart, checkout, account)
│   └── (payload)/          # Payload admin routes (auto-generated, don't edit)
│
├── access/                 # Permission rules (admins, adminsOrPublished, etc.)
├── blocks/                 # Content blocks (ArchiveBlock, CallToAction, Content, MediaBlock)
├── collections/            # Content types (Categories, Media, Pages, Products/, Users/)
├── components/             # React components (UI, admin, checkout, forms, etc.)
├── endpoints/              # Custom API endpoints (seed)
├── fields/                 # Reusable field definitions (link, slug, hero)
├── fonts/                  # Font files
├── globals/                # Global settings (Footer, Header)
├── heros/                  # Hero components (HighImpact, LowImpact, MediumImpact, PostHero)
├── hooks/                  # Lifecycle hooks (populatePublishedAt, revalidate, etc.)
├── lib/                    # Utility libs (generate-meta, merge-open-graph, utils)
├── plugins/                # Plugin configuration (ecommerce, seo, form-builder)
├── providers/              # Context providers (Auth, HeaderTheme, Theme)
├── utilities/              # Helper functions (format-date-time, etc.)
├── cssVariables.js         # CSS variables
├── payload-types.ts        # Auto-generated types (don't edit manually)
└── payload.config.ts       # Main Payload config
```

### Do not create new files if a good home exists

- **Need a workshop collection?** → Add `src/collections/Workshops.ts` (follow Products pattern)
- **Need a recipe component?** → Add to `src/components/RecipeCard/`
- **Need a booking widget?** → Add to `src/components/BookingWidget/`
- **Need a utility function?** → Add to `src/utilities/`
- **Need a Brevo integration?** → Add to `src/endpoints/brevo.ts`

### When you _do_ create a file

- Match existing naming patterns:
  - Collections: `PascalCase.ts` (e.g., `Workshops.ts`)
  - Components: `PascalCase/index.tsx` or `PascalCase.tsx`
  - Utilities: `kebab-case.ts` (e.g., `format-workshop-date.ts`)
  - API routes: `route.ts` in folder
- Include TypeScript types
- Keep it focused on single responsibility

### Prefer these patterns (established in codebase)

- **Components**: Follow existing component structure in `src/components/`
- **Blocks**: Follow CallToAction, Content, WorkshopSlider patterns in `src/blocks/` — **one block = one section**
- **Collections**: Follow Products, Pages patterns in `src/collections/`
- **Plugins**: Configured in `src/plugins/index.ts`
- **Hooks**: Follow revalidate, populatePublishedAt patterns in `src/hooks/`

---

## 3.5) Block Architecture — One Block = One Section (CRITICAL)

Every content block must represent **one self-contained page section**, not an entire page.

### Rules

1. **One block = one section.** A block should handle exactly one concern: a CTA, a text section, a team grid, a slider, a contact form. Never bundle multiple sections into a single block.
2. **Editors compose pages from blocks.** Pages are built by adding blocks to the `layout` field in `/admin`. This gives editors full control over page structure — they can reorder, remove, or add sections to any page without developer help.
3. **Blocks are reusable across pages.** A `CallToAction` block can appear on the home page, the about page, or any future page. Design blocks for reuse, not for a specific page.
4. **No per-page route files.** The dynamic `[slug]/page.tsx` route renders ALL CMS pages using `RenderHero` + `RenderBlocks`. Never create `src/app/(app)/about/page.tsx` or similar — use the Pages collection instead.
5. **Block size guide:**
   - ✅ **Good** (40–120 lines config): `CallToAction` (CTA text + buttons), `Content` (rich text columns), `WorkshopSlider` (cards carousel), `TeamGrid` (member cards), `ContactForm` (form + info)
   - ❌ **Bad** (500+ lines config): `AboutBlock` (hero + story + team + sponsors + contact + form + CTA all in one) — this is a legacy monolith, do not replicate this pattern

### How to add a new block

1. **Create config**: `src/blocks/MyBlock/config.ts` — define slug, labels, fields (keep focused)
2. **Create component**: `src/blocks/MyBlock/Component.tsx` — render the block
3. **Register in Pages**: Add the config import to `src/collections/Pages/index.ts` → `layout.blocks` array
4. **Register in RenderBlocks**: Add the component to `src/blocks/RenderBlocks.tsx` → `blockComponents` map
5. **Generate types**: `pnpm generate:types && pnpm generate:importmap`
6. **Seed data**: Add block data to the relevant page seed script, or create a new seed script and register it in `src/scripts/seed-all.ts`

### Example: Good block structure for an About page

Instead of one monolithic `AboutBlock`, compose from individual blocks:

```
About page layout (in /admin):
  1. Content block        → "Our Story" section (rich text + image)
  2. TeamGrid block       → Team member cards
  3. SponsorsBar block    → Logo strip  
  4. ContactForm block    → Form + contact details
  5. CallToAction block   → "Join our workshops" CTA
```

Each block is independently editable, reorderable, and reusable on other pages.

### Seed scripts & blocks

- One seed script per page: `src/scripts/seed-<page>.ts`
- Register every seed in `src/scripts/seed-all.ts` (scripts map + allOrder array)
- Run all: `pnpm seed` | Run one: `pnpm seed about`
- Each seed populates the page's `layout` array with the correct block types and data

---

## 4) Next.js Best Practices (App Router — Next.js 15)

### Server vs client components

- Default to **server components** (no 'use client' directive).
- Use client components (`'use client'`) only when:
  - you need stateful UI interactions (forms, cart, toggles)
  - browser-only APIs are required (localStorage, window)
  - using hooks (useState, useEffect, useContext)

### Data fetching

- Fetch data in server components when possible.
- Never expose secrets in client code.
- Use Payload's Local API in server components:
  ```typescript
  import { getPayload } from 'payload'
  import config from '@payload-config'
  const payload = await getPayload({ config })
  const data = await payload.find({ collection: 'products' })
  ```

### Route Groups

- `(app)` — Frontend pages visible to users
- `(payload)` — Admin panel (auto-generated, don't modify)

### Existing patterns to follow

- **Dynamic routes**: See `(app)/[slug]/page.tsx`, `(app)/products/[slug]/page.tsx`
- **Loading states**: Use existing loading patterns
- **Error handling**: Use `Message` component
- **Form handling**: Use form components from `src/components/forms/`

---

## 5) Payload CMS Best Practices (3.x)

### Content modeling (follow existing patterns)

- **Collections** for repeatable content:
  - Existing: `Categories`, `Media`, `Pages`, `Products` (with Variants), `Users`
  - Auto-created by ecommerce plugin: `Carts`, `Addresses`, `Orders`, `Transactions`, `Variants`, `VariantTypes`, `VariantOptions`
  - To add: `Workshops`, `Recipes`, `Press`, `B2BInquiries`
- **Globals** for page-managed content:
  - Existing: `Footer`, `Header`

### Follow existing collection structure

```typescript
import type { CollectionConfig } from 'payload'

export const YourCollection: CollectionConfig = {
  slug: 'collection-name',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'updatedAt'],
  },
  access: {
    read: adminsOrPublished,
    create: admins,
    update: admins,
    delete: admins,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    // ... more fields
  ],
}
```

### Plugins (configured in `src/plugins/index.ts`)

- **@payloadcms/plugin-ecommerce** — Products, variants, carts, orders, transactions, Stripe
- **@payloadcms/plugin-seo** — SEO metadata for pages and products
- **@payloadcms/plugin-form-builder** — Contact forms, newsletter signups
- **@payloadcms/richtext-lexical** — Rich text editor (replaces Slate)

### Permissions (match existing patterns)

- **Public read**: Products, Pages, Media, Categories (published only)
- **Authenticated write**: Products, Pages (editors)
- **Admin only**: Orders, Transactions, Users
- Access functions in `src/access/`

---

## 6) Ecommerce Plugin (Payload 3.0)

### Built-in collections (don't recreate)

- **Products** — with pricing per currency
- **Variants** — product variations (size, color)
- **Carts** — server-side, supports guest + authenticated users
- **Addresses** — saved user addresses
- **Orders** — created after successful transaction
- **Transactions** — payment tracking from initiation to completion

### Stripe integration

- Configured via `stripeAdapter()` in `src/plugins/index.ts`
- Payment flow: `initiatePayment()` → Stripe PaymentIntent → `confirmOrder()`
- Webhooks auto-configured
- Client hooks: `useCart()`, `usePayments()`, `useAddresses()` from `@payloadcms/plugin-ecommerce/client/react`

### Sensitive data

- Stripe keys only in environment variables:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOKS_SIGNING_SECRET`
- Never store raw payment details

---

## 7) Styling (TailwindCSS 4 + shadcn/ui)

### Structure

- TailwindCSS configured in `tailwind.config.mjs`
- shadcn/ui components in `src/components/ui/`
- Component config in `components.json`

### Patterns

- Use Tailwind utility classes directly in JSX
- Use `cn()` from `src/lib/utils.ts` for conditional classes
- Use shadcn/ui components (Button, Input, Label, Select, etc.)
- For Fermentfreude: nature-aligned colors (greens, browns, earth tones)
- Ensure WCAG AA contrast (4.5:1 minimum)

---

## 8) Security Requirements

### Must do

- Validate all incoming data (API routes, webhooks, forms)
- Protect admin/editor routes with proper auth (Payload handles this)
- Use environment variables for secrets
- Apply least privilege (Payload roles: admin, customer)

### Avoid

- Writing secrets into logs
- Exposing internal IDs unnecessarily to client
- Allowing unvalidated query params to hit DB calls

---

## 9) Accessibility Requirements (WCAG 2.1 AA)

- Semantic HTML first (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Labels for every input
- Keyboard navigation works (Tab, Enter, Escape)
- Focus states are visible
- Proper heading hierarchy (H1 → H2 → H3)
- Alt text for meaningful images; empty alt for decorative
- Buttons are buttons (not divs)

---

## 10) Performance & SEO

### Performance

- Use Next.js `<Image>` component (not `<img>`)
- Set `priority` on hero/above-fold images
- Lazy load below-fold components with `dynamic()`
- Keep component trees shallow

### SEO

- Use `metadata` export in App Router pages
- SEO plugin configured for pages and products
- Use `generateMeta` utility from `src/lib/generate-meta.ts`

---

## 11) Testing

### Available test infrastructure

- **Vitest** — Integration tests (`pnpm test:int`)
- **Playwright** — E2E tests (`pnpm test:e2e`)
- **Both** — `pnpm test`

### Required checks before finishing a change

- TypeScript passes (`pnpm generate:types` if schema changed)
- Lint passes (`pnpm lint`)
- No unused exports or dead code
- Manual smoke test:
  - create/edit content in Payload `/admin`
  - page renders correctly
  - forms submit correctly

### Commands

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
```

---

## 12) Environment Variables

### Required (see `.env.example`)

```bash
# Database
DATABASE_URL=mongodb+srv://...

# Payload
PAYLOAD_SECRET=min-32-character-random-string
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...

# Draft preview
PREVIEW_SECRET=demo-draft-secret

# Brevo (optional)
BREVO_API_KEY=your_api_key
```

### Never commit

- `.env` file (`.gitignore` already configured)
- Any file with actual keys/secrets

---

## 13) Common Tasks & Patterns

### Adding a new collection (e.g., Workshops)

1. Create `src/collections/Workshops.ts`
2. Follow `Products` structure
3. Add to `collections` array in `payload.config.ts`
4. Run `pnpm generate:types`
5. Create display component in `src/components/WorkshopCard/`
6. Create page in `src/app/(app)/workshops/`
7. Add to navigation in Header global

### Adding a new page

1. **Always use the Pages collection** — do NOT create a new Next.js route file. The dynamic `[slug]/page.tsx` handles all pages.
2. Define the page content as a combination of blocks in the `layout` field.
3. Create a seed script: `src/scripts/seed-<pagename>.ts` — seed hero + layout blocks for DE and EN.
4. Register the seed in `src/scripts/seed-all.ts` (add to `scripts` map and `allOrder` array).
5. Run `pnpm seed <pagename>` to populate the page.
6. Add to Header global navigation (via seed or `/admin`).
7. Only create a dedicated route file (`src/app/(app)/something/page.tsx`) for non-CMS pages that need custom server logic (e.g., checkout, account, cart).

### Adding a new component

1. Check `src/components/` for similar components
2. Create file: `ComponentName.tsx` or `ComponentName/index.tsx`
3. Use TypeScript types
4. Use Tailwind + shadcn/ui for styling
5. Make accessible (WCAG AA)

### Adding API integration (e.g., Brevo)

1. Add endpoint in `src/endpoints/brevo.ts`
2. Register in `payload.config.ts`
3. Store API key in `.env`
4. Add error handling

---

## 14) Documentation References

- **Development setup**: `docs/DEVELOPMENT.md`
- **Security best practices**: `docs/SECURITY.md`
- **Accessibility standards**: `docs/ACCESSIBILITY.md`
- **Performance optimization**: `docs/PERFORMANCE.md`

---

## 15) Quick Reference

### Start development

```bash
pnpm install
cp .env.example .env
# Edit .env with your credentials
pnpm dev
```

### Access points

- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## 16) CMS-Editable with Hardcoded Defaults Pattern

When adding content that editors should be able to manage from the Admin panel, **always** follow this three-layer approach:

### The Pattern

1. **Schema** — Add the editable fields to the relevant Payload collection or global (e.g., `src/globals/Header.ts`, `src/collections/Pages/`).
2. **Hardcoded Defaults** — In the component, define a `defaults` map with sensible initial values. The component renders these defaults immediately — no CMS setup required for the site to work.
3. **CMS Override** — If CMS data exists for that item, use it instead of the default. CMS always wins.
4. **Seed Script** — Write a script in `src/scripts/` that populates the CMS with the default values so editors can see and modify them from day one.

### Component Logic

```typescript
// 1. Define defaults
const defaults: Record<string, MyItem[]> = {
  'key-that-matches-cms': [
    { label: 'Default Label', href: '/default-url', description: 'Default subtitle' },
  ],
}

// 2. Render: CMS data overrides defaults
const items = cmsData.length > 0 ? cmsData : (defaults[matchKey] ?? [])
```

### Seed Script Pattern

```typescript
// src/scripts/seed-[feature].ts
import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  const payload = await getPayload({ config })

  // Always seed DE (default locale)
  await payload.updateGlobal({
    slug: 'global-slug',
    locale: 'de',
    data: {
      /* German values */
    },
    context: { skipRevalidate: true, skipAutoTranslate: true },
  })

  // Always seed EN
  await payload.updateGlobal({
    slug: 'global-slug',
    locale: 'en',
    data: {
      /* English values */
    },
    context: { skipRevalidate: true, skipAutoTranslate: true },
  })

  payload.logger.info('✓ Seeded successfully (DE + EN)!')
  process.exit(0)
}

seed()
```

Run with: `set -a && source .env && set +a && npx tsx src/scripts/seed-[feature].ts`

### Why This Pattern

- **No blank pages** — Site works immediately with defaults, even before editors touch the CMS.
- **Full editor control** — Editors can override everything from `/admin` without developer help.
- **Safe to redeploy** — Defaults only apply when CMS data is empty; editor changes are never overwritten.
- **Seed on first deploy** — Run the seed script once so editors see all items pre-populated and ready to edit.

### Existing Examples

- **Header nav items + dropdowns** — `src/globals/Header.ts` schema, `src/components/Header/index.client.tsx` defaults, `src/scripts/seed-header.ts` seed script.
- **Hero section** — `src/fields/hero.ts` schema, `src/heros/HeroSlider/index.tsx` defaults, `src/scripts/seed-home-hero.ts` seed script.

---

## 17) Bilingual & Admin-Ready Rules (NEVER SKIP)

These rules apply to **every** new feature, section, field, or content block — no exceptions.

### A — Every visible text is a CMS field

- Every piece of visible content (text, images, links, labels, button text) MUST be a field in the Payload schema.
- Never rely on hardcoded-only text — hardcoded defaults are fallbacks, not the source of truth.

### B — All text fields are localized

- Every text, textarea, and richText field MUST have `localized: true`.
- Locales: `de` (default / German) and `en` (English).

### C — Seed BOTH languages — always

- Every seed script MUST populate both `locale: 'de'` and `locale: 'en'`.
- Always pass `context: { skipRevalidate: true, skipAutoTranslate: true }` in seed scripts.
- After seeding, all fields must appear pre-filled and editable in `/admin` for both languages.
- **Never forget either language.**

### D — Hardcoded defaults in English

- Component defaults are written in English.
- CMS data always wins: `const resolved = cmsValue ?? DEFAULT_VALUE`

### E — Admin dashboard = non-coder friendly

- An editor who doesn't code must be able to change every visible text, link, and image from `/admin`.
- Use `admin.condition` to show fields only when relevant.
- Use `admin.description` to explain every non-obvious field.
- Use clear `label` values on every field.
- Required fields must always have seeded data so saving never fails.

### F — Images go through Payload Media (Vercel Blob) — NEVER static paths

- This project uses `@payloadcms/storage-vercel-blob` — all uploaded images are stored in Vercel Blob, **not** in the filesystem.
- **Static file paths (`/assets/images/...`)** do NOT work on Vercel. Never use them as `src` in `<img>` tags or CSS `backgroundImage`.
- Every image field in the schema MUST be `type: 'upload', relationTo: 'media'`.
- In components, render images using the Payload `<Media resource={...} />` component (from `@/components/Media`). Never use raw `<img src="/assets/...">`.
- If no image is set in the CMS, render a neutral placeholder (`<div className="h-full w-full bg-[#ECE5DE]" />`), not a hardcoded file path.
- **Seed scripts** MUST upload images to the Media collection using `payload.create({ collection: 'media', data: { alt }, file: readLocalFile(...) })` and then reference the returned Media document in content fields.
- Source images for seeding live in `public/assets/images/` locally — they exist only for the seed script to read and upload, never for direct serving.
- To check if a media field has a resolved Media object (not just a string ID), use a type guard: `typeof image === 'object' && image !== null && 'url' in image`.
- Always set `priority` on hero/above-fold `<Media>` components.

### G — After every schema change

1. `pnpm generate:types` — update TypeScript types.
2. `pnpm generate:importmap` — if components changed.
3. `npx tsc --noEmit` — verify zero TypeScript errors.
4. Re-run the relevant seed script to populate new fields.

### H — Checklist before finishing any feature

- [ ] Schema field added with `localized: true`, `label`, and `admin.description`?
- [ ] Component has English hardcoded default as fallback?
- [ ] Component reads CMS data and overrides default?
- [ ] All images use `<Media resource={...}>` — no static `/assets/` paths in rendered output?
- [ ] Seed script uploads images to Media collection (Vercel Blob), not referencing static paths?
- [ ] Seed script populates DE and EN?
- [ ] Seed script uses `skipAutoTranslate: true`?
- [ ] Types regenerated?
- [ ] Zero TypeScript errors?
- [ ] Admin panel shows the field, pre-filled, editable?
- [ ] New block is small & focused (one section, not a whole page)?
- [ ] Block registered in Pages `layout.blocks` array AND `RenderBlocks.tsx`?
- [ ] Seed script registered in `seed-all.ts`?

---

**Remember:** This is a production e-commerce system for a real client. Code quality, security, accessibility, and performance are not optional. Always follow existing patterns and keep changes minimal.

---

_Last Updated: February 18, 2026_  
_Project: Fermentfreude Digital Ecosystem_  
_Stack: Next.js 15 + Payload CMS 3.x + TailwindCSS 4 + shadcn/ui + Stripe_
