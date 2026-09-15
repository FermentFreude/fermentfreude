import { HelpFaqHub, type HelpFaqSection } from '@/blocks/HelpFaqBlock/HelpFaqHub'

import type { HelpFaqBlock as HelpFaqBlockType } from '@/payload-types'

/**
 * English defaults — used when a CMS field is empty (e.g. before seed runs).
 */
const DEFAULTS = {
  header: {
    eyebrow: '',
    title: 'Hello, how can we help?',
    intro: '',
    searchPlaceholder: 'Try "book workshop" or "voucher"',
    commonSearchesLabel: 'Popular topics:',
    backLabel: 'All topics',
    resultsLabel: 'Search results',
    emptyResultsLabel: 'No matching questions. Try another search, or browse the topics above.',
    questionCountSingular: 'question',
    questionCountPlural: 'questions',
  },
  contact: {
    title: "Haven't found what you need?",
    body: 'Get in touch — we are happy to help.',
    ctaLabel: 'Contact',
    link: '/contact',
    email: 'kontakt@fermentfreude.at',
  },
} as const

export const HelpFaqBlockComponent: React.FC<HelpFaqBlockType & { id?: string }> = (props) => {
  const header = {
    eyebrow: props.header?.eyebrow ?? DEFAULTS.header.eyebrow,
    title: props.header?.title ?? DEFAULTS.header.title,
    intro: props.header?.intro ?? DEFAULTS.header.intro,
    searchPlaceholder: props.header?.searchPlaceholder ?? DEFAULTS.header.searchPlaceholder,
    commonSearchesLabel: props.header?.commonSearchesLabel ?? DEFAULTS.header.commonSearchesLabel,
    commonSearches: (props.header?.commonSearches ?? [])
      .map((chip) => chip.label?.trim())
      .filter((label): label is string => Boolean(label)),
    backLabel: props.header?.backLabel ?? DEFAULTS.header.backLabel,
    resultsLabel: props.header?.resultsLabel ?? DEFAULTS.header.resultsLabel,
    emptyResultsLabel: props.header?.emptyResultsLabel ?? DEFAULTS.header.emptyResultsLabel,
    questionCountSingular:
      props.header?.questionCountSingular ?? DEFAULTS.header.questionCountSingular,
    questionCountPlural: props.header?.questionCountPlural ?? DEFAULTS.header.questionCountPlural,
  }
  const contact = {
    title: props.contact?.title ?? DEFAULTS.contact.title,
    body: props.contact?.body ?? DEFAULTS.contact.body,
    ctaLabel: props.contact?.ctaLabel ?? DEFAULTS.contact.ctaLabel,
    link: props.contact?.link?.trim() || DEFAULTS.contact.link,
    email: props.contact?.email ?? DEFAULTS.contact.email,
  }

  const sections: HelpFaqSection[] = Array.isArray(props.sections)
    ? props.sections.map((section) => ({
        id: section.id,
        key: section.key,
        title: section.title,
        intro: section.intro,
        icon: section.icon,
        items: section.items,
      }))
    : []

  return (
    <HelpFaqHub
      header={header}
      sections={sections}
      contact={contact}
      heroBackground={props.heroBackground}
    />
  )
}
