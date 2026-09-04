import { isGermanBleedOnEn, looksGerman } from '@/utilities/gastronomyLocaleContent'

export type FermentationHeroBlock = {
  id?: string
  title: string
  description?: string
  icon?: string | null
  url?: string
}

export type FermentationWhyItem = { id?: string; title: string; description: string }
export type FermentationConcern = { id?: string; title: string; description: string }
export type FermentationFaqItem = { id?: string; question: string; answer: string }

/** Full EN copy — must not inherit German from RETOUCH_DE spread. */
export const FERMENTATION_RETOUCH_EN = {
  heroTitle: 'Innovation meets Tradition',
  heroDescription:
    'Fermentation is far more than sauerkraut or yogurt.\nIt is in many foods we eat every day: bread, cheese, salami, olives, vanilla, miso, vinegar, and much more.',
  heroBenefitsTitle: 'Why Ferment?',
  heroBlocks: [
    {
      title: 'PROBIOTICS',
      description:
        'Living microorganisms support a healthy balance in the gut and can have a positive effect on the immune system and overall well-being.',
    },
    {
      title: 'ENZYMES',
      description:
        'During the process, enzymes are created that make food easier to digest and break down complex structures.',
    },
    {
      title: 'FLAVOR',
      description:
        'Fermentation creates entirely new aromas, from mild and rounded to intense and complex, turning simple ingredients into unique foods.',
    },
    {
      title: 'SHELF LIFE',
      description:
        'Fermentation is a natural way to preserve food without artificial additives.',
    },
  ] as FermentationHeroBlock[],
  guideTitle: 'A complete guide to fermentation',
  guideBody:
    'Fermentation is not a recipe, but a process.\nA process to understand and experience consciously.',
  whatTitle: 'What is fermentation?',
  whatBody:
    'Fermentation is the controlled transformation of food with the help of microorganisms such as bacteria, yeasts, and molds.\nA natural process that creates new flavors, more depth, and longer shelf life from simple ingredients.',
  whatMotto: 'Good ingredients, time, and understanding of the process — that is all you need.',
  whatListItems: [] as string[],
  whyEyebrow: 'FUNDAMENTALS',
  whyTitle: 'Understanding fermentation',
  whyItems: [
    {
      title: 'There is no single technique',
      description:
        'Fermentation includes different techniques, from lactic acid fermentation to yeast fermentation and acetic acid fermentation, as well as symbioses like kombucha and kefir and noble molds, depending on microorganisms and starting product.',
    },
    {
      title: 'Where do the microorganisms come from?',
      description:
        'Fermentation can happen spontaneously through naturally occurring microorganisms or be guided deliberately through starter cultures for more control and consistent results.',
    },
    {
      title: 'The right conditions are crucial',
      description:
        'For fermentation to work, the framework must be right — depending on the technique, e.g. salt content, temperature, oxygen, pH, and hygiene.',
    },
    {
      title: 'Time is a central factor',
      description:
        'Fermentation takes time, from a few days to several months. Flavor develops continuously along the way.',
    },
    {
      title: 'Shelf life and resource use',
      description:
        'Fermentation extends the shelf life of food and makes it possible to use seasonal surpluses meaningfully.',
    },
    {
      title: 'Experience makes the difference',
      description:
        'With experience you learn to understand processes, steer them deliberately, and apply them safely — and achieve reliable results.',
    },
  ] as FermentationWhyItem[],
  dangerTitle: 'Is fermentation dangerous?',
  dangerIntro:
    'Fermentation is one of the safest ways to preserve food, provided it is done correctly.',
  dangerConcernsHeading: 'What matters:',
  dangerConcerns: [
    {
      title: 'Clean working practices',
      description:
        'Hygiene, fresh ingredients, and suitable conditions are the foundation of safe fermentation.',
    },
    {
      title: 'Mold',
      description: 'If a ferment molds, it should generally be discarded.',
    },
    {
      title: 'Smell and appearance',
      description:
        'Depending on the fermentation, smell and appearance differ — what matters is being able to interpret changes correctly.',
    },
    {
      title: 'Experience and understanding',
      description:
        'With growing experience you learn to assess processes better and apply them safely.',
    },
  ] as FermentationConcern[],
  dangerClosing:
    'Bottom line: If you understand the basics and work cleanly, you can use fermentation reliably and safely in everyday life.',
  practiceTitle: 'A practice, not a trend',
  practiceParagraphs: [
    'Fermentation has been used for thousands of years across many cultures, from Korean kimchi to European sauerkraut, Japanese miso, and Indonesian tempeh.',
    'It is not a quick process, but develops through time, experience, and understanding.',
    'Every fermentation runs a little differently. What matters is knowing the basics and being able to observe and steer the process.',
    'Fermentation means working with food rather than merely processing it — and shaping flavor, shelf life, and quality consciously.',
  ],
  ctaTitle: 'Ready to learn?',
  ctaDescription:
    'In our workshops you learn how fermentation really works.\nExplained clearly and directly applicable.',
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Common fermentation questions as asked in our workshops',
  faqItems: [
    {
      question: 'Does fermentation kill bacteria?',
      answer:
        'No. Fermentation uses microorganisms deliberately to trigger desired processes while inhibiting the growth of unwanted microbes.',
    },
    {
      question: 'Is fermentation the same as pickling?',
      answer:
        'No. Fermentation is a microbial process in which microorganisms transform food. Pickling usually uses vinegar or other acids for preservation and is not a fermentation process.',
    },
    {
      question: 'Are fermented products from the supermarket healthy too?',
      answer:
        'Partly.\nMany industrially produced products are pasteurized and no longer contain living microorganisms.\nAs a result, some probiotic properties are lost.',
    },
    {
      question: 'Can I eat fermented foods every day?',
      answer:
        'Yes.\nFermented foods can be consumed daily and are a sensible part of the diet.\nIf you are not used to them yet, start with small amounts.',
    },
    {
      question: 'How do I store finished fermented foods?',
      answer:
        'Finished ferments should be stored refrigerated, because the microorganisms remain active and flavor and maturity otherwise continue to change.',
    },
    {
      question: 'Can fermented foods go bad?',
      answer:
        'Yes.\nFerments can turn or become overripe if conditions are wrong.\nWhen in doubt, the product should no longer be used.',
    },
  ] as FermentationFaqItem[],
  faqCtaTitle: 'Ready to ferment?',
  faqCtaBody:
    'Start with simple applications and pay attention to clean working practices and the right conditions.\nOver time you develop a confident feel for the process.',
}

export function resolveFermentationText(
  cmsValue: string | null | undefined,
  locale: 'de' | 'en',
  deDefault: string,
  enDefault: string,
): string {
  const trimmed = cmsValue?.trim()
  if (locale === 'en') {
    if (isGermanBleedOnEn(trimmed, deDefault)) return enDefault
    return trimmed!
  }
  return trimmed || deDefault
}

export function resolveFermentationRows<T>(
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

export function resolveHeroBenefitsTitle(
  cmsValue: string | null | undefined,
  locale: 'de' | 'en',
  deDefault: string,
  enDefault: string,
): string {
  const trimmed = cmsValue?.trim()
  if (locale === 'en') {
    if (isGermanBleedOnEn(trimmed, deDefault)) return enDefault
    return trimmed!
  }
  if (trimmed && !/^why fermentation\?$/i.test(trimmed) && !/^why ferment\?$/i.test(trimmed)) {
    return trimmed
  }
  return deDefault
}
