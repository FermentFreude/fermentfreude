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

/* ── Portionen-Rechner: "200 g" × 2 → "400 g" ──────────────────────
 * Scales every number in a free-text amount. Ranges ("1,5–2") scale
 * both ends; fractions (½, 1/2) work; text without numbers ("nach
 * Geschmack") and ratios ("(2 Teile)", "2 %") stay as they are.
 * 1000 g / ml and more switch to kg / l. Factor 1 returns the text unchanged. */
const FRACTIONS: Record<string, number> = { '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 }
const NICE: Array<[number, string]> = [
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
]
// number: optional whole part + unicode fraction, a/b, or a decimal with , or .
const NUM = /(\d+\s*[¼½¾⅓⅔]|[¼½¾⅓⅔]|\d+\/\d+|\d+(?:[.,]\d+)?)/g
const KEEP_AFTER = /^\s*(?:%|°|Teile?\b|parts?\b)/i

const PLURAL: Record<string, string> = {
  Zehe: 'Zehen',
  Zweig: 'Zweige',
  Prise: 'Prisen',
  Scheibe: 'Scheiben',
  Stange: 'Stangen',
  Knolle: 'Knollen',
  Glas: 'Gläser',
  Bügelflasche: 'Bügelflaschen',
  Portion: 'Portionen',
  clove: 'cloves',
  sprig: 'sprigs',
  pinch: 'pinches',
  slice: 'slices',
  jar: 'jars',
  bunch: 'bunches',
  leaf: 'leaves',
  serving: 'servings',
  bottle: 'bottles',
}

function parseNum(raw: string): number {
  const s = raw.replace(/\s+/g, '')
  const frac = s.match(/^(\d*)([¼½¾⅓⅔])$/)
  if (frac) return Number(frac[1] || 0) + FRACTIONS[frac[2]!]!
  if (s.includes('/')) {
    const [a, b] = s.split('/').map(Number)
    return b ? a! / b : a!
  }
  return Number(s.replace(',', '.'))
}

function formatNum(n: number, locale: 'de' | 'en', fraction = false, digits = n >= 100 ? 0 : 1): string {
  const whole = Math.floor(n + 1e-9)
  const rest = n - whole
  if (fraction && n < 10 && rest > 0.01) {
    const nice = NICE.find(([v]) => Math.abs(v - rest) < 0.02)
    if (nice) return `${whole || ''}${nice[1]}`
  }
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'de-AT', { maximumFractionDigits: digits, useGrouping: false }).format(n)
}

export function scaleAmount(text: string | null | undefined, factor: number, locale: 'de' | 'en' = 'de'): string {
  if (!text || factor === 1) return text ?? ''
  let firstWasOne = false
  let seen = 0
  let out = text.replace(NUM, (raw, _m, offset: number, whole: string) => {
    if (KEEP_AFTER.test(whole.slice(offset + raw.length))) return raw
    const value = parseNum(raw)
    if (!Number.isFinite(value)) return raw
    if (seen++ === 0) firstWasOne = value === 1
    return formatNum(value * factor, locale, /[¼½¾⅓⅔/]/.test(raw))
  })
  // 1000 g → 1 kg, 1500 ml → 1,5 l (only plain "<number> g|ml")
  out = out.replace(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/g, (m, num: string, unit: string) => {
    const v = Number(num.replace(',', '.'))
    if (v < 1000) return m
    return `${formatNum(v / 1000, locale, false, 2)} ${unit === 'g' ? 'kg' : 'l'}`
  })
  // "1 Zehe" × 2 → "2 Zehen"
  if (firstWasOne && factor > 1) {
    out = out.replace(/^((?:ca\.|approx\.|je|each)?\s*[\d¼½¾⅓⅔.,/]+\s+)([A-Za-zÄÖÜäöüß-]+)/, (m, pre: string, word: string) =>
      PLURAL[word] ? pre + PLURAL[word] : m,
    )
  }
  return out
}
