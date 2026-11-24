# Rezepte (/rezepte)

Recipe library built from David's brief (Nov 2026), with the look of Rafaela's Kitchen Lab prototype: recipes first, four categories, every recipe on its own URL with the same template, managed in Payload, SEO + recipe data generated automatically, optional sponsored partner block.

**Design:** brand palette only — Cream #FAF2E0, Charcoal #2D2F2C, Sage #B0C7B8, Mustard #E6BE68. Category colours: Gemüse fermentieren = Sage, Einlegen = Cream, Tempeh = Charcoal, Kombucha = Mustard (`PALETTE` / `theme` in `categories.ts`).

**/rezepte (David's feedback, ref. Cooking Catrin, 20 Nov 2026):** header = the recipe of the week (Rezepte-Seite → Oben → "Rezept der Woche", else the first highlighted recipe with a photo): big photo, "Rezept der Woche" pill, recipe name, short description and "Zum Rezept" on a darker right side (phones: at the bottom); the whole card links to the recipe; hidden on search results · directly below: centred eyebrow + H1 "Aus dem Glas. Auf den Teller." (second part marked), search and "Beliebt" (on search: "Ergebnisse für …" + reset) · all recipes like Cooking Catrin (filter as pill buttons, small landscape 3:2 photo + centred name, 2 per row on phones, 3 on tablets, 4 on desktop, 12 then "Mehr Rezepte zeigen"); phones: the header is shorter so the first recipes show on the first screen · "Was setzt du heute an?" 4 category cards (after the recipes) · workshop block (`closing.tsx`, same on category and recipe pages).

**Recipe page:** full-width photo (21:9 desktop, 4:3 phones) with a white title card overlapping its bottom edge (breadcrumb, title, mustard rule, short description, partner line, "Zum Rezept ↓" jump button + "♡ Speichern", star rating) · left column (normal flow, never cut off): "Über das Rezept" (facts with icons incl. "Gefäß", Drucken/Teilen/Merken) above the ingredients (`IngredientList.tsx`: 1× 2× 3× batch switch that rescales every amount and "Ergibt" via `scaleAmount()` in `src/lib/recipeAmount.ts` — ranges, ½, g→kg, ml→l; ratios like "(2 Teile)" and "%" stay; "Antippen zum Abhaken" with jar checkboxes; "Bildschirm anlassen" switch using the Wake Lock API, hidden where unsupported). Print always shows the original amounts | right: ferment timeline with "Was du bemerkst" and ready-on date, David's note card, steps (photo beside the text from tablet up), tips, partner box · shop products · "Weitere Rezepte" (3) · workshop block. **Print** (`PrintCard` in `[slug]/page.tsx`, same layout for every recipe): one A4 card on cream: logo top middle, category line, big recipe title with a small ornament, Sage facts bar with icons; left: ingredients (tick circles), tips and the "Warum es funktioniert" note with David's name; right: numbered steps (01, 02 … in dark circles), no photo (saves ink); bottom middle: QR code to https://www.fermentfreude.at (`public/print/qr-fermentfreude.svg`, generated with macOS CoreImage and checked to scan) + slogan (template word `printSlogan`); 2 comic friends (top left, bottom right). Images load eagerly because the card is hidden on screen. Checked: all 9 recipes fit on one page.

**Category pages:** clean addresses `/rezepte/fermentieren`, `/rezepte/einlegen`, `/rezepte/tempeh`, `/rezepte/kombucha` (`category-view.tsx`, rendered by `[slug]/page.tsx` when the slug is a category). Old links `/rezepte?kategorie=…` redirect there permanently (308). A recipe can't take a category address: the collection's `beforeValidate` hook turns e.g. `kombucha` into `kombucha-rezept` (also for drafts, where Payload skips `validate`). All four are in the sitemap.

**Menu:** "Rezepte" / "Recipes" sits after "Shop" in the Header global (max. items raised from 6 to 7) and in the code fallback `src/components/Header/nav-defaults.ts`. Desktop nav gap is tighter between 1024–1280 px so 7 items fit on one line. **Production:** add the item in /admin → Header after deploying (the staging DB has it already).

**Home page teaser:** block `recipeTeaser` ("Rezept der Woche (Teaser)", `src/blocks/RecipeTeaser/`): big photo + recipe name + short description + "Zum Rezept" + "Alle Rezepte". Recipe = the block's own pick, else Rezepte-Seite → Hero → "Rezept der Woche", else the first highlighted recipe; no published recipe → section hidden. On staging it sits after the fermentation story. **Production:** add the block to the home page in /admin.

**Bulk import:** `/admin/rezepte-import` (link above the recipe list). Download the CSV template → one recipe per row (Zutaten one per line `60 g | Trauben | eine Handvoll`, `# Gruppe` starts a group; Schritte one per line, optional `Titel: Text`; Tipps one per line; Was du bemerkst one per line `Tag 1: …`) → upload the CSV (comma or semicolon) or paste rows from Google Sheets → preview → import. Creates **drafts** only, sequentially; rows whose URL already exists are skipped, never overwritten; photos are added afterwards. Parser `src/lib/recipeImport.ts` (tests: `tests/int/recipeImport.int.spec.ts`), server actions `src/components/admin/recipe-import/actions.ts` (admin check on every call), page `RecipeImportView.tsx` (shows "Nur für Admins" to others).

**Search:** `/rezepte?q=…` searches title, short description, keywords and ingredients (no extra service).

**Photos (staging only):** placeholders from the existing media library, assigned on the staging DB so the design can be reviewed. Replace with the real shoot in /admin.

**Share, category pill, ratings (recipe page):**
- Title card: the category is a pill button in its own colour, linking to `/rezepte/<kategorie>`. "← Alle Rezepte" sits above the photo, "Alle Rezepte ansehen" under "Weitere Rezepte".
- "Über das Rezept" box: "Rezept drucken" + share (`ShareButtons.tsx`): phones get the native share sheet ("Teilen"), desktops WhatsApp + "Link kopieren"; "Auf Pinterest merken" everywhere (uses the Pinterest photo when set, else the main photo).
- "Hat's geschmeckt?" 1–5 stars under the steps (`StarRating.tsx`) → `POST /api/recipes/rate`. Collection `recipe-ratings` (Inhalt → Rezept-Bewertungen): admins read/delete only, nobody creates/edits through the API. The route checks input, only rates published recipes, one vote per person and recipe (voting again changes it), max. 30 votes per connection per hour, stores only salted SHA-256 hashes (salt `PAYLOAD_SECRET`), never the IP. Average + count are read server-side; Google `aggregateRating` only when there is at least one real vote. Helpers + tests: `src/lib/recipeRatings.ts`, `tests/int/recipeRatings.int.spec.ts`.

## David adds a new recipe (dashboard)

1. /admin → Inhalt → **Rezepte** → "Neu erstellen" (or many at once: "Viele Rezepte auf einmal importieren").
2. Fill in German (default language): Titel, Kategorie (both required), Kurzbeschreibung, Foto, Zeiten, Menge, Schwierigkeit, Zutaten (Menge + Name required per line), Schritte (Text required), Tipps. URL fills itself from the title.
3. Save as draft → check with the preview → **Veröffentlichen**. On save, DeepL fills the English fields automatically (production); any English field can be edited by switching the language top right. Manual English edits are never overwritten.
4. Optional: Partner tab ("In Kooperation mit …"), Verknüpfungen (workshop, shop products), SEO.

## How the CMS rules are covered

- **Everything visible is a CMS field, all text localized (DE + EN):** recipe texts incl. ingredient **amount** (localized since Nov 2026 — EN e.g. "approx. 2 tbsp") and partner name; category **names**, intros and photos (Rezepte-Seite → Kategorien); all fixed template words incl. difficulty (Leicht/Easy …) and the partner line (In Kooperation mit / In partnership with) in Rezepte-Seite → **Vorlagen-Texte** — each with a clear German name and the standard wording (DE · EN) as grey placeholder. Template words no longer shown on the site are hidden in the admin (`RECIPE_LABEL_ADMIN` in `labels.ts`). Only the URL (slug), category, numbers, images and links are shared between languages.
- **Defaults in code:** `labels.ts` (DE + EN for every word), `categories.ts` (names), `CATEGORY_INTRO_DEFAULTS`, `LANDING_DEFAULTS`; CMS value wins (`pick()`, `resolveLabels()`, `categoryName()`, `difficultyName()`, `disclosureName()` in `shared.ts`).
- **Seed both languages:** `pnpm seed recipes` → recipes DE then EN with the same array ids (amount EN via `src/lib/recipeAmount.ts`), page texts, and every run fills empty template words + category names/intros in DE and EN (non-destructive, reads with `fallbackLocale: false`). Staging only unless `--allow-prod`.
- **Required fields** (title, category, ingredient name, step text, tip text) always have seeded data; no image is required (missing photo → neutral tint).

## Where things are

| What | File |
| --- | --- |
| Collection (fields, admin labels) | `src/collections/Recipes/index.ts` |
| The 4 categories, difficulty + ad labels | `src/collections/Recipes/categories.ts` |
| Overview page `/rezepte` | `src/app/(app)/rezepte/page.tsx` |
| Category pages `/rezepte/<kategorie>` + shared data/closing | `src/app/(app)/rezepte/category-view.tsx`, `load.tsx` |
| Home teaser block | `src/blocks/RecipeTeaser/` |
| Bulk import | `src/lib/recipeImport.ts`, `src/components/admin/recipe-import/`, `/admin/rezepte-import` |
| Recipe page `/rezepte/[slug]` | `src/app/(app)/rezepte/[slug]/page.tsx` |
| Card, design kit, JSON-LD builder | `src/app/(app)/rezepte/RecipeCard.tsx`, `ui.tsx`, `shared.ts` |
| Gallery pieces (card, category photo, heading) | `src/app/(app)/rezepte/gallery.tsx`, filter grid `RecipeGrid.tsx` |
| Motion + older creative pieces (not used on /rezepte any more) | `src/app/(app)/rezepte/creative.tsx` |
| Default texts (DE/EN) | `src/app/(app)/rezepte/labels.ts` |
| Page texts & photos (global) | `src/globals/RecipesPage.ts` → /admin → Inhalt → Rezepte-Seite |
| Sitemap entries | `src/app/sitemap.ts` |
| Seed: 5 workshop-script recipes + 4 samples + page texts | `src/scripts/seed-recipes.ts` → `pnpm seed recipes` (`--page` to overwrite page texts) |

## Categories

`fermentieren` Gemüse fermentieren · `einlegen` Einlegen & Haltbarmachen · `tempeh` Tempeh & Kochen · `kombucha` Kombucha & Drinks. Each one links to its matching workshop by default.

## Admin (Inhalt → Rezepte)

- **Rezept tab:** title, short description, landscape hero (3:2), optional Pinterest image (2:3), prep minutes, fermentation days, yield, difficulty, vessel (Gefäß), "Warum es funktioniert" (David), ingredient groups, steps (short title + text + optional photo), tips, keywords.
- **Partner tab:** off by default. When on: a line under the title, e.g. "In Kooperation mit XY" (dropdown: In Kooperation mit / Anzeige / Werbung), plus a box after the steps with brand, logo, text and link (`rel="sponsored"`), no "ANZEIGE" header. Note: for paid partnerships Austrian/German law expects "Anzeige"/"Werbung"; choose that in the dropdown when money or free products are involved.
- **Verknüpfungen tab:** optional workshop + up to 3 shop products.
- **SEO tab:** optional. When it's empty, the page uses the title, short description and hero image.
- Drafts: save as draft, publish when ready. Only published recipes appear on the site and in the sitemap.

## Automatic SEO

- schema.org `Recipe` JSON-LD for Google rich results and Pinterest rich pins: ingredients, steps, prep/total time, yield, category, images.
- Title, description, canonical URL, Open Graph image, plus `pin:media` for the Pinterest image.

## Open / next

- German wording of the 5 script recipes was translated back from the English prototype — David/Marcel to check against the original scripts.
- Real content: 2–3 recipes per category, with photos (landscape + portrait).
- Nav/footer link to `/rezepte` (Header global in /admin).
- Optional later: bulk import from a spreadsheet (CSV → Local API script).

**Gespeichert (save for later, `rezepte/saved.tsx`):** heart in the title card ("Speichern" → "Gespeichert") and on every recipe card photo. Saved on the device only (localStorage key `ff-saved-recipes`, list of slugs, no login, no personal data): survives closing the tab/browser, gone after clearing browser data or in private windows, not synced between devices. /rezepte shows a "♥ Gespeichert (n)" filter tab once something is saved. The Pinterest button is "Pinnen" (was "Merken", which now clashed with the heart); `seed recipes` replaces the old default only if nobody changed it (`OLD_DEFAULTS`). **Logged in:** the hearts are stored on the user (`users.savedRecipes`, relationship to recipes, newest first, max 200) via `GET/POST /api/recipes/saved` (`{ add?, remove? }` slugs; only the caller's own user; published recipes only; the field is admin-only for the normal REST API). Right after login the hearts saved in the browser move into the account and the browser list is emptied. Customers see them under /account → "Gespeicherte Rezepte" (`/account/saved-recipes`, texts in `account/i18n.ts` like the other account pages). Guests see "Gespeichert auf diesem Gerät. Anmelden, …" in the filter tab. **Local testing:** run the dev server on port 3000 or 3001 — other ports are not in Payload's `csrf` list, so the login cookie is ignored for fetch calls there.
