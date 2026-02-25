# /project:new-feature — Add a new feature

## Input

$ARGUMENTS = description of the feature to build

## Workflow

1. **Read context**
   - Read `CLAUDE.md` for project rules
   - Read `docs/##INSTRUCTIONS.md` for full patterns
   - Read `docs/DESIGN_SYSTEM.md` for tokens

2. **Explore**
   - Search existing collections, blocks, and components for similar patterns
   - Identify which files need to change vs. be created
   - Check if existing utilities/components can be reused

3. **Plan** (present to user before coding)
   - Schema changes (collection fields, block config)
   - Component(s) with English defaults
   - Seed script (bilingual: DE first → read IDs → EN reuse)
   - Files to create/modify

4. **Wait for approval** before writing any code

5. **Implement in order**
   a. Schema first (`src/collections/` or `src/blocks/[Name]/config.ts`)
   b. Component with English hardcoded defaults (`cmsValue ?? DEFAULT`)
   c. Use `<Media resource={...} />` for images — never `<img src="...">`
   d. Register block in `Pages/index.ts` + `RenderBlocks.tsx` if applicable
   e. Bilingual seed script:
   - Save DE first → read back for generated IDs → save EN with same IDs
   - Always `context: { skipRevalidate: true, skipAutoTranslate: true }`
   - Never `Promise.all` for writes
   - Use `optimizedFile()` for images
   - Register in `seed-all.ts`

6. **Validate**

   ```bash
   pnpm generate:types
   pnpm generate:importmap  # only if components changed
   npx tsc --noEmit         # must be zero errors
   ```

7. **Commit** to `staging` branch

## Constraints

- All text fields: `localized: true`
- Every field: `label` + `admin.description`
- One block = one section
- No per-page route files
- Never hardcode image paths — use Media component
- Never overwrite admin-managed images in seeds
