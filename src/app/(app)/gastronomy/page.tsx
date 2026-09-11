import type { Metadata } from 'next'
import { Fragment } from 'react'

import { GastronomyAudience } from '@/components/gastronomy/GastronomyAudience'
import { GastronomyBenefits } from '@/components/gastronomy/GastronomyBenefits'
import { GastronomyHero } from '@/components/gastronomy/GastronomyHero'
import { GastronomyInquiry } from '@/components/gastronomy/GastronomyInquiry'
import { GastronomyProductOffer } from '@/components/gastronomy/GastronomyProductOffer'
import { GastronomyProof } from '@/components/gastronomy/GastronomyProof'
import { GastronomyShowcase } from '@/components/gastronomy/GastronomyShowcase'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type {
  GastronomyAudienceBlock,
  GastronomyBenefitsBlock,
  GastronomyHeroBlock,
  GastronomyInquiryBlock,
  GastronomyProductBlock,
  GastronomyProofBlock,
  GastronomyShowcaseBlock,
  Page as PageType,
} from '@/payload-types'

type OptionGroup = {
  default?: string | null
  options?: Array<{ id?: string | null; label?: string | null } | null> | null
}

async function fetchGastronomyPage(locale: string) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 4,
    locale: locale as 'de' | 'en',
    fallbackLocale: false,
  })
  return (result.docs[0] as PageType | undefined) ?? null
}

const getCachedGastronomyPageProd = unstable_cache(fetchGastronomyPage, ['gastronomy-page'], {
  revalidate: 3600,
  tags: ['pages'],
})

async function getCachedGastronomyPage(locale: string) {
  if (process.env.NODE_ENV === 'development') {
    return fetchGastronomyPage(locale)
  }
  return getCachedGastronomyPageProd(locale)
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const locale = await getLocale()
    const doc = await getCachedGastronomyPage(locale)
    if (!doc) return { title: 'Gastronomie | Fermentfreude' }
    return generateMeta({ doc })
  } catch {
    return { title: 'Gastronomie | Fermentfreude' }
  }
}

function cmsText(value: string | null | undefined, fallback: string): string {
  return value?.trim() || fallback
}

function optionLabels(group: OptionGroup | null | undefined, fallback: string[]): string[] {
  const labels = (group?.options ?? [])
    .map((row) => row?.label?.trim())
    .filter((label): label is string => Boolean(label))
  return labels.length > 0 ? labels : fallback
}

export default async function GastronomyPage() {
  const locale = await getLocale()
  const isDe = locale === 'de'
  const page = await getCachedGastronomyPage(locale)
  const blocks = page?.gastronomy?.gastronomyBlocks ?? []

  if (blocks.length === 0) {
    return <article className="font-sans" />
  }

  return (
    <article className="font-sans">
      {blocks.map((block, index) => {
        if (block.visible === false) return null
        const key = String(block.id ?? `${block.blockType}-${index}`)

        if (block.blockType === 'gastronomyHero') {
          return (
            <Fragment key={key}>
              {renderHero(block, isDe)}
            </Fragment>
          )
        }
        if (block.blockType === 'gastronomyShowcase') {
          return (
            <Fragment key={key}>
              {renderShowcase(block, isDe)}
            </Fragment>
          )
        }
        if (block.blockType === 'gastronomyBenefits') {
          return (
            <Fragment key={key}>
              {renderBenefits(block, isDe)}
            </Fragment>
          )
        }
        if (block.blockType === 'gastronomyAudience') {
          return (
            <Fragment key={key}>
              {renderAudience(block, isDe)}
            </Fragment>
          )
        }
        if (block.blockType === 'gastronomyProduct') {
          return (
            <Fragment key={key}>
              {renderProduct(block, isDe)}
            </Fragment>
          )
        }
        if (block.blockType === 'gastronomyProof') {
          return (
            <Fragment key={key}>
              {renderProof(block, isDe)}
            </Fragment>
          )
        }
        if (block.blockType === 'gastronomyInquiry') {
          return <Fragment key={key}>{renderInquiry(block, isDe)}</Fragment>
        }
        return null
      })}
    </article>
  )
}

function renderHero(block: GastronomyHeroBlock, isDe: boolean) {
  return (
    <GastronomyHero
      image={block.image}
      eyebrow={cmsText(block.eyebrow, isDe ? 'Für Restaurants' : 'For restaurants')}
      title={cmsText(block.title, isDe ? 'Tempeh für Profiküchen.' : 'Tempeh for professional kitchens.')}
      tagline={cmsText(
        block.tagline,
        isDe
          ? 'Käferbohnen-Tempeh mit nussigem Aroma, Umami und einer Textur, die sich vielseitig in moderne Küche integrieren lässt.'
          : 'Runner bean tempeh with a nutty aroma, umami, and a texture that belongs in a modern kitchen.',
      )}
      ctaLabel={cmsText(block.ctaLabel, isDe ? 'Für Gastronomie anfragen' : 'Enquire for gastronomy')}
      ctaUrl={cmsText(block.ctaUrl, '#contact')}
      secondaryLabel={cmsText(block.secondaryLabel, isDe ? 'Tempeh entdecken' : 'Discover tempeh')}
      secondaryUrl={cmsText(block.secondaryUrl, '/products/kaeferbohnen-tempeh')}
    />
  )
}

function renderShowcase(block: GastronomyShowcaseBlock, isDe: boolean) {
  const slides = (block.slides ?? [])
    .filter((row) => row?.title?.trim())
    .map((row) => ({
      id: row.id,
      title: row.title!.trim(),
      text: row.text?.trim() || null,
      image: row.image,
    }))
  if (slides.length === 0) return null
  return (
    <GastronomyShowcase
      title={cmsText(block.title, isDe ? 'Was kann man daraus machen?' : 'What can you make with it?')}
      slides={slides}
      locale={isDe ? 'de' : 'en'}
    />
  )
}

function renderBenefits(block: GastronomyBenefitsBlock, isDe: boolean) {
  const items = (block.items ?? [])
    .filter((row) => row?.title?.trim())
    .map((row) => ({
      id: row.id,
      icon: row.icon,
      title: row.title!.trim(),
      text: row.text?.trim() || null,
    }))
  if (items.length === 0) return null
  return (
    <GastronomyBenefits
      title={cmsText(block.title, isDe ? 'Warum Tempeh für deine Küche?' : 'Why tempeh for your kitchen?')}
      items={items}
    />
  )
}

function renderAudience(block: GastronomyAudienceBlock, isDe: boolean) {
  const cards = (block.cards ?? [])
    .filter((row) => row?.title?.trim())
    .map((row) => ({
      id: row.id,
      title: row.title!.trim(),
      text: row.text?.trim() || null,
      image: row.image,
    }))
  if (cards.length === 0) return null
  return (
    <GastronomyAudience
      title={cmsText(
        block.title,
        isDe
          ? 'Für Restaurants, die mehr aus pflanzlicher Küche machen wollen.'
          : 'For restaurants that want more from plant-based cooking.',
      )}
      cards={cards}
    />
  )
}

function renderProduct(block: GastronomyProductBlock, isDe: boolean) {
  const facts = (block.facts ?? [])
    .map((row) => row?.text?.trim())
    .filter((text): text is string => Boolean(text))
  const extra = block.b2bLine?.trim()
  if (facts.length === 0 && extra) facts.push(extra)

  return (
    <GastronomyProductOffer
      title={cmsText(
        block.title,
        isDe ? 'Käferbohnen-Tempeh für deine Küche' : 'Runner bean tempeh for your kitchen',
      )}
      image={block.image}
      facts={facts}
      ctaLabel={cmsText(block.ctaLabel, isDe ? 'Jetzt B2B-Anfrage senden' : 'Send a B2B enquiry')}
      ctaUrl={cmsText(block.ctaUrl, '#contact')}
    />
  )
}

function renderProof(block: GastronomyProofBlock, isDe: boolean) {
  const items = (block.items ?? [])
    .filter((row) => row?.quote?.trim() && row?.author?.trim())
    .map((row) => ({ quote: row.quote.trim(), author: row.author.trim() }))
  if (items.length === 0) return null
  return (
    <GastronomyProof
      title={cmsText(block.title, isDe ? 'Aus der Küche' : 'From the kitchen')}
      items={items}
      image={block.image}
    />
  )
}

function renderInquiry(block: GastronomyInquiryBlock, isDe: boolean) {
  const placeholders = block.placeholders
  const email = block.email?.trim()
  const phone = block.phone?.trim()
  return (
    <GastronomyInquiry
      labels={{
        heading: cmsText(block.heading, isDe ? 'B2B-Anfrage' : 'B2B enquiry'),
        firstName: cmsText(placeholders?.firstName, 'Name'),
        company: cmsText(
          placeholders?.lastName,
          isDe ? 'Restaurant / Betrieb' : 'Restaurant / company',
        ),
        email: cmsText(placeholders?.email, isDe ? 'E-Mail' : 'Email'),
        phone: cmsText(placeholders?.phone, isDe ? 'Telefon (optional)' : 'Phone (optional)'),
        businessType: cmsText(
          block.businessType?.default,
          isDe ? 'Art des Betriebs' : 'Type of business',
        ),
        businessOptions: optionLabels(
          block.businessType,
          isDe ? ['Restaurant', 'Hotel', 'Catering', 'Sonstiges'] : ['Restaurant', 'Hotel', 'Catering', 'Other'],
        ),
        interest: cmsText(block.interest?.default, isDe ? 'Worum geht es?' : 'What are you interested in?'),
        interestOptions: optionLabels(
          block.interest,
          isDe
            ? ['Tempeh / B2B-Bestellung', 'Produktinfo', 'Probe / Test', 'Team-Schulung', 'Sonstiges']
            : ['Tempeh / B2B order', 'Product information', 'Samples / testing', 'Team training', 'Other'],
        ),
        quantity: cmsText(
          placeholders?.quantity,
          isDe ? 'Ungefähre Menge (optional)' : 'Approximate quantity (optional)',
        ),
        message: cmsText(placeholders?.message, isDe ? 'Nachricht' : 'Message'),
        submit: cmsText(block.submitLabel, isDe ? 'Anfrage senden' : 'Send enquiry'),
        contactLine: [email, phone].filter(Boolean).join(' · ') || null,
      }}
    />
  )
}
