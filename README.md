# FermentFreude

Fermentation workshop bookings, shop, and community platform — built on Next.js 15 + Payload CMS, deployed on Vercel.

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | `src/app/(app)/` frontend · `src/app/(payload)/` admin |
| CMS | Payload CMS 3.x | Collections, globals, blocks, lifecycle hooks |
| Database | MongoDB Atlas M0 | No transactions — sequential writes only |
| Storage | Cloudflare R2 | S3-compatible via `@payloadcms/storage-s3` |
| Payments | Stripe | `@payloadcms/plugin-ecommerce` |
| Email | Brevo | Transactional emails, booking confirmations |
| Styling | TailwindCSS 4 + shadcn/ui | Design tokens in `docs/DESIGN_SYSTEM.md` |
| Fonts | Neue Haas Grotesk (Typekit) | `font-sans` = body · `font-display` = headings |
| Locales | `de` (default) + `en` | All text fields localized |
| Hosting | Vercel | Auto-deploys from `main` and `staging` |
| Analytics | GA4 + GTM | All e-commerce events instrumented |
| Package manager | pnpm | |

---

## Environments

| Environment | Branch | Database | URL | Used by |
|---|---|---|---|---|
| **Production** | `main` | `fermentfreude` | `fermentfreude.vercel.app` | Live site (founders) |
| **Staging** | `staging` | `fermentfreude-staging` | `fermentfreude-git-staging-*.vercel.app` | Developer testing |
| **Local** | `feature/*` | `fermentfreude-staging` | `localhost:3000` | Dev |

> **Branch rule:** `feature/*` → PR into `staging` → test → merge `staging` → `main`. Never push directly to `main`.

---

## Local Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables (ask Rafaela for values)
cp .env.example .env

# 3. Start dev server
pnpm dev
# → http://localhost:3000        website
# → http://localhost:3000/admin  CMS admin panel
```

### Required environment variables

```
DATABASE_URL                        # MongoDB Atlas connection string
PAYLOAD_SECRET                      # Random secret (min 24 chars)
PAYLOAD_PUBLIC_SERVER_URL           # Full URL with https://
NEXT_PUBLIC_SERVER_URL              # Full URL (baked at build time!)
R2_BUCKET                           # fermentfreude-media-staging (local/staging)
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ENDPOINT
R2_PUBLIC_URL
STRIPE_SECRET_KEY                   # sk_test_ for dev
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # pk_test_ for dev
STRIPE_WEBHOOKS_SIGNING_SECRET
DEEPL_API_KEY
```

> `NEXT_PUBLIC_*` variables are baked in at **build time**. Changing them on Vercel requires a full redeploy without cache.

---

## Commands

```bash
pnpm dev                   # Dev server (localhost:3000)
pnpm build                 # Production build
pnpm lint                  # ESLint
pnpm lint:fix              # Auto-fix lint issues

pnpm generate:types        # Regenerate Payload types (run after schema changes)
pnpm generate:importmap    # Regenerate import map (run after component changes)
npx tsc --noEmit           # Type-check — must be zero errors before committing

pnpm seed                  # Seed all pages (skips existing content)
pnpm seed home             # Seed one page
pnpm seed home --force     # Force overwrite existing content

pnpm test:int              # Integration tests (Vitest)
pnpm test:e2e              # E2E tests (Playwright)
pnpm stripe-webhooks       # Forward Stripe webhooks locally
```

### After every schema change

```bash
pnpm generate:types
pnpm generate:importmap    # only if components changed
npx tsc --noEmit
```

---

## Project Structure

```
src/
├── app/(app)/              # Public website routes
│   └── [slug]/page.tsx     # Dynamic — renders all CMS pages
├── app/(payload)/          # Payload admin (auto-generated)
├── access/                 # Permission rules
├── blocks/                 # Content blocks — one block = one section
│   └── RenderBlocks.tsx    # Maps block slugs → React components
├── collections/            # Payload collections (Pages, Products, Users…)
├── components/             # React components (Header, Footer, Cart…)
├── fields/                 # Reusable Payload field definitions
├── globals/                # Header.ts, Footer.ts
├── heros/                  # Hero components
│   └── HeroSlider/         # Main home hero
├── hooks/                  # Lifecycle hooks (autoTranslate, revalidate)
├── plugins/                # Plugin config (ecommerce, SEO, R2)
├── scripts/                # Seed scripts — one per page
│   └── seed-all.ts         # Registry
└── payload.config.ts       # Main Payload config
```

---

## Key Features

- **Workshop bookings** — customers book spots on live workshop dates; admins manage capacity, dates, and locations from `/admin`
- **Shop** — physical and digital products, Stripe checkout, invoice PDF download
- **Vouchers** — gift vouchers purchasable in the shop, redeemable at checkout
- **Bilingual** — full `de`/`en` content, auto-translated via DeepL on save
- **Email automation** — Brevo sends booking confirmations, invoices, password resets, and welcome emails on Stripe webhook triggers
- **SEO** — dynamic sitemap, OpenGraph, per-page meta via Payload SEO plugin

---

## Content Management

David and Marcel manage all content from `/admin` — no developer needed for day-to-day changes.

| Task | Where |
|---|---|
| Edit page content | Admin → Pages |
| Add workshop dates | Admin → Workshop Appointments |
| Manage products | Admin → Products |
| View bookings/orders | Admin → Orders |
| Edit navigation | Admin → Globals → Header / Footer |
| Upload images | Admin → Media |
| View newsletter subscribers | Brevo dashboard |

---

## Deployment

Vercel auto-deploys:
- `main` → production
- `staging` → staging preview URL

To deploy: open a PR from `staging` into `main` and merge it. Vercel builds and deploys automatically.

**Rollback:** Vercel → Deployments → click any previous deployment → Promote to Production. Takes under 60 seconds.

---

## Documentation

| Doc | What it covers |
|---|---|
| `docs/SETUP.md` | Full technical reference — providers, theme, locale, API |
| `docs/AGENTS.md` | Payload CMS patterns, security, hooks, queries |
| `docs/DESIGN_SYSTEM.md` | Typography, spacing, color tokens |
| `docs/SECURITY.md` | Auth, GDPR, payments, incident response |
| `docs/TRANSLATION.md` | DeepL hooks, locale system |
| `docs/DEVELOPMENT.md` | Dev workflow, troubleshooting |
| `docs/WORKSHOP_SETUP_GUIDE.md` | How to create and manage workshop types |
| `docs/BOOKING_SYSTEM_FOR_FOUNDERS.md` | Non-technical guide for David & Marcel |
| `docs/CLIENT_BREVO_OPERATIONS.md` | Brevo email management for founders |
| `CLAUDE.md` | Claude Code context — all project rules in one place |

---

## Contacts

| Role | Person |
|---|---|
| Developer | Rafaela |
| Developer | Ala'a |
| Founder / content | David |
| Founder / content | Marcel |
