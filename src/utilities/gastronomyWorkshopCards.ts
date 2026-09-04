/**
 * Builds the four /gastronomy workshop cards from workshop page CMS,
 * with optional Gastronomy-page overrides and English fallbacks.
 */

import type { Media } from '@/payload-types'
import type { NextWorkshopDateInfo } from '@/utilities/getNextWorkshopDatesByHref'
import { looksGerman } from '@/utilities/gastronomyLocaleContent'
import {
  WORKSHOP_CARD_URLS,
  type WorkshopPageCardSync,
} from '@/utilities/workshopHeroImages'

export type GastronomyWorkshopCardDefault = {
  title: string
  description: string
  price: string
  priceSuffix: string
  buttonLabel: string
  buttonUrl: string
}

const DEFAULTS_DE: GastronomyWorkshopCardDefault[] = [
  {
    title: 'Lakto-Gemüse',
    description:
      'Gemüse fermentieren, Aromen erleben – jeden Monat anders. Live online Session.',
    price: '€99',
    priceSuffix: 'pro Person',
    buttonLabel: 'Mehr Infos & Buchen',
    buttonUrl: '/workshops/lakto-gemuese',
  },
  {
    title: 'Kombucha',
    description: 'Lernen Sie, zu Hause köstlichen und gesunden Kombucha zu brauen.',
    price: '€99',
    priceSuffix: 'pro Person',
    buttonLabel: 'Mehr Infos & Buchen',
    buttonUrl: '/workshops/kombucha',
  },
  {
    title: 'Tempeh',
    description:
      'Entdecken Sie die Vielseitigkeit von Tempeh und wie Sie es in Ihre Küche integrieren.',
    price: '€99',
    priceSuffix: 'pro Person',
    buttonLabel: 'Mehr Infos & Buchen',
    buttonUrl: '/workshops/tempeh',
  },
  {
    title: 'Vom Feld ins Glas',
    description:
      'Fermentation beginnt am Feld. Ernte, Handwerk und drei Lakto-Fermente im Marktgarten „Unser Bauerngarten“.',
    price: '€99',
    priceSuffix: 'pro Person',
    buttonLabel: 'Mehr Infos & Buchen',
    buttonUrl: '/workshops/vom-feld-ins-glas',
  },
]

const DEFAULTS_EN: GastronomyWorkshopCardDefault[] = [
  {
    title: 'Lakto-Gemüse',
    description:
      'Ferment vegetables, experience aromas – different every month. Live online session.',
    price: '€99',
    priceSuffix: 'per Person',
    buttonLabel: 'More Info & Book',
    buttonUrl: '/workshops/lakto-gemuese',
  },
  {
    title: 'Kombucha',
    description: 'Learn to brew delicious and healthy kombucha at home.',
    price: '€99',
    priceSuffix: 'per Person',
    buttonLabel: 'More Info & Book',
    buttonUrl: '/workshops/kombucha',
  },
  {
    title: 'Tempeh',
    description:
      'Discover the versatility of tempeh and how to incorporate it into your cooking.',
    price: '€99',
    priceSuffix: 'per Person',
    buttonLabel: 'More Info & Book',
    buttonUrl: '/workshops/tempeh',
  },
  {
    title: 'Vom Feld ins Glas',
    description:
      'Fermentation starts in the field. Harvest, craft, and three lacto-ferments at the “Unser Bauerngarten” market garden.',
    price: '€99',
    priceSuffix: 'per Person',
    buttonLabel: 'More Info & Book',
    buttonUrl: '/workshops/vom-feld-ins-glas',
  },
]

export type GastronomyWorkshopCardCmsInput = {
  id?: string | null
  title?: string | null
  description?: string | null
  image?: unknown
  price?: string | null
  priceSuffix?: string | null
  buttonLabel?: string | null
  buttonUrl?: string | null
  nextDate?: string | null
  duration?: string | null
}

export type SyncedWorkshopCard = {
  id?: string | null
  title: string
  description: string
  price: string
  priceSuffix: string
  buttonLabel: string
  buttonUrl: string
  image?: Media | unknown
  nextDate?: string
  availableSpots?: number
}

function pickText(
  override: string | null | undefined,
  synced: string | null | undefined,
  fallback: string,
  locale: 'de' | 'en',
): string {
  const fromOverride = override?.trim()
  if (fromOverride && !(locale === 'en' && looksGerman(fromOverride))) {
    return fromOverride
  }
  const fromSynced = synced?.trim()
  if (fromSynced && !(locale === 'en' && looksGerman(fromSynced))) {
    return fromSynced
  }
  return fallback
}

/**
 * Priority per field:
 * 1. Gastronomy page CMS override (gastronomyWorkshopCards)
 * 2. Matching workshop page CMS (Workshop Detail tab)
 * 3. English hardcoded fallback
 */
export function buildSyncedWorkshopCards(
  cmsCards: GastronomyWorkshopCardCmsInput[],
  workshopPageData: Record<string, WorkshopPageCardSync>,
  locale: 'de' | 'en',
  nextDates: Record<string, NextWorkshopDateInfo>,
): SyncedWorkshopCard[] {
  const defaults = locale === 'de' ? DEFAULTS_DE : DEFAULTS_EN
  const cmsByUrl = new Map(
    cmsCards.filter((c) => c.buttonUrl).map((c) => [c.buttonUrl!, c] as const),
  )

  return WORKSHOP_CARD_URLS.map((buttonUrl) => {
    const fallback = defaults.find((d) => d.buttonUrl === buttonUrl)!
    const cms = cmsByUrl.get(buttonUrl)
    const synced = workshopPageData[buttonUrl]
    const nextDateData = nextDates[buttonUrl]

    const card: SyncedWorkshopCard = {
      id: cms?.id,
      title: pickText(cms?.title, synced?.title, fallback.title, locale),
      description: pickText(cms?.description, synced?.description, fallback.description, locale),
      price: pickText(cms?.price, synced?.price, fallback.price, locale),
      priceSuffix: pickText(cms?.priceSuffix, synced?.priceSuffix, fallback.priceSuffix, locale),
      buttonLabel: pickText(cms?.buttonLabel, null, fallback.buttonLabel, locale),
      buttonUrl,
      image: synced?.image ?? cms?.image ?? null,
    }

    if (nextDateData) {
      card.nextDate = nextDateData.date ?? undefined
      card.availableSpots = nextDateData.soldOut ? 0 : nextDateData.availableSpots
    } else {
      card.nextDate = cms?.nextDate?.trim() || undefined
    }

    return card
  })
}

/** @deprecated Use buildSyncedWorkshopCards */
export function mergeGastronomyWorkshopCards(
  cmsCards: GastronomyWorkshopCardCmsInput[],
  locale: 'de' | 'en',
): SyncedWorkshopCard[] {
  return buildSyncedWorkshopCards(cmsCards, {}, locale, {})
}
