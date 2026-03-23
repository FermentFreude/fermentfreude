import type { VoucherCtaGlobal } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function getVoucherCtaGlobal(locale: string = 'de'): Promise<VoucherCtaGlobal> {
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'voucher-cta-global',
      locale: locale === 'en' ? 'en' : 'de',
      depth: 2,
      draft: false,
    })) as VoucherCtaGlobal
  } catch (error) {
    console.warn('Failed to fetch voucher CTA global:', error)
    return {
      heading: locale === 'en' ? 'Gift a special tasty experience' : 'Verschenke ein besonderes Geschmackserlebnis',
      description: '',
      buttonLabel: locale === 'en' ? 'Voucher' : 'Gutschein',
      buttonLink: '/workshops/voucher',
      galleryImages: [],
      id: 'voucher-cta-global',
    } as VoucherCtaGlobal
  }
}
