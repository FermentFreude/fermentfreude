/**
 * Seed data builder for the VoucherCta block.
 */

export interface VoucherCtaImages {
  galleryMediaIds: string[]
}

export function buildVoucherCta(imgs: VoucherCtaImages) {
  const galleryImages = imgs.galleryMediaIds.map((id) => ({ image: id }))

  const de = {
    blockType: 'voucherCta' as const,
    heading: 'Verschenke ein besonderes Geschmacks-Erlebnis',
    description: 'Teile ein leckeres Erlebnis mit jemandem Besonderem.',
    buttonLabel: 'Gutschein',
    buttonLink: '/voucher',
    galleryImages,
  }

  const en = {
    blockType: 'voucherCta' as const,
    heading: 'Gift a special tasty experience',
    description: 'Share a tasty experience with someone special.',
    buttonLabel: 'Voucher',
    buttonLink: '/voucher',
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
