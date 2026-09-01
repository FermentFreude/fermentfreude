export type OutcomeRow = { before: string; after: string }
export type ProcessStep = { title: string; description: string }
export type TestimonialRow = { quote: string; author: string }
export type FaqRow = { q: string; a: string }

const GERMAN_WORD_MARKERS = [
  ' für ',
  ' und ',
  ' sie ',
  ' ihr ',
  ' ihre ',
  ' ihnen ',
  ' nicht ',
  ' küche',
  ' vorher',
  ' nachher',
  ' häufig',
  ' anfragen',
  ' gemeinschaft',
  ' feinkost',
  ' schulung',
  ' unternehmen',
  ' referenzen',
  ' gastro',
  ' profis',
  ' betriebe',
  ' unternehmer',
  ' vegetarische',
  ' austauschbare',
  ' eigenständiges',
  ' verarbeitete',
  ' ausgangssituation',
  ' verändert ',
  ' interesse geweckt',
  ' ausprobieren',
  ' küchenteams',
  ' teambuilding',
  ' aufwendig',
  ' haltbar',
  ' lieferung',
  ' großraum',
  ' österreich',
  ' ersatzprodukt',
  ' wie wird',
  ' bieten sie',
  ' braucht mein',
  ' muss ich',
  ' das sagen',
  ' häufige fragen',
  ' einfach anfragen',
  ' profiküchen',
  ' vertraut von',
  ' gerichte',
  ' abläufe',
  ' zusammenarbeit',
  ' teilnehmer',
  ' steirische',
  ' marktgarten',
  ' gesundheitstag',
  ' bereichert',
  ' vielseitige',
  ' einsetzbarkeit',
  ' praxisnah',
  ' handwerkliches',
  ' wertschätzung',
  ' lebensmittel',
  ' fermentierte',
  ' hülsenfrüchte',
  ' gekühlt',
  ' kühlketten',
  ' lakto-fermente',
  ' käferbohnen',
  ' mild-nussigen',
  ' rückmeldungen',
  ' fleischalternativen',
  ' eigenständiges',
  ' wiederekennungswert',
  ' schulungen für',
  ' fermentieren und erleben',
  ' unkompliziert',
  ' grundlegend umgestellt',
  ' proteinreich',
  ' klassischer fleischersatz',
  ' glutenfreies',
  ' schrittweise aufgebaut',
]

const GERMAN_BADGE_LABELS = new Set([
  'feinkost',
  'gemeinschaftsverpflegung',
  'profiküchen',
  'vertraut von',
])

const EN_TRUST_BADGE_LABELS = new Set([
  'delis',
  'institutional catering',
  'food concept stores',
])

const GERMAN_FUNCTION_WORDS =
  /\b(aber|auch|anfrage|anfragen|ausprobieren|bei|bereit|bieten|braucht|das|dein|deine|dem|den|der|des|die|dies|diese|dieser|doch|eine|einem|einen|einer|eines|erst|fragen|für|gar|geht|gibt|haben|hast|häufig|ihr|ihre|ihnen|ihren|ihrer|ihres|ist|jede|jeden|jeder|jedes|kann|kein|keine|keinen|kompletter|leitfaden|mehr|muss|nach|nicht|noch|oder|schon|sehr|sie|sind|trifft|und|uns|verstehen|viel|vom|von|vor|war|warum|was|weil|welche|welcher|welches|wenn|werden|wie|wir|wird|wohl|zum|zur|zwar)\b/i

function matchesDeDefault(cmsValue: string, deDefault: string): boolean {
  return cmsValue.trim() === deDefault.trim()
}

/** Detect German copy stored under the EN locale (common CMS bleed). */
export function looksGerman(text: string | null | undefined): boolean {
  const trimmed = text?.trim()
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()
  if (/[äöüß]/.test(lower)) return true
  if (GERMAN_FUNCTION_WORDS.test(lower)) return true
  return GERMAN_WORD_MARKERS.some((marker) => lower.includes(marker))
}

export function isGermanBleedOnEn(
  cmsValue: string | null | undefined,
  deDefault: string,
  extraGermanCheck?: (value: string) => boolean,
): boolean {
  const trimmed = cmsValue?.trim()
  if (!trimmed) return true
  if (looksGerman(trimmed)) return true
  if (matchesDeDefault(trimmed, deDefault)) return true
  if (extraGermanCheck?.(trimmed)) return true
  return false
}

export function isGermanBeforeAfterLabel(value: string | null | undefined): boolean {
  const trimmed = value?.trim()
  if (!trimmed) return false
  return /^(vorher|nachher|naher)$/i.test(trimmed)
}

export function hasGermanTrustBadges(badges: string[]): boolean {
  return badges.some((badge) => {
    const lower = badge.toLowerCase()
    return GERMAN_BADGE_LABELS.has(lower) || looksGerman(badge)
  })
}

export function isEnglishTrustedByHeading(value: string | null | undefined): boolean {
  const trimmed = value?.trim().toLowerCase()
  if (!trimmed) return false
  return trimmed === 'trusted by' || trimmed === 'for professional kitchens'
}

export function hasEnglishTrustBadges(badges: string[]): boolean {
  return badges.some((badge) => EN_TRUST_BADGE_LABELS.has(badge.toLowerCase()))
}

export function resolveTrustedByHeading(
  cmsValue: string | null | undefined,
  locale: 'de' | 'en',
  deDefault: string,
  enDefault: string,
): string {
  const trimmed = cmsValue?.trim()
  if (locale === 'en') {
    if (!trimmed || looksGerman(trimmed)) return enDefault
    return trimmed
  }
  if (!trimmed || isEnglishTrustedByHeading(trimmed)) return deDefault
  return trimmed
}

export function resolveTrustBadges(
  cmsBadges: string[],
  locale: 'de' | 'en',
  deFallback: readonly string[],
  enFallback: readonly string[],
): string[] {
  if (cmsBadges.length === 0) {
    return locale === 'de' ? [...deFallback] : [...enFallback]
  }
  if (locale === 'en' && hasGermanTrustBadges(cmsBadges)) {
    return [...enFallback]
  }
  if (locale === 'de' && hasEnglishTrustBadges(cmsBadges)) {
    return [...deFallback]
  }
  return cmsBadges
}

export function resolveLocalizedText(
  cmsValue: string | null | undefined,
  locale: 'de' | 'en',
  deDefault: string,
  enDefault: string,
  extraGermanCheck?: (value: string) => boolean,
): string {
  const trimmed = cmsValue?.trim()
  if (locale === 'en') {
    if (isGermanBleedOnEn(trimmed, deDefault, extraGermanCheck)) return enDefault
    return trimmed!
  }
  return trimmed || deDefault
}

export function resolveLocalizedRows<T>(
  cmsRows: T[],
  locale: 'de' | 'en',
  deFallback: T[],
  enFallback: T[],
  extractText: (rows: T[]) => string,
): T[] {
  if (cmsRows.length === 0) {
    return locale === 'de' ? deFallback : enFallback
  }
  if (locale === 'en') {
    const cmsText = extractText(cmsRows)
    const deText = extractText(deFallback)
    if (looksGerman(cmsText) || (deText && cmsText === deText)) {
      return enFallback
    }
  }
  return cmsRows
}

export const GASTRONOMY_TRUST_BADGES_EN = [
  'Restaurants',
  'Hotels',
  'Catering',
  'Delis',
  'Institutional catering',
] as const

export const GASTRONOMY_OUTCOMES_EN: OutcomeRow[] = [
  {
    before: 'Vegetarian options without enough substance',
    after: 'Tempeh as a stand-alone, plant-based main course',
  },
  {
    before: 'Highly processed meat alternatives on the menu',
    after: 'Fermented products built on real, regional ingredients',
  },
  {
    before: 'Interchangeable dishes with no clear identity',
    after: 'Dishes with a distinct signature and real recognition value',
  },
]

export const GASTRONOMY_PROCESS_STEPS_EN: ProcessStep[] = [
  {
    title: 'Tempeh & Co.',
    description:
      'For use in your kitchen – we show you how ferments fit into your dishes',
  },
  {
    title: 'Training for kitchen teams',
    description:
      'Practical knowledge to produce and use ferments effectively in your operation.',
  },
  {
    title: 'Corporate teambuilding events',
    description:
      'Ferment together and experience it – a culinary format for your team.',
  },
]

export const GASTRONOMY_TESTIMONIALS_EN: TestimonialRow[] = [
  {
    quote:
      "Fermentfreude's fava bean tempeh impresses with its mild, nutty flavor and versatile applications. A genuine enrichment for Styrian cuisine.",
    author: 'Michael Wankerl, Gerüchteküche',
  },
  {
    quote:
      'The collaboration reflects exactly what we stand for: seasonal vegetables, craft knowledge and genuine appreciation for food. The workshops are practical, inspiring and fit perfectly into our market garden routine.',
    author: 'Johanna & Bernhard Steinhauszer, Unser Bauerngarten',
  },
  {
    quote:
      "The SVS Kulmland health day was enriched professionally and practically by Fermentfreude's workshops. The collaboration was professional and participant feedback was very positive.",
    author: 'Mag. Robert Matzer, Kulmland',
  },
]

export const GASTRONOMY_FAQ_EN: FaqRow[] = [
  {
    q: 'How much effort does using tempeh require in a professional kitchen?',
    a: 'Integration is straightforward. Tempeh comes as a block (approx. 200g) and can be fried, marinated or further processed like other components and integrated into existing workflows without major changes.',
  },
  {
    q: 'Do I need to change my dishes or workflows?',
    a: 'No. Tempeh can be integrated into existing dishes or used as a new component without fundamentally restructuring the kitchen.',
  },
  {
    q: 'Is tempeh a meat substitute?',
    a: 'No. Although tempeh is very high in protein, it is a standalone food based on legumes with its own texture and flavor – not a classic meat replacement.',
  },
  {
    q: 'Is tempeh vegan?',
    a: 'Yes, tempeh is a vegan and gluten-free product.',
  },
  {
    q: 'Does my team need experience with fermentation?',
    a: 'No. We show you practically how tempeh and other ferments can be used or produced in your operation – tailored to your kitchen routine.',
  },
  {
    q: 'How is tempeh stored and how long does it keep?',
    a: 'Tempeh is stored refrigerated and keeps for several weeks when stored correctly. It integrates well into existing cold chains.',
  },
  {
    q: 'How does delivery work?',
    a: 'For now we deliver directly in the greater Graz area and Styria. Shipping within Austria is planned and will be rolled out step by step.',
  },
  {
    q: 'Do you offer products besides tempeh?',
    a: 'Yes. Besides fava bean tempeh we offer selected fermented products such as kimchi and other lacto-ferments.',
  },
]
