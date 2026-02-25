# /project:new-block — Create a new content block

## Input

$ARGUMENTS = name and purpose of the block

## Workflow

1. **Read context**
   - `CLAUDE.md` for rules
   - `docs/DESIGN_SYSTEM.md` for tokens
   - Look at 1-2 existing blocks for patterns (e.g., `src/blocks/CallToAction/`, `src/blocks/TeamCards/`)

2. **Create config** — `src/blocks/[Name]/config.ts`

   ```typescript
   import type { Block } from 'payload'
   export const MyBlock: Block = {
     slug: 'myBlock',
     interfaceName: 'MyBlockType',
     labels: { singular: 'My Block', plural: 'My Blocks' },
     fields: [
       // ALL text fields: localized: true
       // ALL fields: label + admin.description
     ],
   }
   ```

3. **Create component** — `src/blocks/[Name]/Component.tsx`
   - English hardcoded defaults as fallbacks
   - `const resolved = cmsValue ?? DEFAULT_VALUE`
   - Images: `<Media resource={...} />` — never `<img>`
   - No image: `<div className="bg-[#ECE5DE]" />`
   - Use design tokens from `docs/DESIGN_SYSTEM.md`
   - Font: `font-display` for headings, `font-sans` for body

4. **Register**
   - Add to `src/collections/Pages/index.ts` → `layout.blocks` array
   - Add to `src/blocks/RenderBlocks.tsx` → `blockComponents` map

5. **Seed** (if needed)
   - Bilingual: DE first → read IDs → EN with same IDs
   - `context: { skipRevalidate: true, skipAutoTranslate: true }`
   - Use `optimizedFile()` for images
   - Register in `src/scripts/seed-all.ts`

6. **Validate**

   ```bash
   pnpm generate:types
   pnpm generate:importmap
   npx tsc --noEmit
   ```

7. **Commit** with message: `feat: add [Name] block`

## Rules

- One block = one section (never bundle multiple sections)
- Block must be reusable across pages
- 40–120 lines of config is ideal
- Every field must be admin-friendly (label + description)
