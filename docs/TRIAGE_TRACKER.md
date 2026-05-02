# FermentFreude — Triage Tracker

> Source of truth for the founder-reported issues (PDF triage shared 2026-04 → 2026-05).
> Use this file when the user says "next issue" so we never lose context between sessions.

Legend: ✅ Done · 🟡 Partial / In progress · ❌ Not done · 🔍 Needs investigation

---

## 🔴 HIGH PRIORITY

### 1. Booking card titles not editable in dashboard (Lakto/Tempeh/Kombucha) — 16.04
**Status: ✅ Done (2026-05-02)**
- Added localized `bookingTitle` field in [src/fields/workshopDetailFields.ts](../src/fields/workshopDetailFields.ts) (collapsible "2. Booking Card", after `bookingEyebrow`).
- Wired through [LaktoBookingCard.tsx](../src/app/(app)/workshops/[slug]/LaktoBookingCard.tsx), [TempehBookingCard.tsx](../src/app/(app)/workshops/[slug]/TempehBookingCard.tsx), [KombuchaBookingCard.tsx](../src/app/(app)/workshops/[slug]/KombuchaBookingCard.tsx) — H2 + `mergedWorkshop.title` (so booking modal also reflects CMS).
- Passed `bookingTitle: detail.bookingTitle` in all 3 cms-spread blocks of [page.tsx](../src/app/(app)/workshops/[slug]/page.tsx).
- Types regen + `npx tsc --noEmit` clean.

### 2. Booking card title "Lacto-Fermented Vegetables" stuck in English — 22.04
**Status: ✅ Done (same fix as #1)** — editor now sets DE locale value in `/admin → Pages → workshop → Workshop Detail → 2. Booking Card → Booking Card Title`.

### 3. New blog posts not appearing on workshop pages — 19.04
**Status: ✅ Done (2026-05-02)**
- Created [src/utilities/getLatestPosts.ts](../src/utilities/getLatestPosts.ts) — fetches latest N published posts (depth 2 so heroImage resolves).
- Wired into [src/app/(app)/workshops/[slug]/page.tsx](../src/app/(app)/workshops/[slug]/page.tsx): per-page `workshopDetail.howToArticles` wins when set; otherwise falls back to latest 6 posts globally.
- **Sub-fix:** filter out stale string IDs (deleted posts return as bare ID strings) so the fallback engages instead of rendering empty placeholders. This was the root cause of Tempeh page beige cards.
- Verified via curl that post cover images render. tsc clean.

### 4. Workshop "All Dates" / global dashboard empty & not editable — 16.04
**Status: ✅ Done (2026-05-02)**
- Investigation: the "📋 All Dates List" collapsible at `/admin → Pages → workshops → Workshops Overview Page` was correctly wired and **fully editable** — the fields were just blank in the founder's DB because the seed values weren't applied. The actual workshop dates are managed in a different place (`/admin → Workshops → Workshop Appointments` collection), which is what they couldn't find.
- Fix: added German `defaultValue` on every label field in [src/fields/workshopOverviewFields.ts](../src/fields/workshopOverviewFields.ts) so blank fields render sensible defaults out of the box. Also rewrote the collapsible description to explicitly point editors to **Workshops → Workshop Appointments** for the actual dates/times/spots.
- Types regenerated, tsc clean.
- Note for founders: the dates list itself is dynamically built from each `workshop-appointments` document — add a new appointment there and it appears in the "All Dates" list automatically.

### 5. About → "Fermentation – What is Fermentation" page not editable — 22.04
**Status: ✅ Done (2026-05-02)**
Full audit of [/fermentation](../src/app/(app)/fermentation/page.tsx) vs admin → Pages → fermentation → **Fermentation Page** tab.

**Section order (live ↔ admin) — match ✓**
| # | Live page section | Admin collapsible |
|---|---|---|
| 1 | Hero (title, description, image, 4 cards) | 1. Hero |
| 2 | Guide | 2. Guide |
| 3 | What is fermentation? | 3. What is fermentation? |
| 4 | Why is it so special? | 4. Why is it so special? |
| 5 | Is it dangerous? + A practice, not a trend (one combined section, two accordions) | 5. Is it dangerous? · 6. A practice, not a trend |
| 6 | Ready to learn? CTA | 7. CTA (Ready to learn?) |
| 7 | FAQ | 8. FAQ |
| 8 | Workshops | 9. Learn UNIQUE. FLAVOURS (Workshop) |

**Bugs found & fixed**
1. **CMS overridden by hardcoded `RETOUCH_DE`/`RETOUCH_EN`** — every text field was `retouch.X ?? f?.fermentationX ?? DEFAULT`, so admin edits never surfaced. Flipped to **CMS → retouch → DEFAULT** for all ~25 fields.
2. **"BENEFITS" eyebrow above the Why section was not editable** — it was passed as `retouch.whyEyebrow` and there was no schema field. Added `fermentationWhyEyebrow` (localized text) under section 4 in [Pages/index.ts](../src/collections/Pages/index.ts) and wired it through `<WhySection eyebrow={whyEyebrow} />`.
3. **Workshop card images were always overridden** by hardcoded `/assets/images/fermentation/workshop-*.png` fallbacks — uploading an image in admin did nothing. Flipped precedence so CMS image wins; static asset is used only when no image is set.
4. **4 dead admin fields** (visible in dashboard but never rendered on the page) — hidden via `admin.hidden: true`: `fermentationGuideTag`, `fermentationFaqMoreText`, `fermentationFaqContactLabel`, `fermentationFaqContactUrl`. Existing values are preserved in the DB.

`pnpm generate:types` + `npx tsc --noEmit` clean. Founders can now edit every visible piece of `/fermentation` from `/admin → Pages → fermentation`.

### 6. Open Graph link preview shows "Payload" + generic text — 30.04
**Status: ❌ Not done**
- No global default OG image / title set; falls back to Payload defaults.
- **Plan:** Set defaults in [src/utilities/mergeOpenGraph.ts](../src/utilities/mergeOpenGraph.ts) or root `layout.tsx` metadata: site name "FermentFreude", description, default OG image (1200×630 webp uploaded to Media). SEO global lets editors override per-page.

---

## 🟠 MEDIUM PRIORITY

### 7. Voucher CTA on Home — black bg can't be edited; turns grey when image added
**Status: 🟡 Partial — visual softened (uncommitted)**
- Blur removed and overlays softened across all voucher CTA variants ([VoucherCta block](../src/blocks/VoucherCta/Component.tsx), [LaktoVoucherCta](../src/app/(app)/workshops/[slug]/LaktoVoucherCta.tsx), [TempehVoucherCta](../src/app/(app)/workshops/[slug]/TempehVoucherCta.tsx), [KombuchaVoucherCta](../src/app/(app)/workshops/[slug]/KombuchaVoucherCta.tsx)).
- **Still owed:** Make section bg color a CMS field; add "background mode" select (solid color / image).

### 8. "Other workshops" not editable + slider arrows broken — 16.04
**Status: ❌ Not done (two bugs)**
- (a) Edits in Workshop Slider global don't reflect → component reads from `slide-data.ts` instead of global. Wire rendered "Andere Workshops" to global.
- (b) Last-slide-disappears → check Embla `loop: true` / `selectedScrollSnap()` off-by-one.

### 9. Kombucha page shows lacto-fermentation articles — 16.04
**Status: 🟡 Resolved by #3** (if Kombucha `howToArticles` empty → falls back to latest 6). Confirm with founders if per-page curation desired.

### 10. "How To" article cannot be uploaded — 22.04
**Status: ✅ Done (2026-05-02)**
- Root cause: the global fallback (`getLatestPosts`) returned the latest 6 posts across **all** workshop types, so a newly created Tempeh post was buried under older Lakto/Kombucha posts (or invisible if the per-page `howToArticles` relationship still had 6 stale entries).
- Fix: [`getLatestPosts`](../src/utilities/getLatestPosts.ts) now accepts an optional `workshopType` filter; [workshops/[slug]/page.tsx](../src/app/(app)/workshops/[slug]/page.tsx) derives `workshopType` from the page slug (`lakto-gemuese → lakto`, `tempeh → tempeh`, `kombucha → kombucha`) and passes it. New posts created in `/admin/collections/posts` with the matching `workshopType` appear automatically.
- Editors who curate a custom list per page can still set `Articles (pick 6)` on the workshop detail; that wins over the fallback.
- tsc clean.

### 11. Mobile loading speed — 29.04
**Status: 🟡 Ongoing** — schedule Lighthouse audit after CMS fixes ship.

---

## 🔴 RED (lower in PDF but tagged red)

### 12. Newsletter popup behavior — 29.04 — ✅ Done (per founder mark)
### 13. Workshop spaces don't restore on cancelled checkout — ✅ Done (per founder mark)
### 14. Booking process always in English — ✅ Done (per founder mark)

### 15. Brevo voucher email — "Gutschein ansehen" button + `www.fermentfreude.at` link don't work
**Status: ❌ Not done**
- Likely button `href` is `www.fermentfreude.at` without `https://` (renders relative).
- **Plan:** Update Brevo template to `https://fermentfreude.at` (or `{{ params.VOUCHER_URL }}` from sender). Fix in Brevo template editor + sender call site.

### 16. Shop "Order Now" button not translated to German
**Status: 🟡 Code locale-aware** ([FeaturedProductCards](../src/blocks/FeaturedProductCards/Component.tsx#L88), [ShopHero](../src/blocks/ShopHero/Component.tsx#L35)) — falls back to translation when CTA equals `"order now"`. Seeded value likely `"Order Now"`, German not set.
- **Plan:** Seed German `"Jetzt bestellen"` OR extend normalization to catch capitalized variants.

### 17. Shop product page — "Add to Cart" / "Delivery is not available" not translated
**Status: ❌ Not done**
- [ProductDetailPage.tsx](../src/components/product/ProductDetailPage.tsx#L87) — English-only literals.
- **Plan:** Add strings to `TRANSLATIONS` map and call `t(...)`. Same for [ProductQuickView.tsx](../src/blocks/ShopProductList/ProductQuickView.tsx#L240).

### 18. Cart modal & checkout — many English strings (Contact, Your cart, Store Pickup, The Ginery, Pickup Date, Pickup Time, Payment, Pay now, Cancel payment)
**Status: ❌ Not done**
- Payload Ecommerce plugin React components render English-only.
- **Plan:** Override plugin labels via `i18n` / translations API or wrap each component with localized props. Single sweep task.

### 19. Shop product description headings not translated — ✅ Done (per founder mark)

---

## 🟡 ASSORTED

### 20. Menu "Uber uns" should be "Über uns" — 30.04
**Status: ✅ Already correct in code** — every header / footer / seed source uses `Über uns` ([seed-globals.ts:148](../src/scripts/seed-globals.ts#L148), [seed-header.ts:63](../src/scripts/seed-header.ts#L63), [Footer/index.tsx:32](../src/components/Footer/index.tsx#L32)).
- **Action:** re-seed header global on production OR ask founders to fix label in `/admin → Header → menu`.

### 21. Voucher value off by 99 cents (€99 → €98.01)
**Status: 🟡 In progress (other dev)** — verify when their voucher branch lands.

### 22. Brevo emails — first name not displayed (`Hallo , vielen Dank`)
**Status: ❌ Not done — root cause is NOT the spaces**
- `{{ params.FIRST_NAME }}` with spaces is **valid** Brevo handlebars. Empty render = parameter not passed by sender.
- **Plan:** Audit `sendTransacEmail` calls in `src/lib/brevo*` and order-confirmation hook → include `params: { FIRST_NAME: customer.firstName }`. One template (Bestellung bestätigt) missing param entirely; another (Dein Gutschein) has it → confirms per-call.

---

## 🚦 Suggested Execution Order

| # | Item | Status |
|---|------|--------|
| 1 | #3 — verify posts on prod | ✅ Code done; needs founders to publish |
| 2 | #1 + #2 — booking card CMS fields | ✅ Done |
| 3 | **#4 — All Dates global** | 🔍 **NEXT** |
| 4 | #5 — Fermentation page editable | ❌ |
| 5 | #22 — Brevo `FIRST_NAME` param | ❌ |
| 6 | #15 — Voucher email button/link | ❌ |
| 7 | #6 — OpenGraph defaults | ❌ |
| 8 | #17 + #18 — Shop & checkout German strings | ❌ |
| 9 | #16 — "Order Now" → "Jetzt bestellen" | 🟡 |
| 10 | #8 — Other Workshops binding + arrow bug | ❌ |
| 11 | #7 — Voucher CTA bg color CMS field | 🟡 |
| 12 | #10 — How-to upload investigation | 🔍 |
| 13 | #11 — Mobile perf | 🟡 |
| 14 | #20 — re-seed Header `Über uns` | ✅ code |

---

## Working Rules (per founders)

- "start just stop when fix" — one issue at a time, full validate, then stop.
- After every schema change: `pnpm generate:types` → `pnpm generate:importmap` → `npx tsc --noEmit` (zero errors) → re-run seed if needed.
- Don't touch unrelated uncommitted changes (howToArticles filter, voucher overlay rework).
- Bilingual (DE+EN), localized fields, ID reuse on bilingual seeds, sequential writes (Mongo M0).
