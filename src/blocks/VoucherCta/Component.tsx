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
      className="rounded-[40px] md:rounded-[60px] lg:rounded-[87px] bg-[#f9f0dc] px-6 py-12 md:px-12 md:py-16 lg:px-30 lg:py-22.75"
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Text side */}
        <div className="flex-1 flex flex-col gap-6 lg:gap-8 items-start">
          <h2 className="font-display text-4xl md:text-5xl lg:text-[80px] leading-none text-[#1d1d1d] tracking-tight">
            {resolvedHeading}
          </h2>
          <p className="font-display font-bold text-base md:text-lg lg:text-[22px] leading-relaxed text-[#091638] max-w-150 whitespace-pre-line">
            {resolvedDescription}
          </p>
          <Link
            href={resolvedButtonLink}
            className="inline-flex items-center justify-center rounded-full bg-[#4b4b4b] hover:bg-[#3a3a3a] transition-colors text-[#faf2e0] font-display font-bold text-lg md:text-xl lg:text-2xl px-8 py-4 lg:px-10 lg:py-5"
          >
            {resolvedButtonLabel}
          </Link>
        </div>

        {/* Image side */}
        <div className="shrink-0 w-full lg:w-120 xl:w-135 aspect-580/540 rounded-[40px] md:rounded-[60px] lg:rounded-[71px] overflow-hidden">
          {image && typeof image === 'object' ? (
            <Media resource={image as MediaType} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#ECE5DE]" />
          )}
        </div>
      </div>
    </section>
  )
}
