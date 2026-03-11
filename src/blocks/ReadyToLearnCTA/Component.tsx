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
    <section id={id ?? undefined} className="relative section-padding-md bg-ff-charcoal overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} aria-hidden />
      <div className="container relative mx-auto container-padding">
        <div className="flex flex-col items-center gap-(--space-content-lg) content-narrow mx-auto text-center">
          <h2 className="text-section-heading font-display font-bold text-white">
            {resolvedHeading}
          </h2>
          <p className="text-body-lg text-white/90 leading-relaxed">
            {resolvedDescription}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href={resolvedPrimary.href}
              className="inline-flex items-center justify-center rounded-(--radius-pill) bg-ff-gold-accent hover:bg-ff-gold-accent-dark text-ff-near-black font-display font-bold text-base px-8 py-3 transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {resolvedPrimary.label}
            </Link>
            <Link
              href={resolvedSecondary.href}
              className="inline-flex items-center justify-center rounded-(--radius-pill) border-2 border-white/80 bg-transparent text-white font-display font-bold text-base px-8 py-3 transition-all hover:bg-white hover:text-ff-charcoal hover:scale-[1.03] active:scale-[0.97]"
            >
              {resolvedSecondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
