/**
 * Seed data builder for the VoucherCta block.
 */

export interface VoucherCtaImages {
  galleryMediaIds: string[]
  backgroundImageId?: string
}

export function buildVoucherCta(imgs: VoucherCtaImages) {
  const galleryImages = imgs.galleryMediaIds.map((id) => ({ image: id }))

  const de = {
    blockType: 'voucherCta' as const,
    eyebrow: 'Workshops · Gutscheine · Genuss',
    heading: 'Verschenke Fermentation als Erlebnis',
    description:
      'Ob zum Geburtstag, als Überraschung oder einfach so – mit einem GUTSCHEIN verschenkst du Genuss und ein Erlebnis, das in Erinnerung bleibt.',
    buttonLabel: 'Mehr erfahren',
    buttonLink: '/voucher',
    ...(imgs.backgroundImageId ? { backgroundImage: imgs.backgroundImageId } : {}),
    galleryImages,
  }

  const en = {
    blockType: 'voucherCta' as const,
    eyebrow: 'Workshops · Vouchers · Flavour',
    heading: 'Give fermentation as an experience',
    description:
      'For a birthday, a surprise, or just because — with a GIFT VOUCHER you share great taste and a memory that lasts.',
    buttonLabel: 'Learn more',
    buttonLink: '/voucher',
    ...(imgs.backgroundImageId ? { backgroundImage: imgs.backgroundImageId } : {}),
    galleryImages,
  }

  return { de, en }
}

type VoucherBlock = {
  id?: string
  galleryImages?: { id?: string }[]
}

export function mergeVoucherCtaEN(
  en: ReturnType<typeof buildVoucherCta>['en'],
  fresh: VoucherBlock,
) {
  return {
    ...en,
    id: fresh.id,
    galleryImages: en.galleryImages.map((g, i) => ({ ...g, id: fresh.galleryImages?.[i]?.id })),
  }
}
