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
    <section id={id ?? undefined} className="bg-ff-ivory section-padding-md">
      <div className="container mx-auto container-padding">
        <div className="flex flex-col items-center gap-(--space-content-xl) content-medium mx-auto text-center">
          <h2 className="text-ff-black">{resolvedHeading}</h2>
          <p className="text-body-lg font-display font-semibold text-ff-olive content-medium">
            {resolvedDescription}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-(--space-content-md)">
            <Link
              href={resolvedPrimary.href}
              className="inline-flex items-center justify-center rounded-full bg-ff-charcoal hover:bg-ff-charcoal-hover hover:scale-[1.03] active:scale-[0.97] transition-all text-ff-ivory font-display font-bold text-base px-8 py-3"
            >
              {resolvedPrimary.label}
            </Link>
            <Link
              href={resolvedSecondary.href}
              className="inline-flex items-center justify-center rounded-full border-2 border-ff-charcoal bg-transparent hover:bg-ff-charcoal hover:text-ff-ivory hover:scale-[1.03] active:scale-[0.97] transition-all text-ff-charcoal font-display font-bold text-base px-8 py-3"
            >
              {resolvedSecondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
