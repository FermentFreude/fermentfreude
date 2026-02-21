import type { Metadata } from 'next'

import { ContactBlockComponent } from '@/blocks/ContactBlock/Component'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { EditPageLink } from '@/components/EditPageLink'
import { GastronomyOfferCards } from '@/components/gastronomy/GastronomyOfferCards'
import { GastronomyProductSlider } from '@/components/gastronomy/GastronomyProductSlider'
import { Media } from '@/components/Media'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import type { Media as MediaType, Page as PageType } from '@/payload-types'

const DEFAULT_HERO_TITLE = 'Elevate Your Gastronomy Business'
const DEFAULT_HERO_CTA = 'Take A Look'
const DEFAULT_OFFER_TITLE = 'What we offer'
const DEFAULT_QUOTE =
  "Transform tradition into innovation. Fermentation is not just preservation it's the future of gastronomy."
const DEFAULT_QUOTE_SUBTEXT = 'Partner with us to differentiate your business.'
const DEFAULT_WORKSHOP_TITLE = 'Next Workshop'
const DEFAULT_WORKSHOP_SUBTITLE = 'Exclusive and Personalized Fermentations'
const DEFAULT_WORKSHOP_NEXT_DATE_LABEL = 'Next Appointment:'
const DEFAULT_OFFER_DETAILS_TITLE = 'What We Offer'
const DEFAULT_COLLABORATE_TITLE = 'Ready to collaborate?'
const DEFAULT_COLLABORATE_SUBTITLE = 'Let us help you create unforgettable culinary experiences.'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Gastronomie | Fermentfreude',
    description:
      'Fermentierte Produkte für Restaurants, Hotels und Catering. Heben Sie Ihre Küche mit einzigartigen Aromen und probiotischen Zutaten auf ein neues Level.',
  }
}

export default async function GastronomyPage() {
  const locale = await getLocale()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 3,
    locale,
  })
  const page = result.docs[0] as PageType | undefined
  const g = page?.gastronomy

  const heroTitle = g?.gastronomyHeroTitle ?? DEFAULT_HERO_TITLE
  const heroCtaLabel = g?.gastronomyHeroCtaLabel ?? DEFAULT_HERO_CTA
  const heroCtaUrl = g?.gastronomyHeroCtaUrl ?? '#offer'
  const offerSectionTitle = g?.gastronomyOfferSectionTitle ?? DEFAULT_OFFER_TITLE
  const offerCards = g?.gastronomyOfferCards ?? []
  const quoteText = g?.gastronomyQuoteText ?? DEFAULT_QUOTE
  const quoteSubtext = g?.gastronomyQuoteSubtext ?? DEFAULT_QUOTE_SUBTEXT
  const workshopSectionTitle = g?.gastronomyWorkshopSectionTitle ?? DEFAULT_WORKSHOP_TITLE
  const workshopSectionSubtitle = g?.gastronomyWorkshopSectionSubtitle ?? DEFAULT_WORKSHOP_SUBTITLE
  const workshopClarification = g?.gastronomyWorkshopClarification ?? null
  const workshopNextDateLabel = g?.gastronomyWorkshopNextDateLabel ?? DEFAULT_WORKSHOP_NEXT_DATE_LABEL
  const workshopCards = g?.gastronomyWorkshopCards ?? []
  const offerDetailsTitle = g?.gastronomyOfferDetailsTitle ?? DEFAULT_OFFER_DETAILS_TITLE
  const offerDetails = g?.gastronomyOfferDetails ?? []
  const collaborateImage = g?.gastronomyCollaborateImage
  const collaborateTitle = g?.gastronomyCollaborateTitle ?? DEFAULT_COLLABORATE_TITLE
  const collaborateSubtitle = g?.gastronomyCollaborateSubtitle ?? DEFAULT_COLLABORATE_SUBTITLE

  const formPlaceholders = g?.gastronomyFormPlaceholders as { firstName?: string; lastName?: string; email?: string; message?: string } | undefined
  const subjectOptions = g?.gastronomySubjectOptions as { default?: string; options?: Array<{ label?: string }> } | undefined

  // Contact section — same design as About page ContactBlock; CTA banner and map hidden — same design as About page ContactBlock (defaults in English per rules)
  const contactBlockProps = {
    blockType: 'contactBlock' as const,
    hideHeroSection: true,
    hero: {
      image: null,
      heading: '',
      subtext: '',
      buttonLabel: null,
      buttonHref: null,
    },
    contactImage: g?.gastronomyContactImage ?? null,
    contact: {
      heading: g?.gastronomyContactTitle ?? 'Contact',
      description:
        g?.gastronomyContactDescription ??
        'Would you like to book a workshop or have questions? We look forward to hearing from you.',
    },
    contactForm: {
      placeholders: {
        firstName: formPlaceholders?.firstName ?? 'First Name',
        lastName: formPlaceholders?.lastName ?? 'Last Name',
        email: formPlaceholders?.email ?? 'Email',
        message: formPlaceholders?.message ?? 'Message',
      },
      subjectOptions: {
        default: subjectOptions?.default ?? 'Subject',
        options:
          (subjectOptions?.options ?? []).map((o) => o?.label ?? '') ||
          ['General Inquiry', 'Workshop', 'Product', 'Partnership'],
      },
      submitButton: g?.gastronomySubmitButtonLabel ?? 'Send Message',
    },
    ctaBanner: {
      heading: '',
      description: '',
      buttonLabel: '',
      buttonHref: '',
    },
    hideCtaBanner: true,
    hideMap: true,
  }

  return (
    <article className="font-sans">
      {/* Hero — Kitchen Knives style product slider */}
      <GastronomyProductSlider
        slides={offerCards.map((c) => ({ id: c.id ?? undefined, title: c.title, description: c.description, image: c.image }))}
        ctaLabel={heroCtaLabel}
        ctaUrl={heroCtaUrl}
      />

      {/* What we offer — white bg, 3 cards with scroll-triggered animation */}
      <GastronomyOfferCards
        title={offerSectionTitle}
        cards={offerCards.map((c) => ({ id: c.id, title: c.title, description: c.description, image: c.image }))}
      />

      {/* Quote — bg #333333, main quote white, subtext #E6BE68 */}
      <section className="px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-[#333333] px-8 py-16 md:px-16">
            <p className="text-center text-xl font-medium text-white md:text-2xl">{quoteText}</p>
            <p className="mt-4 text-center text-base text-[#E6BE68]">{quoteSubtext}</p>
          </div>
        </div>
      </section>

      {/* Next Workshop — Lakto-Gemüse card: image ~60%, white bg, pill button, next date */}
      <section className="bg-white px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-ff-black md:text-4xl">
            {workshopSectionTitle}
          </h2>
          {workshopSectionSubtitle && (
            <p className="mt-2 text-center text-ff-gray-text">{workshopSectionSubtitle}</p>
          )}
          {workshopClarification && (
            <p className="mt-3 text-center text-base text-ff-gray-text md:max-w-2xl md:mx-auto">
              {workshopClarification}
            </p>
          )}
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {workshopCards.map((card, i) => (
              <div
                key={card.id ?? i}
                className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[5/4] overflow-hidden rounded-t-2xl">
                  {isResolvedMedia(card.image) ? (
                    <Media resource={card.image} fill imgClassName="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-neutral-100" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="mb-2 font-display text-2xl font-bold text-[#1a1a1a]">{card.title}</h3>
                  <p className="mb-4 text-base leading-relaxed text-[#333]">{card.description}</p>
                  <div className="mb-5 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-[#E5B765]">{card.price}</span>
                    {(card as { priceSuffix?: string }).priceSuffix && (
                      <span className="font-sans text-xl text-[#555]">
                        {(card as { priceSuffix?: string }).priceSuffix}
                      </span>
                    )}
                  </div>
                  <Link
                    href={card.buttonUrl}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#2a2a2a] px-8 py-3.5 font-display text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1a1a1a]"
                  >
                    {card.buttonLabel}
                  </Link>
                  {(card as { nextDate?: string }).nextDate && (
                    <div className="mt-5">
                      <p className="font-sans text-sm text-[#666]">{workshopNextDateLabel}</p>
                      <p className="mt-1 font-display text-lg font-bold text-[#1a1a1a]">
                        {(card as { nextDate?: string }).nextDate}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer (Was wir anbieten) — bg #333333, heading gold #E5B765, paragraph white */}
      <section className="bg-[#333333] px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-[#E6BE68] md:text-4xl">
            {offerDetailsTitle}
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {[0, 1].map((col) => (
              <div key={col} className="space-y-6">
                {offerDetails.slice(col * 4, col * 4 + 4).map((item, i) => (
                  <div key={item.id ?? `${col}-${i}`} className="border-l-2 border-white/30 pl-4">
                    <h3 className="mb-1 font-display text-base font-bold text-[#E6BE68]">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-white">{item.description}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to collaborate — dark card, rounded corners; taller on mobile */}
      <section className="px-6 py-8 md:px-12 lg:px-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl">
          {isResolvedMedia(collaborateImage) ? (
            <div className="relative min-h-[220px] aspect-[4/3] md:aspect-[21/9] md:min-h-[280px]">
              <Media
                resource={collaborateImage}
                fill
                imgClassName="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10">
                <h2 className="text-center font-display text-2xl font-bold text-white md:text-4xl lg:text-5xl">
                  {collaborateTitle}
                </h2>
                <p className="mt-3 text-center text-base text-white/95 md:text-lg lg:text-xl">
                  {collaborateSubtitle}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl bg-ff-charcoal px-6 py-12 md:aspect-[21/9] md:min-h-[280px] md:py-0">
              <h2 className="text-center font-display text-2xl font-bold text-white md:text-4xl lg:text-5xl">
                {collaborateTitle}
              </h2>
              <p className="mt-3 text-center text-base text-white/95 md:text-lg lg:text-xl">
                {collaborateSubtitle}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Content tab blocks — editable in Admin → Pages → Gastronomy → Content */}
      {page?.layout && page.layout.length > 0 && (
        <div className="px-6 py-16 md:px-12 lg:px-20">
          <RenderBlocks blocks={page.layout} />
        </div>
      )}

      {/* Contact — same design as About page */}
      <div id="contact">
        <ContactBlockComponent {...(contactBlockProps as unknown as Parameters<typeof ContactBlockComponent>[0])} />
      </div>

      {/* Edit in Admin — floating link to design/edit the page */}
      {page?.id && (
        <EditPageLink collection="pages" id={String(page.id)} label="Edit page in Admin" />
      )}
    </article>
  )
}
