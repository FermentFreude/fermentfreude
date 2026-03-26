'use client'

import { FieldTable, HubSection, HubShell, InfoCard, StepList, type TocSection, useT } from '../HubShell'

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border p-4 text-sm leading-relaxed" style={{ background: '#1a1a1a', color: '#e0ddd4', borderColor: '#333' }}>
      <code>{children}</code>
    </pre>
  )
}

export default function DevHubPage() {
  const t = useT()

  const sections: TocSection[] = [
    { id: 'architecture', title: t('Architektur & Stack', 'Architecture & Stack') },
    { id: 'project-structure', title: t('Projektstruktur', 'Project Structure') },
    { id: 'environments', title: t('Umgebungen', 'Environments') },
    { id: 'commands', title: t('Befehle', 'Commands') },
    { id: 'collections', title: t('Collections & Schema', 'Collections & Schema') },
    { id: 'blocks', title: t('Block-System', 'Blocks System') },
    { id: 'hero-system', title: t('Hero-System', 'Hero System') },
    { id: 'globals', title: t('Globale Einstellungen', 'Globals') },
    { id: 'routing', title: t('Frontend-Routing', 'Frontend Routing') },
    { id: 'localization', title: t('Lokalisierung (i18n)', 'Localization (i18n)') },
    { id: 'seeding', title: t('Seed-Scripts', 'Seed Scripts') },
    { id: 'ecommerce', title: t('E-Commerce & Stripe', 'E-commerce & Stripe') },
    { id: 'media-system', title: t('Medien & Bilder', 'Media & Images') },
    { id: 'access-control', title: t('Zugriffskontrolle', 'Access Control') },
    { id: 'design-system', title: t('Design-System', 'Design System') },
    { id: 'hooks', title: t('Hooks & Lebenszyklus', 'Hooks & Lifecycle') },
    { id: 'adding-block', title: t('Neuen Block hinzufügen', 'Adding a New Block') },
    { id: 'rules', title: t('12 unverhandelbare Regeln', '12 Non-Negotiable Rules') },
  ]

  return (
    <HubShell
      title={t('Developer Hub', 'Developer Hub')}
      subtitle={t('Technische Dokumentation', 'Technical Documentation')}
      accentColor="#1a1a1a"
      sections={sections}
    >
      {/* ── ARCHITECTURE ── */}
      <HubSection id="architecture" title={t('Architektur & Stack', 'Architecture & Stack')}>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Schicht', 'Layer')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Technologie', 'Technology')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Hinweise', 'Notes')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['Framework', 'Next.js 15 (App Router)', 'src/app/(app)/ = Frontend, src/app/(payload)/ = Admin'],
                ['CMS', 'Payload CMS 3.x', 'Collections, Globals, Blocks, Hooks'],
                [t('Datenbank', 'Database'), 'MongoDB Atlas M0', t('Keine Transaktionen — nur sequenzielle Schreibvorgänge', 'No transactions — sequential writes only')],
                [t('Dateispeicher', 'File Storage'), 'Cloudflare R2', t('S3-kompatibel via @payloadcms/storage-s3', 'S3-compatible via @payloadcms/storage-s3')],
                [t('Zahlungen', 'Payments'), 'Stripe', '@payloadcms/plugin-ecommerce'],
                ['Styling', 'TailwindCSS 4 + shadcn/ui', t('Design-Tokens in CSS Custom Properties', 'Design tokens in CSS custom properties')],
                [t('Schriften', 'Fonts'), 'Neue Haas Grotesk (Typekit)', 'font-sans = body, font-display = headings'],
                [t('Sprachen', 'Locales'), 'de (default) + en', t('Alle Textfelder: localized: true', 'All text fields: localized: true')],
                ['E-Mail', 'Brevo', t('Transaktions-E-Mails + Newsletter-Sync', 'Transactional emails + newsletter sync')],
                ['Package Manager', 'pnpm', ''],
              ].map(([layer, tech, notes], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>{layer}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{tech}</td>
                  <td className="px-4 py-2.5">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Infrastruktur-Diagramm', 'Infrastructure Diagram')}</h3>
        <Code>{`┌─────────────────────────────────────────────┐
│  MongoDB Atlas M0 (fermentfreude / staging) │
│  • Pages, Products, Workshops, Users        │
│  • No transactions — sequential writes only │
└─────────────────────────────────────────────┘
            ↕ Payload CMS reads/writes
┌─────────────────────────────────────────────┐
│  Cloudflare R2 (S3-compatible)              │
│  • Image files (WebP-optimized)             │
│  • CDN-served globally, zero egress fees    │
└─────────────────────────────────────────────┘
            ↕ Stripe webhook callbacks
┌─────────────────────────────────────────────┐
│  Stripe (Payments)                          │
│  • Product pricing (cents), Austrian VAT    │
│  • Checkout hosted by Vercel                │
└─────────────────────────────────────────────┘
            ↕ Email delivery
┌─────────────────────────────────────────────┐
│  Brevo (Email/SMS)                          │
│  • Transactional: bookings, orders          │
│  • Newsletter marketing + user sync         │
└─────────────────────────────────────────────┘`}</Code>
      </HubSection>

      {/* ── PROJECT STRUCTURE ── */}
      <HubSection id="project-structure" title={t('Projektstruktur', 'Project Structure')}>
        <Code>{`src/
├── app/(app)/              # Frontend routes (dynamic [slug]/page.tsx)
├── app/(payload)/          # Payload admin (auto-generated)
├── access/                 # Permission rules (adminOnly, publicAccess, etc.)
├── blocks/                 # Content blocks (one block = one section)
│   └── RenderBlocks.tsx    # Maps block slugs → React components
├── collections/            # Payload collections
│   ├── Categories.ts
│   ├── Media.ts
│   ├── Pages/index.ts
│   ├── Products/index.ts
│   ├── Posts/index.ts
│   ├── Users/index.ts
│   ├── Workshops.ts
│   ├── WorkshopAppointments.ts
│   ├── WorkshopBookings.ts
│   ├── WorkshopLocations.ts
│   ├── Vouchers.ts
│   ├── OnlineCourses.ts
│   ├── Enrollments.ts
│   └── CourseProgress.ts
├── components/             # React components
├── fields/                 # Reusable field definitions (hero.ts, link.ts)
├── globals/                # Header.ts, Footer.ts, Testimonials.ts, etc.
├── heros/                  # Hero components + config
├── hooks/                  # Lifecycle hooks (autoTranslate, revalidate)
├── lib/                    # Utils (generate-meta, cn())
├── plugins/                # Plugin config (ecommerce, seo, storage-s3)
├── providers/              # Context providers (Auth, Theme, Locale)
├── scripts/                # Seed scripts (one per page)
├── utilities/              # Helper functions
├── payload-types.ts        # Auto-generated types (never edit)
└── payload.config.ts       # Main Payload config`}</Code>
      </HubSection>

      {/* ── ENVIRONMENTS ── */}
      <HubSection id="environments" title={t('Umgebungen', 'Environments')}>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Env</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Database</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>R2 Bucket</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Branch</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              <tr className="border-t" style={{ borderColor: '#E8E4D9' }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>Production</td>
                <td className="px-4 py-2.5 font-mono text-xs">fermentfreude</td>
                <td className="px-4 py-2.5 font-mono text-xs">fermentfreude-media</td>
                <td className="px-4 py-2.5 font-mono text-xs">main</td>
              </tr>
              <tr className="border-t" style={{ borderColor: '#E8E4D9' }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>Staging</td>
                <td className="px-4 py-2.5 font-mono text-xs">fermentfreude-staging</td>
                <td className="px-4 py-2.5 font-mono text-xs">fermentfreude-media-staging</td>
                <td className="px-4 py-2.5 font-mono text-xs">staging</td>
              </tr>
              <tr className="border-t" style={{ borderColor: '#E8E4D9' }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>Local Dev</td>
                <td className="px-4 py-2.5 font-mono text-xs">fermentfreude-staging</td>
                <td className="px-4 py-2.5 font-mono text-xs">fermentfreude-media-staging</td>
                <td className="px-4 py-2.5 font-mono text-xs">feature/*</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Branch-Strategie', 'Branch Strategy')}</h3>
        <Code>{`feature/* → PR into staging → test → merge staging → main

# Never push directly to main
# Local .env always points to staging
# Never develop against production database`}</Code>

        <InfoCard variant="important" title={t('NEXT_PUBLIC_* Variablen', 'NEXT_PUBLIC_* Variables')}>
          <p><code>NEXT_PUBLIC_*</code> {t('Umgebungsvariablen werden beim Build eingebrannt. Änderungen in Vercel erfordern ein vollständiges Redeploy ohne Cache.', 'env vars are baked in at build time. Changing them in Vercel requires a full redeploy without cache.')}</p>
        </InfoCard>
      </HubSection>

      {/* ── COMMANDS ── */}
      <HubSection id="commands" title={t('Befehle', 'Commands')}>
        <Code>{`# Development
pnpm dev                    # Dev server (localhost:3000)
pnpm build                  # Production build
pnpm start                  # Production server

# CMS & Types
pnpm generate:types         # Regenerate Payload types (after schema changes)
pnpm generate:importmap     # Regenerate import map (after component changes)
npx tsc --noEmit            # Type-check (must pass with zero errors)

# Seeding
pnpm seed                   # Seed ALL pages (non-destructive)
pnpm seed home              # Seed one page
pnpm seed home --force      # Force overwrite existing content

# Linting & Testing
pnpm lint                   # ESLint
pnpm lint:fix               # Auto-fix lint issues
pnpm test:int               # Integration tests (vitest)
pnpm test:e2e               # E2E tests (Playwright)
pnpm stripe-webhooks        # Forward Stripe webhooks locally`}</Code>

        <InfoCard variant="important" title={t('Nach jeder Code-Änderung', 'After Every Code Change')}>
          <Code>{`pnpm generate:types         # Always
pnpm generate:importmap     # Only if components changed
npx tsc --noEmit            # Must pass with zero errors`}</Code>
        </InfoCard>
      </HubSection>

      {/* ── COLLECTIONS ── */}
      <HubSection id="collections" title={t('Collections & Schema', 'Collections & Schema')}>
        <p>{t('Alle Collections werden in src/collections/ definiert. Wichtigste Collections:', 'All collections are defined in src/collections/. Key collections:')}</p>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Produkte', 'Products')}</h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          {t('Pfad:', 'Path:')} <code>src/collections/Products/index.ts</code> — {t('E-Commerce-Katalog mit Varianten, Preisgestaltung, Multi-Typ-Unterstützung.', 'E-commerce catalog with variants, pricing, multi-type support.')}
        </p>
        <FieldTable
          fields={[
            { name: 'title', description: 'Product name (localized)', required: true },
            { name: 'slug', description: 'URL path (auto-generated)' },
            { name: 'productType', description: 'jarred | fresh | bottled | workshop | digital-course', required: true },
            { name: 'shortDescription', description: 'Brief teaser (textarea, localized)' },
            { name: 'brand', description: 'Brand name (localized)' },
            { name: 'flavour', description: 'Flavor text (localized)' },
            { name: 'description', description: 'Full richText description (localized)' },
            { name: 'gallery', description: 'Array of upload images with optional variant option' },
            { name: 'benefits', description: 'Array of feature badges (localized text)' },
            { name: 'badges', description: 'Select: vegan, organic, gluten-free, probiotic, etc.' },
            { name: 'priceInEUR', description: 'Price in CENTS (ecommerce plugin). 9900 = €99.00', required: true },
            { name: 'inventory', description: 'Stock count. 0 = sold out' },
            { name: 'enableVariants', description: 'Toggle variant system' },
            { name: 'categories', description: 'Relationship to categories' },
            { name: 'relatedProducts', description: 'Cross-sell relationship to products' },
          ]}
        />
        <InfoCard variant="tip" title={t('Bedingte Felder', 'Conditional Fields')}>
          <p>{t('Felder werden abhängig vom productType angezeigt: Lebensmittelfelder (Zutaten, Allergene, Lagerung) nur für jarred/fresh/bottled. Kursfelder (courseSlug) nur für digital-course.', 'Fields are conditionally shown based on productType: food fields (ingredients, allergens, storage) only appear for jarred/fresh/bottled. Course fields (courseSlug) only for digital-course.')}</p>
        </InfoCard>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Seiten', 'Pages')}</h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          {t('Pfad:', 'Path:')} <code>src/collections/Pages/index.ts</code> — {t('CMS-gesteuerte Seiten mit Hero + Block-System.', 'CMS-driven pages with hero + blocks system.')}
        </p>
        <FieldTable
          fields={[
            { name: 'title', description: 'Page title (localized)', required: true },
            { name: 'slug', description: 'URL path (unique). Special: home, shop, gastronomy, fermentation', required: true },
            { name: 'hero (tab)', description: 'Hero section — type selects component (heroSlider, heroCarousel, etc.)' },
            { name: 'layout (tab)', description: 'Dynamic blocks array — editors compose pages from blocks' },
            { name: 'meta', description: 'SEO title, description, image' },
            { name: 'publishedOn', description: 'Publication date' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>Workshops</h3>
        <FieldTable
          fields={[
            { name: 'slug', description: 'Unique identifier (basics, lakto, kombucha, tempeh)', required: true },
            { name: 'title', description: 'Workshop name (localized)', required: true },
            { name: 'description', description: 'Rich-text description (localized)' },
            { name: 'basePrice', description: 'Price per person in EUR (not cents!)', required: true },
            { name: 'maxCapacityPerSlot', description: 'Fixed at 12 per session' },
            { name: 'image', description: 'Hero image upload' },
            { name: 'isActive', description: 'Visibility toggle' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>Workshop Appointments</h3>
        <FieldTable
          fields={[
            { name: 'workshop', description: 'Relationship to workshops', required: true },
            { name: 'location', description: 'Relationship to workshop-locations', required: true },
            { name: 'dateTime', description: 'Session start (must be future)', required: true },
            { name: 'availableSpots', description: '0–12. 0 = sold out' },
            { name: 'isPublished', description: 'Visibility toggle' },
            { name: 'notes', description: 'Internal notes (not customer-visible)' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Weitere Collections', 'Other Collections')}</h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Collection</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Datei', 'File')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Zweck', 'Purpose')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['Categories', 'Categories.ts', t('Produktkategorisierung (Titel + Slug)', 'Product categorization (title + slug)')],
                ['Media', 'Media.ts', t('Zentralisierte Uploads → R2 (alt, caption, WebP Auto-Konvertierung)', 'Centralized uploads → R2 (alt, caption, WebP auto-convert)')],
                ['Users', 'Users/index.ts', t('Auth, Rollen (Admin/Kunde), Brevo-Sync', 'Auth, roles (admin/customer), Brevo sync')],
                ['Posts', 'Posts/index.ts', t('How-to-Artikel (Workshop-typisiert, /tipps/[slug])', 'How-to articles (workshop-typed, /tipps/[slug])')],
                ['WorkshopBookings', 'WorkshopBookings.ts', t('Kundenreservierungen (automatisch beim Checkout erstellt)', 'Customer reservations (auto-created at checkout)')],
                ['WorkshopLocations', 'WorkshopLocations.ts', t('Workshop-Veranstaltungsorte (Name, Adresse, Zeitzone)', 'Workshop venues (name, address, timezone)')],
                ['Vouchers', 'Vouchers.ts', t('Geschenkgutscheine (Auto-generierter Code, Einlöse-Tracking)', 'Gift vouchers (auto-generated code, redemption tracking)')],
                ['OnlineCourses', 'OnlineCourses.ts', t('Digitale Kurse (Module, Lektionen, Video)', 'Digital courses (modules, lessons, video)')],
                ['Enrollments', 'Enrollments.ts', t('Benutzer-Einschreibungen (automatisch bei Stripe-Zahlung)', 'User enrollments (auto on Stripe payment)')],
                ['CourseProgress', 'CourseProgress.ts', t('Fortschrittsverfolgung pro Benutzer', 'Lesson completion tracking per user')],
              ].map(([name, file, purpose], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>{name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{file}</td>
                  <td className="px-4 py-2.5">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HubSection>

      {/* ── BLOCKS ── */}
      <HubSection id="blocks" title={t('Block-System', 'Blocks System')}>
        <p>
          {t('Content-Blöcke befinden sich in', 'Content blocks live in')} <code>src/blocks/</code>. {t('Jeder Block ist ein eigenständiger Abschnitt mit eigener Config (Schema) und Komponente (React). Redakteure erstellen Seiten, indem sie Blöcke im Admin hinzufügen/umsortieren.', 'Each block is a self-contained section with its own config (schema) and component (React). Editors compose pages by adding/reordering blocks in the admin.')}
        </p>
        <p className="text-sm" style={{ color: '#626160' }}>
          {t('Block-Registrierung:', 'Block registration:')} <code>src/collections/Pages/index.ts</code> (layout.blocks array) + <code>src/blocks/RenderBlocks.tsx</code> ({t('Slug → Komponenten-Map', 'slug → component map')}).
        </p>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Verfügbare Blöcke (28)', 'Available Blocks (28)')}</h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Slug</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Zweck', 'Purpose')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['contactBlock', 'Contact form + info section'],
                ['archive', 'Content archive/grid'],
                ['banner', 'Alert/info banner (info, warning, error, success)'],
                ['carousel', 'Image/content carousel'],
                ['content', 'Multi-column rich text (1/3, 1/2, 2/3, full)'],
                ['cta', 'Call-to-action with heading + buttons'],
                ['featureCards', 'Feature showcase with icon cards'],
                ['formBlock', 'Custom form builder'],
                ['heroBanner', 'Hero section variant'],
                ['mediaBlock', 'Single image/video with caption'],
                ['ourStory', 'Brand story with timeline'],
                ['productSlider', 'Product carousel'],
                ['readyToLearnCta', '"Ready to Learn?" CTA'],
                ['shopHero', 'Shop page hero with slides'],
                ['shopProductGrid', 'Product grid with filter/sort'],
                ['shopProductList', 'Product list view'],
                ['collectionGrid', 'Generic item grid'],
                ['testimonials', 'Customer testimonial slider'],
                ['threeItemGrid', '3-item grid layout'],
                ['onlineCourseSlider', 'Course carousel'],
                ['workshopSlider', 'Workshop carousel with dates'],
                ['workshopPhases', 'Workshop phases/timeline'],
                ['featuredProductCards', 'Featured product highlight cards'],
                ['laktoVoucherCta', 'Lakto-specific voucher CTA'],
                ['teamCards', 'Team member cards'],
                ['teamPreview', 'Team preview grid'],
                ['voucherCta', 'Voucher call-to-action'],
                ['sponsorsBar', 'Sponsor logo bar'],
              ].map(([slug, purpose], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#555954' }}>{slug}</td>
                  <td className="px-4 py-2.5">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HubSection>

      {/* ── HERO SYSTEM ── */}
      <HubSection id="hero-system" title={t('Hero-System', 'Hero System')}>
        <p>
          {t('Heroes werden in', 'Heroes are defined in')} <code>src/fields/hero.ts</code> {t('definiert und Komponenten in', 'and components in')} <code>src/heros/</code>.
          <code>RenderHero.tsx</code> {t('routet hero.type zur korrekten Komponente.', 'routes hero.type to the correct component.')}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Hero-Typen', 'Hero Types')}</h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Type</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Komponente', 'Component')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Verwendung', 'Usage')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['heroSlider', 'HeroSlider/', t('Startseite — 4 feste Slides (basics, lakto, kombucha, tempeh)', 'Home page — 4 fixed slides (basics, lakto, kombucha, tempeh)')],
                ['heroCarousel', 'HeroCarousel/', t('Multi-Slide Bild-Karussell', 'Multi-slide image carousel')],
                ['heroGrid', 'HeroGrid/', t('Raster-basiertes Hero-Layout', 'Grid-based hero layout')],
                ['heroSplit', 'HeroSplit/', t('Geteiltes Bild/Text Layout', 'Split image/text layout')],
                ['foodPresentationSlider', 'FoodPresentationSlider/', t('Lebensmittel-Präsentation', 'Food product showcase')],
                ['highImpact', 'HighImpact/', t('Große Aussage mit Titel/Untertitel', 'Large statement with title/subtitle')],
              ].map(([type, comp, usage], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#555954' }}>{type}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{comp}</td>
                  <td className="px-4 py-2.5">{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Home Hero-Slider', 'Home Hero Slider')}</h3>
        <p className="text-sm" style={{ color: '#626160' }}>{t('4 Slides in fester Reihenfolge, definiert in', '4 slides in fixed order, defined in')} <code>src/heros/HeroSlider/slide-data.ts</code>:</p>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>#</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>slideId</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>panelColor</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>bgColor</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Link</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['1', 'basics', '#000000', '#AEB1AE', '/workshops/basics'],
                ['2', 'lakto', '#555954', '#D2DFD7', '/workshops/lakto'],
                ['3', 'kombucha', '#555954', '#F6F0E8', '/workshops/kombucha'],
                ['4', 'tempeh', '#737672', '#F6F3F0', '/workshops/tempeh'],
              ].map(([n, id, panel, bg, link], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5">{n}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{id}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full border" style={{ background: panel, borderColor: '#ccc' }} />
                      <code className="text-xs">{panel}</code>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full border" style={{ background: bg, borderColor: '#ccc' }} />
                      <code className="text-xs">{bg}</code>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{link}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm" style={{ color: '#626160' }}>
          {t('Wichtige Dateien:', 'Key files:')} Schema (<code>src/fields/hero.ts</code>), Defaults (<code>src/heros/HeroSlider/slide-data.ts</code>),
          {t('Komponente', 'Component')} (<code>src/heros/HeroSlider/index.tsx</code>), Seed Builder (<code>src/heros/HeroSlider/seed.ts</code>).
        </p>
      </HubSection>

      {/* ── GLOBALS ── */}
      <HubSection id="globals" title={t('Globale Einstellungen', 'Globals')}>
        <p>{t('Globals sind seitenweite Einstellungen, definiert in', 'Globals are site-wide settings defined in')} <code>src/globals/</code>.</p>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Global</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Zweck', 'Purpose')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Wichtige Felder', 'Key Fields')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['Header', t('Obere Navigation', 'Top navigation'), 'announcementBar (enabled, text, link), navItems (label, type, ref/url, dropdownItems)'],
                ['Footer', t('Footer-Inhalte', 'Footer content'), 'navItems (max 8), workshopLinks (max 6), location, phone, newsletter, socialMedia'],
                ['Testimonials', t('Kundenbewertungen', 'Customer reviews'), 'eyebrow, heading, testimonials[] (quote, authorName, authorRole, rating 1–5)'],
                ['ProductSlider', t('Produkt-Karussell', 'Product carousel config'), t('Ausgewählte Produkte, Überschrift', 'Featured products selection, heading')],
                ['WorkshopSlider', t('Workshop-Karussell', 'Workshop carousel'), t('Workshop-Auswahl, kommende Termine, CTA', 'Workshop selection, upcoming dates, CTA')],
                ['VoucherCta', t('Gutschein-Promo', 'Voucher promo section'), t('Überschrift, Beschreibung, Bild, CTA-Button', 'Heading, description, image, CTA button')],
                ['SponsorsBar', t('Sponsor-Logos', 'Sponsor logos'), t('Logo-Array', 'Logo array')],
                ['WorkshopCards', t('Workshop-Karten-Vorlagen', 'Workshop card templates'), t('Karten-Layout-Konfiguration', 'Card layout configuration')],
              ].map(([name, purpose, fields], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>{name}</td>
                  <td className="px-4 py-2.5">{purpose}</td>
                  <td className="px-4 py-2.5 text-xs">{fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HubSection>

      {/* ── ROUTING ── */}
      <HubSection id="routing" title={t('Frontend-Routing', 'Frontend Routing')}>
        <Code>{`src/app/(app)/
├── page.tsx                    # / (home, slug=home)
├── [slug]/page.tsx             # Dynamic CMS pages
├── shop/page.tsx               # /shop
├── products/[slug]/page.tsx    # /products/[slug]
├── workshops/
│   ├── page.tsx                # /workshops
│   └── [slug]/page.tsx         # /workshops/[slug]
├── courses/
│   ├── page.tsx                # /courses
│   └── [slug]/page.tsx         # /courses/[slug]
├── tipps/[slug]/page.tsx       # /tipps/[slug] (articles)
├── account/                    # User dashboard
│   ├── page.tsx, profile/, orders/, addresses/, learning/
├── checkout/page.tsx           # Stripe checkout
├── login/ create-account/ logout/
├── forgot-password/ recover-password/
├── fermentation/ gastronomy/   # Special pages
├── agb/ datenschutz/ impressum/# Legal
└── hub/                        # This documentation`}</Code>

        <InfoCard variant="default" title={t('Dynamische [slug] Seite', 'Dynamic [slug] Page')}>
          <p>{t('Die [slug]/page.tsx rendert jede Seite aus der Pages Collection. Sie holt die Seite per Slug, rendert Hero + Blöcke. Seiten mit eigenen Routen (home, gastronomy, workshops/*, etc.) sind von der dynamischen Route ausgeschlossen.', 'The [slug]/page.tsx renders any page from the Pages collection. It fetches the page by slug, renders hero + blocks. Pages with dedicated routes (home, gastronomy, workshops/*, etc.) are excluded from the dynamic route.')}</p>
        </InfoCard>
      </HubSection>

      {/* ── LOCALIZATION ── */}
      <HubSection id="localization" title={t('Lokalisierung (i18n)', 'Localization (i18n)')}>
        <p>{t('Zwei-Schichten-System: Payload CMS (serverseitige Speicherung) + Client-seitig (Locale-Umschalter).', 'Two-layer system: Payload CMS (server-side storage) + Client-side (locale toggle).')}</p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Locale abrufen', 'Getting Locale')}</h3>
        <Code>{`// Server Component
import { getLocale } from '@/utilities/getLocale'
const locale = await getLocale()

// Client Component
'use client'
import { useLocale } from '@/providers/Locale'
const { locale, setLocale } = useLocale()`}</Code>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Regeln', 'Rules')}</h3>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li>{t('Standard-Locale:', 'Default locale:')} <code>de</code> ({t('Deutsch', 'German')})</li>
          <li>{t('Alle Textfelder müssen', 'All text fields must be')} <code>localized: true</code> {t('sein', '')}</li>
          <li>{t('Locale gespeichert im Cookie:', 'Locale stored in cookie:')} <code>fermentfreude-locale</code></li>
          <li>{t('DeepL übersetzt automatisch DE → EN beim Speichern (nur Produktion)', 'DeepL auto-translates DE → EN on save (production only)')}</li>
          <li>{t('Manuelle EN-Bearbeitungen werden nie von DeepL überschrieben', 'Manual EN edits are never overwritten by DeepL')}</li>
          <li>{t('Seed-Scripts verwenden', 'Seed scripts use')} <code>context: &#123; skipAutoTranslate: true &#125;</code></li>
        </ul>
      </HubSection>

      {/* ── SEEDING ── */}
      <HubSection id="seeding" title={t('Seed-Scripts', 'Seed Scripts')}>
        <p>{t('Ein Script pro Seite/Entität in', 'One script per page/entity in')} <code>src/scripts/</code>, {t('registriert in', 'registered in')} <code>seed-all.ts</code>.</p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Verfügbare Seeds', 'Available Seeds')}</h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Ziel', 'Target')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Script</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['header', 'seed-header.ts'],
                ['products', 'seed-products.ts'],
                ['workshop-products', 'seed-workshop-products.ts'],
                ['home', 'seed-home.ts'],
                ['about', 'seed-about.ts'],
                ['contact', 'seed-contact.ts'],
                ['workshops', 'seed-workshops.ts'],
                ['gastronomy', 'seed-gastronomy.ts'],
                ['fermentation', 'seed-fermentation.ts'],
                ['shop', 'seed-shop-new.ts'],
                ['workshop-pages', 'seed-workshop-pages.ts'],
                ['workshop-collections', 'seed-workshop-collections.ts'],
                ['posts', 'seed-posts.ts'],
                ['online-courses', 'seed-online-courses.ts'],
                ['courses-page', 'seed-courses-page.ts'],
                ['voucher', 'seed-voucher.ts'],
              ].map(([target, script], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#555954' }}>{target}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{script}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Zweisprachiges Seeding-Pattern', 'Bilingual Seeding Pattern')}</h3>
        <Code>{`const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

// 1. Save DE first (generates IDs for arrays/blocks)
const saved = await payload.update({
  collection: 'pages', id: pageId, locale: 'de',
  data: { hero: deHero, layout: deBlocks },
  context: ctx,
})

// 2. Read back to capture generated IDs
const doc = await payload.findByID({
  collection: 'pages', id: pageId, locale: 'de', depth: 0
})

// 3. Build EN data reusing those exact IDs
const enHero = mergeHeroSliderEN(doc.hero, enHeroData)

// 4. Save EN with same IDs
await payload.update({
  collection: 'pages', id: pageId, locale: 'en',
  data: { hero: enHero, layout: enBlocks },
  context: ctx,
})`}</Code>

        <InfoCard variant="important" title={t('Kritisch: Kein Promise.all für Schreibvorgänge', 'Critical: No Promise.all for writes')}>
          <p>{t('MongoDB Atlas M0 hat keine Transaktionen. Immer sequenzielle Schreibvorgänge verwenden. Niemals Promise.all für Mutationen.', 'MongoDB Atlas M0 has no transactions. Always use sequential writes. Never Promise.all for mutations.')}</p>
        </InfoCard>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Bildoptimierung in Seeds', 'Image Optimization in Seeds')}</h3>
        <Code>{`import { optimizedFile, IMAGE_PRESETS } from '@/scripts/seed-image-utils'

const heroFile = await optimizedFile(path, IMAGE_PRESETS.hero)   // 1920px
const cardFile = await optimizedFile(path, IMAGE_PRESETS.card)   // 1200px
const logoFile = await optimizedFile(path, IMAGE_PRESETS.logo)   // 600px`}</Code>
      </HubSection>

      {/* ── ECOMMERCE ── */}
      <HubSection id="ecommerce" title={t('E-Commerce & Stripe', 'E-commerce & Stripe')}>
        <h3 className="font-display text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Preisgestaltung — KRITISCH', 'Pricing — CRITICAL')}</h3>
        <InfoCard variant="important" title={t('Alle Preise werden in CENT gespeichert', 'All prices are stored in CENTS')}>
          <p>{t('Datenbank speichert Cent (Ganzzahlen), nicht Euro. Admin-Eingabe in Cent. Anzeige konvertiert automatisch in Euro.', 'Database stores cents (integers), not euros. Admin input is in cents. Display auto-converts to euros.')}</p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>{t('9900 in DB = 99,00 € angezeigt', '9900 in DB = €99.00 displayed')}</li>
            <li>{t('990 in DB = 9,90 € angezeigt', '990 in DB = €9.90 displayed')}</li>
          </ul>
          <p className="mt-2">{t('Konfiguriert in', 'Configured in')} <code>src/plugins/index.ts</code> {t('mit', 'with')} <code>decimals: 2</code>.</p>
        </InfoCard>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Checkout-Ablauf', 'Checkout Flow')}</h3>
        <StepList
          steps={[
            { title: t('In den Warenkorb', 'Add to Cart'), desc: t('Produkte/Workshops werden in den Warenkorb gelegt (in DB gespeichert)', 'Products/workshops added to cart (persisted in DB)') },
            { title: t('Weiter zu /checkout', 'Navigate to /checkout'), desc: t('Stripe-Checkout-Session wird erstellt', 'Stripe hosted checkout session created') },
            { title: t('Bezahlung', 'Payment'), desc: t('Stripe verarbeitet die Zahlung (EUR, österreichische MwSt.)', 'Stripe processes payment (EUR, Austrian VAT)') },
            { title: t('Bestellung erstellt', 'Order Created'), desc: t('Webhook erstellt Bestellung. Für digitale Kurse: automatische Einschreibung.', 'Webhook creates order. For digital courses: auto-enrollment.') },
            { title: t('Bestätigung', 'Confirmation'), desc: t('E-Mail wird über Brevo gesendet. Workshop-Buchungen werden separat bestätigt.', 'Email sent via Brevo. Workshop bookings confirmed separately.') },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Umgebungsvariablen', 'Environment Variables')}</h3>
        <Code>{`STRIPE_SECRET_KEY                    # sk_test_ (dev) / sk_live_ (prod)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   # pk_test_ (dev) / pk_live_ (prod)
STRIPE_WEBHOOKS_SIGNING_SECRET       # whsec_`}</Code>
      </HubSection>

      {/* ── MEDIA SYSTEM ── */}
      <HubSection id="media-system" title={t('Medien & Bilder', 'Media & Images')}>
        <h3 className="font-display text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Bilder rendern', 'Rendering Images')}</h3>
        <Code>{`// Always use Media component
import { Media } from '@/components/Media'

<Media resource={product.gallery[0].image} priority />

// Type guard for image objects
typeof image === 'object' && image !== null && 'url' in image

// No image fallback
<div className="bg-[#ECE5DE]" />

// NEVER do this:
<img src="/assets/..." />  // ❌ Static paths forbidden`}</Code>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Upload-Automatik', 'Upload Auto-Processing')}</h3>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li>{t('Automatische Konvertierung zu WebP (Qualität 82%)', 'Auto-convert to WebP (quality 82%)')}</li>
          <li>{t('Maximale Originalgröße: 2560px Breite', 'Max original: 2560px width')}</li>
          <li>{t('Responsive Größen: Thumbnail (400px, q75), Card (800px, q80), Hero (1920×1080, q85)', 'Responsive sizes: thumbnail (400px, q75), card (800px, q80), hero (1920×1080, q85)')}</li>
          <li>{t('Fokuspunkt-Auswahl aktiviert', 'Focal point selection enabled')}</li>
          <li>{t('Unterstützt: PNG, JPEG, WebP, AVIF, SVG, GIF, MP4, WebM, OGG, MOV', 'Supported: PNG, JPEG, WebP, AVIF, SVG, GIF, MP4, WebM, OGG, MOV')}</li>
        </ul>
      </HubSection>

      {/* ── ACCESS CONTROL ── */}
      <HubSection id="access-control" title={t('Zugriffskontrolle', 'Access Control')}>
        <p>{t('Zugriffsfunktionen in', 'Access functions in')} <code>src/access/</code>:</p>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Funktion', 'Function')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Regel', 'Rule')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['isAdmin() / adminOnly()', t('Nur Benutzer mit Admin-Rolle', 'Only users with admin role')],
                ['adminOrPublishedStatus()', t('Admins ODER Dokumente mit Status „veröffentlicht“', 'Admins OR documents with published status')],
                ['adminOrSelf()', t('Admins ODER Benutzer, die auf ihren eigenen Datensatz zugreifen', 'Admins OR user accessing their own record')],
                ['publicAccess()', t('Jeder (keine Authentifizierung erforderlich)', 'Everyone (no auth required)')],
                ['checkRole(roles, user)', t('Prüft, ob der Benutzer eine der angegebenen Rollen hat', 'Check if user has any of the specified roles')],
              ].map(([fn, rule], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#555954' }}>{fn}</td>
                  <td className="px-4 py-2.5">{rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Code>{`// Field-level access example
{
  name: 'roles',
  type: 'select',
  access: {
    create: adminOnlyFieldAccess,
    read: adminOnlyFieldAccess,
    update: adminOnlyFieldAccess,
  },
}`}</Code>
      </HubSection>

      {/* ── DESIGN SYSTEM ── */}
      <HubSection id="design-system" title={t('Design-System', 'Design System')}>
        <h3 className="font-display text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Typografie', 'Typography')}</h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Anwendungsfall', 'Use Case')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>CSS</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Größe', 'Size')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                [t('Hero-Überschriften', 'Hero Headlines'), '.text-hero / h1', 'clamp(2.25rem, 5vw, 4rem)'],
                [t('Abschnitt H2', 'Section H2'), 'h2', 'clamp(1.75rem, 4vw, 3rem)'],
                [t('Unterabschnitt H3', 'Subsection H3'), '.text-subheading', 'clamp(1.375rem, 3vw, 2rem)'],
                [t('Einleitungsabsatz', 'Intro Paragraph'), '.text-body-lg', 'clamp(1rem, 1vw+0.25rem, 1.25rem)'],
                [t('Fließtext', 'Body'), '.text-body', '1rem'],
                [t('Klein', 'Small'), '.text-body-sm', '0.875rem'],
                [t('Bildunterschrift', 'Caption'), '.text-caption', '0.75rem'],
              ].map(([use, css, size], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5">{use}</td>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#555954' }}>{css}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Schriftarten', 'Fonts')}</h3>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><code>font-sans</code> — neue-haas-grotesk-text ({t('Fließtext, Gewicht 400', 'body text, 400 weight')})</li>
          <li><code>font-display</code> — neue-haas-grotesk-display ({t('Überschriften, Navigation, Buttons, Gewicht 700', 'headings, nav, buttons, 700 weight')})</li>
          <li><strong>{t('Niemals verwenden:', 'Never use:')}</strong> Geist, Inter, {t('oder System-Schriftarten', 'or system fonts')}</li>
        </ul>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>{t('Abstands-Tokens', 'Spacing Tokens')}</h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Token</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Value</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['section-padding-sm', 'clamp(3rem, 5vw, 4rem)'],
                ['section-padding-md', 'clamp(4rem, 7vw, 6rem)'],
                ['section-padding-lg', 'clamp(5rem, 9vw, 8rem)'],
                ['section-padding-xl', 'clamp(6rem, 11vw, 10rem)'],
                ['container-padding', 'clamp(1.5rem, 4vw, 6rem)'],
                ['content-narrow', '42rem (672px)'],
                ['content-medium', '56rem (896px)'],
                ['content-wide', '72rem (1152px)'],
                ['content-full', '86rem (1376px)'],
              ].map(([token, val], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#555954' }}>{token}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HubSection>

      {/* ── HOOKS ── */}
      <HubSection id="hooks" title={t('Hooks & Lebenszyklus', 'Hooks & Lifecycle')}>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Hook</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Auslöser', 'Trigger')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Zweck', 'Purpose')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['autoTranslateCollection', 'afterChange', t('DeepL DE→EN Auto-Übersetzung (nur Produktion)', 'DeepL DE→EN auto-translation (production only)')],
                ['autoTranslateGlobal', 'afterChange', t('Dasselbe für Globals', 'Same for globals')],
                ['revalidatePage', 'afterChange', t('ISR-Revalidierung bei Seitenänderung', 'ISR revalidation on page update')],
                ['revalidateProduct', 'afterChange', t('ISR-Revalidierung bei Produktänderung', 'ISR revalidation on product update')],
                ['populatePublishedOn', 'beforeChange', t('Setzt publishedOn-Datum bei erster Veröffentlichung', 'Set publishedOn date on first publish')],
                ['Brevo sync', 'afterChange (users)', t('Benutzer mit Brevo E-Mail-Marketing synchronisieren', 'Sync user to Brevo email marketing')],
                ['Booking confirmation', 'afterChange (bookings)', t('Bestätigungs-E-Mail über Brevo senden', 'Send confirmation email via Brevo')],
                ['Enrollment auto-create', 'afterChange (orders)', t('Einschreibung bei erfolgreicher Zahlung erstellen', 'Create enrollment on successful payment')],
              ].map(([hook, trigger, purpose], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#555954' }}>{hook}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{trigger}</td>
                  <td className="px-4 py-2.5">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HubSection>

      {/* ── ADDING A BLOCK ── */}
      <HubSection id="adding-block" title={t('Neuen Block hinzufügen', 'Adding a New Block')}>
        <StepList
          steps={[
            { title: t('Config erstellen', 'Create config'), desc: t('src/blocks/MyBlock/config.ts — Schema mit lokalisierten Feldern + admin.description', 'src/blocks/MyBlock/config.ts — schema with localized fields + admin.description') },
            { title: t('Komponente erstellen', 'Create component'), desc: t('src/blocks/MyBlock/Component.tsx — Englische Defaults, <Media resource={...} />', 'src/blocks/MyBlock/Component.tsx — English defaults, <Media resource={...} />') },
            { title: t('In Pages registrieren', 'Register in Pages'), desc: t('src/collections/Pages/index.ts — zum layout.blocks Array hinzufügen', 'src/collections/Pages/index.ts — add to layout.blocks array') },
            { title: t('In RenderBlocks registrieren', 'Register in RenderBlocks'), desc: t('src/blocks/RenderBlocks.tsx — zur blockComponents Map hinzufügen', 'src/blocks/RenderBlocks.tsx — add to blockComponents map') },
            { title: t('Typen generieren', 'Generate types'), desc: 'pnpm generate:types && pnpm generate:importmap' },
            { title: t('Seed hinzufügen (optional)', 'Add seed (optional)'), desc: t('Seed-Script erstellen (zweisprachig), in seed-all.ts registrieren', 'Create seed script (bilingual), register in seed-all.ts') },
            { title: t('Typ-Prüfung', 'Type check'), desc: t('npx tsc --noEmit — muss null Fehler ergeben', 'npx tsc --noEmit — must be zero errors') },
          ]}
        />
        <Code>{`// src/blocks/MyBlock/config.ts
import { Block } from 'payload'

export const MyBlock: Block = {
  slug: 'myBlock',
  interfaceName: 'MyBlockType',
  labels: { singular: 'My Block', plural: 'My Blocks' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
      label: 'Heading',
      admin: { description: 'Section heading (DE + EN)' },
    },
    // ... more fields
  ],
}`}</Code>
      </HubSection>

      {/* ── 12 RULES ── */}
      <HubSection id="rules" title={t('12 unverhandelbare Regeln', '12 Non-Negotiable Rules')}>
        <ol className="space-y-4">
          {[
            { rule: t('Jeder sichtbare Text = CMS-Feld', 'Every visible text = CMS field'), desc: t('Hardcodierte Defaults sind Fallbacks, nicht die Quelle der Wahrheit.', 'Hardcoded defaults are fallbacks, not the source of truth.') },
            { rule: t('Alle Textfelder: localized: true', 'All text fields: localized: true'), desc: t('Sowohl de als auch en, immer.', 'Both de and en, always.') },
            { rule: t('BEIDE Sprachen seeden', 'Seed BOTH languages'), desc: t('Jeder Seed: locale: "de" + locale: "en". Immer context: { skipAutoTranslate: true }.', 'Every seed: locale: "de" + locale: "en". Always context: { skipAutoTranslate: true }.') },
            { rule: t('Zweisprachiges Seeding — IDs wiederverwenden', 'Bilingual seeding — reuse IDs'), desc: t('Zuerst DE speichern → IDs auslesen → EN mit gleichen IDs speichern. Nur sequenzielle Schreibvorgänge.', 'Save DE first → read back IDs → save EN with same IDs. Sequential writes only.') },
            { rule: t('Hardcodierte Defaults auf Englisch', 'Hardcoded defaults in English'), desc: 'const resolved = cmsValue ?? DEFAULT_VALUE' },
            { rule: t('Admin = nicht-coder-freundlich', 'Admin = non-coder friendly'), desc: t('Redakteure steuern alles über /admin. admin.description, admin.condition, klare Labels verwenden.', 'Editors control everything from /admin. Use admin.description, admin.condition, clear labels.') },
            { rule: t('Bilder → Payload Media → R2', 'Images → Payload Media → R2'), desc: t('<Media resource={...} /> verwenden. Kein Bild → <div className="bg-[#ECE5DE]" />. Niemals statische /assets/-Pfade.', 'Use <Media resource={...} />. No image → <div className="bg-[#ECE5DE]" />. Never static /assets/ paths.') },
            { rule: t('Bilder vor dem Upload optimieren', 'Optimize images before upload'), desc: t('optimizedFile() aus seed-image-utils.ts verwenden. Presets: hero (1920px), card (1200px), logo (600px).', 'Use optimizedFile() from seed-image-utils.ts. Presets: hero (1920px), card (1200px), logo (600px).') },
            { rule: t('Ein Block = ein Abschnitt', 'One block = one section'), desc: t('Niemals mehrere Abschnitte bündeln. Redakteure erstellen Seiten aus Blöcken.', 'Never bundle multiple sections. Editors compose pages from blocks.') },
            { rule: t('Nach jeder Schema-Änderung', 'After every schema change'), desc: 'pnpm generate:types → pnpm generate:importmap → npx tsc --noEmit → re-run seed.' },
            { rule: t('Seed-Scripts: eins pro Seite', 'Seed scripts: one per page'), desc: t('Registriert in seed-all.ts. Standardmäßig nicht-destruktiv. --force zum Überschreiben.', 'Registered in seed-all.ts. Non-destructive by default. --force to overwrite.') },
            { rule: t('Keine seitenspezifischen Route-Dateien', 'No per-page route files'), desc: t('Dynamische [slug]/page.tsx rendert alle CMS-Seiten. Nur dedizierte Routen für Nicht-CMS-Seiten.', 'Dynamic [slug]/page.tsx renders all CMS pages. Only dedicated routes for non-CMS pages.') },
          ].map((item, i) => (
            <li key={i} className="flex gap-4">
              <span
                className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: '#1a1a1a' }}
              >
                {i + 1}
              </span>
              <div>
                <p className="font-display text-sm font-semibold" style={{ color: '#1a1a1a' }}>
                  {item.rule}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed" style={{ color: '#626160' }}>
                  {item.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </HubSection>
    </HubShell>
  )
}
