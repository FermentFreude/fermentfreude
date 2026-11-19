import { describe, expect, it } from 'vitest'

import { amountToEnglish } from '@/lib/recipeAmount'

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
