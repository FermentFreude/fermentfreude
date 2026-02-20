# Implementation Fixes & Plan

> Full audit results, completed fixes, and roadmap for remaining improvements.
> Last updated: June 2025.

---

## Table of Contents

1. [Completed Fixes](#1-completed-fixes)
2. [Remaining Work — Priority Matrix](#2-remaining-work--priority-matrix)
3. [Phase 1 — Quick Wins (Hours)](#3-phase-1--quick-wins)
4. [Phase 2 — CMS Migration (Days)](#4-phase-2--cms-migration)
5. [Phase 3 — Architecture Cleanup (Days)](#5-phase-3--architecture-cleanup)
6. [Phase 4 — Quality & Coverage (Ongoing)](#6-phase-4--quality--coverage)
7. [Image Optimization Checklist](#7-image-optimization-checklist)
8. [Code Suppressions Inventory](#8-code-suppressions-inventory)

---

## 1. Completed Fixes

All items below have been implemented and verified with `npx tsc --noEmit` (zero errors).

### 1.1 — Dead Code Removal (3,630 lines)

| What | Detail |
|------|--------|
| **Deleted `src/endpoints/seed/`** | 17 files, 3,630 lines, 2.8 MB of Payload ecommerce template seed code (t-shirts, hats, generic content). None of it was FermentFreude content. |
| **Preserved 3 data files** | `about.ts`, `contact.ts`, `voucher-page.ts` — moved to `src/scripts/data/` and seed scripts updated to import from new location. |

### 1.2 — Security Hole Closed

| What | Detail |
|------|--------|
| **Deleted `src/app/(app)/next/seed/route.ts`** | API route that let **any authenticated user** POST to `/next/seed` and wipe the database + re-seed with template data. No admin-role check existed. |

### 1.3 — Hardcoded Fallback Removed

| What | Detail |
|------|--------|
| **Removed `homeStaticData` import** from `src/app/(app)/[slug]/page.tsx` | Was silently rendering a hardcoded Home page when CMS data was missing. Now cleanly returns `notFound()`. |

### 1.4 — HTML Lang Fix

| What | Detail |
|------|--------|
| **`<html lang="en">`** → **`<html lang={locale}>`** | `src/app/(app)/layout.tsx` now reads the locale from cookies via `getLocale()` so the document language matches the user's selected locale (`de` or `en`). |

### 1.5 — Commented-Out Code Removed

| What | Detail |
|------|--------|
| **24 lines of dead metadata** removed from `src/app/(app)/layout.tsx` | Template metadata for "Payload Ecommerce Template" was commented out but still present. |

### 1.6 — Dead Redirect Removed

| What | Detail |
|------|--------|
| **IE-only redirect** removed from `redirects.js` | Redirected IE users to a Microsoft page. IE has been dead since 2022. Now returns empty array. |

### 1.7 — Type Safety Fix in RenderBlocks

| What | Detail |
|------|--------|
| **Replaced `@ts-ignore`** in `src/blocks/RenderBlocks.tsx` | Was `// @ts-ignore` + `eslint-disable`. Now uses proper `React.FC<{ id?: string } & Record<string, unknown>>` type cast with null-safe `blockName` guard. |

### 1.8 — Config Cleanup

| What | Detail |
|------|--------|
| **Removed empty `endpoints: []`** from `src/payload.config.ts` | No-op line left from template. |

### 1.9 — HeroSlider Refactor (699 → 6 modules)

The monolithic 699-line `HeroSlider/index.tsx` was split into focused modules:

| Module | Lines | Responsibility |
|--------|-------|----------------|
| `index.tsx` | ~340 | Main component — layout, CMS merge, render |
| `slide-data.ts` | ~95 | Types (`ResolvedSlide`), type guard, `DEFAULT_SLIDES` |
| `useAutoPlay.ts` | ~82 | Auto-play timer, animation state machine, transitions |
| `useSwipe.ts` | ~48 | Touch/swipe detection for mobile |
| `NavArrow.tsx` | ~65 | Desktop half-circle nav arrows |
| `SlideImage.tsx` | ~35 | Image render with `<Media>` or placeholder |

### 1.10 — Unused Assets Removed (23 MB)

13 files deleted from `public/`:

- `assets/tempeh-hero.gif`, `Image (Geburtstage).png`, `hero-test.jpg`, `Image (Weihnachten).png`, `Image (Team Events).png`, `sponsor-logo-{1-4}.svg`
- `media/tempeh-hero.gif`, `herobackgrownd.jpg`, `DavidHero.png`, `DavidHeroSlider.png`

### 1.11 — Misc Cleanup

- Deleted empty `fermentfreude-v3/` directory
- Deleted `.DS_Store`

---

## 2. Remaining Work — Priority Matrix

| # | Item | Severity | Effort | Phase |
|---|------|----------|--------|-------|
| A | **107 MB unoptimized images** in `public/` | 🔴 High | Low | 1 |
| B | **Gastronomy page** — 275 lines hardcoded, broken image refs | 🔴 High | Medium | 2 |
| C | **Fermentation page** — 9 hardcoded sections, broken image refs | 🔴 High | Medium-High | 2 |
| D | **AdminBar** — 4× `@ts-ignore` + 4× `eslint-disable` in one file | 🟡 Medium | Low | 1 |
| E | **AboutBlock** — 351 lines, 6 sections in 1 block (violates Rule #9) | 🟡 Medium | Medium | 3 |
| F | **Contact duplication** — ContactBlock (294 lines) + ContactSection (261 lines) | 🟡 Medium | Low-Med | 3 |
| G | **Remaining `@ts-ignore`/`@ts-expect-error`** — 6 more occurrences | 🟡 Medium | Low | 1 |
| H | **Test coverage** — near-zero, template boilerplate E2E suite | 🟡 Medium | High | 4 |
| I | **Template E2E tests** — 644 lines of unmodified Payload template tests | 🟢 Low | Low | 1 |

---

## 3. Phase 1 — Quick Wins

Estimated time: **2–4 hours**. No schema changes, no CMS migrations.

### 3.1 — Optimize & Upload Images to R2

**Problem:** 107 MB of raw PNGs in `public/`. `Banner.png` alone is 25 MB. Per Rule #7 and #8, all images should go through Payload Media → Cloudflare R2, optimized via `optimizedFile()`.

**Files to optimize:**

| File | Size | Preset |
|------|------|--------|
| `public/assets/images/Banner.png` | 25 MB | `hero` (1920px) |
| `public/media/hero/lakto2.png` | 12 MB | `hero` (1920px) |
| `public/media/hero/kombucha1.png` | 9.5 MB | `hero` (1920px) |
| `public/assets/images/Image (Gift Set).png` | 9.8 MB | `card` (1200px) |
| `public/media/hero/lakto1.png` | 8.7 MB | `hero` (1920px) |
| `public/media/hero/kombucha2.png` | 7.3 MB | `hero` (1920px) |
| `public/media/workshops/lakto.png` | 6.7 MB | `card` (1200px) |
| `public/media/workshops/tempeh.png` | 6.5 MB | `card` (1200px) |
| `public/assets/images/company-b2b.png` | 5.8 MB | `card` (1200px) |
| `public/media/workshops/kombucha.png` | 3.2 MB | `card` (1200px) |
| `public/media/hero/DavidHeroCopy.png` | 2.6 MB | `hero` (1920px) |
| `public/media/hero/MarcelHero.png` | 2.1 MB | `hero` (1920px) |
| `public/media/hero/tempeh{1,2}.png` | 2.5 MB | `hero` (1920px) |

**Steps:**
1. For each image, run through `optimizedFile()` from `src/scripts/seed-image-utils.ts`
2. Upload to Payload Media collection (which stores in R2)
3. Update references in seed scripts to use Media IDs
4. Delete originals from `public/` after confirming R2 upload
5. Update any hardcoded `src="/assets/..."` or `src="/media/..."` paths to use `<Media resource={...} />`

### 3.2 — Fix AdminBar Type Suppressions

**File:** `src/components/AdminBar/index.tsx` (8 suppressions)

**Steps:**
1. Read the actual types from `@payloadcms/live-preview-react`
2. Type the `useRouter` and collection references properly
3. Remove all 4 `@ts-ignore` and 4 `eslint-disable` comments

### 3.3 — Fix Remaining Type Suppressions

| File | Line | Fix approach |
|------|------|-------------|
| `src/components/checkout/CheckoutPage.tsx` | L302 | Type the Stripe elements prop correctly |
| `src/utilities/useClickableCard.ts` | L99, L103 | Type the ref callback properly |
| `src/app/(app)/(account)/orders/[id]/page.tsx` | L187 | Fix the Payload relation type |

### 3.4 — Delete Template E2E Tests

**File:** `tests/e2e/frontend.e2e.spec.ts` (644 lines)

This is unmodified Payload ecommerce template boilerplate. It tests "Payload Ecommerce Template" page title, hardcoded credit card details, and product creation flows that don't match FermentFreude's schema. Delete and replace with actual FermentFreude E2E tests when test coverage work begins.

---

## 4. Phase 2 — CMS Migration

Estimated time: **2–3 days**. Requires new Payload blocks, seeds, and potentially schema changes.

### 4.1 — Convert Gastronomy Page to CMS Blocks

**Current:** `src/app/(app)/gastronomy/page.tsx` — 275 lines of hardcoded JSX with broken image references (`fermentation-hero.jpg`, `fermentation-cta.jpg` don't exist).

**Plan:**
1. Identify the 6 sections: Hero, Benefits Grid, Products Grid, How-it-works Steps, Chef Workshops CTA, Contact CTA
2. Map each to existing blocks where possible (HeroBanner, FeatureCards, CallToAction)
3. Create new blocks only for sections that don't match existing ones
4. Create `src/scripts/seed-gastronomy.ts` with bilingual content (DE first → EN with same IDs)
5. Register seed in `seed-all.ts`
6. Delete `src/app/(app)/gastronomy/page.tsx` — the dynamic `[slug]/page.tsx` will handle it
7. Run `pnpm generate:types && pnpm generate:importmap && npx tsc --noEmit`

### 4.2 — Convert Fermentation Page to CMS Blocks

**Current:** `src/app/(app)/fermentation/page.tsx` (39 lines) composing 9 section components from `src/components/sections/`. The sections themselves contain hardcoded content and broken image references.

**Plan:**
1. Audit all 9 section components (HeroSection, BenefitsBar, GuideIntro, WhatIsSection, WhySpecialSection, SafetySection, PracticeSection, ReadyToLearnCTA, FAQSection)
2. Convert each to a CMS block or map to existing blocks
3. Create `src/scripts/seed-fermentation.ts`
4. Delete `src/app/(app)/fermentation/page.tsx` and the 9 section components
5. Run type generation + verify

### 4.3 — Fix Broken Image References

Both gastronomy and fermentation pages reference images that don't exist:
- `fermentation-hero.jpg` — referenced in 4+ places
- `fermentation-cta.jpg` — referenced in 4+ places

These should be uploaded to R2 via Payload Media and referenced via `<Media resource={...} />`.

---

## 5. Phase 3 — Architecture Cleanup

Estimated time: **1–2 days**. Refactoring existing blocks and components.

### 5.1 — Split AboutBlock (351 lines → 6 focused blocks)

**Current:** `src/blocks/AboutBlock/Component.tsx` bundles 6 sections into one mega-block, violating Rule #9 ("one block = one section").

**Proposed split:**
1. `AboutHeroBlock` — Background hero image
2. `OurStoryBlock` — Label, heading, subheading, description
3. `TeamBlock` — Team member cards (reusable)
4. `SponsorsBlock` — Already delegates to `SponsorsSection` (extract)
5. `ContactBlock` — Already exists separately (consolidate with 5.2)
6. `ReadyToLearnCTABlock` — Heading, description, 2 buttons

**Steps:**
1. Create each new block collection config in `src/blocks/`
2. Register in `Pages/index.ts` and `RenderBlocks.tsx`
3. Create seed data for each block
4. Update About page seed to compose from individual blocks
5. Delete `AboutBlock/` after migration
6. Run type generation + verify

### 5.2 — Consolidate Contact Duplication

**Current:**
- `src/blocks/ContactBlock/Component.tsx` (294 lines) — CMS block with hero, form, map, CTA
- `src/components/sections/ContactSection.tsx` (261 lines) — Plain component used by AboutBlock

**They differ in:**
- Form fields: ContactBlock uses `firstName`/`lastName`; ContactSection uses single `name`
- Layout: ContactBlock has a hero image; ContactSection doesn't
- Neither actually submits the form (both are UI-only)

**Plan:**
1. Keep `ContactBlock` as the canonical CMS block
2. Align form fields to a single schema
3. Make ContactBlock flexible enough to render with/without hero
4. Delete `ContactSection` after AboutBlock refactor
5. Update any imports

---

## 6. Phase 4 — Quality & Coverage

Estimated time: **Ongoing**. Test strategy and infrastructure.

### 6.1 — Delete Template E2E Tests

Delete `tests/e2e/frontend.e2e.spec.ts` (644 lines of Payload template boilerplate).

### 6.2 — Write FermentFreude-Specific Tests

**Priority test targets:**

| Area | Type | What to test |
|------|------|-------------|
| Seed scripts | Integration | Each seed runs without error, creates expected documents |
| Access control | Unit | `adminOnly`, `adminOrSelf`, `publicAccess` functions |
| Auto-translate hook | Unit | `autoTranslateCollection` calls DeepL correctly |
| Checkout flow | E2E | Cart → Stripe checkout → order creation |
| CMS pages | E2E | Dynamic `[slug]` route renders CMS blocks correctly |
| Admin panel | E2E | Login, create page, add blocks, publish |

### 6.3 — CI Pipeline

Add GitHub Actions workflow:
1. `pnpm install`
2. `pnpm generate:types && pnpm generate:importmap`
3. `npx tsc --noEmit`
4. `pnpm lint`
5. `pnpm test` (once tests exist)

---

## 7. Image Optimization Checklist

Per Rule #8, all images must be optimized before upload using `optimizedFile()` from `src/scripts/seed-image-utils.ts`.

| Preset | Max width | Use case |
|--------|-----------|----------|
| `hero` | 1920px | Full-width hero banners |
| `card` | 1200px | Product cards, workshop images |
| `logo` | 600px | Logos, icons, small assets |

**Checklist for each image:**
- [ ] Run through `optimizedFile()` with appropriate preset
- [ ] Upload to Payload Media collection (stored in R2)
- [ ] Get Media document ID
- [ ] Update seed script to reference Media ID
- [ ] Replace any `<Image src="/assets/..." />` with `<Media resource={...} />`
- [ ] Delete original from `public/`
- [ ] Verify render in both `de` and `en` locales

---

## 8. Code Suppressions Inventory

### `@ts-ignore` / `@ts-expect-error` (10 total, 8 actionable)

| File | Line | Suppression | Status |
|------|------|-------------|--------|
| `src/components/AdminBar/index.tsx` | 35, 63, 66, 71 | `@ts-ignore` (4×) | ❌ Fix in Phase 1 |
| `src/components/checkout/CheckoutPage.tsx` | 302 | `@ts-ignore` | ❌ Fix in Phase 1 |
| `src/utilities/useClickableCard.ts` | 99, 103 | `@ts-expect-error` (2×) | ❌ Fix in Phase 1 |
| `src/app/(app)/(account)/orders/[id]/page.tsx` | 187 | `@ts-expect-error` | ❌ Fix in Phase 1 |
| `src/scripts/seed-voucher.ts` | 19 | `@ts-expect-error` (dotenv) | ✅ Acceptable |
| `src/scripts/seed-all.ts` | 20 | `@ts-expect-error` (dotenv) | ✅ Acceptable |

### `eslint-disable` (15 total, ~10 actionable)

| File | Line | Rule | Status |
|------|------|------|--------|
| `src/payload-types.ts` | 2 | `eslint-disable` (auto-generated) | ✅ Acceptable |
| `src/providers/Theme/types.ts` | 4 | `no-unused-vars` | ❌ Fix |
| `src/components/Logo/Logo.tsx` | 5 | `@next/next/no-img-element` | 🟡 Review — may need `<img>` for SVG |
| `src/providers/Theme/InitTheme/index.tsx` | 8 | `no-before-interactive-script-outside-document` | 🟡 Review |
| `src/utilities/useClickableCard.ts` | 52, 74, 94 | `react-hooks/exhaustive-deps` (3×) | ❌ Fix deps |
| `src/hooks/autoTranslateGlobal.ts` | 62 | `no-explicit-any` | ❌ Type properly |
| `src/components/BeforeDashboard/index.tsx` | 20 | `no-html-link-for-pages` | 🟡 Review |
| `src/components/AdminBar/index.tsx` | 34, 62, 65, 70 | `ban-ts-comment` (4×) | ❌ Fix with proper types |
| `src/app/(app)/robots.ts` | 1 | `no-restricted-exports` | ✅ Acceptable (Next.js convention) |
| `src/blocks/WorkshopSlider/Component.tsx` | 232 | `no-img-element` | ❌ Use `<Media>` or `next/image` |
