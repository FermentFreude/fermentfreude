# /project:review — Pre-demo sanity check

## When to run

Before showing work to David/Marcel, or any time something feels off but isn't a specific reported bug (use `/project:debug` instead if you already know what's broken).

## Input

$ARGUMENTS = what's being reviewed (a page, a feature, or blank = everything changed in this session)

## Workflow

1. **Identify scope** — which pages/components/collections changed since the last review or commit
2. **Check against the 12 Non-Negotiable Rules** (`CLAUDE.md`) — spot-check, don't re-read every file:
   - Every visible text comes from a CMS field, not hardcoded (except documented English fallbacks)
   - Both `de` and `en` have real content, not just DE with EN blank/fallback
   - Images render via `<Media resource={...} />`, never `<img src="/assets/...">`
   - No image → `bg-[#ECE5DE]` placeholder, not a broken/missing image
   - Admin fields have `label` + `admin.description` — David/Marcel shouldn't need dev help
3. **Visual/functional pass** (use the browser preview tools, don't just read code)
   - Load the affected page(s) in both locales
   - Toggle dark mode if the change touches styled UI
   - Check mobile viewport if the change touches layout
4. **Check for regressions** — did this change touch a shared component/block used elsewhere?
5. **Report findings** — list what's solid and what needs fixing before the demo; don't silently fix things found here, surface them first

## Rules

- This command does not commit or deploy — it only reports
- If something's broken, hand off to `/project:fix` or `/project:debug` rather than patching inline
- Don't expand scope into a full codebase audit — review what changed, not everything that exists
