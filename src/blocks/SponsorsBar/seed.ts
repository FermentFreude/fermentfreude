/**
 * Seed data builder for the SponsorsBar block.
 */

export interface SponsorsBarImages {
  sponsorLogo1Id: string
  sponsorLogo2Id: string
  sponsorLogo3Id: string
  sponsorLogo4Id: string
}

export function buildSponsorsBar(imgs: SponsorsBarImages) {
  const sponsors = [
    { name: 'Partner 1', logo: imgs.sponsorLogo1Id, url: '' },
    { name: 'Partner 2', logo: imgs.sponsorLogo2Id, url: '' },
    { name: 'Partner 3', logo: imgs.sponsorLogo3Id, url: '' },
    { name: 'Partner 4', logo: imgs.sponsorLogo4Id, url: '' },
  ]

  const de = {
    blockType: 'sponsorsBar' as const,
    heading: 'Dieses Projekt wird unterstützt von:',
    sponsors,
  }

  const en = {
    blockType: 'sponsorsBar' as const,
    heading: 'This project is supported by:',
    sponsors,
  }

  return { de, en }
}

type SponsorsBarBlock = {
  id?: string
  sponsors?: { id?: string }[]
}

export function mergeSponsorsBarEN(
  en: ReturnType<typeof buildSponsorsBar>['en'],
  fresh: SponsorsBarBlock,
) {
  return {
    ...en,
    id: fresh.id,
    sponsors: en.sponsors.map((s, i) => ({ ...s, id: fresh.sponsors?.[i]?.id })),
  }
}
