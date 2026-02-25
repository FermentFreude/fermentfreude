# /project:hero-fix — Fix hero slider issues

## Input

$ARGUMENTS = what's wrong with the hero

## Scope — only these files

- `src/fields/hero.ts` — schema definition
- `src/heros/HeroSlider/index.tsx` — React component
- `src/heros/HeroSlider/slide-data.ts` — DEFAULT_SLIDES (English fallbacks)
- `src/heros/HeroSlider/seed.ts` — buildHeroSlider() + mergeHeroSliderEN()
- `src/heros/RenderHero.tsx` — hero type router

## Hero Slides (fixed order, index 0 = basics)

| #   | slideId    | panelColor | bgColor   | Link                  |
| --- | ---------- | ---------- | --------- | --------------------- |
| 1   | `basics`   | `#000000`  | `#AEB1AE` | `/workshops/basics`   |
| 2   | `lakto`    | `#555954`  | `#D2DFD7` | `/workshops/lakto`    |
| 3   | `kombucha` | `#555954`  | `#F6F0E8` | `/workshops/kombucha` |
| 4   | `tempeh`   | `#737672`  | `#F6F3F0` | `/workshops/tempeh`   |

## Workflow

1. Read the relevant file(s) from the scope above
2. Identify the issue
3. Fix it — minimal change only
4. **No seeds.** Don't re-run seed-home.ts unless explicitly asked
5. **No other sections.** Don't touch blocks, footer, header, or other pages
6. Validate: `npx tsc --noEmit`
7. Show what changed

## Common Issues

- Slide order wrong → check `DEFAULT_SLIDES` array in slide-data.ts
- Colors wrong → check `panelColor`/`bgColor` in slide-data.ts or seed.ts
- Images broken → check if media IDs are resolved (`isResolvedMedia()`)
- Animation glitch → check CSS classes `hero-anim-*`, `hero-exit-*` in index.tsx
- EN showing DE text → bilingual ID mismatch in seed.ts (mergeHeroSliderEN)
