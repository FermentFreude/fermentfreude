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
      eyebrow: locale === 'en' ? 'FERMENT TOGETHER' : 'GEMEINSAM FERMENTIEREN',
      title: locale === 'en' ? 'Go with a friend.' : 'Go with a friend.',
      description:
        locale === 'en'
          ? 'Gift someone a special experience — our vouchers are the perfect gift for foodies and curious minds.'
          : 'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und neugierige Köpfe.',
      primaryLabel: locale === 'en' ? 'Buy Voucher' : 'Gutschein kaufen',
      primaryHref: '/voucher',
      secondaryLabel: locale === 'en' ? 'Visit Shop' : 'Zum Shop',
      secondaryHref: '/shop',
      pills: [],
      id: 'voucher-cta-global',
    } as VoucherCtaGlobal
  }
}
