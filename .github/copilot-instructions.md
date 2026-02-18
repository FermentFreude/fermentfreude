# Copilot Instructions — Fermentfreude

**Stack:** Next.js 15 (App Router) + Payload CMS 3.x + MongoDB Atlas M0 + Vercel Blob + Stripe + TailwindCSS 4 + shadcn/ui  
**Locales:** `de` (default, German) and `en` (English). DeepL auto-translation hooks exist but are skipped in seeds.  
**Full docs:** `docs/##INSTRUCTIONS.md` (detailed rules), `docs/AGENTS.md` (Payload patterns)

## Infrastructure

- **Database:** MongoDB Atlas M0 (free — no transactions, write operations must be sequential)
- **Image storage:** `@payloadcms/storage-vercel-blob` — all media goes to Vercel Blob via the Media collection. `BLOB_READ_WRITE_TOKEN` env var. Never use static file paths.
- **Media collection:** `src/collections/Media.ts` — upload field, `alt` (text, required, localized), `caption` (richText, localized). Public read access.
- **Fonts:** Neue Haas Grotesk via Adobe Fonts (Typekit). `font-sans` = body text, `font-display` = headings/nav/buttons. Never use Geist, Inter, or system fonts.

## Rules

1. **Every visible text is a CMS field** — never rely on hardcoded-only text. Hardcoded defaults are fallbacks, not the source of truth.
2. **All text fields are `localized: true`** — both German (de) and English (en), always.
3. **Seed BOTH languages** — every seed script populates `locale: 'de'` and `locale: 'en'`. Always pass `context: { skipRevalidate: true, skipAutoTranslate: true }`.
4. **Hardcoded defaults in English** — component defaults are English. CMS data overrides: `const resolved = cmsValue ?? DEFAULT_VALUE`.
5. **Admin = non-coder friendly** — editors change everything from `/admin`. Use `admin.description` on non-obvious fields, `admin.condition` for conditional visibility, clear labels, required fields always have seeded data.
6. **Images go through Payload Media (Vercel Blob)** — never use static `/assets/` paths. Use `<Media resource={...} />` component. Seed scripts upload images with `payload.create({ collection: 'media', ... })`. No image? Render a neutral placeholder `<div className="bg-[#ECE5DE]" />`.
7. **One block = one section** — every content block handles exactly one concern (a CTA, a text section, a team grid, a slider, a contact form). Never bundle multiple sections into one block. Editors compose pages by adding blocks to the layout field in `/admin`. Blocks must be reusable across pages. Don't create per-page Next.js routes — the dynamic `[slug]/page.tsx` renders all CMS pages. New blocks: create config + component in `src/blocks/`, register in `Pages/index.ts` layout blocks array + `RenderBlocks.tsx`.
8. **After every schema change** — run `pnpm generate:types`, `pnpm generate:importmap`, `npx tsc --noEmit`. Re-run the relevant seed script.
9. **Seed scripts** — one per page (`src/scripts/seed-<page>.ts`), registered in `src/scripts/seed-all.ts`. Run all: `pnpm seed`. Run one: `pnpm seed home`. Each seed populates hero + layout blocks for both locales.
10. **Checklist** — localized field with label + description? English default fallback? CMS data overrides? Images use `<Media>`? Seed uploads to Media collection? Both locales seeded? Types regenerated? Zero TS errors? Block is small & focused? Block registered in Pages + RenderBlocks? Seed registered in seed-all.ts?
