# /project:admin-cleanup — Remove or hide fields safely

## Input

$ARGUMENTS = which fields or sections to clean up

## Workflow

1. **Find all references** before touching anything
   - Search components for field usage
   - Search seed scripts for field references
   - Search types (`payload-types.ts`) for the field name

2. **Decide: hard delete or soft hide**
   - **Hard delete:** Remove from schema if NO component references it
   - **Soft hide:** Use `admin.condition: () => false` if unsure or if data exists in DB
   - Prefer soft hide when in doubt — it's reversible

3. **Apply the change**
   - Modify the collection/block config in `src/collections/` or `src/blocks/`
   - Remove from components if hard deleting
   - Update TypeScript types

4. **Validate**

   ```bash
   pnpm generate:types
   npx tsc --noEmit
   ```

5. **Never re-seed.** Admin cleanup is about the schema, not the data.

## Rules

- Always check component references before deleting a field
- Don't delete fields that editors have already populated with data — hide them instead
- Don't touch seed scripts (they'll be updated separately if needed)
- Commit with: `chore: clean up [field/section] from admin`
