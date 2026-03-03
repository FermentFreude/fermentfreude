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
    <section id={id ?? undefined} className="relative bg-ff-charcoal section-padding-xl overflow-hidden">
      {/* Decorative gradient blobs — organic shapes */}
      <div
        className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-ff-gold-accent/12 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-ff-navy/40 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] rounded-full bg-ff-gold-accent/5 blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="container mx-auto container-padding relative z-10">
        <div className="flex flex-col items-center gap-(--space-content-lg) content-medium mx-auto text-center">
          <div className="flex items-center gap-3 mb-2" aria-hidden>
            <span className="h-px w-8 bg-ff-gold-accent/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-ff-gold-accent/80" />
            <span className="h-px w-8 bg-ff-gold-accent/60" />
          </div>
          <h2 className="text-ff-cream text-display">{resolvedHeading}</h2>
          <p className="text-body-lg text-ff-cream/85 content-medium">{resolvedDescription}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href={resolvedPrimary.href}
              className="inline-flex items-center gap-2 rounded-full bg-ff-gold-accent px-8 py-3.5 font-display font-bold text-base text-ff-black transition-all hover:bg-ff-gold-accent-dark group"
            >
              {resolvedPrimary.label}
              <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
            <Link
              href={resolvedSecondary.href}
              className="inline-flex items-center justify-center rounded-full border-2 border-ff-cream/80 bg-transparent px-8 py-3.5 font-display font-bold text-base text-ff-cream transition-colors hover:bg-ff-cream hover:text-ff-charcoal"
            >
              {resolvedSecondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
