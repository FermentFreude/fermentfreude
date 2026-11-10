import { beforeEach, describe, expect, it, vi } from 'vitest'

const find = vi.fn()
const findGlobal = vi.fn()

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find, findGlobal }) }))

const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

const data: Record<string, unknown[]> = {
  workshops: [
    {
      slug: 'kombucha',
      title: 'Kombucha Workshop',
      basePrice: 99,
      maxCapacityPerSlot: 8,
      description: { root: { type: 'root', children: [{ type: 'paragraph', children: [{ text: 'Brew your own.' }] }] } },
      whatToBring: 'An apron',
    },
  ],
  'workshop-appointments': [
    {
      dateTime: future,
      availableSpots: 3,
      workshop: { slug: 'kombucha', title: 'Kombucha Workshop' },
      location: { name: 'Studio Graz', address: 'Hauptplatz 1' },
    },
    { dateTime: future, availableSpots: 0, workshop: { slug: 'tempeh', title: 'Tempeh' }, location: {} },
  ],
  products: [
    { slug: 'kimchi', title: 'Kimchi', productType: 'jarred', priceInEUR: 890, inventory: 0 },
    { slug: 'ws', title: 'Workshop product', productType: 'workshop', priceInEUR: 9900 },
  ],
  'online-courses': [{ slug: 'basic-fermentation-course', courseSlug: 'basic-fermentation', title: 'Basics online', isActive: true }],
  pages: [
    {
      layout: [
        {
          blockType: 'helpFaq',
          sections: [{ title: 'Booking', items: [{ question: 'Can I cancel?', answer: 'Yes, up to 7 days before.' }] }],
        },
      ],
    },
  ],
}

describe('getChatKnowledge', () => {
  beforeEach(() => {
    vi.resetModules()
    find.mockReset()
    findGlobal.mockReset()
    find.mockImplementation(async ({ collection }: { collection: string }) => ({ docs: data[collection] ?? [] }))
    findGlobal.mockImplementation(async ({ slug }: { slug: string }) =>
      slug === 'business-info'
        ? { companyName: 'Fermentfreude', email: 'hallo@example.at' }
        : { extraKnowledge: 'Parking behind the building.' },
    )
  })

  it('builds a sheet from public CMS content', async () => {
    const { getChatKnowledge } = await import('@/lib/chat-assistant/knowledge')
    const sheet = await getChatKnowledge('en')

    expect(sheet).toContain('Kombucha Workshop — page: /workshops/kombucha')
    expect(sheet).toContain('€99.00 per person')
    expect(sheet).toContain('Brew your own.')
    expect(sheet).toContain('3 spots free')
    expect(sheet).toContain('Studio Graz, Hauptplatz 1')
    expect(sheet).toContain('SOLD OUT')
    expect(sheet).toContain('Kimchi (/products/kimchi) — €8.90, currently out of stock')
    expect(sheet).not.toContain('Workshop product')
    expect(sheet).toContain('/courses/basic-fermentation')
    expect(sheet).toContain('Q: Can I cancel?')
    expect(sheet).toContain('Email: hallo@example.at')
    expect(sheet).toContain('Parking behind the building.')
  })

  it('only reads with public access and caches per locale', async () => {
    const { getChatKnowledge } = await import('@/lib/chat-assistant/knowledge')
    await getChatKnowledge('de')
    const calls = find.mock.calls.length
    await getChatKnowledge('de')
    expect(find.mock.calls.length).toBe(calls)
    for (const [args] of [...find.mock.calls, ...findGlobal.mock.calls]) {
      expect(args.overrideAccess).toBe(false)
    }
  })
})
