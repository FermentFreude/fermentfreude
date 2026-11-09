# Localization & Auto-Translation

Fermentfreude is a bilingual website (German 🇩🇪 / English 🇬🇧) powered by Payload CMS localization and DeepL auto-translation.

## Overview

```
┌──────────────┐    save (DE)    ┌──────────────┐    DeepL API    ┌──────────────┐
│  Admin Panel │ ──────────────▸ │  afterChange │ ─────────────▸  │  EN locale   │
│  (German)    │                 │    Hook      │                 │  auto-filled │
└──────────────┘                 └──────────────┘                 └──────────────┘
```

1. Content editors write in **German** (default locale)
2. On save, an `afterChange` hook fires
3. The hook finds all localized text fields that are empty in English
4. It batch-translates them via the DeepL API
5. English translations are saved automatically
6. Manual English edits are **never overwritten**

## Configuration

### Payload Localization

Defined in `src/payload.config.ts`:

```typescript
localization: {
  locales: [
    { label: 'Deutsch', code: 'de' },
    { label: 'English', code: 'en' },
  ],
  defaultLocale: 'de',
  fallback: true, // Falls back to DE if EN is missing
}
```

### DeepL API Key

Set in `.env`:

```
DEEPL_API_KEY=your-key-here
```

Get a key at [deepl.com/pro-api](https://www.deepl.com/pro-api). The free tier supports 500,000 characters/month. Translation gracefully degrades if the key is missing — content just won't be auto-translated.

## Localized Fields

Every user-facing text field has `localized: true`, meaning Payload stores a separate value per locale.

### Collections

| Collection | Localized Fields |
|---|---|
| **Pages** | `title`, `hero.richText`, `meta.title`, `meta.description` |
| **Products** | `title`, `description`, `meta.title`, `meta.description` |
| **Categories** | `title` |
| **Media** | `alt`, `caption` |

### Globals

| Global | Localized Fields |
|---|---|
| **Header** | `navItems.link.label`, `dropdownItems.label`, `dropdownItems.description` |
| **Footer** | `navItems.link.label` |

### Shared Fields

| Field | Localized Fields |
|---|---|
| **link** (`src/fields/link.ts`) | `label` — used by Footer, hero, CTA block, Content block |
| **hero** (`src/fields/hero.ts`) | `richText` |

### Blocks

| Block | Localized Fields |
|---|---|
| **Archive** | `introContent` (richText) |
| **Banner** | `content` (richText) |
| **Call to Action** | `richText` |
| **Content** | `columns.richText` |
| **Form** | `introContent` (richText) |

### SEO Plugin

The `@payloadcms/plugin-seo` fields (`meta.title`, `meta.description`) are localized **by default** — no extra configuration needed.

## Auto-Translation Hooks

### How They Work

Two generic hooks walk the Payload field schema at runtime to discover all `localized: true` text/textarea fields:

| Hook | File | Used By |
|---|---|---|
| `autoTranslateCollection` | `src/hooks/autoTranslateCollection.ts` | Pages, Products, Categories, Media |
| `autoTranslateGlobal` | `src/hooks/autoTranslateGlobal.ts` | Header, Footer |

#### Algorithm

1. **Guard checks** — Only runs when `locale === 'de'`, DeepL key exists, and `context.skipAutoTranslate` is not set
2. **Fetch EN document** — Reads the current English version from the database
3. **Walk field schema** — Recursively traverses `fields` config (groups, tabs, rows, arrays) to find localized text fields
4. **Compare values** — For each localized text field, checks if the EN value is empty or identical to DE
5. **Batch translate** — Sends all untranslated texts to DeepL in a single API call
6. **Save EN** — Updates the document with `locale: 'en'` and `context: { skipAutoTranslate: true }` to prevent infinite loops

#### What Gets Auto-Translated

- **Text fields** (`type: 'text'`) with `localized: true` → ✅ auto-translated
- **Textarea fields** (`type: 'textarea'`) with `localized: true` → ✅ auto-translated
- **RichText fields** (`type: 'richText'`) with `localized: true` → ❌ NOT auto-translated (stored as Lexical JSON AST, requires manual translation in admin)

### DeepL Utility

Located at `src/utilities/translate.ts`:

```typescript
translateToEnglish(text: string): Promise<string>       // Single text
translateBatchToEnglish(texts: string[]): Promise<string[]> // Batch (efficient)
```

- Uses `deepl-node` package
- Translates `'de'` → `'en-US'`
- Graceful fallback: returns original text if API key is missing or translation fails

## Frontend Locale Switching

### Language Toggle

The `LanguageToggle` component (`src/components/Header/LanguageToggle.tsx`) renders a **DE | EN** pill in the header.

### How It Works

1. User clicks a language
2. The locale is stored in:
   - `localStorage` (`fermentfreude-locale`) — persists across sessions
   - A cookie (`fermentfreude-locale`) — readable by server components
3. The page reloads so server components re-fetch with the new locale

### Server Components

Server components read the locale from the cookie:

```typescript
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const localeValue = cookieStore.get('fermentfreude-locale')?.value
const locale = (localeValue === 'en' ? 'en' : 'de') as 'de' | 'en'

const data = await getCachedGlobal('header', 1, locale)()
```

### Client Components

Client components use the `useLocale()` hook from `src/providers/Locale/index.tsx`:

```typescript
import { useLocale } from '@/providers/Locale'

function MyComponent() {
  const { locale, setLocale } = useLocale()
  // locale is 'de' or 'en'
}
```

## Adding Localization to New Fields

### 1. Mark the field as localized

```typescript
{
  name: 'myField',
  type: 'text',
  localized: true, // ← add this
}
```

### 2. Wire the auto-translate hook (if on a new collection)

```typescript
import { autoTranslateCollection } from '@/hooks/autoTranslateCollection'

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  hooks: {
    afterChange: [autoTranslateCollection],
  },
  fields: [/* ... */],
}
```

### 3. Regenerate types

```bash
pnpm generate:types
```

### 4. Pass locale in server components

Use `getCachedGlobal(slug, depth, locale)` or `payload.find({ collection, locale })`.

## Preventing Infinite Loops

The hooks use `context` flags to avoid re-triggering themselves:

```typescript
await payload.update({
  collection: 'pages',
  id: doc.id,
  locale: 'en',
  data: updateData,
  context: {
    skipAutoTranslate: true,  // Prevents hook from re-firing
    skipRevalidate: true,     // Prevents unnecessary revalidation
  },
})
```

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| EN fields stay empty | Missing `DEEPL_API_KEY` in `.env` | Add your DeepL API key |
| Translation overwrites manual edits | Should not happen — hook only fills empty/identical fields | Check if EN value matches DE exactly |
| Hook runs on every save | Expected behavior — it only translates fields that need it | No action needed |
| RichText not translated | By design — structured JSON can't be batch-translated | Translate manually in admin under EN locale |
| `skipAutoTranslate` logged | Hook was called recursively and caught by guard | Working as intended |
