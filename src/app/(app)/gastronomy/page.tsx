import type { Metadata } from 'next'

import { ContactBlockComponent } from '@/blocks/ContactBlock/Component'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { EditPageLink } from '@/components/EditPageLink'
import { GastronomyOfferCards } from '@/components/gastronomy/GastronomyOfferCards'
import { GastronomyProductSlider } from '@/components/gastronomy/GastronomyProductSlider'
import { Media } from '@/components/Media'
import { WorkshopCardsSection } from '@/components/WorkshopCardsSection'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Media as MediaType, Page as PageType } from '@/payload-types'

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
    depth: 4,
    locale,
  })
  const page = result.docs[0] as PageType | undefined
  const g = page?.gastronomy

  const heroCtaLabel = g?.gastronomyHeroCtaLabel ?? DEFAULT_HERO_CTA
  const heroCtaUrl = g?.gastronomyHeroCtaUrl ?? '#offer'
  const offerSectionTitle = g?.gastronomyOfferSectionTitle ?? DEFAULT_OFFER_TITLE
  const offerCards = g?.gastronomyOfferCards ?? []
  const quoteText = g?.gastronomyQuoteText ?? DEFAULT_QUOTE
  const quoteSubtext = g?.gastronomyQuoteSubtext ?? DEFAULT_QUOTE_SUBTEXT
  const workshopSectionTitle = g?.gastronomyWorkshopSectionTitle ?? DEFAULT_WORKSHOP_TITLE
  const workshopSectionSubtitle = g?.gastronomyWorkshopSectionSubtitle ?? DEFAULT_WORKSHOP_SUBTITLE
  const workshopClarification = g?.gastronomyWorkshopClarification ?? null
  const workshopNextDateLabel =
    g?.gastronomyWorkshopNextDateLabel ?? DEFAULT_WORKSHOP_NEXT_DATE_LABEL
  const workshopCards = g?.gastronomyWorkshopCards ?? []
  const offerDetailsTitle = g?.gastronomyOfferDetailsTitle ?? DEFAULT_OFFER_DETAILS_TITLE
  const offerDetails = g?.gastronomyOfferDetails ?? []
  const collaborateImage = g?.gastronomyCollaborateImage
  const collaborateTitle = g?.gastronomyCollaborateTitle ?? DEFAULT_COLLABORATE_TITLE
  const collaborateSubtitle = g?.gastronomyCollaborateSubtitle ?? DEFAULT_COLLABORATE_SUBTITLE

  const formPlaceholders = g?.gastronomyFormPlaceholders as
    | { firstName?: string; lastName?: string; email?: string; message?: string }
    | undefined
  const subjectOptions = g?.gastronomySubjectOptions as
    | { default?: string; options?: Array<{ label?: string }> }
    | undefined

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
        options: (subjectOptions?.options ?? []).map((o) => o?.label ?? '') || [
          'General Inquiry',
          'Workshop',
          'Product',
          'Partnership',
        ],
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
        slides={offerCards.map((c) => ({
          id: c.id ?? undefined,
          title: c.title,
          description: c.description,
          image: c.image,
        }))}
        ctaLabel={heroCtaLabel}
        ctaUrl={heroCtaUrl}
      />

      {/* What we offer — white bg, 3 cards with scroll-triggered animation */}
      <GastronomyOfferCards
        title={offerSectionTitle}
        cards={offerCards.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          image: c.image,
        }))}
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

      {/* Next Workshop — shared WorkshopCardsSection */}
      <WorkshopCardsSection
        title={workshopSectionTitle}
        subtitle={workshopSectionSubtitle}
        clarification={workshopClarification}
        nextDateLabel={workshopNextDateLabel}
        cards={workshopCards.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          image: c.image,
          price: c.price,
          priceSuffix: (c as { priceSuffix?: string }).priceSuffix,
          buttonLabel: c.buttonLabel,
          buttonUrl: c.buttonUrl,
          nextDate: (c as { nextDate?: string }).nextDate,
        }))}
        cardBg="#ffffff"
        layout="centered"
      />

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
                    <h3 className="mb-1 font-display text-base font-bold text-[#E6BE68]">
                      {item.title}
                    </h3>
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
            <div className="relative min-h-55 aspect-4/3 md:aspect-21/9 md:min-h-70">
              <Media resource={collaborateImage} fill imgClassName="object-cover" priority />
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
            <div className="flex min-h-55 flex-col items-center justify-center rounded-2xl bg-ff-charcoal px-6 py-12 md:aspect-21/9 md:min-h-70 md:py-0">
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
        <ContactBlockComponent
          {...(contactBlockProps as unknown as Parameters<typeof ContactBlockComponent>[0])}
        />
      </div>

      {/* Edit in Admin — floating link to design/edit the page */}
      {page?.id && (
        <EditPageLink collection="pages" id={String(page.id)} label="Edit page in Admin" />
      )}
    </article>
  )
}
