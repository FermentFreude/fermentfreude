# Dashboard v2 — handoff (2026-11-13)

## Where we are
- Branch: `feature/dashboard-v2` (local only, not pushed). Based on staging at the time (458d682).
- Commit `76e35a0` already contains: CalendarView, ArchiveView, WelcomeView, AttentionPanel, AttentionNotes collection (+ `payload.config.ts` registration), autoAttention / seatCheck / bookingOrigin helpers, rosterI18n (DE/EN), archive API route (`src/app/api/admin/roster/archive/`), updated DashboardView / RosterClient / WorkshopDetailView / fetchRosterData / rosterTheme / types. `tsc` was clean.
- Staging/main moved on since (perf PRs #179-#183 merged to main). Before pushing, merge or rebase `origin/staging` into this branch.
- Old v1 attempt: `feature/founders-dashboard` (at main, no own work; old changes in `stash@{0}`).

## Source of the plan
- HTML mock-up (artifact): https://claude.ai/artifact/NJ8e28JVmf559ovWf5C7sK ("Fermentfreude Admin Vorschau"). Read it with the Artifact tool (action: read) before planning.
- Mock-up features: calendar + list views, participants, archive, move seat, add/edit/remove person, "email another date" incl. "everyone chooses own date" link, invoices / ZIP / CSV, team-note conversations (replies, images, profile photos), arrange tabs, pickup tab (suggested: skip), new look.

## Next feature to build: edit Brevo email templates from the dashboard
Why: David writes the template copy; founders should edit it without a developer.
Facts to respect (see memory `project_brevo_templates_state`):
- One Brevo account serves staging AND production; templates are shared. 28 active templates, 19 sent by the site, 9 unsent kept on purpose (32,33,34,35,38,39,42,43,44) — never propose deleting them.
- Edit via Brevo API (`BREVO_API_KEY`, server side only): GET/PUT `/v3/smtp/templates`. Change only text nodes, subject, name, alt/title. Never touch URLs, `{{ params.X }}` placeholders, `{% if %}` Liquid, class names or email addresses.
- Safety: admin-only check at the top of every server action / API route (`requireAdmin()` pattern in `src/components/admin/roster/actions.ts`); store a before-copy of each template (undo); preview with a real contact email + params; "send test to myself".
- Founder-friendly German UI, plain labels, show "when is this sent" per template (table in the Google doc "Fermentfreude Brevo Email Templates").
- Brand spelling: always `Fermentfreude`.

## Other pending work (separate)
- Ala (colleague) works on the workshop page booking component (location display) on her own branch from staging.
- Open email gaps and decisions are listed in the Google doc (section 3) — wrong contact addresses on About/FAQ, 14-day vs 48-hour cancellation rule, login notification after every login, "ready for pickup" email, etc.
- Chatbot is parked: `feature/chatbot-assistant` (local, own folder `fermentfreude-chatbot`) and `feature/website-chatbot` (pushed).

## Working rules (from CLAUDE.md + user preferences)
- Local first, commit last: check on localhost; commit when she says details are done. Never push / PR / merge without an explicit yes.
- Staging DB is shared test data (disposable); production only read-only unless she says otherwise. Scripts touching DBs must guard `DATABASE_URL`.
- After schema changes: `pnpm generate:types`, `pnpm generate:importmap`, `npx tsc --noEmit` (zero errors).
- MongoDB Atlas M0: sequential writes, no `Promise.all` for mutations. Admin fields need clear labels + descriptions; all text localized (de + en).
- Branch flow: feature/* → PR into staging → test → staging → main.
