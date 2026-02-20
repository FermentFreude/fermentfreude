# Payload CMS Development Rules — FermentFreude

> **Inherits from:** `docs/##INSTRUCTIONS.md` (project rules). This file covers Payload CMS patterns, security, hooks, queries, and component development specific to this project.

---

## Typography & Fonts

This project uses **Neue Haas Grotesk** via Adobe Fonts (Typekit), loaded in `src/app/(app)/layout.tsx`:

```html
<link rel="stylesheet" href="https://use.typekit.net/dtk7kir.css" />
```

| Tailwind class | Font name | Usage |
|---------------|-----------|-------|
| `font-sans` | `neue-haas-grotesk-text` | Body text, paragraphs, labels |
| `font-display` | `neue-haas-grotesk-display` | Headings, nav links, buttons |

### Rules

1. **Never use Geist, Inter, or system fonts** — always Neue Haas Grotesk.
2. **Nav links & headings**: `font-display font-bold`.
3. **Body text**: `font-sans` (default on `<body>`).
4. **All headings** (h1–h6) use `neue-haas-grotesk-display` weight 700 via `@layer base` in globals.css.
5. Typography tokens are defined in `docs/DESIGN_SYSTEM.md` — use those, never raw Tailwind text sizes for headings.

---

## Core Principles

1. **TypeScript-First**: Always use TypeScript with proper types from Payload.
2. **Security-Critical**: Follow all access control patterns (see Security section below).
3. **Type Generation**: Run `pnpm generate:types` after schema changes.
4. **Transaction Safety**: Always pass `req` to nested operations in hooks.
5. **Access Control**: Local API bypasses access control by default — use `overrideAccess: false` when passing `user`.
6. **Sequential Writes**: MongoDB Atlas M0 has no transaction support — never `Promise.all` for DB mutations.

### Code Validation

```bash
pnpm generate:types        # After schema changes
pnpm generate:importmap    # After component changes
npx tsc --noEmit           # Verify zero errors
```

---

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Frontend routes
│   └── (payload)/          # Payload admin routes (auto-generated)
├── access/                 # Permission rules (admins, adminsOrPublished, etc.)
├── blocks/                 # Content blocks (one block = one section)
├── collections/            # Collection configs (Categories, Media, Pages, Products/, Users/)
├── components/             # React components (UI, admin, checkout, forms, etc.)
├── endpoints/              # Custom API endpoints
├── fields/                 # Reusable field definitions (link, slug, hero)
├── globals/                # Global settings (Footer, Header)
├── heros/                  # Hero components (HeroSlider, HeroCarousel, etc.)
├── hooks/                  # Lifecycle hooks (autoTranslate, revalidate, etc.)
├── plugins/                # Plugin config (ecommerce, seo, storage-s3)
├── scripts/                # Seed scripts (one per page)
├── utilities/              # Helper functions
└── payload.config.ts       # Main config
```

---

## Storage — Cloudflare R2 (via S3 API)

### Configuration (`src/plugins/index.ts`)

```typescript
import { s3Storage } from '@payloadcms/storage-s3'

s3Storage({
  enabled: !!process.env.R2_BUCKET,
  collections: {
    media: {
      disablePayloadAccessControl: true,
      prefix: 'media',
      generateFileURL: ({ filename, prefix }) => {
        return `${process.env.R2_PUBLIC_URL}/${prefix}/${filename}`
      },
    },
  },
  bucket: process.env.R2_BUCKET!,
  config: {
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    endpoint: process.env.R2_ENDPOINT!,
    region: 'auto',
  },
})
```

### Environment Variables

```bash
R2_BUCKET=fermentfreude-media
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://<public-url>.r2.dev
```

### Image Rendering Rules

- **Always** use `<Media resource={...} />` from `@/components/Media`.
- **Never** use `<img src="/assets/...">` or static file paths.
- No image? → `<div className="bg-[#ECE5DE]" />`
- Type guard: `typeof image === 'object' && image !== null && 'url' in image`
- Hero images: always set `priority` on the `<Media>` component.

### Image Optimization for Seeds

```typescript
import { optimizedFile, IMAGE_PRESETS } from '@/scripts/seed-image-utils'

// Full-width hero banners
const heroFile = await optimizedFile(imagePath, IMAGE_PRESETS.hero)    // 1920px, q80

// Product/card images
const cardFile = await optimizedFile(imagePath, IMAGE_PRESETS.card)    // 1200px, q80

// Logos/icons
const logoFile = await optimizedFile(imagePath, IMAGE_PRESETS.logo)    // 600px, q80

// SVGs (no conversion needed)
import { readLocalFile } from '@/scripts/seed-image-utils'
const svgFile = readLocalFile(svgPath)
```

Never upload raw PNGs from design tools — `optimizedFile()` saves 80–90% storage.

---

## Collections

### Basic Collection Pattern

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: adminsOrPublished,
    create: admins,
    update: admins,
    delete: admins,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    slugField(),
    // ... more fields — ALL text fields must be localized: true
  ],
}
```

### Media Collection

```typescript
// src/collections/Media.ts
export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  hooks: { afterChange: [autoTranslateCollection] },
  fields: [
    { name: 'alt', type: 'text', required: true, localized: true },
    { name: 'caption', type: 'richText', localized: true },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
  },
}
```

---

## Security Patterns

### 1. Local API Access Control (Critical)

```typescript
// ❌ BUG: Access control bypassed (default overrideAccess: true)
await payload.find({ collection: 'posts', user: someUser })

// ✅ SECURE: Enforces permissions
await payload.find({ collection: 'posts', user: someUser, overrideAccess: false })

// ✅ Administrative (intentional bypass, no user)
await payload.find({ collection: 'posts' })
```

### 2. Transaction Safety in Hooks

```typescript
// ✅ Always pass req to nested operations
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // Maintains atomicity
      })
    },
  ],
}
```

### 3. Prevent Infinite Hook Loops

```typescript
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        context: { skipHooks: true },
        req,
      })
    },
  ],
}
```

---

## Access Control Patterns

```typescript
// Anyone
export const anyone: Access = () => true

// Authenticated only
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Admin only
export const adminOnly: Access = ({ req: { user } }) => user?.roles?.includes('admin')

// Admin or self
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  return { id: { equals: user?.id } }
}

// Published or authenticated
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

**Note:** Field-level access only returns `boolean` (no query constraints).

---

## Hooks

### Common Patterns

```typescript
hooks: {
  // Before validation — format data
  beforeValidate: [({ data, operation }) => {
    if (operation === 'create') data.slug = slugify(data.title)
    return data
  }],

  // Before save — business logic
  beforeChange: [({ data, operation }) => {
    if (operation === 'update' && data.status === 'published') {
      data.publishedAt = new Date()
    }
    return data
  }],

  // After save — side effects
  afterChange: [({ doc, req, context }) => {
    if (context.skipNotification) return
    sendNotification(doc)
    return doc
  }],
}
```

---

## Queries (Local API)

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Find
const { docs } = await payload.find({
  collection: 'products',
  where: { _status: { equals: 'published' } },
  depth: 2,
  limit: 10,
  sort: '-createdAt',
})

// Find by ID
const doc = await payload.findByID({ collection: 'products', id: '123', depth: 2 })

// Create
const newDoc = await payload.create({ collection: 'products', data: { title: 'New' } })

// Update
await payload.update({ collection: 'products', id: '123', data: { status: 'published' } })

// Delete
await payload.delete({ collection: 'products', id: '123' })
```

### Query Operators

```typescript
{ status: { equals: 'published' } }
{ status: { not_equals: 'draft' } }
{ price: { greater_than: 100 } }
{ title: { contains: 'payload' } }
{ category: { in: ['tech', 'news'] } }
{ image: { exists: true } }
```

---

## Components

### Server vs Client

**All components default to Server Components** — use `'use client'` only when you need state, effects, or browser APIs.

```tsx
// Server Component (default) — can use Local API directly
async function MyServerComponent({ payload }: { payload: Payload }) {
  const posts = await payload.find({ collection: 'posts' })
  return <div>{posts.totalDocs} posts</div>
}
```

```tsx
// Client Component — only when needed
'use client'
import { useState } from 'react'

export function MyClientComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

### Custom Admin Components

Components in the admin panel are defined using **file paths** (not direct imports):

```typescript
admin: {
  components: {
    graphics: { Logo: '/components/Logo', Icon: '/components/Icon' },
    beforeDashboard: ['/components/WelcomeMessage'],
  },
}
```

After adding/modifying components: `pnpm generate:importmap`

---

## Plugins (configured in `src/plugins/index.ts`)

| Plugin | Purpose |
|--------|---------|
| `@payloadcms/storage-s3` | Cloudflare R2 file storage (S3-compatible) |
| `@payloadcms/plugin-seo` | SEO metadata for pages and products |
| `@payloadcms/plugin-form-builder` | Contact forms, newsletter signups |
| `@payloadcms/plugin-ecommerce` | Products, variants, carts, orders, Stripe |
| `@payloadcms/richtext-lexical` | Rich text editor |

---

## Drafts & Versions

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
      validate: false, // Don't validate drafts
    },
    maxPerDoc: 100,
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return { _status: { equals: 'published' } }
      return true
    },
  },
}
```

---

## Common Gotchas

1. **Local API Default**: Access control bypassed unless `overrideAccess: false`
2. **Transaction Safety**: Missing `req` in nested operations breaks atomicity
3. **Hook Loops**: Operations in hooks can trigger the same hooks — use context flags
4. **Field Access**: Cannot use query constraints, only boolean
5. **Relationship Depth**: Default is 2, set to 0 for IDs only
6. **Draft Status**: `_status` field auto-injected when drafts enabled
7. **Type Generation**: Types not updated until `pnpm generate:types` runs
8. **MongoDB M0**: No transactions — always sequential writes
9. **R2 Storage**: Images served from CDN URL, not filesystem — check `R2_PUBLIC_URL`
10. **Localization**: Text fields need `localized: true` — arrays/blocks are NOT localized, only their text children

---

## Additional Context

For deeper exploration of specific Payload patterns, see `.cursor/rules/`:

| File | Topic |
|------|-------|
| `payload-overview.md` | Architecture, config fundamentals |
| `security-critical.md` | Access control, transaction safety |
| `collections.md` | Collection patterns, auth, uploads |
| `fields.md` | Field types, validation, conditional fields |
| `access-control.md` | Permission patterns, RBAC |
| `hooks.md` | Lifecycle hooks, recipes |
| `queries.md` | Local API, query operators |
| `endpoints.md` | Custom API endpoints |
| `adapters.md` | Database and storage adapters |
| `components.md` | Custom admin components |
| `plugin-development.md` | Creating plugins |

---

## Resources

- Payload Docs: https://payloadcms.com/docs
- Payload LLM Context: https://payloadcms.com/llms-full.txt
- Payload GitHub: https://github.com/payloadcms/payload
- Payload Examples: https://github.com/payloadcms/payload/tree/main/examples
