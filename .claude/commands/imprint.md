# /project:imprint — Capture a UI pattern

## When to run

After building any new UI component or block — while the decisions are still fresh, before moving to the next task.

## Input

$ARGUMENTS = which component/block to capture (defaults to whatever was just built in this session)

## Workflow

1. **Identify what was built** — component name, file path, and the block/collection it belongs to
2. **Extract the pattern, not the implementation**
   - What layout/structure decision was made and why (not just "what the code does")
   - Which existing tokens/utilities it reused from `docs/DESIGN_SYSTEM.md`
   - Any non-obvious constraint it had to satisfy (localization, dark mode, admin-friendliness, image fallback)
3. **Check `docs/UI_PATTERNS.md` for an existing entry on the same pattern family** — update it instead of duplicating if one exists
4. **Append a concise entry** to `docs/UI_PATTERNS.md`:

   ```markdown
   ## [Component/Block Name]
   **File:** `src/...`
   **Pattern:** one or two sentences — the reusable decision, not a restatement of the code
   **Reuse when:** the situation where the next feature should copy this instead of inventing a new approach
   ```

5. **Do not** re-explain rules already in `CLAUDE.md` or `DESIGN_SYSTEM.md` — only capture what's new or component-specific

## Rules

- Keep each entry under ~5 lines — this is a lookup index, not documentation
- No code changes in this command — it only writes to `docs/UI_PATTERNS.md`
- Skip patterns that are one-off/unlikely to be reused
