# Home page redesign — new version vs simple version

**Status (verified 2026-11-02):** Two versions are online for the founders, built from the same staging DB. Rafaela has since met David and wants to go through what to KEEP and what to REMOVE. Nothing has changed since 2026-10-21: no new commits, staging untouched since 235be62 (13 Oct), Home content unchanged.

| Link | Code | Shows |
|---|---|---|
| https://fermentfreude-staging.vercel.app | `staging` @ 235be62 | Simple version (tempeh slider under hero) |
| https://fermentfreude-neu.vercel.app | `feature/product-showcase` @ 866f332 (pushed) | New version |

**Branch:** `feature/product-showcase` — 90 commits ahead of `origin/staging`, clean, all pushed. Nothing on `main`/production.

## Section inventory — go through this with Rafaela (keep / change / remove)

Order on the new version (staging Home layout):

| # | Section (block) | On simple? | What it is in the new version |
|---|---|---|---|
| — | Hero (`heroCinematic`) | yes | Founders photo; neu has hero parallax + bolder title. Copy is OLD ("Fermentieren sicher / Lerne von Expert") — someone reverted it 2026-10-08 |
| 1 | Product Showcase (`productShowcase`) | **no** | NEW. Huge word (TEMPEH) + floating product cut-out + ingredient layers, price, "Zum Produkt", index of 4 products (Käferbohnen, Klassischer, Berglinsen, Kimchi), benefit strip |
| 2 | Tempeh slider (`homeTempehStory`) | yes (it IS the simple one's product section) | Hidden automatically on neu when the showcase exists. Rafaela changed its pictures 2026-10-21 |
| 3 | Workshops (`workshopSlider`) | yes, older look | Big centred title, gold "Nächster Termin" date box, swipe capsule on phone/tablet |
| 4 | Voucher (`voucherCta`) | yes, older look | NEW gift slide: big GUTSCHEIN word, 99 €, voucher card + ingredient layers, points row |
| 5 | Feature cards (`featureCards`) | yes | unchanged |
| 6 | Event banner (`heroBanner`) | yes, older look | Full-screen event photo, B2B invite copy ("Wir bringen Fermentation zu euch.") |
| 7 | Fermentation Story (`fermentationStory`) | **no** | NEW. "Warum Fermentation?" swipe cards: GESUND, LEBENDIG, NATÜRLICH, ALLTAG, PROTEIN, EXPERTEN with Kittl chef cut-outs; only card 1 has a button |
| 8–11 | Team, Testimonials, Press, Sponsors | yes | Testimonials slide up over the team like a stacked card; sponsors on ivory |

David's ranking from 2026-10-09: **header (us) → workshops → product.** The new version puts the product showcase BEFORE workshops — needs a decision.
David's other feedback: prefers simple over heavy animation (customers found it sluggish/jumpy); no "next workshop" card in the header.

## Decisions (founders' feedback, relayed by Rafaela 2026-11-03)

Overall: too many animations, too much going on, site is confusing for the target group (older people) → SIMPLIFY. The NEW version (animations, showcase, pages sliding up from below, transitions) is the chosen base; the simple version is dropped.

- Product Showcase: only ONE product — Käferbohnen-Tempeh (drop the index of 4 products).
- Showcase gets a 2nd slide that leads to the workshops.
- Workshop slider (`workshopSlider`, the scrolling calendar) is REMOVED from Home; workshops live inside the showcase instead of their own section.
- Voucher stays.
- Navigation between showcase slides stays exactly as now (scroll stack + side index). Only change: 4 slides → 2: Käferbohnen-Tempeh + a "Workshops" slide whose button goes to `/workshops`.
- CODE DONE (uncommitted, tsc clean): `slideType` (product | workshops) + `linkUrl` added to ProductShowcase slides (config.ts, Component.tsx, Stack.tsx allows no picture). CONTENT NOT DONE: Home DB still has 4 product slides + workshopSlider block. DB is shared with the simple staging site → writing it changes that site too; needs Rafaela's OK. Workshops slide needs a picture decision.
- Still undecided: hero copy, Feature cards, Event banner, Fermentation Story, Team/Testimonials/Press/Sponsors, how far to tone down animations.

## Storytelling pass — DONE on localhost 2026-11-04 (uncommitted)

Founders liked the hero → kept (photo, two buttons); copy now about Marcel & David. Showcase rebuilt:
- Slide 1 Tempeh: background photo (tempeh on boards), product/ingredient cut-outs hidden via `showProductImages=false` (code + files kept), cream text on a dark shade (`textTone=light`, `backgroundVeil=30`), gold button.
- Slide 2 Workshops: lakto photo, charcoal text on ivory shade (`textTone=dark`, veil 35), **auto list of active workshops** from the Workshops collection with next date (gold on dark / charcoal on ivory) or `seasonalLabel`, one full-width button → /workshops. Trust strip hidden on this slide.
- Motion trimmed: no mouse parallax, no floating loops, big word rises per line (1.1 s) not per letter; stacking + scroll-lift kept.
- New admin fields on showcase slides: slideType, linkUrl, backgroundImage, textTone, backgroundVeil, showProductImages, seasonalLabel.
- Scripts (all staging-only): patch-home-showcase-workshops, -backgrounds, -tempeh-bg-only, patch-home-story-flow.
- Screenshot script: scratchpad `shots.mjs` (Playwright; accepts cookie banner, scrolls to each sticky panel's wrapper top).
- Rafaela edited Home in admin 2026-11-04 07:44 — her edits were preserved (scripts spread existing slide data).
- Untouched so far (open): voucher pinned gallery, fermentationStory 6 cards, testimonials lift, B2B heroBanner on Home, press/sponsors merge, hero copy wording ("Kulinarik trifft Wissenschaft") to confirm with founders.

- 2026-11-04 bug fixed: showcase `scroll-snap-type: y proximity` trapped wheel/trackpad scrolling at ~900px (page snapped back to each slide start). Snap logic + markers removed from Stack.tsx. Found with Playwright real wheel scroll (scratchpad `wheel.mjs`; `walk.mjs` = step-through + console errors). Lesson: test with mouse.wheel, not scrollTo.
- Known, not fixed: voucher pinned photo-wall zoom is ~3.8 screens of scroll; its full-screen centre tile (overhead B/W photo + F logo) looks soft; scroll-cue capsule over photos; dark B2B heroBanner directly after the gift slide; image `quality=90` console warnings (add 90 to next.config images.qualities).

- 2026-11-04: heroBanner got `mediaLayout` (side | background). Home = background (cinematic full-screen `/assets/videos/gastro-banner.mp4`, 1200×608 H.264, event photo = poster). Playwright Chromium can't play H.264 — test video with `webkit` (scratchpad `banner-wk.mjs`). `next.config.js` images.qualities [75, 90] added (silences quality warnings). Tailwind canonical-class warnings in Stack.tsx fixed on disk; VS Code panel was stale from an open tab.
- Photo wall: Rafaela wants length/behaviour/scroll cue unchanged. Softness = source files (gallery-*.webp 1024px wide, two 1024×269) — needs ≥1920px photos via admin.

- 2026-11-04: Gastro banner rewritten for professional kitchens (source: founders' "Preisliste Käferbohnentempeh 2026" PDF): "Für Gastronomie & Profiküchen / Steirischer Tempeh für eure Küche." + new `points` array (3 offer points: Tempeh / Schulungen / Verkostungen). Script `patch-home-gastro-banner-copy.ts`. Open: add the "Kennenlern-Angebot 50 % ab 2 kg" hook? (not added — commercial promise, needs founders' OK).

- 2026-11-04 bug fixed: links from far down Home opened the next page at its bottom (e.g. banner → /gastronomy landed on #contact). Cause: GSAP ScrollTrigger cached Home's scrollY; ScrollTriggerRefresh's refresh() on the new page restored it. Fix: `src/components/ScrollToTopOnNavigate` (in app layout): on pathname change (not back/forward, not #hash) → clearScrollMemory + scrollTo(0) + ScrollTrigger.update(). Back button still restores Home position (verified). Also `data-scroll-behavior="smooth"` on <html>. Banner button = "Alles für Köche" → /gastronomy (that IS the "Für Köche" nav page).

## SHIPPED TO STAGING 2026-11-04
Commits 9214248 (Home) + b171975 (scroll fix) → PR #163 merged into `staging` (merge commit 67b8c06, branch kept for the neu preview). GitHub had an incident during the merge (branch moved, but PR stayed OPEN and no webhook → no Vercel build). At Rafaela's request the staging build was created via API: POST /v13/deployments?teamId=team_sqsbaXpYRZmSFiMYKJXlEwf0 with project prj_fD6aVgCkfkE7Sr182Lz5oUh7488n, customEnvironmentSlugOrId env_U1OFf2KJ63bkokH5O2n5fWM0IMmp, gitSource {github, repoId 1156161473, ref staging, sha}. → dpl_Aj31HjMPHJwaJUuzTgD4WHGrfX7M READY, aliased to fermentfreude-staging.vercel.app, revalidated, new Home verified live. The "never save Home in the staging admin" gotcha is OVER — staging admin now has the new schema. Nothing on `main`/production.

**After the staging deploy (2026-11-04, local only, uncommitted):** big words sized per slide (shared size made both tiny on 1280×720: 72px → ~195px); Workshops slide desktop = text+button left, list right; date labels black/white; new field `workshopsToShow` (hasMany → workshops) set to Tempeh, Lakto, Kombucha via `patch-home-showcase-three-workshops.ts`. Staging's deployed code doesn't know `workshopsToShow` yet → staging still lists all 4 until next deploy.

**Also local/uncommitted:** Tempeh slide content centred on phone (no gap), trust badges moved from the bottom strip to small labels under the button; StackPanel got `hold` (marginBottom in svh = pause before the next panel covers) — showcase uses SLIDE_HOLD 0.4, side index math uses the same constant.

**Next feature (new session): Gutschein / voucher** — the voucher gift slide on Home (`src/blocks/VoucherCta`: GiftSlide.tsx, pinned photo-wall zoom; keep its length/behaviour/scroll cue unless Rafaela says otherwise) AND the Gutschein page itself. Start a new memory file `voucher-redesign.md`; this file can be folded into docs + deleted once Home is on main.

## Next step

Walk Rafaela through the table above section by section, record KEEP / CHANGE / REMOVE for each, then plan the work: remove what's dropped (code + content), reorder, and decide whether this branch (or a cleaned-up cut of it) goes to staging. Ask before any push / PR / merge / redeploy.

## Open questions (founders / Rafaela)

- Which new sections survive, and in what order (see David's ranking above)
- Hero copy: keep the old reverted text or re-apply the 2026-10-08 copy ("Lerne von den Experten.")
- "Bio" wording on tempeh/kimchi — certification (AT-BIO code) to confirm before prod
- Product `klassischer-tempeh` (staging): no ingredients/allergens yet — contains soy
- Voucher gift-slide card shows code `FF-GIFT-99-EUR` — confirm it's not a real redeemable code
- Not this feature, but raised by David and still open: wrong location on the workshop ticket (shows Marktgarten instead of Ginery; reminder email is right), remove the ticket from emails, voucher email says "valid 1 year" (no expiry), one customer's Visa payment failed, workshop location hard to find on the site

## Files touched (vs staging)

`src/blocks/ProductShowcase/*`, `src/blocks/FermentationStory/*`, `src/blocks/VoucherCta/*`, `src/blocks/WorkshopSlider/*`, `src/blocks/HeroBanner/*`, `src/blocks/RenderBlocks.tsx`, `src/heros/HeroCinematic`, `src/components/{SwipeCapsule,StoryScene,StackPanel,SectionHeader,ScrollCue,ParallaxPanel}`, `src/app/(app)/[slug]/page.tsx` (hides tempeh slider when showcase exists), `src/collections/Pages/index.ts`, `public/{showcase,fermentation,voucher}`, scripts `build-showcase-images.ts` / `build-voucher-images.ts`. Admin schema changes are additive only.

## Gotchas

- **Never save Home in the STAGING admin** until this branch is merged. Its old schema dropped productShowcase + fermentationStory AND new fields inside voucherCta (giftSlide), workshopSlider (headings/date labels), heroBanner (eyebrow) on 2026-10-21. Edit Home only at https://fermentfreude-neu.vercel.app/admin. Last full good version: `_pages_versions` 6ad1ad4afc721e6691295a99 (2026-10-16).
- Refreshing the neu site after new commits: see auto-memory `project_neu_preview_site` (Vercel previews are disabled; build via API, then alias — alias needs Rafaela's OK).
- Script writes to the DB skip cache refresh → GET `/api/revalidate-pages` on BOTH staging and neu.
- Fermentation cards, final design: desktop = text top left, GESUND apple at the word (`aroundWord` in layers.ts), other pictures under the word at 2/3 of its width; phone/tablet = everything centred; background #FAF2E0. Rafaela rejected centring desktop.
- Before any content write, check Home `updatedAt` — Rafaela edits in admin concurrently.

**2026-11-04 — Tempeh points:** trustPoints now max 3 rows, each `text` (title) + optional `detail`; rendered WITHOUT numbers (Rafaela: no numbers) with gold hairline (chefs-banner look); copy = Aus nur 3 Zutaten / Vakuumiert, 6 Wochen haltbar · Proteinreich · Vegan & Bio / 100 % pflanzlich (her words only, no invented ingredient lines). Desktop side index (ProductIndex) removed at her request under the button, `lg:w-xl`; `detail` hidden on screens < 700px tall. Staging copy written by `src/scripts/patch-home-showcase-trust-points.ts` (DE then EN, same row IDs). Not committed yet.

**2026-11-04 — one points style for the whole page:** new `src/components/PointsRow` (icon in a round outline + bold title + quiet line, hairline above, no numbers; tone light/dark; phone 'grid' | 'list') used by ProductShowcase trustPoints, HeroBanner points, VoucherCta giftSlide.points, FermentationStory benefits. Shared icon select `src/fields/pointIcon.ts` (21 icons) in all four configs. Icons set in staging by `src/scripts/patch-home-point-icons.ts` (Tempeh: bean/muscle/vegan; chefs: chefHat/graduationCap/utensils). Old numbered chefs list, old GiftSlide PointIcon/JarIcon/BowlIcon and FermentationStory BenefitIcon removed. Tailwind canonical-class warnings in HeroBanner/GiftSlide/FermentationStory fixed. Not committed.

**2026-11-04 (later) — Tempeh slide copy + hero colours:** HeroCinematic eyebrow gold, headline ivory. ProductShowcase: new slide fields `subline`, `buttonNote`; block field `trustPointsTitle`; product slides render the name as an editorial headline (2xl–[2.125rem]); product slide with points = two columns on desktop (text left, points right); points row hidden under 700px tall (iPhone SE) — product page has the steps. PointsRow: `heading`, `listAll` props; icons `slice`, `droplets` added. Staging copy via `src/scripts/patch-home-tempeh-slide-copy.ts` (eyebrow "Fermentierte steirische Käferbohnen", headline "Regional. Innovativ. Vielseitig.", founders' paragraph, Zubereitung steps Schneiden/Anbraten/Würzen, note "Vakuumiert & gekühlt / 6 Wochen haltbar"). FermentationStory compact benefits centred (`mx-auto max-w-88 sm:max-w-120`). Not committed.
- Later same day: slide counter "01 / 02" removed (pad/count gone). Product slide with points on desktop: full-width grid, text column `lg:max-w-lg` (editorial measure, leading 1.65), points column 26rem at the far right. Forced line breaks in the paragraph were tried and rejected by Rafaela — keep one flowing paragraph. Weight line ("185 g | 1 Packung") hidden when a buttonNote is set.

**2026-11-04 — Gutschein slide redesigned** (`src/blocks/VoucherCta/GiftSlide.tsx` rewritten): built like the showcase slides. New giftSlide fields `backgroundImage` (upload), `headline`, `buttonNote`; `bigWord` only shows when there's no picture. The picture sits in-flow on top (object-contain, flex-1) — a line illustration as a full-bleed background behind text was tried and made text unreadable on desktop. Text bottom left (label, editorial headline, paragraph, price, black button), PointsRow at the far right (36rem). Paper colour #F9F2E0 = the illustration's own paper (`GIFT_PAPER`, also used by the shell in Component.tsx). Old floating layers (jar/ingredients/card), pointer float and fit-size word removed from the slide; `VOUCHER_LAYERS.card` only used as JSON-LD image fallback. Staging: `src/scripts/patch-home-voucher-slide.ts` uploaded `home-gift-slide-gutschein.webp` (from ~/Downloads/voucher_FermentFreude - Artboard 2.jpg, HEAD 200) and wrote DE/EN copy + 3 points (shieldCheck/box/clock). Headline "Ein Erlebnis zum Verschenken." is mine — Rafaela to confirm. Not committed.
- Hero photo (REVERTED same day — Rafaela wants the original hero-cinematic-1.webp; `--restore` flag does this): the script uploaded `home-hero-marcel-david.webp` (from ~/Downloads/Fermentfreude Team 1200x800 bearbeitet_Qualität Hoch Canva (1).png, HEAD 200) and set it on hero.cinematicSlides[0]. Old hero-cinematic-1.webp (6abf67490b4dfda4993c24b5) left untouched. Source is only 1200px wide — slightly soft full-screen on desktop; ask for a larger export if they want it crisper.
- Tempeh slide background → founders' existing media doc "Käferbohnentempeh gebraten mit Kimchi im Hintergrund_1200x800.webp" (6a8ff817535d83e4ba524a76) via `src/scripts/patch-home-tempeh-slide-bg.ts`. Previous bg (6aea03cbf1443fcba67e4aa7, home-showcase-bg-tempeh.webp) left in the library.
- Gutschein slide: new `pictureLayout` field (top | background). Staging now uses the clinking-glasses photo full-background (`patch-home-voucher-slide-photo.ts`, media home-gift-slide-cheers.webp from the 5308px original, HEAD 200; the selfie photo home-gift-slide-friends.webp was used before and is unused now), bigWord GUTSCHEIN/VOUCHER placed low (mt-auto) so it never covers faces; shell colour via `giftSlideColor()`. Illustration media (6aeb3a391cbb15eb408573f8) left in library.
- Workshops slide: new background `home-showcase-bg-workshops-pan.webp` (~/Downloads/4 (2).jpg, 1000px) + textTone light, veil 35 (`patch-home-workshops-slide-bg.ts`). Date pills: cream/black on dark photo, black/white on light.
- FINAL for today: Tempeh slide bg = pan photo (home-showcase-bg-workshops-pan.webp, `patch-home-tempeh-slide-bg-pan.ts`). Workshops slide restored to the studio photo (6aea040f35c9915903ef4ab2) with textTone dark (`patch-home-workshops-slide-bg.ts --restore`). Rafaela may still send a new Workshops photo.
- Workshops slide bg → studio workshop photo `home-showcase-bg-workshops-studio.webp` (~/Downloads/FF-Vorschau-60.jpg, 1500×1000, HEAD 200), textTone dark (cream veil 35). Script `patch-home-workshops-slide-bg.ts` now points at this file. At 1440×900 the big WORKSHOPS word touches Marcel's chin — offered to lower the word.
- Team section portraits → `team-david-portrait.webp` / `team-marcel-portrait.webp` (~/Downloads/David.jpg, Marcel.jpg; white bg) via `patch-home-team-photos.ts`, matched by member name. First Marcel upload 404'd on R2 → deleted that unreferenced doc, re-ran → HEAD 200. Old portraits (69b207a5…, 69b207a6…) still in library + still used by the old hero slider data.
- OPEN: EN locale has the names misspelled: "David Heider", "Marcel Rauminger" (DE: Haider, Raunnigger). Asked Rafaela before fixing. David's photo has more white space on top → heads sit at different heights on desktop; offered to trim.
- Press banner (Home): new `image` field per slide; shown as a 3:2 rounded picture beside the sentence (sm+), above it on phones. Staging: `patch-home-press-slide-images.ts` copies each article's picture from the /presse page (matched by URL) — no uploads. Copy (heading/sentences) unchanged on purpose. Open: the press pictures have the outlet logo baked in, so the logo row repeats it — offered to hide the logo row when a picture is set.

**2026-11-04 (evening) — admin cleanup + polish (local, uncommitted):**
- Admin, Home only: block picker limited to the 9 Home blocks (`HOME_BLOCKS` + any block already on the page, via `layout.filterOptions` in Pages/index.ts); hero style select shows only Cinematic (`filterOptions` in fields/hero.ts). Other pages unchanged. Clearer block names (Showcase slides, Voucher — photo wall + gift slide, Big banner, Team, Testimonials, Press slider, Sponsors & partners; old Product Story Carousel marked "old — not shown").
- VoucherCta config reordered: photo wall → gift slide → old text-panel fields, which hide while giftSlide.enabled (they aren't rendered then). Showcase: cut-out picture row hides when "Show the product picture" is unticked (validate accepts that). Press slide logo field hides when a picture is set; Component hides the logo row then.
- Photo wall bug fixed (globals.css): on phones 3×32.5vw + 2×1vh gap was wider than the screen → outer photos cut off. Gap now `min(1vh, 1.25vw)`, columns `(100vw − 4·gap)/3`; open rows `(100vh − gap)/2` (centre photo exactly one screen). Desktop sizes unchanged.
- Press slider: slides stacked in one grid cell (no height jump on autoplay), inactive slides `inert`.
- Audit (scratchpad audit.mjs, 5 sizes): no sideways overflow, no broken images, no console errors. Newsletter pop-up locks scroll mid-page — expected.
- Gift slide picture was swapped in admin at 20:36 UTC to `gutschein.webp` (studio jars photo); its alt text still describes the clinking glasses — told Rafaela, not changed.
- OPEN: remove the hidden `homeTempehStory` block from Home content? (asked)
- Old Tempeh carousel (`homeTempehStory`) REMOVED from Home content at Rafaela's request ("for now") + gift photo (gutschein.webp) alt updated to the studio photo — `src/scripts/patch-home-remove-tempeh-carousel.ts`. Copy of the block (DE+EN): /var/folders/2n/32k9yfbn16s790_vwylpgxj40000gn/T/home-tempeh-carousel-1793826693656.json → `--restore <file>` puts it back; also in Payload version 6aeb98b3d05627d9d4ef5355.
- INCIDENT 21:11–21:13 UTC: that write UNPUBLISHED Home (404 on localhost + staging). Cause: an admin autosave draft (20:42) existed; Payload's update builds on the latest draft and saved Home as draft. Fixed with `src/scripts/check-home-status.ts --publish` after diffing draft vs published (only diff: hidden Tempeh cut-out productImage → null). Script now refuses when a newer draft exists. GOTCHA for every Home patch script: check for an admin draft first.

## SHIPPED TO STAGING 2026-11-04 (2nd round)
Commit 9bb853f → PR #163 (was still open from the GitHub incident) re-titled + merged → merge commit 732144e on `staging`. Vercel webhook worked this time (deployment 7558223049, success). Revalidated; live staging Home verified (gift headline, Tempeh headline, press pictures, photo wall), /admin 200. Nothing on `main`/production. fermentfreude-neu.vercel.app NOT refreshed (needs API deploy + alias, ask first).

**2026-11-05:** Voucher page work moved to its own branch `feature/voucher-page` + note `.claude/memory/voucher-redesign.md`. This file can be folded into docs + deleted once Home is on main.

**2026-11-10 — David's copy (Drive doc "Home Page Content_Fermentfreude Website 06-11-2026_edited", edited 2026-11-07, direct edits, no suggestions/comments):** written to staging by `src/scripts/patch-home-copy-2026-11.ts` (DE+EN, rollback = Payload version 6aeb9ff59e9c7a9fbbbf18a0). Hero, Tempeh text + Zubereitung, Workshops text, Gutschein slide, gastro banner (button "Mehr erfahren", new points: vegan/bean/graduationCap icons), Fermentation intro + 3 benefits (3rd = Verdaulichkeit, bowl icon), cards LEBENDIG/NATÜRLICH/GESCHMACK, PROTEIN + EXPERTEN removed, team paragraph. Tempeh buttonNote cleared → weight line "185 g | 1 Packung" shows again. Benefits column widened (FermentationStory `w-[min(40rem,46vw)]`). NOT done: price 6,40 € in his doc (product priceInEUR = shop price, staging 5,90 €) — needs founders/Rafaela decision. Branch `content/david-copy-home-voucher`, uncommitted.
