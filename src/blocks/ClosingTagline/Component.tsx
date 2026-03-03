import Link from 'next/link'
import type { ClosingTaglineBlock as ClosingTaglineBlockType } from '@/payload-types'

const DEFAULTS = {
  tagline: 'Fermentation for everyone.',
  subtext: '',
  linkLabel: '',
  linkUrl: '',
}

type Props = ClosingTaglineBlockType & { id?: string }

export const ClosingTaglineBlock: React.FC<Props> = ({
  tagline,
  subtext,
  linkLabel,
  linkUrl,
  id,
}) => {
  const resolvedTagline = tagline ?? DEFAULTS.tagline
  const resolvedSubtext = subtext ?? DEFAULTS.subtext
  const resolvedLinkLabel = linkLabel ?? DEFAULTS.linkLabel
  const resolvedLinkUrl = linkUrl ?? DEFAULTS.linkUrl

  return (
    <section
      id={id ?? undefined}
      className="relative section-padding-xl overflow-hidden bg-ff-cream border-t border-ff-border-light"
    >
      {/* Decorative organic blob */}
      <div
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ff-gold-accent/8 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-ff-olive/5 blur-2xl"
        aria-hidden
      />

      <div className="container mx-auto container-padding relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-16 content-wide mx-auto">
          {/* Left: large decorative quote */}
          <div className="flex-shrink-0" aria-hidden>
            <span className="font-display text-[8rem] md:text-[10rem] lg:text-[12rem] font-bold leading-none text-ff-gold-accent/12 select-none">
              "
            </span>
          </div>

          {/* Center: content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <p className="font-display text-2xl md:text-3xl lg:text-4xl text-ff-black leading-tight max-w-xl">
              {resolvedTagline}
            </p>
            {resolvedSubtext && (
              <p className="mt-4 text-body-lg text-ff-olive max-w-lg">{resolvedSubtext}</p>
            )}
            {resolvedLinkLabel && resolvedLinkUrl && (
              <Link
                href={resolvedLinkUrl}
                className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-ff-gold-accent bg-transparent px-6 py-3 font-display text-base font-bold text-ff-black transition-colors hover:bg-ff-gold-accent group"
              >
                {resolvedLinkLabel}
                <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
