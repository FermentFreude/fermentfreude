import { describe, expect, it } from 'vitest'

import { amountToEnglish, scaleAmount } from '@/lib/recipeAmount'

describe('amountToEnglish', () => {
  it.each([
    ['ca. 60 g', 'approx. 60 g'],
    ['2 EL', '2 tbsp'],
    ['1,5–2 gestr. TL', '1.5–2 level tsp'],
    ['2 Zehen', '2 cloves'],
    ['1 Zweig', '1 sprig'],
    ['ca. 250 ml (2 Teile)', 'approx. 250 ml (2 parts)'],
    ['nach Geschmack', 'to taste'],
    ['nach Bedarf', 'as needed'],
    ['je 1', 'each 1'],
    ['½', '½'],
    ['1 kg', '1 kg'],
  ])('%s → %s', (de, en) => expect(amountToEnglish(de)).toBe(en))

  it('keeps empty values empty', () => expect(amountToEnglish('')).toBeUndefined())
})

describe('scaleAmount', () => {
  it.each([
    ['200 g', 2, 'de', '400 g'],
    ['ca. 650 ml', 2, 'de', 'ca. 1,3 l'],
    ['1,5–2 gestr. TL', 2, 'de', '3–4 gestr. TL'],
    ['1,5–2 gestr. TL', 3, 'de', '4,5–6 gestr. TL'],
    ['½', 3, 'de', '1½'],
    ['½', 2, 'de', '1'],
    ['1/2 TL', 2, 'de', '1 TL'],
    ['2 Zehen', 3, 'de', '6 Zehen'],
    ['1 Zweig', 2, 'de', '2 Zweige'],
    ['ca. 250 ml (2 Teile)', 2, 'de', 'ca. 500 ml (2 Teile)'],
    ['2 % Salz', 3, 'de', '2 % Salz'],
    ['1 kg', 3, 'de', '3 kg'],
    ['nach Geschmack', 2, 'de', 'nach Geschmack'],
    ['je 1', 2, 'de', 'je 2'],
    ['1 Glas (300 ml)', 2, 'de', '2 Gläser (600 ml)'],
    ['1.5–2 level tsp', 2, 'en', '3–4 level tsp'],
    ['approx. 650 ml', 3, 'en', 'approx. 1.95 l'],
    ['1 sprig', 2, 'en', '2 sprigs'],
    ['8 g', 3, 'de', '24 g'],
  ] as const)('%s × %d (%s) → %s', (text, f, loc, want) => expect(scaleAmount(text, f, loc)).toBe(want))

  it('leaves the text alone at × 1', () => expect(scaleAmount('1,5–2 gestr. TL', 1)).toBe('1,5–2 gestr. TL'))
})
