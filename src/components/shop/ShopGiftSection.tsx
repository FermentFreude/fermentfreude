import Link from 'next/link'
import React from 'react'

const DEFAULTS = {
  giftHeading: 'Gift a special tasty experience',
  giftDescription:
    'Share the joy of fermentation with someone special. Our gift vouchers let them choose their own workshop or product.',
  giftButtonLabel: 'Find Out More',
  giftButtonUrl: '/voucher',
}

type ShopGiftSectionData = {
  giftHeading?: string | null
  giftDescription?: string | null
  giftButtonLabel?: string | null
  giftButtonUrl?: string | null
}

type Props = {
  data?: ShopGiftSectionData | null
}

export const ShopGiftSection: React.FC<Props> = ({ data }) => {
  const heading = data?.giftHeading ?? DEFAULTS.giftHeading
  const description = data?.giftDescription ?? DEFAULTS.giftDescription
  const buttonLabel = data?.giftButtonLabel ?? DEFAULTS.giftButtonLabel
  const buttonUrl = data?.giftButtonUrl ?? DEFAULTS.giftButtonUrl

  return (
    <section className="section-padding-md bg-ff-ivory-mist">
      <div className="container mx-auto container-padding">
        <div className="flex flex-col items-center text-center content-medium mx-auto gap-4">
          <h2 className="text-section-heading font-display font-bold text-ff-black">
            {heading}
          </h2>
          {description && (
            <p className="text-body-lg text-ff-olive content-narrow">{description}</p>
          )}
          {buttonUrl && (
            <Link
              href={buttonUrl}
              className="inline-flex items-center justify-center rounded-full bg-ff-charcoal hover:bg-ff-charcoal-hover px-8 py-2.5 font-display font-bold text-base text-ff-ivory transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {buttonLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
