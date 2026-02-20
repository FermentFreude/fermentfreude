import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type { Media as MediaType, VoucherCtaBlock as VoucherCtaBlockType } from '@/payload-types'
import Link from 'next/link'

const DEFAULTS = {
  heading: 'Gift a special tasty experience',
  description:
    'Share the joy with someone special.\nThis voucher is perfect for unforgettable moments.',
  buttonLabel: 'Voucher',
  buttonLink: '/voucher',
}

type Props = VoucherCtaBlockType & { id?: string }

export const VoucherCtaBlock: React.FC<Props> = ({
  heading,
  description,
  buttonLabel,
  buttonLink,
  image,
  id,
}) => {
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink

  return (
    <section
      id={id ?? undefined}
      className="rounded-2xl bg-ff-ivory section-padding-md container-padding"
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-(--space-content-xl)">
        {/* Text side */}
        <FadeIn from="left" className="flex-1 flex flex-col gap-(--space-content-md) items-start">
          <h2 className="text-ff-black">{resolvedHeading}</h2>
          <p className="text-body-lg text-ff-navy content-narrow whitespace-pre-line">
            {resolvedDescription}
          </p>
          <Link
            href={resolvedButtonLink}
            className="inline-flex items-center justify-center rounded-full bg-ff-charcoal hover:bg-ff-charcoal-hover hover:scale-[1.03] active:scale-[0.97] transition-all text-ff-ivory-mist font-display font-bold text-base px-6 py-2.5"
          >
            {resolvedButtonLabel}
          </Link>
        </FadeIn>

        {/* Image side */}
        <FadeIn
          from="right"
          delay={150}
          className="shrink-0 w-full max-w-xs lg:max-w-sm aspect-580/540 rounded-2xl overflow-hidden"
        >
          {image && typeof image === 'object' ? (
            <Media resource={image as MediaType} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-ff-warm-gray" />
          )}
        </FadeIn>
      </div>
    </section>
  )
}
