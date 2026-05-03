import { CourseWaitlistCtaInner } from '@/blocks/CourseWaitlistCta/CourseWaitlistCtaInner'
import { Media } from '@/components/Media'
import { ContentSection } from '@/components/ui/ContentSection'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type {
  CourseWaitlistCtaBlock as CourseWaitlistCtaBlockType,
  Media as MediaType,
} from '@/payload-types'

const DEFAULTS_EN = {
  heading: 'Learn fermentation without uncertainty',
  description:
    'Join the waitlist and be the first to know when the course launches.\n\nYou will also get access to a discounted entry and exclusive previews.',
  emailPlaceholder: 'Your email address',
  submitLabel: 'Join the waitlist',
  successMessage:
    'Thanks! If your email app opened, send the message to join the waitlist. Otherwise email kontakt@fermentfreude.at.',
}

const DEFAULTS_DE = {
  heading: 'Lerne Fermentation ohne Unsicherheit',
  description:
    'Trag dich auf die Warteliste ein und erfahre als Erste:r, wenn der Kurs startet.\n\nDu bekommst außerdem die Möglichkeit auf einen vergünstigten Einstieg und exklusive Einblicke vorab.',
  emailPlaceholder: 'Deine E-Mail-Adresse',
  submitLabel: 'Auf Warteliste setzen',
  successMessage:
    'Danke! Wenn sich dein E-Mail-Programm geöffnet hat, sende die Nachricht ab. Sonst schreibe an kontakt@fermentfreude.at.',
}

/** CMS block props; all content fields optional so the courses page can render a locale-aware fallback before the block is seeded. */
type Props = Partial<CourseWaitlistCtaBlockType> & { id?: string }

/** Show image frame whenever a Media is linked (id or string relation). Media handles missing URL with a placeholder. */
function hasRenderableImage(image: unknown): image is MediaType | string {
  if (image == null || image === '') return false
  if (typeof image === 'string') return true
  if (typeof image === 'object' && image !== null && 'id' in image) return true
  return false
}

/** Absolute or site-root URL for <Image /> fallback (serializes across the client boundary). */
function resolvePublicImageUrl(media: MediaType): string | undefined {
  const url = media.url
  if (!url || typeof url !== 'string' || !url.trim()) return undefined
  if (url.startsWith('http') || url.startsWith('/')) return url
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  return base ? `${base}/${url.replace(/^\//, '')}` : `/${url.replace(/^\//, '')}`
}

export async function CourseWaitlistCtaBlock({
  visible,
  heading,
  description,
  image,
  emailPlaceholder,
  submitLabel,
  successMessage,
  id,
}: Props) {
  if (visible === false) return null

  const locale = await getLocale()
  const loc = locale === 'de' ? 'de' : 'en'
  const base = loc === 'de' ? DEFAULTS_DE : DEFAULTS_EN

  const resolvedHeading = heading ?? base.heading
  const resolvedDescription = description ?? base.description
  const resolvedPlaceholder = emailPlaceholder ?? base.emailPlaceholder
  const resolvedSubmit = submitLabel ?? base.submitLabel
  const resolvedSuccess = successMessage ?? base.successMessage

  const paragraphs = resolvedDescription.split(/\n\n+/).filter(Boolean)

  /** Unpopulated block `image` is often a raw ID; Media needs `url` (depth may not hydrate uploads in layout). */
  let mediaForRender: string | MediaType | undefined = image ?? undefined

  if (typeof image === 'string' && image.trim() !== '') {
    const payload = await getPayload({ config: configPromise })
    const doc = await payload.findByID({
      collection: 'media',
      id: image,
      depth: 0,
      overrideAccess: true,
    })
    if (doc != null && typeof doc === 'object' && 'id' in doc) {
      mediaForRender = doc as MediaType
    }
  } else if (typeof image === 'object' && image !== null && 'id' in image) {
    const m = image as MediaType
    const needsUrl = !m.url || (typeof m.url === 'string' && m.url.trim() === '')
    if (needsUrl && m.id) {
      const payload = await getPayload({ config: configPromise })
      const doc = await payload.findByID({
        collection: 'media',
        id: m.id,
        depth: 0,
        overrideAccess: true,
      })
      if (doc != null && typeof doc === 'object' && 'url' in doc && doc.url) {
        mediaForRender = doc as MediaType
      }
    }
  }

  const imageSlot = hasRenderableImage(mediaForRender) ? (
    <div className="relative mx-auto aspect-[496/320] w-full max-w-xl overflow-hidden rounded-2xl border border-ff-border-light/50 bg-[#ECE5DE] shadow-md lg:mx-0 lg:max-w-none">
      <Media
        resource={mediaForRender}
        fill
        className="relative size-full"
        imgClassName="object-cover"
      />
    </div>
  ) : null

  const hasImg = hasRenderableImage(mediaForRender)
  const waitlistImageUrl =
    hasImg && typeof mediaForRender === 'object' && mediaForRender !== null
      ? resolvePublicImageUrl(mediaForRender as MediaType)
      : undefined
  const waitlistImageAlt =
    hasImg &&
    typeof mediaForRender === 'object' &&
    mediaForRender !== null &&
    typeof mediaForRender.alt === 'string'
      ? mediaForRender.alt
      : ''

  return (
    <section id={id ?? undefined} aria-labelledby={id ? `${id}-heading` : undefined}>
      <ContentSection
        bg="none"
        padding="lg"
        className="relative overflow-hidden border-t border-ff-border-light/40 bg-gradient-to-b from-ff-ivory via-ff-cream to-ff-warm-gray/50"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_100%_20%,rgba(229,183,101,0.12),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_100%,rgba(236,229,222,0.9),transparent_50%)]"
          aria-hidden
        />

        <CourseWaitlistCtaInner
          id={id}
          heading={resolvedHeading}
          paragraphs={paragraphs}
          emailPlaceholder={resolvedPlaceholder}
          submitLabel={resolvedSubmit}
          successMessage={resolvedSuccess}
          locale={loc}
          waitlistImageUrl={waitlistImageUrl}
          waitlistImageAlt={waitlistImageAlt}
        >
          {imageSlot}
        </CourseWaitlistCtaInner>
      </ContentSection>
    </section>
  )
}
