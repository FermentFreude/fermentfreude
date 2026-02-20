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
    <section id={id ?? undefined} className="w-full py-12 md:py-24 bg-[#F9F0DC]">
      <div className="mx-auto max-w-350 px-6">
        <div className="rounded-[2.75rem] bg-[#F9F0DC] px-6 py-12 md:px-24 md:py-20">
          <div className="flex flex-col items-center gap-8 md:gap-12">
            <h2 className="font-display text-center text-2xl font-bold text-[#1D1D1D] md:text-3xl">
              {resolvedHeading}
            </h2>
            <p className="max-w-4xl text-center font-display text-xl font-semibold text-[#4B4B4B] md:text-3xl">
              {resolvedDescription}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <Link
                href={resolvedPrimary.href}
                className="rounded-full bg-[#6B6B6B] px-6 py-2.5 font-display text-lg font-semibold text-[#F9F0DC] transition-colors hover:bg-[#595959] md:px-16 md:py-3 md:text-xl"
              >
                {resolvedPrimary.label}
              </Link>
              <Link
                href={resolvedSecondary.href}
                className="rounded-full bg-white px-6 py-2.5 font-display text-lg font-semibold text-[#4B4B4B] transition-all hover:border-4 hover:border-[#4B4B4B] hover:bg-[#F9F0DC] md:px-14 md:py-3 md:text-xl"
              >
                {resolvedSecondary.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
