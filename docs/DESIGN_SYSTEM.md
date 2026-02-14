# FermentFreude Design System

All tokens are defined in `src/app/(app)/globals.css` as CSS custom properties.
They are the **single source of truth** — never hardcode font sizes, section padding, or spacing inline.

---

## Typography Scale

| Token               | CSS Variable         | Value                              | Usage                              |
| -------------------- | -------------------- | ---------------------------------- | ---------------------------------- |
| `.text-hero`         | `--text-hero`        | `clamp(1.5rem, 4vw + 0.5rem, 3.25rem)` | Hero section headlines         |
| `.text-display`      | `--text-display`     | `clamp(2.25rem, 5vw, 4rem)`       | Page titles, h1 base               |
| `.text-section-heading` | `--text-heading`  | `clamp(1.75rem, 4vw, 3rem)`       | Section headings (h2)              |
| `.text-subheading`   | `--text-subheading`  | `clamp(1.375rem, 3vw, 2rem)`      | Subsection headings (h3)           |
| `.text-body-lg`      | `--text-body-lg`     | `clamp(1rem, 1vw + 0.25rem, 1.25rem)` | Intro paragraphs, descriptions |
| `.text-body`         | `--text-body`        | `1rem`                             | Default body text                  |
| `.text-body-sm`      | `--text-body-sm`     | `0.875rem`                         | Secondary body text                |
| `.text-caption`      | `--text-caption`     | `0.75rem`                          | Metadata, timestamps               |
| `.text-eyebrow`      | —                    | Caption + uppercase + wide tracking | Above headings in heroes/sections  |
| `.label-uppercase`   | —                    | Caption + bold + uppercase         | UI labels, tags                    |

### Rules

- **Hero headlines** (`h1` inside hero): Use `.text-hero` or `[&_h1]:text-hero`
- **Page headings** (`h1` elsewhere): Base `h1` styles use `--text-display` automatically
- **Section headings** (`h2`): Base `h2` styles use `--text-heading` automatically. Use `.text-section-heading` when applied to non-h2 elements
- **Never use raw Tailwind text sizes** for headings (no `text-3xl md:text-4xl lg:text-5xl`)
- All sizes use `clamp()` — they scale fluidly, no breakpoint overrides needed

---

## Spacing Scale

### Section Padding (vertical)

| Token                 | CSS Variable          | Value                          |
| --------------------- | --------------------- | ------------------------------ |
| `.section-padding-sm` | `--space-section-sm`  | `clamp(3rem, 5vw, 4rem)`      |
| `.section-padding-md` | `--space-section-md`  | `clamp(4rem, 7vw, 6rem)`      |
| `.section-padding-lg` | `--space-section-lg`  | `clamp(5rem, 9vw, 8rem)`      |
| `.section-padding-xl` | `--space-section-xl`  | `clamp(6rem, 11vw, 10rem)`    |

### Container Padding (horizontal)

| Token                | CSS Variable            | Value                      |
| -------------------- | ----------------------- | -------------------------- |
| `.container-padding` | `--space-container-x`   | `clamp(1.5rem, 4vw, 6rem)` |

### Content Gaps

Available as Tailwind spacing via `spacing-content-xs` through `spacing-content-xl`:

| Token                | Value                        |
| -------------------- | ---------------------------- |
| `--space-content-xs` | `clamp(0.5rem, 1vw, 0.75rem)` |
| `--space-content-sm` | `clamp(0.75rem, 1.5vw, 1rem)` |
| `--space-content-md` | `clamp(1rem, 2vw, 1.5rem)`    |
| `--space-content-lg` | `clamp(1.5rem, 3vw, 2rem)`    |
| `--space-content-xl` | `clamp(2rem, 4vw, 3rem)`      |

---

## Content Width Constraints

| Class             | CSS Variable       | Value    | Usage                              |
| ----------------- | ------------------ | -------- | ---------------------------------- |
| `.content-narrow` | `--content-narrow` | `42rem`  | Text-heavy, focused reading        |
| `.content-medium` | `--content-medium` | `56rem`  | Most section content               |
| `.content-wide`   | `--content-wide`   | `72rem`  | Card grids, wider layouts          |
| `.content-full`   | `--content-full`   | `86rem`  | Full-width sections                |

---

## Border Radius

| Variable         | Value     | Usage                    |
| ---------------- | --------- | ------------------------ |
| `--radius-sm`    | `0.375rem` | Small elements, inputs  |
| `--radius-md`    | `0.625rem` | Buttons, badges         |
| `--radius-lg`    | `1rem`    | Cards                    |
| `--radius-xl`    | `1.5rem`  | Large cards              |
| `--radius-2xl`   | `2rem`    | Feature cards            |
| `--radius-card`  | `1.75rem` | Standard card radius     |
| `--radius-pill`  | `9999px`  | Pills, tags, nav bar     |

---

## Usage Patterns

### Section wrapper

```tsx
<ContentSection bg="ivory" padding="lg">
  <SectionHeading tag="Benefits" title="Why Fermentation?" description="..." />
  {/* content */}
</ContentSection>
```

### Hero RichText overrides

```tsx
<RichText
  className="[&_h1]:text-hero [&_h1]:text-white [&_p]:text-body-sm [&_p]:text-white/70"
  data={richText}
/>
```

### Custom section (no ContentSection wrapper)

```tsx
<section className="section-padding-lg">
  <div className="container mx-auto container-padding">
    <h2 className="text-section-heading">Title</h2>
    <p className="text-body-lg content-narrow">Description</p>
  </div>
</section>
```

---

## Breakpoints

| Name  | Width    |
| ----- | -------- |
| `sm`  | `40rem`  |
| `md`  | `48rem`  |
| `lg`  | `64rem`  |
| `xl`  | `80rem`  |
| `2xl` | `86rem`  |

Note: All typography and spacing tokens use `clamp()` for fluid scaling between breakpoints.
No manual `sm:text-X md:text-Y lg:text-Z` chains are needed for standard sizes.
