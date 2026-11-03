import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { AppLocale } from '@/utilities/payloadLocaleQuery'

/**
 * Builds the plain-text "knowledge sheet" the chat assistant answers from.
 *
 * Everything is read live from Payload with public read access only
 * (overrideAccess: false), so the assistant can never see bookings, orders,
 * customers or internal notes. The sheet is cached in memory for a few
 * minutes per locale so a busy chat does not hit MongoDB on every message.
 */

const CACHE_TTL_MS = 5 * 60 * 1000
const MAX_APPOINTMENTS = 60
const APPOINTMENT_WINDOW_DAYS = 120

const cache = new Map<AppLocale, { at: number; text: string }>()

type AnyDoc = Record<string, unknown>

function lexicalToPlainText(value: unknown): string {
  if (!value || typeof value !== 'object') return typeof value === 'string' ? value : ''
  const node = value as AnyDoc
  if (typeof node.text === 'string') return node.text
  if (node.root) return lexicalToPlainText(node.root)
  if (Array.isArray(node.children)) {
    const sep = node.type === 'root' ? '\n' : node.type === 'paragraph' ? '' : ' '
    return (node.children as unknown[]).map(lexicalToPlainText).filter(Boolean).join(sep)
  }
  return ''
}

function clean(value: unknown, max = 600): string {
  const text = (typeof value === 'string' ? value : lexicalToPlainText(value))
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function euros(cents: unknown): string | null {
  return typeof cents === 'number' && cents > 0 ? `€${(cents / 100).toFixed(2)}` : null
}

function formatDateTime(iso: string, locale: AppLocale): string {
  return new Date(iso).toLocaleString(locale === 'de' ? 'de-AT' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Vienna',
  })
}

async function build(locale: AppLocale): Promise<string> {
  const payload = await getPayload({ config: configPromise })
  const localeQuery = { locale, fallbackLocale: 'de' as const, overrideAccess: false }
  const now = new Date()
  const windowEnd = new Date(now.getTime() + APPOINTMENT_WINDOW_DAYS * 24 * 60 * 60 * 1000)

  // Sequential reads keep load on the M0 cluster low; this runs at most once
  // per locale per cache window.
  const workshops = await payload.find({
    collection: 'workshops',
    where: { isActive: { equals: true } },
    depth: 0,
    limit: 50,
    ...localeQuery,
  })

  const appointments = await payload.find({
    collection: 'workshop-appointments',
    where: {
      and: [
        { isPublished: { equals: true } },
        { cancellationStatus: { not_equals: 'cancelled_by_organiser' } },
        { dateTime: { greater_than: now.toISOString() } },
        { dateTime: { less_than: windowEnd.toISOString() } },
      ],
    },
    sort: 'dateTime',
    depth: 1,
    limit: MAX_APPOINTMENTS,
    ...localeQuery,
  })

  const products = await payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' } },
    depth: 0,
    limit: 100,
    ...localeQuery,
  })

  const courses = await payload.find({
    collection: 'online-courses',
    depth: 0,
    limit: 20,
    ...localeQuery,
  })

  const helpPage = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'help' } },
    depth: 0,
    limit: 1,
    ...localeQuery,
  })

  const business = (await payload.findGlobal({
    slug: 'business-info',
    depth: 0,
    ...localeQuery,
  })) as unknown as AnyDoc

  const chatGlobal = (await payload.findGlobal({
    slug: 'chat-assistant-global',
    depth: 0,
    ...localeQuery,
  })) as unknown as AnyDoc

  const lines: string[] = []

  // ── Business ──────────────────────────────────────────────
  lines.push('## Contact & company')
  const contactParts = [
    business.companyName && `Company: ${clean(business.companyName)}`,
    business.addressLine1 &&
      `Address: ${clean(business.addressLine1)}, ${clean(business.postalCode)} ${clean(business.city)}, ${clean(business.country)}`,
    business.email && `Email: ${clean(business.email)}`,
    business.phone && `Phone: ${clean(business.phone)}`,
    business.website && `Website: ${clean(business.website)}`,
  ].filter(Boolean) as string[]
  lines.push(...(contactParts.length ? contactParts : ['(no contact details in the CMS)']))

  // ── Workshops ─────────────────────────────────────────────
  lines.push('', '## Workshops (in person)')
  for (const w of workshops.docs as unknown as AnyDoc[]) {
    lines.push(
      `### ${clean(w.title)} — page: /workshops/${w.slug}`,
      `Price: €${Number(w.basePrice ?? 0).toFixed(2)} per person · max ${w.maxCapacityPerSlot} people per session`,
    )
    const description = clean(w.description, 900)
    if (description) lines.push(`About: ${description}`)
    const bring = clean(w.whatToBring, 400)
    if (bring) lines.push(`What to bring: ${bring}`)
  }
  if (!workshops.docs.length) lines.push('(no active workshops)')

  // ── Upcoming dates ────────────────────────────────────────
  lines.push('', `## Upcoming workshop dates (next ${APPOINTMENT_WINDOW_DAYS} days, Vienna time)`)
  for (const a of appointments.docs as unknown as AnyDoc[]) {
    const workshop = (a.workshop ?? {}) as AnyDoc
    const location = (a.location ?? {}) as AnyDoc
    const spots = Number(a.availableSpots ?? 0)
    const spotsText = spots > 0 ? `${spots} spots free` : 'SOLD OUT'
    const where = [clean(location.name), clean(location.address, 200)].filter(Boolean).join(', ')
    lines.push(
      `- ${clean(workshop.title) || 'Workshop'} (/workshops/${workshop.slug ?? ''}): ${formatDateTime(String(a.dateTime), locale)}${where ? ` @ ${where}` : ''} — ${spotsText}`,
    )
  }
  if (!appointments.docs.length) lines.push('(no upcoming dates published right now)')

  // ── Shop ──────────────────────────────────────────────────
  lines.push('', '## Shop products — shop overview: /shop')
  for (const p of products.docs as unknown as AnyDoc[]) {
    if (p.productType === 'workshop') continue // covered above
    const details = [
      euros(p.priceInEUR),
      clean(p.unitSize, 60),
      p.inventory === 0 ? 'currently out of stock' : null,
      p.isSeasonal ? 'seasonal' : null,
    ].filter(Boolean)
    lines.push(
      `- ${clean(p.title)} (/products/${p.slug})${details.length ? ` — ${details.join(', ')}` : ''}`,
    )
    const short = clean(p.shortDescription, 300)
    if (short) lines.push(`  ${short}`)
    const extra = [
      p.ingredients && `Ingredients: ${clean(p.ingredients, 300)}`,
      p.allergens && `Allergens: ${clean(p.allergens, 200)}`,
      p.storageInstructions && `Storage: ${clean(p.storageInstructions, 200)}`,
    ].filter(Boolean)
    if (extra.length) lines.push(`  ${extra.join(' · ')}`)
  }

  // ── Online courses ────────────────────────────────────────
  const activeCourses = (courses.docs as unknown as AnyDoc[]).filter((c) => c.isActive !== false)
  if (activeCourses.length) {
    lines.push('', '## Online courses — overview: /courses')
    for (const c of activeCourses) {
      const meta = [clean(c.durationText, 60), clean(c.levelText, 60), c.isComingSoon ? 'coming soon' : null]
        .filter(Boolean)
        .join(', ')
      const path = `/courses/${c.courseSlug || c.slug}`
      lines.push(`- ${clean(c.title)} (${path})${meta ? ` — ${meta}` : ''}`)
      const description = clean(c.description, 400)
      if (description) lines.push(`  ${description}`)
    }
  }

  // ── FAQ ───────────────────────────────────────────────────
  const helpLayout = ((helpPage.docs[0] as unknown as AnyDoc | undefined)?.layout ?? []) as AnyDoc[]
  const faqBlocks = helpLayout.filter((b) => b.blockType === 'helpFaq')
  if (faqBlocks.length) {
    lines.push('', '## FAQ (from the Help page: /help)')
    for (const block of faqBlocks) {
      for (const section of (block.sections ?? []) as AnyDoc[]) {
        lines.push(`### ${clean(section.title)}`)
        for (const item of (section.items ?? []) as AnyDoc[]) {
          lines.push(`Q: ${clean(item.question)}`, `A: ${clean(item.answer, 1200)}`)
        }
      }
    }
  }

  // ── Extra knowledge from the admin ────────────────────────
  const extra = typeof chatGlobal.extraKnowledge === 'string' ? chatGlobal.extraKnowledge.trim() : ''
  if (extra) lines.push('', '## Extra notes from the FermentFreude team', extra)

  return lines.join('\n')
}

export async function getChatKnowledge(locale: AppLocale): Promise<string> {
  const hit = cache.get(locale)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.text
  const text = await build(locale)
  cache.set(locale, { at: Date.now(), text })
  return text
}
