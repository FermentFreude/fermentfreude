import type { ReadyToLearnCtaBlock as ReadyToLearnCtaBlockType } from '@/payload-types'
import Link from 'next/link'

const DEFAULTS = {
  heading: 'Ready to learn?',
  description:
    'Join our workshops and online courses to learn hands-on fermentation techniques, ask questions, and connect with a community of learners.',
  primaryButton: { label: 'View workshops', href: '/workshops' },
  secondaryButton: { label: 'Browse online courses', href: '/courses' },
}

type Props = ReadyToLearnCtaBlockType & { id?: string }

export const ReadyToLearnCTABlock: React.FC<Props> = ({
  heading,
  description,
  primaryButton,
  secondaryButton,
  id,
}) => {
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedPrimary = {
    label: primaryButton?.label ?? DEFAULTS.primaryButton.label,
    href: primaryButton?.href ?? DEFAULTS.primaryButton.href,
  }
  const resolvedSecondary = {
    label: secondaryButton?.label ?? DEFAULTS.secondaryButton.label,
    href: secondaryButton?.href ?? DEFAULTS.secondaryButton.href,
  }

  return (
    <section id={id ?? undefined} className="section-padding-lg bg-ff-ivory">
      <div className="container mx-auto container-padding">
        <div className="mx-auto max-w-[var(--content-medium)] text-center">
          <h2 className="text-ff-black">{resolvedHeading}</h2>
          <div className="mx-auto mt-4 h-px w-16 bg-ff-gold-accent" />
          <p className="mt-6 text-body-lg leading-relaxed text-ff-olive">{resolvedDescription}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={resolvedPrimary.href}
              className="inline-flex items-center justify-center rounded-full bg-ff-charcoal px-6 py-3 font-display text-base font-bold text-ff-ivory transition-colors hover:bg-ff-charcoal-hover"
            >
              {resolvedPrimary.label}
            </Link>
            <Link
              href={resolvedSecondary.href}
              className="inline-flex items-center justify-center rounded-full border-2 border-ff-charcoal bg-transparent px-6 py-3 font-display text-base font-bold text-ff-charcoal transition-colors hover:bg-ff-charcoal hover:text-ff-ivory"
            >
              {resolvedSecondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
