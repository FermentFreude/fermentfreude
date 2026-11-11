# Fermentfreude Brand System

Self-contained brand reference — paste this into any AI design prompt (Claude's artifact/design skills, a new project's system prompt, etc.) so generated work matches Fermentfreude's actual identity instead of a generic placeholder.

Source of truth in code: `src/app/(app)/globals.css`. Token-usage rules (typography scale, spacing scale as Tailwind classes) live in `docs/DESIGN_SYSTEM.md` — this file adds the colors and brand fundamentals that doc doesn't cover, plus a portable summary of both.

---

## 1. Brand in one paragraph

Fermentfreude is a fermentation workshop and product studio — warm, earthy, artisanal, slightly premium. The palette is built on ivory/cream neutrals with charcoal and near-black for contrast, warmed up by a muted gold accent. One saturated exception: a deep burgundy used only for the shop/product line. Typography is Neue Haas Grotesk exclusively — a clean, confident grotesque, never a geometric sans like Inter or Geist, never a system font. The overall feel: natural, handcrafted, unfussy — closer to a specialty food brand's print materials than a typical SaaS product.

---

## 2. Color palette

### Core brand colors (fixed — use these exact hex values regardless of light/dark mode)

| Swatch | Name | Hex | Use |
|---|---|---|---|
| 🟨 | `ff-ivory` | `#F9F0DC` | Primary background — warm off-white, the site's dominant surface |
| 🟨 | `ff-ivory-mist` | `#FAF2E0` | Secondary background, subtle variation on ivory |
| ⬜ | `ff-cream` | `#FFFEF9` | Card/panel surfaces, near-white |
| ⬜ | `ff-warm-gray` | `#ECE5DE` | Muted backgrounds, dividers on ivory |
| ⬜ | `ff-border-light` | `#E8E4D9` | Hairline borders on light surfaces |
| ⬛ | `ff-charcoal` | `#4B4B4B` | Primary text on light, secondary dark surface |
| ⬛ | `ff-charcoal-dark` | `#403C39` | Deeper charcoal surface (splash screen, footers) |
| ⬛ | `ff-charcoal-hover` | `#333333` | Hover state for charcoal buttons |
| ⬛ | `ff-near-black` | `#1A1A1A` | Highest-contrast text/background |
| ⬛ | `ff-black` | `#1D1D1D` | Near-black alternative |
| ⬛ | `ff-dark` / `ff-dark-deep` | `#1E1E1E` / `#1B1B1B` | Dark UI surfaces |
| ⬛ | `ff-gray-15` | `#262626` | Dark surface variant |
| 🟫 | `ff-gray-text` | `#595959` | Body text, secondary emphasis |
| 🟫 | `ff-gray-text-light` / `ff-text-muted` | `#6B6B6B` | Muted/caption text |
| 🟫 | `ff-gray-muted` | `#626160` | Muted UI text |
| ⬜ | `ff-white-95` | `#F1F1F3` | Near-white on dark surfaces |
| 🟡 | **`ff-gold`** | `#E6BE68` | **Primary accent** — CTAs, highlights, dividers, icons |
| 🟡 | `ff-gold-light` | `#EDD195` | Lighter gold, hover/tint states |
| 🟡 | `ff-gold-accent` | `#E5B765` | Alternate accent gold |
| 🟡 | `ff-gold-accent-dark` | `#D4A654` | Gold hover/pressed state |
| 🟢 | `ff-olive` | `#4B4F4A` | Secondary accent — used sparingly (e.g. hero panels) |
| 🟢 | `ff-olive-dark` | `#3A3E3A` | Darker olive variant |
| 🔵 | `ff-navy` | `#091638` | Rare deep accent, high-contrast dark |
| ⬜ | `ff-card-gray` | `rgba(193,193,193,0.65)` | Translucent card overlay |
| ⬜ | `ff-sponsor-placeholder` | `#D9D2CB` | Placeholder tone for logo/sponsor slots |

### Shop sub-palette (product line only — this is the one saturated exception)

| Swatch | Name | Hex | Use |
|---|---|---|---|
| 🔴 | `ff-shop-burgundy` | `#980C00` | Shop primary accent — add-to-cart, price emphasis |
| 🔴 | `ff-shop-burgundy-hover` | `#680C00` | Shop accent hover/pressed |
| 🟨 | `ff-shop-cream` | `#F0ECDB` | Shop background variant |

**Rule of thumb:** ivory/cream/charcoal/gold everywhere; burgundy *only* in shop/product/cart contexts, never as a general site accent.

### Semantic UI tokens (theme-aware — shift between light/dark automatically, used for UI chrome/admin, not brand surfaces)

These are OKLCH and defined for both a light and a dark mode (`[data-theme='dark']`). Use them for functional UI state, not for brand expression.

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `background` / `foreground` | white / near-black | near-black / white | Base page surface + text |
| `border` / `input` | `oklch(92.2% 0 0)` light gray | `oklch(26.9% 0 0)` dark gray | Structural lines |
| `success` | `oklch(78% 0.08 200)` teal-green | `oklch(28% 0.1 200)` | Positive state |
| `warning` | `oklch(89% 0.1 75)` amber | `oklch(35% 0.08 70)` | Caution state |
| `error` / `destructive` | `oklch(75% 0.15 25)` red | `oklch(45% 0.1 25)` | Error/destructive state |

### Quick palette for AI-generated visuals (charts, diagrams, mockups)

If asked to design something brand-aligned without deep context, default to this reduced set:

- **Background:** `#F9F0DC` (ivory) or `#FFFEF9` (cream) for surfaces
- **Primary text:** `#1A1A1A` / `#4B4B4B`
- **Muted text:** `#6B6B6B`
- **Accent / CTA / highlight:** `#E6BE68` (gold)
- **Borders/dividers:** `#E8E4D9`
- **Secondary accent (sparing use):** `#4B4F4A` (olive)
- **Shop-only accent:** `#980C00` (burgundy) — do not use outside shop/product/checkout contexts

---

## 3. Typography

**Font family:** Neue Haas Grotesk (via Adobe Typekit), two weights of the family mapped to two roles:

| Role | CSS variable | Font | Used for |
|---|---|---|---|
| Body | `--font-sans` | `neue-haas-grotesk-text` | Body copy, paragraphs, UI labels |
| Display | `--font-display` | `neue-haas-grotesk-display` | Headings (h1–h6), nav, buttons, hero text |

**Never substitute** Geist, Inter, system-ui, or any other sans-serif — this is a hard rule, not a preference.

### Type scale (fluid, `clamp()`-based — scales smoothly across viewport, no manual breakpoint chains)

| Style | Size | Line-height | Letter-spacing | Weight | Use |
|---|---|---|---|---|---|
| Hero | `clamp(1.5rem, 4vw+0.5rem, 3.25rem)` | 1.08 | -0.025em | 700 | Full-viewport hero headlines |
| Display | `clamp(2rem, 3.5vw, 3rem)` | 1.1 | -0.025em | 700 | Page titles (h1) |
| Heading | `clamp(1.5rem, 2.5vw, 2.25rem)` | 1.15 | -0.02em | 700 | Section headings (h2) |
| Subheading | `clamp(1.25rem, 2vw, 1.625rem)` | 1.25 | -0.015em | 700 | Subsection headings (h3) |
| Title | `clamp(1.125rem, 2vw, 1.5rem)` | 1.3 | -0.01em | 700 | Card titles (h4) |
| Body large | `clamp(1rem, 1vw+0.25rem, 1.25rem)` | 1.6 | normal | 400 | Intros, descriptions |
| Body | `1rem` | 1.6 | 0.005em | 400 | Default paragraph text |
| Body small | `0.875rem` | 1.5 | normal | 400 | Secondary text |
| Caption | `0.75rem` | 1.4 | normal | 400 | Metadata, timestamps |
| Eyebrow | Caption size | — | 0.15em, uppercase | 400–700 | Small label above a heading |

**Headings are always Display weight/family (700, bold)** — the site has no light or regular heading weight.

---

## 4. Spacing & layout rhythm

Fluid `clamp()`-based scale — pick the token, don't hand-write breakpoint-specific values.

**Section vertical padding:** sm `3–4rem` → md `4–6rem` → lg `4–5.5rem` → xl `5–7rem`
**Container horizontal padding:** `1.5–4rem`
**Content gaps:** xs `0.5–0.75rem` → sm `0.75–1rem` → md `1–1.5rem` → lg `1.5–2rem` → xl `2–3rem`
**Max content widths:** narrow `42rem` (reading) · medium `56rem` (sections) · wide `72rem` (grids) · full `86rem`

**Breakpoints:** sm `40rem` · md `48rem` · lg `64rem` · xl `80rem` · 2xl `86rem`

---

## 5. Border radius

Soft, rounded — never sharp corners on cards or buttons.

| Token | Value | Use |
|---|---|---|
| sm | `0.375rem` | Inputs, small elements |
| md | `0.625rem` | Buttons, badges |
| lg | `1rem` | Cards |
| xl | `1.5rem` | Large cards |
| 2xl | `2rem` | Feature cards |
| card (custom) | `1.75rem` | Standard content card |
| pill | `9999px` | Pills, tags, nav bar |

---

## 6. Logo & assets

- Primary logo: `primary-logo.svg` · Secondary/wordmark: `secondary-logo.svg` / `.png` · Icon mark: `icon-logo.svg` · Favicon: `favicon.svg`
- Icon mark appears as a subtle corner watermark on legal/document pages (`icon-logo.svg`, low opacity, drop-shadow)

---

## 7. Non-negotiable rules (design-relevant subset)

1. Every visible text is editable content — don't assume copy is final/hardcoded.
2. Fonts: Neue Haas Grotesk only, `font-sans` for body / `font-display` for headings, nav, buttons. Never Geist, Inter, or system fonts.
3. No image available → fall back to a flat `#ECE5DE` (`ff-warm-gray`) block, never a broken image icon or generic gray.
4. Bilingual site (German default, English secondary) — design should tolerate ~20–30% text-length variance between languages.
5. Burgundy (`#980C00`) is shop-only. Gold (`#E6BE68`) is the general-purpose accent everywhere else.
6. Corners are always rounded (see radius scale) — no sharp 0px corners on cards, buttons, or panels.

---

## 8. Copy-paste summary (minimal version for tight prompt budgets)

```
Brand: Fermentfreude — warm, earthy, artisanal fermentation studio.
Fonts: Neue Haas Grotesk only (Text=body, Display=headings/nav/buttons). Never Inter/Geist/system fonts.
Colors: ivory #F9F0DC / cream #FFFEF9 backgrounds · charcoal #4B4B4B / near-black #1A1A1A text ·
        gold #E6BE68 accent (primary, general use) · olive #4B4F4A (secondary accent, sparing) ·
        border #E8E4D9 · muted text #6B6B6B.
        Shop-only accent: burgundy #980C00 (never use outside shop/cart/checkout).
Shape: soft rounded corners everywhere (1–1.75rem radius on cards), pill-shaped buttons/tags.
Type scale: fluid clamp()-based, bold display weight on all headings, generous line-height (1.5–1.6 body).
Tone: premium but unfussy — closer to specialty food branding than SaaS.
```
