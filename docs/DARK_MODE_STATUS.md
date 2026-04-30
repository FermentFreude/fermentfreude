# Dark Mode — Work in Progress

> Branch: `feature/dark-mode-fix`
> Last commit: `55fa0d4`
> Status: **PAUSED** — partial implementation. Resume when ready.

---

## What works today

### Mechanism
- `data-theme='dark'` is set on `<html>` by the `ThemeProvider`
- Tailwind v4 custom variant: `@custom-variant dark (&:is([data-theme='dark'] *))` — line 6 of `globals.css`
- So `dark:` classes in JSX map to "descendant of `[data-theme='dark']`", NOT `prefers-color-scheme`

### Brand tokens (CSS variables) ✅
All `--ff-*` tokens now have dark overrides inside `[data-theme='dark']` block in `src/app/(app)/globals.css`.
Any component that uses `bg-ff-ivory`, `text-ff-near-black`, etc. **adapts automatically** — no JSX changes needed.
Gold (`--ff-gold`, `#e6be68`) is intentionally **unchanged** — looks good in both modes.

### Header ✅ (was already done before this session)
- `src/components/Header/index.client.tsx` — nav links, burger, logo all have `dark:` classes
- `src/components/Header/index.css` — `.nav-glass` and `.dropdown-glass` have `[data-theme='dark']` overrides

### Footer ✅ (done this session)
- `src/components/Footer/index.tsx` — all dark: classes added
- `src/components/Footer/FooterBrand.tsx` — brand name, back-to-top button
- `src/components/Footer/NewsletterForm.tsx` — form border, placeholder

### Legal pages ✅ (done this session)
CSS class overrides added to `globals.css` for `.page-legal`, `.legal-richtext`, `.legal-content-block` — covers all legal/privacy/terms pages.

### Blocks — partially done
| Block | File | Status |
|---|---|---|
| FeatureCards | `src/blocks/FeatureCards/Component.tsx` | ✅ Done |
| OurStory | `src/blocks/OurStory/Component.tsx` | ✅ Done |

---

## What still needs to be done

### Blocks — not started
All need `dark:bg-[#111111]` on sections, `dark:bg-[#1a1a1a]` on cards, `dark:text-white` on hardcoded dark text.

| Block | File | Key issues |
|---|---|---|
| TeamCards | `src/blocks/TeamCards/Component.tsx` | section `bg-white`, article card `bg-white` |
| WorkshopPhases | `src/blocks/WorkshopPhases/Component.tsx` | section `bg-white` |
| CollectionGrid | `src/blocks/CollectionGrid/Component.tsx` | section `bg-white`, placeholder `bg-[#ECE5DE]` |
| WorkshopSlider | `src/blocks/WorkshopSlider/Component.tsx` | outer `bg-white`, mobile cards `bg-white`, desktop sticky `bg-white` |
| ShopHero | `src/blocks/ShopHero/Component.tsx` | section `bg-white`, heading `text-[#1a1a1a]`, buttons, labels |
| ShopProductGrid | `src/blocks/ShopProductGrid/Component.tsx` | product image bg `bg-white`, placeholder `bg-[#ECE5DE]` |
| ShopProductList | `src/blocks/ShopProductList/ShopProductListClient.tsx` | filter button, product card, image bg |
| ProductQuickView | `src/blocks/ShopProductList/ProductQuickView.tsx` | modal `bg-white`, close button, image bg |
| OnlineCourseSlider | `src/blocks/OnlineCourseSlider/Component.tsx` | card `bg-white shadow-sm ring-1 ring-ff-border-light` |
| ReadyToLearnCTA | `src/blocks/ReadyToLearnCTA/Component.tsx` | inner card `bg-[#F9F0DC]`, close button, form area |
| ContactBlock | `src/blocks/ContactBlock/Component.tsx` | many `bg-white` — inputs, icons, social buttons |
| ProductSlider | `src/blocks/ProductSlider/Component.tsx` | placeholder `bg-[#ECE5DE]` |
| FeaturedProductCards | `src/blocks/FeaturedProductCards/Component.tsx` | rating badge `bg-white` |
| CourseWaitlistCta | `src/blocks/CourseWaitlistCta/Component.tsx` + `CourseWaitlistCtaInner.tsx` + `WaitlistForm.tsx` | placeholder, overlay badge, form card, input row |

### Pages — not started
- `src/app/(app)/account/` — all account pages, orders, settings
- `src/app/(app)/[slug]/` — workshop detail, fermentation, courses, tipps
- Shop pages, cart drawer, checkout
- Auth pages (login, register, reset password)

### Other components — not started
Run this grep to see current state:
```bash
grep -rn "bg-white\|bg-\[#\|text-\[#" src/components --include="*.tsx" | grep -v "dark:" | grep -v "node_modules"
```

---

## Color mapping reference

| Light value | Dark replacement | Use case |
|---|---|---|
| `bg-white` | `dark:bg-[#111111]` | Page sections |
| `bg-white` | `dark:bg-[#1a1a1a]` | Cards, modals, inputs |
| `bg-[#ECE5DE]` | `dark:bg-[#2a2a2a]` | Image placeholders |
| `bg-[#F9F0DC]` | `dark:bg-[#1a1a1a]` | Cream/ivory card backgrounds |
| `text-[#1d1d1d]` / `text-[#1a1a1a]` | `dark:text-white` | Body text, headings |
| `text-[#262626]` | `dark:text-white/90` | Slightly muted text |
| `text-[#999]` / `text-gray-400` | `dark:text-white/50` | Muted / secondary text |
| `border-[#1d1d1d]` | `dark:border-white/20` | Borders |
| `border-[#ECE5DE]` | `dark:border-white/10` | Subtle borders |
| Gold `#e6be68` / `#E5B765` | **UNCHANGED** | Always looks good |
| Blue `#1a3f8a` (links) | `dark:text-[#93b4ff]` | Accessible link color in dark |

---

## Key rule: never touch light mode

Only add `dark:` classes — never change existing light mode classes. The goal is purely additive.

---

## How to resume

1. `git checkout feature/dark-mode-fix`
2. Start with `TeamCards` (it was mid-read when paused) — section and article card
3. Work through the block list above in order
4. After blocks: pages and components
5. Final check: `npx tsc --noEmit`
6. PR `feature/dark-mode-fix` → `staging`
