# Rezepte (/rezepte)

Recipe library built from David's brief (Nov 2026), with the look of Rafaela's Kitchen Lab prototype: recipes first, four categories, every recipe on its own URL with the same template, managed in Payload, SEO + recipe data generated automatically, optional sponsored partner block.

**Design:** brand palette only — Cream #FAF2E0, Charcoal #2D2F2C, Sage #B0C7B8, Mustard #E6BE68. Category colours: Gemüse fermentieren = Sage, Einlegen = Cream, Tempeh = Charcoal, Kombucha = Mustard (`PALETTE` / `theme` in `categories.ts`).

**/rezepte (after David's feedback, 18 Nov 2026):** hero = one cinematic recipe photo (the "Rezept der Woche" from Rezepte-Seite → Hero, else the first featured recipe with a photo) with a dark layer and light text: headline "Aus dem Glas. Auf den Teller." (second line in gold), search and "Beliebt" bottom-left, small "Rezept der Woche · <name> →" pill top-right (hidden on phones), slow zoom on the photo · search + "Beliebt" · "Was setzt du heute an?" with 4 compact category cards (photo + name, no counts, 2 per row on phones) · "Was setzt du heute an?" cards show the name centred under the photo, no arrow · "Frisch aus der Küche": one swipeable filter line, recipes as photo + centred name only (no category/time/button), 2 per row on phones (even grid), 3 on tablet/desktop with the middle column staggered lower (photo-wall rhythm), 6 then "Mehr Rezepte zeigen" (no count) · page ending (same on overview, category and recipe pages, `closing.tsx`): the workshop block only — photo + "Lieber gemeinsam fermentieren?" + "Termine ansehen". The time shows only inside the recipe (David).

**Recipe page:** top = breadcrumb, title, mustard rule, short description, partner line ("In Kooperation mit **Marke**") and a 2×2 facts box with line icons (clock, calendar, jar, 1–3 difficulty bars) + "Rezept drucken" on the left, photo on the right (4:5; phones: title → photo 4:3 → facts) · ingredients card (vessel with jar icon, "Antippen zum Abhaken" hint, square checkboxes — tap a line to tick it off, plain checkbox, no script) | ferment timeline with small dots + "Was du bemerkst" list (recipe field `fermentLog`: day + text, DE/EN, only shown when fermentation days are set) and the ready-on date (`ReadyOn.tsx`: today + fermentation days in the visitor's browser, text from template word `readyOnText` with `{datum}`) · note card "Warum es funktioniert" (paper card with tape, quote, photo + name + role from Rezepte-Seite → **Notiz-Karte**, defaults `NOTE_DEFAULTS`) · steps (a step photo sits beside the text from tablet up) · numbered steps · tips · partner box · shop products · "Weitere Rezepte" (always 3: same category first, then others) · workshop block. Print (`PrintButton.tsx` + print CSS) keeps only title, facts, ingredients and steps.

**Category pages:** clean addresses `/rezepte/fermentieren`, `/rezepte/einlegen`, `/rezepte/tempeh`, `/rezepte/kombucha` (`category-view.tsx`, rendered by `[slug]/page.tsx` when the slug is a category). Old links `/rezepte?kategorie=…` redirect there permanently (308). A recipe can't take a category address: the collection's `beforeValidate` hook turns e.g. `kombucha` into `kombucha-rezept` (also for drafts, where Payload skips `validate`). All four are in the sitemap.

**Menu:** "Rezepte" / "Recipes" sits after "Shop" in the Header global (max. items raised from 6 to 7) and in the code fallback `src/components/Header/nav-defaults.ts`. Desktop nav gap is tighter between 1024–1280 px so 7 items fit on one line. **Production:** add the item in /admin → Header after deploying (the staging DB has it already).

**Home page teaser:** block `recipeTeaser` ("Rezept der Woche (Teaser)", `src/blocks/RecipeTeaser/`): big photo + recipe name + short description + "Zum Rezept" + "Alle Rezepte". Recipe = the block's own pick, else Rezepte-Seite → Hero → "Rezept der Woche", else the first highlighted recipe; no published recipe → section hidden. On staging it sits after the fermentation story. **Production:** add the block to the home page in /admin.

**Bulk import:** `/admin/rezepte-import` (link above the recipe list). Download the CSV template → one recipe per row (Zutaten one per line `60 g | Trauben | eine Handvoll`, `# Gruppe` starts a group; Schritte one per line, optional `Titel: Text`; Tipps one per line; Was du bemerkst one per line `Tag 1: …`) → upload the CSV (comma or semicolon) or paste rows from Google Sheets → preview → import. Creates **drafts** only, sequentially; rows whose URL already exists are skipped, never overwritten; photos are added afterwards. Parser `src/lib/recipeImport.ts` (tests: `tests/int/recipeImport.int.spec.ts`), server actions `src/components/admin/recipe-import/actions.ts` (admin check on every call), page `RecipeImportView.tsx` (shows "Nur für Admins" to others).

**Search:** `/rezepte?q=…` searches title, short description, keywords and ingredients (no extra service).

**Photos (staging only):** placeholders from the existing media library, assigned on the staging DB so the design can be reviewed. Replace with the real shoot in /admin.

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
