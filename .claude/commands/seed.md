# /project:seed — Run or create seed scripts

## Input

$ARGUMENTS = page name or "all"

## Before Running Any Seed

1. **Check which environment you're pointing to**

   ```bash
   grep DATABASE_URI .env | head -1   # Which DB?
   grep R2_BUCKET .env | head -1       # Which bucket?
   ```

   - If it says `fermentfreude` (no `-staging`): **STOP. You're on production.**
   - Local dev must always point to `fermentfreude-staging`

2. **Confirm the seed won't overwrite admin-managed data**
   - Images uploaded by editors through `/admin` must NOT be overwritten
   - Only seed data that is developer-managed

## Running Seeds

```bash
# Seed all pages
pnpm seed

# Seed one page
pnpm seed home
pnpm seed about
```

## Creating a New Seed

Template at `src/scripts/seed-<page>.ts`:

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { optimizedFile, IMAGE_PRESETS } from './seed-image-utils'

async function seed() {
  const payload = await getPayload({ config })
  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

  // Upload images first (if needed)
  const heroImg = await payload.create({
    collection: 'media',
    data: { alt: 'Description' },
    file: await optimizedFile('seed-assets/images/hero.jpg', IMAGE_PRESETS.hero),
    context: ctx,
  })

  // Save DE first
  const saved = await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    data: {
      /* German content */
    },
    context: ctx,
  })

  // Read back to get generated IDs
  const doc = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 0,
  })

  // Save EN reusing exact IDs from DE
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    data: {
      /* English content with same array IDs */
    },
    context: ctx,
  })

  payload.logger.info('✓ Seeded <page> (DE + EN)')
  process.exit(0)
}

seed()
```

Register in `src/scripts/seed-all.ts` (add to `scripts` map + `allOrder` array).

## Rules

- **Never** run seeds on production
- **Never** `Promise.all` for writes (MongoDB M0 = no transactions)
- **Always** bilingual: DE → read IDs → EN with same IDs
- **Always** `skipAutoTranslate: true` in context
- **Always** use `optimizedFile()` for images (never raw PNGs)
- **Never** overwrite images that admins uploaded through `/admin`
