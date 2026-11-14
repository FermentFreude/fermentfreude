# Dashboard v2 — handoff (updated 2026-11-13, evening)

## Where we are
- Branch: `feature/dashboard-v2` (local only, not pushed). `origin/staging` merged in (merge commit a34a0a3, includes #181–#184).
- Committed earlier: 76e35a0 (calendar, archive, welcome, attention notes, DE/EN), 24482d7 (this note).
- **Everything below is UNCOMMITTED** — Rafaela checks on localhost first; commit only on her explicit yes.

## Built in this session (uncommitted)
1. **Email safety net** — `src/lib/emailSafety.ts`, wired into `sendTemplateEmail` / `sendTransactionalEmail` / `upsertContact` in `src/lib/brevo.ts`. Outside production (VERCEL_ENV≠production or staging DB) only @fermentfreude.at/.de, ADMIN_NOTIFICATION_EMAIL and EMAIL_TEST_ALLOWLIST receive mail. Local `.env` has EMAIL_TEST_ALLOWLIST=connectwithrafaela@gmail.com. Staging DB check (2026-11-13): bookings/orders/vouchers/transactions scrubbed to @example.invalid, but `users` still has ~19 real addresses → the guard is the protection.
2. **E-Mails tab** — `EmailTemplatesView.tsx`, `emailTemplateActions.ts`, `emailTemplateMeta.ts` (29 templates incl. new 104, "when sent" from the Google doc), engine `src/lib/emailTemplateText.ts` (byte-exact text-only edits, locked ⟦markers⟧, fingerprint check; tested against all 28 live templates + `tests/int/emailTemplateText.int.spec.ts`), `src/lib/brevoTemplates.ts`, collection `email-template-versions` (before-copies, restore). Outside production only "TEST – …" copies (inactive) are writable; button "Testkopie anlegen" in the editor. Old `brevo-email-templates` (raw HTML push) and `brevo-templates` (never synced) hidden/read-only. Push script refuses without `--overwrite-dashboard-edits`.
3. **New look** — `rosterStyles.ts` (tokens from the mock-up, Neue Haas Grotesk via Typekit, Payload `--theme-*` vars remapped inside `.ff-roster`), new shell in `RosterClient.tsx` (charcoal rail, wordmark `Wordmark.tsx`, profile chip, E-Mails group, CMS link, DE/EN), arrange Workshops tabs (drag/arrows, per user in localStorage), `RosterToast.tsx`. Every view uses `.ff-page`. `DashboardView.tsx` deleted (unused).
4. **Welcome / List / Calendar** rebuilt to the mock-up (`WelcomeView`, `WorkshopCard`, `WorkshopsView`, `CalendarView`, bilingual).
5. **Day sheet** — `WorkshopDetailView.tsx`: header stats + bar, add person, print day sheet (print CSS), copy list, invoices ZIP (`/api/admin/orders/receipt-bulk?ids=…`), per-booking details/edit/move (any workshop, impact preview)/email another date/remove. Bookings now carry `invoiceNumber` + `payment` (fetchRosterData).
6. **Choose your own date** — new magic-link scope `date-offer` (`dateOfferActions` in policyEngine; manageBooking/page/route pass scope; customer page skips the reason step and shows an intro). Action `chooseDateActions.ts`. **Brevo template #104 "Workshop – Neuen Termin wählen (Dashboard)" was created** (text-only copy of 99) via `src/scripts/create-brevo-date-offer-template.ts`; `BREVO_TEMPLATES.WORKSHOP_DATE_OFFER = 104`.
7. **Conversations** — AttentionNotes got `createdById`, `assignedTo`, `messages[]` (text, images→media, events), `seenBy`, `ackReason`; Users got `avatar` + `noteEmailPref` (admin-only fields). `attentionActions.ts` rewritten (ask, reply, reassign, done/reopen, seen, image upload, profile). `AttentionPanel.tsx` rewritten (filters, unread, thread dialog with paste/drop screenshots, ask/known for system items, profile dialog). Email alerts are built in code (`alertTeam`), link `/admin/workshop-roster?note=<id>`.

## Not verified yet
- No logged-in browser pass was possible (creating a temporary admin was blocked). `tsc`, eslint, `generate:types/importmap`, new int tests and a dev-server compile all pass. Rafaela needs to click through on localhost.

## Open / next
- Vercel Preview (staging): add EMAIL_TEST_ALLOWLIST with team test inboxes, or test emails on staging go only to @fermentfreude.at.
- Sender name on existing Brevo templates is "FermentFreude" (brand spelling) — not part of text editing; fix in Brevo settings if wanted.
- Pickup tab unchanged (mock-up says later).
