import type { VoucherCtaGlobal } from '@/payload-types'
import { normalizeAppLocale, strictLocaleQuery } from '@/utilities/payloadLocaleQuery'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function getVoucherCtaGlobal(locale: string = 'de'): Promise<VoucherCtaGlobal> {
  const cmsLocale = normalizeAppLocale(locale)
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({
      slug: 'voucher-cta-global',
      ...strictLocaleQuery(cmsLocale),
      depth: 2,
      draft: false,
    })) as VoucherCtaGlobal
  } catch (error) {
    console.warn('Failed to fetch voucher CTA global:', error)
    return {
      eyebrow: cmsLocale === 'en' ? 'FERMENT TOGETHER' : 'GEMEINSAM FERMENTIEREN',
      title: cmsLocale === 'en' ? 'Go with a friend.' : 'Go with a friend.',
      description:
        cmsLocale === 'en'
          ? 'Gift someone a special experience — our vouchers are the perfect gift for foodies and curious minds.'
          : 'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und neugierige Köpfe.',
      primaryLabel: cmsLocale === 'en' ? 'Buy Voucher' : 'Gutschein kaufen',
      primaryHref: '/workshops/voucher',
      secondaryLabel: cmsLocale === 'en' ? 'Visit Shop' : 'Zum Shop',
      secondaryHref: '/shop',
      pills: [],
      id: 'voucher-cta-global',
    } as VoucherCtaGlobal
  }
}
