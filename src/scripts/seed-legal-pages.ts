/**
 * Seed CMS-managed legal pages (Datenschutz, AGB, Impressum).
 *
 * Creates or updates page documents in the `pages` collection so they render
 * through the dynamic `[slug]` route and can be edited in `/admin`.
 *
 * Non-destructive by default:
 * - If a page already has layout content, it is skipped.
 * - Use `--force` to overwrite existing legal page content.
 *
 * Run:
 *   pnpm seed legal
 *   pnpm seed legal --force
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const isForce = process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

type LexicalTextNode = {
  type: 'text'
  text: string
  format: number
  style: string
  mode: 'normal'
  detail: number
  version: 1
}

type LexicalHeadingNode = {
  type: 'heading'
  tag: 'h2' | 'h3'
  format: ''
  indent: number
  version: 1
  direction: 'ltr'
  children: LexicalTextNode[]
}

type LexicalParagraphNode = {
  type: 'paragraph'
  format: ''
  indent: number
  version: 1
  direction: 'ltr'
  textFormat: number
  textStyle: string
  children: LexicalTextNode[]
}

type Section = {
  heading: string
  body: string[]
}

type LegalPageSeed = {
  slug: 'datenschutz' | 'agb' | 'impressum'
  deTitle: string
  enTitle: string
  deDescription: string
  enDescription: string
  deSections: Section[]
  enSections: Section[]
}

function textNode(text: string): LexicalTextNode {
  return { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }
}

function heading(text: string): LexicalHeadingNode {
  return {
    type: 'heading',
    tag: 'h2',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [textNode(text)],
  }
}

function paragraph(text: string): LexicalParagraphNode {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children: [textNode(text)],
  }
}

function sectionsToLexical(sections: Section[]) {
  const children: (LexicalHeadingNode | LexicalParagraphNode)[] = []
  for (const section of sections) {
    children.push(heading(section.heading))
    for (const p of section.body) {
      children.push(paragraph(p))
    }
  }
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1 as const,
      direction: 'ltr' as const,
      children,
    },
  }
}

function makeLayout(richText: ReturnType<typeof sectionsToLexical>) {
  return [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full' as const,
          richText,
        },
      ],
    },
  ]
}

const LEGAL_PAGES: LegalPageSeed[] = [
  {
    slug: 'datenschutz',
    deTitle: 'Datenschutz',
    enTitle: 'Privacy Policy',
    deDescription: 'Datenschutzerklaerung von FermentFreude.',
    enDescription: 'Privacy policy of FermentFreude.',
    deSections: [
      {
        heading: 'Erklaerung zur Informationspflicht',
        body: [
          'In folgender Datenschutzerklaerung informieren wir Sie ueber die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Webseite.',
          'Wir erheben und verarbeiten personenbezogene Daten nur auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2003).',
        ],
      },
      {
        heading: 'Kontakt mit uns',
        body: [
          'Wenn Sie uns per Kontaktformular oder E-Mail kontaktieren, werden Ihre Daten zur Bearbeitung der Anfrage und fuer Anschlussfragen gespeichert.',
          'Diese Daten geben wir ohne Ihre Einwilligung nicht weiter.',
        ],
      },
      {
        heading: 'Datenspeicherung',
        body: [
          'Zum Zweck der Vertragsabwicklung speichern wir unter anderem Name, Telefonnummer, E-Mail-Adresse und Zahlungsinformationen.',
          'Die von Ihnen bereitgestellten Daten sind zur Vertragserfuellung bzw. fuer vorvertragliche Massnahmen erforderlich.',
          'Die Daten werden gemaess gesetzlicher Aufbewahrungsfristen gespeichert.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'Unsere Website verwendet Cookies, um unser Angebot nutzerfreundlich zu gestalten.',
          'Sie koennen Ihren Browser so einrichten, dass Sie ueber das Setzen von Cookies informiert werden und dies nur im Einzelfall erlauben.',
        ],
      },
      {
        heading: 'Ihre Rechte',
        body: [
          'Ihnen stehen grundsaetzlich die Rechte auf Auskunft, Berichtigung, Loeschung, Einschraenkung, Datenuebertragbarkeit sowie Widerruf und Widerspruch zu.',
          'Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen Datenschutzrecht verstoesst, kontaktieren Sie uns unter fermentfreude@gmail.com.',
        ],
      },
    ],
    enSections: [
      {
        heading: 'Information Obligation',
        body: [
          'This privacy policy explains the most important aspects of data processing on our website.',
          'We collect and process personal data only on the basis of applicable legal regulations.',
        ],
      },
      {
        heading: 'Contacting Us',
        body: [
          'If you contact us via contact form or email, your data is stored to process your request and for possible follow-up questions.',
          'We do not share this data without your consent.',
        ],
      },
      {
        heading: 'Data Storage',
        body: [
          'For contract processing we may store data such as name, phone number, email address and payment information.',
          'The data you provide is required for contract fulfillment and pre-contractual measures.',
          'Data is stored in line with legal retention requirements.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'Our website uses cookies to make our services user-friendly.',
          'You can configure your browser to inform you about cookies and allow them only in individual cases.',
        ],
      },
      {
        heading: 'Your Rights',
        body: [
          'You generally have rights of access, rectification, deletion, restriction, portability, and objection.',
          'If you believe your data is being processed unlawfully, contact us at fermentfreude@gmail.com.',
        ],
      },
    ],
  },
  {
    slug: 'agb',
    deTitle: 'Allgemeine Geschaeftsbedingungen',
    enTitle: 'Terms and Conditions',
    deDescription: 'Allgemeine Geschaeftsbedingungen fuer Workshops und Online-Shop.',
    enDescription: 'General terms and conditions for workshops and online shop.',
    deSections: [
      {
        heading: '1. Geltungsbereich',
        body: [
          'Diese Allgemeinen Geschaeftsbedingungen gelten fuer alle ueber fermentfreude.com geschlossenen Vertraege zwischen Fermentfreude OG und Kundinnen/Kunden.',
        ],
      },
      {
        heading: '2. Vertragsschluss',
        body: [
          'Die Darstellung von Produkten und Workshops im Online-Shop stellt kein rechtlich bindendes Angebot dar.',
          'Durch den Abschluss der Bestellung geben Sie ein verbindliches Angebot ab. Der Vertrag kommt mit unserer Bestaetigung zustande.',
        ],
      },
      {
        heading: '3. Preise und Zahlung',
        body: [
          'Alle Preise verstehen sich in Euro und inklusive gesetzlicher Abgaben, sofern anwendbar.',
          'Die Zahlung erfolgt ueber die angebotenen Zahlungsmethoden. Der Rechnungsbetrag ist sofort faellig.',
        ],
      },
      {
        heading: '4. Workshop-Buchungen und Stornierung',
        body: [
          'Workshop-Plaetze sind begrenzt und werden nach Eingang vergeben.',
          'Eine kostenlose Stornierung ist bis 7 Tage vor dem Termin moeglich. Danach kann der volle Betrag einbehalten werden.',
        ],
      },
      {
        heading: '5. Widerruf und Datenschutz',
        body: [
          'Verbraucherinnen und Verbraucher koennen Warenkaeufe gemaess den gesetzlichen Vorgaben widerrufen.',
          'Informationen zur Datenverarbeitung finden Sie in der Datenschutzerklaerung auf /datenschutz.',
        ],
      },
      {
        heading: '6. Anwendbares Recht',
        body: [
          'Es gilt oesterreichisches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist Graz, soweit gesetzlich zulaessig.',
        ],
      },
    ],
    enSections: [
      {
        heading: '1. Scope',
        body: [
          'These terms and conditions apply to all contracts concluded via fermentfreude.com between FermentFreude OG and customers.',
        ],
      },
      {
        heading: '2. Contract Formation',
        body: [
          'Product and workshop listings in the online shop are non-binding.',
          'By placing an order, you submit a binding offer. The contract is concluded when we confirm your order.',
        ],
      },
      {
        heading: '3. Prices and Payment',
        body: [
          'All prices are shown in EUR and include statutory charges where applicable.',
          'Payment is made via the methods offered on the website. The invoice amount is due immediately.',
        ],
      },
      {
        heading: '4. Workshop Bookings and Cancellation',
        body: [
          'Workshop seats are limited and assigned in order of booking.',
          'Free cancellation is possible up to 7 days before the workshop date. After that, the full amount may be retained.',
        ],
      },
      {
        heading: '5. Withdrawal and Privacy',
        body: [
          'Consumers may withdraw from goods purchases according to applicable law.',
          'For data processing details, see our privacy policy at /datenschutz.',
        ],
      },
      {
        heading: '6. Applicable Law',
        body: [
          'Austrian law applies, excluding the UN Convention on Contracts for the International Sale of Goods. Place of jurisdiction is Graz where legally permitted.',
        ],
      },
    ],
  },
  {
    slug: 'impressum',
    deTitle: 'Impressum',
    enTitle: 'Legal Notice',
    deDescription: 'Impressum mit Unternehmens- und Kontaktdaten.',
    enDescription: 'Legal notice with company and contact information.',
    deSections: [
      {
        heading: 'Firmenangaben',
        body: [
          'Fermentfreude OG',
          'Grabenstrasse 15, 8010 Graz',
          'FN 659072 z, Firmenbuchgericht Graz',
          'UID: ATU82444712',
        ],
      },
      {
        heading: 'Kontaktdaten',
        body: [
          'Telefon: +43 660 4943577',
          'E-Mail: fermentfreude@gmail.com',
        ],
      },
      {
        heading: 'Unternehmensgegenstand',
        body: ['Fermentier-Workshops und E-Commerce.'],
      },
      {
        heading: 'Online-Streitbeilegung',
        body: [
          'Plattform der EU-Kommission zur Online-Streitbeilegung: https://ec.europa.eu/consumers/odr',
          'Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren teilzunehmen.',
        ],
      },
      {
        heading: 'Haftung und Urheberrecht',
        body: [
          'Trotz sorgfaeltiger inhaltlicher Kontrolle uebernehmen wir keine Haftung fuer externe Links.',
          'Die Inhalte dieser Website unterliegen dem Urheberrecht und duerfen nur mit Zustimmung verwendet werden.',
        ],
      },
    ],
    enSections: [
      {
        heading: 'Company Details',
        body: [
          'Fermentfreude OG',
          'Grabenstrasse 15, 8010 Graz, Austria',
          'Commercial register number: FN 659072 z (Graz)',
          'VAT ID: ATU82444712',
        ],
      },
      {
        heading: 'Contact',
        body: [
          'Phone: +43 660 4943577',
          'Email: fermentfreude@gmail.com',
        ],
      },
      {
        heading: 'Business Activity',
        body: ['Fermentation workshops and e-commerce.'],
      },
      {
        heading: 'Online Dispute Resolution',
        body: [
          'EU Commission online dispute resolution platform: https://ec.europa.eu/consumers/odr',
          'We are neither obliged nor willing to participate in dispute settlement proceedings.',
        ],
      },
      {
        heading: 'Liability and Copyright',
        body: [
          'Despite careful content control, we assume no liability for external links.',
          'Website content is protected by copyright and may only be used with prior permission.',
        ],
      },
    ],
  },
]

async function upsertLegalPage(payload: Awaited<ReturnType<typeof getPayload>>, page: LegalPageSeed) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: page.slug } },
    limit: 10,
    depth: 0,
  })

  const existingDoc = existing.docs[0]
  const existingLayout = Array.isArray(existingDoc?.layout) ? existingDoc.layout : []

  if (existingDoc && existingLayout.length > 0 && !isForce) {
    payload.logger.info(
      `  ⏭️  "${page.slug}" already has content (${existingLayout.length} blocks) — skipping.`,
    )
    payload.logger.info('     Use --force to overwrite.')
    return
  }

  const deData = {
    title: page.deTitle,
    slug: page.slug,
    _status: 'published' as const,
    hero: { type: 'none' as const },
    meta: {
      title: page.deTitle,
      description: page.deDescription,
    },
    layout: makeLayout(sectionsToLexical(page.deSections)),
  }

  let id: string | number

  if (existingDoc) {
    id = existingDoc.id
    await payload.update({
      collection: 'pages',
      id,
      locale: 'de',
      data: deData as never,
      context: ctx,
    })
    payload.logger.info(`  ✅ Updated "${page.slug}" (DE)`)
  } else {
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      data: deData as never,
      context: ctx,
    })
    id = created.id
    payload.logger.info(`  ✅ Created "${page.slug}" (DE)`)
  }

  const deDoc = await payload.findByID({
    collection: 'pages',
    id,
    locale: 'de',
    depth: 0,
  })

  const contentBlock = Array.isArray(deDoc.layout) ? deDoc.layout[0] : null
  const blockId = contentBlock?.id
  const firstColumn =
    contentBlock && 'columns' in contentBlock && Array.isArray(contentBlock.columns)
      ? contentBlock.columns[0]
      : null
  const columnId = firstColumn?.id

  const enLayout = [
    {
      ...(blockId ? { id: blockId } : {}),
      blockType: 'content',
      columns: [
        {
          ...(columnId ? { id: columnId } : {}),
          size: 'full' as const,
          richText: sectionsToLexical(page.enSections),
        },
      ],
    },
  ]

  await payload.update({
    collection: 'pages',
    id,
    locale: 'en',
    data: {
      title: page.enTitle,
      _status: 'published',
      hero: { type: 'none' },
      meta: {
        title: page.enTitle,
        description: page.enDescription,
      },
      layout: enLayout as never,
    },
    context: ctx,
  })

  payload.logger.info(`  ✅ Updated "${page.slug}" (EN)`)
}

async function seedLegalPages() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding legal CMS pages...')
  if (isForce) {
    payload.logger.info('  🔄 --force detected: existing legal page content will be overwritten.')
  }

  for (const page of LEGAL_PAGES) {
    await upsertLegalPage(payload, page)
  }

  payload.logger.info('✅ Legal pages seeded successfully.')
  payload.logger.info('   Editable in /admin/collections/pages with slugs: datenschutz, agb, impressum')
  process.exit(0)
}

seedLegalPages().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
