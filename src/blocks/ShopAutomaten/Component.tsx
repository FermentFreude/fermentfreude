import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Media as MediaType, ShopAutomatenBlock } from '@/payload-types'

import {
  AutomatenEditorial,
  type AutomatenEditorialLocation,
} from './AutomatenGuide'

const ACCENTS = ['#5C6B54', '#403c39', '#C4A35A']

const DEFAULTS = {
  de: {
    eyebrow: 'Graz · Rund um die Uhr',
    heading: 'Unsere Produkte jederzeit.',
    body: 'Zwei Automaten in Graz. Frisches Käferbohnen-Tempeh, wann immer du Lust hast.',
    mapsLabel: 'In Maps öffnen',
    shareLabel: 'Route teilen',
    websiteLabel: 'Zur Website',
    tipLabel: 'Insider',
    tipText:
      'Hier steht unser Käferbohnen-Tempeh regelmäßig auf der Speisekarte.',
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
        imageUrl: null as string | null,
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
        imageUrl: null as string | null,
        imageAlt: 'Waltendorf Automat',
        accent: ACCENTS[1],
      },
    ] satisfies AutomatenEditorialLocation[],
  },
  en: {
    eyebrow: 'Graz · Available 24/7',
    heading: 'Find our products anytime.',
    body: 'Two Automaten in Graz. Fresh runner bean tempeh, whenever you need it.',
    mapsLabel: 'Open in Maps',
    shareLabel: 'Share route',
    websiteLabel: 'Visit website',
    tipLabel: 'Insider tip',
    tipText:
      'Our Käferbohnen Tempeh is regularly on the menu here.',
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
        imageUrl: null as string | null,
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
        imageUrl: null as string | null,
        imageAlt: 'Waltendorf Automat',
        accent: ACCENTS[1],
      },
    ] satisfies AutomatenEditorialLocation[],
  },
} as const

function mediaId(val: unknown): string | null {
  if (typeof val === 'string' && val.trim()) return val
  if (typeof val === 'object' && val !== null && 'id' in val) {
    const id = (val as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

function mediaUrl(val: unknown): string | null {
  if (typeof val === 'object' && val !== null && 'url' in val) {
    const url = (val as MediaType).url
    return typeof url === 'string' && url.trim() ? url : null
  }
  return null
}

function mediaAlt(val: unknown, fallback: string): string {
  if (typeof val === 'object' && val !== null && 'alt' in val) {
    const alt = (val as MediaType).alt
    if (typeof alt === 'string' && alt.trim()) return alt
  }
  return fallback
}

async function urlIsReachable(url: string | null): Promise<string | null> {
  if (!url) return null
  // Skip known broken R2 uploads from the Automaten sync (HEAD 404)
  if (/david-auto-loc[12]-/i.test(url)) return null
  try {
    const head = await fetch(url, { method: 'HEAD' })
    return head.ok ? url : null
  } catch {
    return null
  }
}

async function resolveMediaUrl(
  payload: Awaited<ReturnType<typeof getPayload>>,
  val: unknown,
): Promise<{ url: string | null; alt: string }> {
  const alt = mediaAlt(val, '')
  const direct = await urlIsReachable(mediaUrl(val))
  if (direct) return { url: direct, alt }

  const id = mediaId(val)
  if (!id) return { url: null, alt }

  try {
    const doc = await payload.findByID({
      collection: 'media',
      id,
      depth: 0,
      overrideAccess: true,
    })
    const url = await urlIsReachable(typeof doc.url === 'string' ? doc.url : null)
    return {
      url,
      alt: typeof doc.alt === 'string' && doc.alt.trim() ? doc.alt : alt,
    }
  } catch {
    return { url: null, alt }
  }
}

async function findFallbackUrls(payload: Awaited<ReturnType<typeof getPayload>>) {
  // Match editorial layout: plated featured; card 01 = circular pack label
  const picks = [
    { contains: 'shop-hero-kaefer-plated', key: 'featured' as const },
    { contains: 'shop-hero-kaefer', key: 'featured' as const },
    { contains: 'automaten-poelzl-sign', key: 'loc1' as const },
    { contains: 'david-pack-auto', key: 'loc1' as const },
    { contains: 'david-pack-card', key: 'loc1' as const },
    { contains: 'david-auto-feat', key: 'loc1' as const },
    { contains: 'kaefer-packaging-drive', key: 'loc1' as const },
    { contains: 'automaten-poelzl-shop-hi', key: 'loc2' as const },
    { contains: 'automaten-poelzl-shop', key: 'loc2' as const },
    { contains: 'berglinsen-plated', key: 'loc2' as const },
    { contains: 'david-auto-feat', key: 'loc2' as const },
  ]
  const out: Record<'featured' | 'loc1' | 'loc2', string | null> = {
    featured: null,
    loc1: null,
    loc2: null,
  }

  for (const pick of picks) {
    if (out[pick.key]) continue
    const res = await payload.find({
      collection: 'media',
      where: { filename: { contains: pick.contains } },
      limit: 5,
      sort: '-createdAt',
      overrideAccess: true,
    })
    for (const doc of res.docs) {
      if (typeof doc.url !== 'string' || !doc.url) continue
      if (/david-auto-loc[12]-/i.test(doc.url)) continue
      const ok = await urlIsReachable(doc.url)
      if (ok) {
        out[pick.key] = ok
        break
      }
    }
  }
  return out
}

export const ShopAutomatenComponent: React.FC<ShopAutomatenBlock> = async (props) => {
  if (props.visible === false) return null

  const locale = (await getLocale()) as 'de' | 'en'
  const d = DEFAULTS[locale === 'de' ? 'de' : 'en']
  const payload = await getPayload({ config: configPromise })

  // Re-read live shop block so tip image/text stay in sync with CMS (drafts / HMR)
  let block: ShopAutomatenBlock = props
  try {
    const pageRes = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'shop' } },
      locale,
      depth: 2,
      limit: 1,
      overrideAccess: true,
      draft: false,
    })
    const live = (pageRes.docs[0]?.layout as ShopAutomatenBlock[] | undefined)?.find(
      (b) => b?.blockType === 'shopAutomaten',
    )
    if (live) block = { ...props, ...live }
  } catch {
    // keep props
  }

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
  let tipResolved = tipVisible
    ? await resolveMediaUrl(payload, block.tipImage)
    : { url: null as string | null, alt: '' }

  if (tipVisible && !tipResolved.url) {
    const tipMedia = await payload.find({
      collection: 'media',
      where: { filename: { contains: 'automaten-wildmoser' } },
      limit: 3,
      sort: '-createdAt',
      overrideAccess: true,
    })
    for (const doc of tipMedia.docs) {
      const ok = await urlIsReachable(typeof doc.url === 'string' ? doc.url : null)
      if (ok) {
        tipResolved = { url: ok, alt: typeof doc.alt === 'string' ? doc.alt : tipName || '' }
        break
      }
    }
  }

  const featuredResolved = await resolveMediaUrl(payload, block.featuredImage)
  const fallbacks = await findFallbackUrls(payload)

  const cmsLocs = block.locations ?? []
  let locations: AutomatenEditorialLocation[] = []

  if (cmsLocs.length > 0) {
    for (let i = 0; i < cmsLocs.length; i++) {
      const loc = cmsLocs[i]
      const name = loc?.name?.trim()
      const address = loc?.address?.trim()
      const mapsUrl = loc?.mapsUrl?.trim()
      if (!name || !address || !mapsUrl) continue

      const resolved = await resolveMediaUrl(payload, loc.image)
      const fallbackUrl = i === 0 ? fallbacks.loc1 : fallbacks.loc2
      locations.push({
        city: loc.city?.trim() || '',
        name,
        address,
        products: loc.products?.trim() || '',
        description: loc.description?.trim() || loc.note?.trim() || '',
        badge: loc.accessInfo?.trim() || d.badge,
        mapsUrl,
        websiteUrl: loc.websiteUrl?.trim() || d.locations[Math.min(i, d.locations.length - 1)]?.websiteUrl || null,
        imageUrl: resolved.url || fallbackUrl,
        imageAlt: resolved.alt || name,
        accent: ACCENTS[i % ACCENTS.length],
      })
    }
  }

  if (locations.length === 0) {
    locations = d.locations.map((loc, i) => ({
      ...loc,
      imageUrl: i === 0 ? fallbacks.loc1 : fallbacks.loc2,
    }))
  }

  const featuredImageUrl = featuredResolved.url || fallbacks.featured || locations[0]?.imageUrl || null
  const featuredImageAlt = featuredResolved.alt || heading

  return (
    <AutomatenEditorial
      eyebrow={eyebrow}
      heading={heading}
      body={body}
      mapsLabel={mapsLabel}
      shareLabel={shareLabel}
      websiteLabel={websiteLabel}
      featuredImageUrl={featuredImageUrl}
      featuredImageAlt={featuredImageAlt}
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
