/* German ingredient amount → English ("ca. 2 EL" → "approx. 2 tbsp").
 * Used by the recipe seed and the one-off migration when `amount` became
 * a localized field. Editors can always overwrite the English value. */
const WORDS: Array<[RegExp, string]> = [
  [/\bca\.\s*/gi, 'approx. '],
  [/\bEL\b/g, 'tbsp'],
  [/\bTL\b/g, 'tsp'],
  [/\bMsp\.?\b/gi, 'pinch'],
  [/\bPrisen?\b/gi, 'pinch'],
  [/\bStk\.?(?=\s|$)/gi, 'pcs'],
  [/\bStück\b/gi, 'pcs'],
  [/\bBund\b/gi, 'bunch'],
  [/\bZehen\b/gi, 'cloves'],
  [/\bZehe\b/gi, 'clove'],
  [/\bHandvoll\b/gi, 'handful'],
  [/\bScheiben\b/gi, 'slices'],
  [/\bScheibe\b/gi, 'slice'],
  [/\bBlätter\b/gi, 'leaves'],
  [/\bBlatt\b/gi, 'leaf'],
  [/\bnach Geschmack\b/gi, 'to taste'],
  [/\bnach Bedarf\b/gi, 'as needed'],
  [/\bgestr\.\s*/gi, 'level '],
  [/\bZweige\b/gi, 'sprigs'],
  [/\bZweig\b/gi, 'sprig'],
  [/\bTeile\b/g, 'parts'],
  [/\bTeil\b/g, 'part'],
  [/^je\b/i, 'each'],
  [/\bjeweils\b/gi, 'each'],
  [/\bbis\b/gi, 'to'],
]

export function amountToEnglish(de?: string | null): string | undefined {
  if (!de) return undefined
  let out = de.replace(/(\d),(\d)/g, '$1.$2') // 1,5 → 1.5
  for (const [re, en] of WORDS) out = out.replace(re, en)
  return out.replace(/\s{2,}/g, ' ').trim()
}
