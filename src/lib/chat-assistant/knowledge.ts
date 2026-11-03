import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { AppLocale } from '@/utilities/payloadLocaleQuery'

/**
 * Loads everything the chat assistant answers from.
 *
 * Everything is read live from Payload with public read access only
 * (overrideAccess: false), so the assistant can never see bookings, orders,
 * customers or internal notes. The data is cached in memory for a few
 * minutes per locale so a busy chat does not hit MongoDB on every message.
 *
 * Two consumers:
 * - `getChatData()` → structured data for the free keyword answerer
 * - `getChatKnowledge()` → a plain-text sheet for the Claude-powered answerer
 */

const CACHE_TTL_MS = 5 * 60 * 1000
const MAX_APPOINTMENTS = 60
const APPOINTMENT_WINDOW_DAYS = 120

type AnyDoc = Record<string, unknown>

export type ChatWorkshop = {
  slug: string
  title: string
  price: number
  maxCapacity: number | null
  description: string
  whatToBring: string
}

export type ChatAppointment = {
  workshopSlug: string
  workshopTitle: string
  dateTime: string
  when: string
  location: string
  spots: number
}

export type ChatProduct = {
  slug: string
  title: string
  price: string | null
  unitSize: string
  outOfStock: boolean
  seasonal: boolean
  shortDescription: string
  ingredients: string
  allergens: string
  storage: string
}

export type ChatCourse = {
  path: string
  title: string
  meta: string
  description: string
  comingSoon: boolean
}

export type ChatFaq = { section: string; question: string; answer: string }

export type ChatContact = {
  companyName: string
  address: string
  email: string
  phone: string
  website: string
}

export type ChatData = {
  locale: AppLocale
  contact: ChatContact
  workshops: ChatWorkshop[]
  appointments: ChatAppointment[]
  products: ChatProduct[]
  courses: ChatCourse[]
  faq: ChatFaq[]
  extraKnowledge: string
}

const cache = new Map<AppLocale, { at: number; data: ChatData }>()

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

async function load(locale: AppLocale): Promise<ChatData> {
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

  const address = business.addressLine1
    ? `${clean(business.addressLine1)}, ${clean(business.postalCode)} ${clean(business.city)}, ${clean(business.country)}`
        .replace(/\s+,/g, ',')
        .replace(/,\s*$/, '')
    : ''

  const helpLayout = ((helpPage.docs[0] as unknown as AnyDoc | undefined)?.layout ?? []) as AnyDoc[]
  const faq: ChatFaq[] = []
  for (const block of helpLayout.filter((b) => b.blockType === 'helpFaq')) {
    for (const section of (block.sections ?? []) as AnyDoc[]) {
      for (const item of (section.items ?? []) as AnyDoc[]) {
        const question = clean(item.question, 300)
        const answer = clean(item.answer, 1200)
        if (question && answer) faq.push({ section: clean(section.title, 120), question, answer })
      }
    }
  }

  return {
    locale,
    contact: {
      companyName: clean(business.companyName),
      address,
      email: clean(business.email),
      phone: clean(business.phone),
      website: clean(business.website),
    },
    workshops: (workshops.docs as unknown as AnyDoc[]).map((w) => ({
      slug: String(w.slug ?? ''),
      title: clean(w.title),
      price: Number(w.basePrice ?? 0),
      maxCapacity: typeof w.maxCapacityPerSlot === 'number' ? w.maxCapacityPerSlot : null,
      description: clean(w.description, 900),
      whatToBring: clean(w.whatToBring, 400),
    })),
    appointments: (appointments.docs as unknown as AnyDoc[]).map((a) => {
      const workshop = (a.workshop ?? {}) as AnyDoc
      const location = (a.location ?? {}) as AnyDoc
      return {
        workshopSlug: String(workshop.slug ?? ''),
        workshopTitle: clean(workshop.title) || 'Workshop',
        dateTime: String(a.dateTime),
        when: formatDateTime(String(a.dateTime), locale),
        location: [clean(location.name), clean(location.address, 200)].filter(Boolean).join(', '),
        spots: Number(a.availableSpots ?? 0),
      }
    }),
    products: (products.docs as unknown as AnyDoc[])
      .filter((p) => p.productType !== 'workshop') // workshops are covered above
      .map((p) => ({
        slug: String(p.slug ?? ''),
        title: clean(p.title),
        price: euros(p.priceInEUR),
        unitSize: clean(p.unitSize, 60),
        outOfStock: p.inventory === 0,
        seasonal: Boolean(p.isSeasonal),
        shortDescription: clean(p.shortDescription, 300),
        ingredients: clean(p.ingredients, 300),
        allergens: clean(p.allergens, 200),
        storage: clean(p.storageInstructions, 200),
      })),
    courses: (courses.docs as unknown as AnyDoc[])
      .filter((c) => c.isActive !== false)
      .map((c) => ({
        path: `/courses/${c.courseSlug || c.slug}`,
        title: clean(c.title),
        meta: [clean(c.durationText, 60), clean(c.levelText, 60)].filter(Boolean).join(', '),
        description: clean(c.description, 400),
        comingSoon: Boolean(c.isComingSoon),
      })),
    faq,
    extraKnowledge: typeof chatGlobal.extraKnowledge === 'string' ? chatGlobal.extraKnowledge.trim() : '',
  }
}

/** Plain-text knowledge sheet for the Claude prompt. */
export function buildKnowledgeSheet(data: ChatData): string {
  const lines: string[] = []
  const { contact } = data

  lines.push('## Contact & company')
  const contactParts = [
    contact.companyName && `Company: ${contact.companyName}`,
    contact.address && `Address: ${contact.address}`,
    contact.email && `Email: ${contact.email}`,
    contact.phone && `Phone: ${contact.phone}`,
    contact.website && `Website: ${contact.website}`,
  ].filter(Boolean) as string[]
  lines.push(...(contactParts.length ? contactParts : ['(no contact details in the CMS)']))

  lines.push('', '## Workshops (in person)')
  for (const w of data.workshops) {
    lines.push(
      `### ${w.title} — page: /workshops/${w.slug}`,
      `Price: €${w.price.toFixed(2)} per person${w.maxCapacity ? ` · max ${w.maxCapacity} people per session` : ''}`,
    )
    if (w.description) lines.push(`About: ${w.description}`)
    if (w.whatToBring) lines.push(`What to bring: ${w.whatToBring}`)
  }
  if (!data.workshops.length) lines.push('(no active workshops)')

  lines.push('', `## Upcoming workshop dates (next ${APPOINTMENT_WINDOW_DAYS} days, Vienna time)`)
  for (const a of data.appointments) {
    const spotsText = a.spots > 0 ? `${a.spots} spots free` : 'SOLD OUT'
    lines.push(
      `- ${a.workshopTitle} (/workshops/${a.workshopSlug}): ${a.when}${a.location ? ` @ ${a.location}` : ''} — ${spotsText}`,
    )
  }
  if (!data.appointments.length) lines.push('(no upcoming dates published right now)')

  lines.push('', '## Shop products — shop overview: /shop')
  for (const p of data.products) {
    const details = [
      p.price,
      p.unitSize,
      p.outOfStock ? 'currently out of stock' : null,
      p.seasonal ? 'seasonal' : null,
    ].filter(Boolean)
    lines.push(`- ${p.title} (/products/${p.slug})${details.length ? ` — ${details.join(', ')}` : ''}`)
    if (p.shortDescription) lines.push(`  ${p.shortDescription}`)
    const extra = [
      p.ingredients && `Ingredients: ${p.ingredients}`,
      p.allergens && `Allergens: ${p.allergens}`,
      p.storage && `Storage: ${p.storage}`,
    ].filter(Boolean)
    if (extra.length) lines.push(`  ${extra.join(' · ')}`)
  }

  if (data.courses.length) {
    lines.push('', '## Online courses — overview: /courses')
    for (const c of data.courses) {
      const meta = [c.meta, c.comingSoon ? 'coming soon' : null].filter(Boolean).join(', ')
      lines.push(`- ${c.title} (${c.path})${meta ? ` — ${meta}` : ''}`)
      if (c.description) lines.push(`  ${c.description}`)
    }
  }

  if (data.faq.length) {
    lines.push('', '## FAQ (from the Help page: /help)')
    let section = ''
    for (const item of data.faq) {
      if (item.section !== section) {
        section = item.section
        lines.push(`### ${section}`)
      }
      lines.push(`Q: ${item.question}`, `A: ${item.answer}`)
    }
  }

  if (data.extraKnowledge) {
    lines.push('', '## Extra notes from the FermentFreude team', data.extraKnowledge)
  }

  return lines.join('\n')
}

export async function getChatData(locale: AppLocale): Promise<ChatData> {
  const hit = cache.get(locale)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data
  const data = await load(locale)
  cache.set(locale, { at: Date.now(), data })
  return data
}

export async function getChatKnowledge(locale: AppLocale): Promise<string> {
  return buildKnowledgeSheet(await getChatData(locale))
}
