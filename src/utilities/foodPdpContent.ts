import type { Product } from '@/payload-types'

import type { AppLocale } from '@/utilities/productDetailDisplay'

type FlavorNote = { label?: string | null }
type TrustPoint = { text?: string | null }
type UsageStep = { title?: string | null; description?: string | null }

export type FoodPdpContent = {
  tagline: string | null
  heroNote: string | null
  tasteHeadline: string | null
  storyIntro: string | null
  storyDetail: string | null
  flavorNotes: string[]
  trustPoints: string[]
  usageSteps: Array<{ title: string; description: string | null }>
  origin: string | null
  madeIn: string | null
  usageSectionTitle: string
}

const DEFAULTS: Record<
  AppLocale,
  {
    usageTempeh: string
    usageKimchi: string
    usageJarred: string
  }
> = {
  de: {
    usageTempeh: 'So wird dein Tempeh richtig gut',
    usageKimchi: 'So genießt du dein Kimchi am besten',
    usageJarred: 'So wird es richtig gut',
  },
  en: {
    usageTempeh: 'How to make your tempeh shine',
    usageKimchi: 'How to enjoy your kimchi best',
    usageJarred: 'How to get the most from it',
  },
}

function mapFlavorNotes(notes: FlavorNote[] | null | undefined): string[] {
  if (!notes?.length) return []
  return notes.map((n) => n.label?.trim()).filter((l): l is string => Boolean(l))
}

function mapTrustPoints(points: TrustPoint[] | null | undefined): string[] {
  if (!points?.length) return []
  return points.map((p) => p.text?.trim()).filter((t): t is string => Boolean(t))
}

function mapUsageSteps(steps: UsageStep[] | null | undefined) {
  if (!steps?.length) return []
  return steps
    .map((s) => ({
      title: s.title?.trim() ?? '',
      description: s.description?.trim() ?? null,
    }))
    .filter((s) => s.title)
}

function richTextToPlain(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const node = data as { root?: unknown; type?: string; text?: string; children?: unknown[] }
  if (node.root) return richTextToPlain(node.root)
  if (typeof node.text === 'string' && node.text.trim()) return node.text.trim()
  if (Array.isArray(node.children)) {
    const joined = node.children.map(richTextToPlain).filter(Boolean).join(' ')
    return joined.trim() || null
  }
  return null
}

function storyFromDescription(description: Product['description']): {
  intro: string | null
  detail: string | null
} {
  const plain = richTextToPlain(description)
  if (!plain) return { intro: null, detail: null }

  const split = plain.match(/^(.+?[.!?…])\s+([\s\S]+)$/)
  if (split) {
    return { intro: split[1].trim(), detail: split[2].trim() }
  }
  return { intro: plain, detail: null }
}

export function getFoodPdpContent(product: Product, locale: AppLocale): FoodPdpContent {
  const fromCms = product.pdpUsageSectionTitle?.trim()
  const usageSectionTitle =
    fromCms ||
    (product.productType === 'jarred'
      ? DEFAULTS[locale].usageKimchi
      : product.productType === 'fresh'
        ? DEFAULTS[locale].usageTempeh
        : DEFAULTS[locale].usageJarred)

  const fromDescription = storyFromDescription(product.description)

  return {
    tagline: product.pdpTagline?.trim() || null,
    heroNote: product.shortDescription?.trim() || null,
    tasteHeadline: product.pdpTasteHeadline?.trim() || null,
    storyIntro: product.pdpStoryIntro?.trim() || fromDescription.intro,
    storyDetail: product.pdpStoryDetail?.trim() || fromDescription.detail,
    flavorNotes: mapFlavorNotes(product.pdpFlavorNotes),
    trustPoints: mapTrustPoints(product.pdpTrustPoints),
    usageSteps: mapUsageSteps(product.pdpUsageSteps),
    origin: product.productOrigin?.trim() || null,
    madeIn: product.madeIn?.trim() || null,
    usageSectionTitle,
  }
}

/** Hero badges only — excludes fermented/refrigerated clutter; kimchi never shows gluten-free */
export function getHeroBadges(product: Product): string[] {
  const badges: string[] = []
  if (product.isVegan) badges.push('vegan')
  if (product.isOrganic) badges.push('organic')
  if (product.isGlutenFree) badges.push('gluten-free')
  return badges
}

/** Strip leading emoji from CMS trust-point text when icons are rendered in UI */
export function stripTrustPointEmoji(text: string): string {
  return text
    .replace(/^[\s\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]+/u, '')
    .trim()
}
