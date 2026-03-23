import { VoucherCtaBlock } from '@/blocks/VoucherCta/Component'
import { getLocale } from '@/utilities/getLocale'
import { getVoucherCtaGlobal } from '@/utilities/getVoucherCtaGlobal'

interface VoucherCtaGlobalWrapperProps {
  id?: string
}

/**
 * Server component that fetches global voucher CTA data and renders it.
 * Edit once in /admin → Website → Voucher CTA, appears everywhere.
 */
export async function VoucherCtaGlobalWrapper({ id }: VoucherCtaGlobalWrapperProps) {
  const locale = await getLocale()
  const data = await getVoucherCtaGlobal(locale)

  return (
    <VoucherCtaBlock
      id={id}
      blockType="voucherCta"
      heading={data.heading}
      description={data.description}
      buttonLabel={data.buttonLabel}
      buttonLink={data.buttonLink}
      galleryImages={data.galleryImages ?? []}
      backgroundImage={data.backgroundImage ?? null}
    />
  )
}
