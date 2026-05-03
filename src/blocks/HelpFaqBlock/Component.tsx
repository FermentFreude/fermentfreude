import { FaqAccordion, type FaqItem } from '@/app/(app)/fermentation/FaqAccordion'
import { FadeIn } from '@/components/FadeIn'
import Link from 'next/link'

import type { HelpFaqBlock as HelpFaqBlockType } from '@/payload-types'

/**
 * English defaults — used when the CMS field is empty (e.g. before seed runs).
 * The page default DEFAULTS object is intentionally narrow: enough to render
 * a sensible page even before the admin has saved anything.
 */
const DEFAULTS = {
  header: {
    eyebrow: 'HELP & SUPPORT',
    title: 'Help & FAQ',
    intro:
      'Find answers to the most common questions about your account, bookings, vouchers, orders and payments.',
    tocLabel: 'Topics on this page',
  },
  contact: {
    title: 'Question not answered?',
    body: 'Send us an email — we usually reply within one business day.',
    ctaLabel: 'Get in touch',
    email: 'kontakt@fermentfreude.at',
  },
} as const

type Section = NonNullable<HelpFaqBlockType['sections']>[number]

export const HelpFaqBlockComponent: React.FC<HelpFaqBlockType & { id?: string }> = (props) => {
  const header = {
    eyebrow: props.header?.eyebrow ?? DEFAULTS.header.eyebrow,
    title: props.header?.title ?? DEFAULTS.header.title,
    intro: props.header?.intro ?? DEFAULTS.header.intro,
    tocLabel: props.header?.tocLabel ?? DEFAULTS.header.tocLabel,
  }
  const contact = {
    title: props.contact?.title ?? DEFAULTS.contact.title,
    body: props.contact?.body ?? DEFAULTS.contact.body,
    ctaLabel: props.contact?.ctaLabel ?? DEFAULTS.contact.ctaLabel,
    email: props.contact?.email ?? DEFAULTS.contact.email,
  }
  const contactHref = `mailto:${contact.email}`

  const sections: Section[] = Array.isArray(props.sections) ? props.sections : []

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-[#F6F0E8] section-padding-sm">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <FadeIn>
            <p className="text-eyebrow font-semibold tracking-[0.16em] text-ff-gold-accent-dark">
              {header.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-page-heading font-bold text-ff-near-black">
              {header.title}
            </h1>
            <p className="mt-4 text-body-lg leading-relaxed text-ff-gray-text">{header.intro}</p>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section className="section-padding-sm">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* TOC */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-ff-near-black">
              {header.tocLabel}
            </p>
            <ul className="mt-4 space-y-2">
              {sections.map((section, idx) => {
                const key = section.key ?? `section-${idx}`
                return (
                  <li key={key}>
                    <a
                      href={`#${key}`}
                      className="block rounded-lg px-3 py-2 text-sm text-ff-gray-text transition-colors hover:bg-[#F6F0E8] hover:text-ff-near-black"
                    >
                      {section.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, idx) => {
              const key = section.key ?? `section-${idx}`
              const items: FaqItem[] = (section.items ?? []).map((it) => ({
                id: it.id ?? undefined,
                question: it.question,
                answer: it.answer,
              }))
              return (
                <FadeIn key={key}>
                  <section
                    id={key}
                    className="scroll-mt-28 rounded-2xl border border-ff-black/10 bg-[#FAF7F2] p-6 sm:p-8"
                  >
                    <h2 className="font-display text-section-heading font-bold text-ff-near-black">
                      {section.title}
                    </h2>
                    {section.intro && (
                      <p className="mt-3 text-body leading-relaxed text-ff-gray-text">
                        {section.intro}
                      </p>
                    )}
                    <div className="mt-6">
                      <FaqAccordion items={items} type="single" />
                    </div>
                  </section>
                </FadeIn>
              )
            })}

            {/* Contact CTA */}
            <FadeIn>
              <section className="rounded-2xl bg-ff-near-black p-8 text-center text-white sm:p-10">
                <h2 className="font-display text-section-heading font-bold">{contact.title}</h2>
                <p className="mx-auto mt-3 max-w-xl text-body leading-relaxed text-white/85">
                  {contact.body}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href={contactHref}
                    className="inline-flex items-center justify-center rounded-full bg-[#E6BE68] px-8 py-3 font-display text-sm font-bold text-[#1a1a1a] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#EDD195]"
                  >
                    {contact.ctaLabel}
                  </Link>
                  <a
                    href={contactHref}
                    className="text-sm font-medium text-white/80 underline-offset-2 hover:text-white hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </section>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
