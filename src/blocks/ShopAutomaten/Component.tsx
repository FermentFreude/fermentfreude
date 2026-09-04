import { getLocale } from '@/utilities/getLocale'
import React from 'react'

import type { Media as MediaType, ShopAutomatenBlock } from '@/payload-types'

import {
  AutomatenEditorial,
  type AutomatenEditorialLocation,
} from './AutomatenGuide'

const ACCENTS = ['#5C6B54', '#403c39', '#C4A35A']

/** Instant local fallbacks — no network probes on the request path */
const LOCAL_FALLBACKS = {
  featured: '/shop/hero-kaefer-plate.webp',
  loc1: '/shop/automaten-loc-poelzl-sign.webp',
  loc2: '/shop/automaten-loc-poelzl-storefront-wide.webp',
  tip: '/shop/automaten-tip-wildmoser.webp',
} as const

const DEFAULTS = {
  de: {
    eyebrow: 'Graz · Entdecken',
    heading: 'Tempeh, wann immer du Lust hast',
    body: 'Zwei versteckte Spots in Graz: Automaten-Abholung rund um die Uhr und Käferbohnen-Tempeh auf dem Teller.',
    mapsLabel: 'In Maps öffnen',
    shareLabel: 'Route teilen',
    websiteLabel: 'Zur Website',
    tipLabel: 'Insider',
    tipText: 'Hier steht unser Käferbohnen-Tempeh regelmäßig auf der Speisekarte.',
    tipMapsUrl: 'https://maps.app.goo.gl/yrLi4rHiVozjCbzo6',
    tipWebsiteUrl: 'https://www.wildmoser-graz.at/',
    tipAddress: 'Grüne Gasse 17, 8020 Graz',
    tipProducts: 'Käferbohnen-Tempeh',
    badge: '24/7 Automat',
    locations: [
      {
        city: 'Graz',
        name: 'Automat Pölzl Gemüse & Freunde',
        address: 'Leonhardplatz 12, 8010 Graz',
        products: 'Käferbohnen-Tempeh',
        description: 'Käferbohnen-Tempeh direkt aus dem Automaten, frisch und ohne Termin.',
        badge: '24/7 Automat',
        mapsUrl:
          'https://www.google.com/maps/search/?api=1&query=Leonhardplatz+12+8010+Graz+P%C3%B6lzl+Automat',
        websiteUrl: 'https://poelzl.at/' as string | null,
        imageUrl: LOCAL_FALLBACKS.loc1 as string | null,
        imageAlt: 'Leonhardplatz Automat',
        accent: ACCENTS[0],
      },
      {
        city: 'Graz',
        name: 'Automat Pölzl Gemüse · Waltendorf',
        address: 'Waltendorfer Hauptstraße 19, Graz',
        products: 'Käferbohnen-Tempeh',
        description: 'Zweiter Spot in Graz, rund um die Uhr verfügbar.',
        badge: '24/7 Automat',
        mapsUrl:
          'https://www.google.com/maps/search/?api=1&query=P%C3%B6lzl+Gem%C3%BCse+Waltendorfer+Hauptstra%C3%9Fe+19+Graz',
        websiteUrl: 'https://poelzl.at/' as string | null,
        imageUrl: LOCAL_FALLBACKS.loc2 as string | null,
        imageAlt: 'Waltendorf Automat',
        accent: ACCENTS[1],
      },
    ] satisfies AutomatenEditorialLocation[],
  },
  en: {
    eyebrow: 'Graz · Discover',
    heading: 'Tempeh, whenever you want it',
    body: 'Two hidden spots in Graz: 24/7 Automat pickup and Käferbohnen Tempeh on the plate.',
    mapsLabel: 'Open in Maps',
    shareLabel: 'Share route',
    websiteLabel: 'Visit website',
    tipLabel: 'Insider tip',
    tipText: 'Our Käferbohnen Tempeh is regularly on the menu here.',
    tipMapsUrl: 'https://maps.app.goo.gl/yrLi4rHiVozjCbzo6',
    tipWebsiteUrl: 'https://www.wildmoser-graz.at/',
    tipAddress: 'Grüne Gasse 17, 8020 Graz',
    tipProducts: 'Käferbohnen Tempeh',
    badge: '24/7 Vending Machine',
    locations: [
      {
        city: 'Graz',
        name: 'Automat Pölzl Gemüse & Freunde',
        address: 'Leonhardplatz 12, 8010 Graz',
        products: 'Käferbohnen Tempeh',
        description: 'Runner bean tempeh from the Automat, fresh, no appointment needed.',
        badge: '24/7 Vending Machine',
        mapsUrl:
          'https://www.google.com/maps/search/?api=1&query=Leonhardplatz+12+8010+Graz+P%C3%B6lzl+Automat',
        websiteUrl: 'https://poelzl.at/' as string | null,
        imageUrl: LOCAL_FALLBACKS.loc1 as string | null,
        imageAlt: 'Leonhardplatz Automat',
        accent: ACCENTS[0],
      },
      {
        city: 'Graz',
        name: 'Automat Pölzl Gemüse · Waltendorf',
        address: 'Waltendorfer Hauptstraße 19, Graz',
        products: 'Käferbohnen Tempeh',
        description: 'Second Graz spot, available around the clock.',
        badge: '24/7 Vending Machine',
        mapsUrl:
          'https://www.google.com/maps/search/?api=1&query=P%C3%B6lzl+Gem%C3%BCse+Waltendorfer+Hauptstra%C3%9Fe+19+Graz',
        websiteUrl: 'https://poelzl.at/' as string | null,
        imageUrl: LOCAL_FALLBACKS.loc2 as string | null,
        imageAlt: 'Waltendorf Automat',
        accent: ACCENTS[1],
      },
    ] satisfies AutomatenEditorialLocation[],
  },
} as const

function resolveMedia(val: unknown, fallbackUrl: string, fallbackAlt: string): {
  url: string
  alt: string
} {
  if (typeof val === 'object' && val !== null) {
    const media = val as MediaType
    const url = typeof media.url === 'string' && media.url.trim() ? media.url.trim() : null
    // Skip known-broken Automaten uploads from an earlier sync
    if (url && !/david-auto-loc[12]-/i.test(url)) {
      const alt =
        typeof media.alt === 'string' && media.alt.trim() ? media.alt.trim() : fallbackAlt
      return { url, alt }
    }
  }
  return { url: fallbackUrl, alt: fallbackAlt }
}

/**
 * Shop Automaten section — CMS copy + media when present, local fallbacks otherwise.
 * Intentionally does NOT probe R2 with HEAD requests (that blocked /shop for many seconds).
 */
export const ShopAutomatenComponent: React.FC<ShopAutomatenBlock> = async (props) => {
  if (props.visible === false) return null

  const locale = (await getLocale()) as 'de' | 'en'
  const d = DEFAULTS[locale === 'de' ? 'de' : 'en']
  const block = props

  const eyebrow = block.eyebrow?.trim() || d.eyebrow
  const heading = block.heading?.trim() || d.heading
  const body = block.body?.trim() || d.body
  const mapsLabel = block.mapsLabel?.trim() || d.mapsLabel
  const shareLabel = block.shareLabel?.trim() || d.shareLabel
  const websiteLabel = block.websiteLabel?.trim() || d.websiteLabel
  const tipVisible = block.tipVisible !== false
  const tipText = tipVisible ? block.tipText?.trim() || d.tipText : null
  const tipMapsUrl = tipVisible ? block.tipMapsUrl?.trim() || d.tipMapsUrl : null
  const tipWebsiteUrl = tipVisible
    ? block.tipWebsiteUrl?.trim() || d.tipWebsiteUrl
    : null
  const tipName = tipVisible ? block.tipName?.trim() || 'Wildmoser' : null

  const tipResolved = tipVisible
    ? resolveMedia(block.tipImage, LOCAL_FALLBACKS.tip, tipName || 'Wildmoser')
    : { url: null as string | null, alt: '' }

  const featuredResolved = resolveMedia(
    block.featuredImage,
    LOCAL_FALLBACKS.featured,
    heading,
  )

  const cmsLocs = block.locations ?? []
  let locations: AutomatenEditorialLocation[] = []

  if (cmsLocs.length > 0) {
    for (let i = 0; i < cmsLocs.length; i++) {
      const loc = cmsLocs[i]
      const name = loc?.name?.trim()
      const address = loc?.address?.trim()
      const mapsUrl = loc?.mapsUrl?.trim()
      if (!name || !address || !mapsUrl) continue

      const fallbackUrl = i === 0 ? LOCAL_FALLBACKS.loc1 : LOCAL_FALLBACKS.loc2
      const resolved = resolveMedia(loc.image, fallbackUrl, name)

      locations.push({
        city: loc.city?.trim() || '',
        name,
        address,
        products: loc.products?.trim() || '',
        description: loc.description?.trim() || loc.note?.trim() || '',
        badge: loc.accessInfo?.trim() || d.badge,
        mapsUrl,
        websiteUrl:
          loc.websiteUrl?.trim() ||
          d.locations[Math.min(i, d.locations.length - 1)]?.websiteUrl ||
          null,
        imageUrl: resolved.url,
        imageAlt: resolved.alt,
        accent: ACCENTS[i % ACCENTS.length],
      })
    }
  }

  if (locations.length === 0) {
    locations = d.locations.map((loc) => ({ ...loc }))
  }

  return (
    <AutomatenEditorial
      eyebrow={eyebrow}
      heading={heading}
      body={body}
      mapsLabel={mapsLabel}
      shareLabel={shareLabel}
      websiteLabel={websiteLabel}
      featuredImageUrl={featuredResolved.url}
      featuredImageAlt={featuredResolved.alt}
      locations={locations}
      tipText={tipText}
      tipMapsUrl={tipMapsUrl}
      tipWebsiteUrl={tipWebsiteUrl}
      tipLabel={d.tipLabel}
      tipName={tipName}
      tipAddress={d.tipAddress}
      tipProducts={d.tipProducts}
      tipImageUrl={tipResolved.url}
      tipImageAlt={tipResolved.alt || tipName || 'Restaurant'}
    />
  )
}
