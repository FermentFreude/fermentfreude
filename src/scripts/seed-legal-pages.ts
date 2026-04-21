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
        heading: '1. Verantwortlicher',
        body: [
          'Verantwortlich für die Datenverarbeitung auf dieser Website ist:',
          'Fermentfreude OG',
          'Grabenstraße 15',
          '8010 Graz',
          'Österreich',
          'E-Mail: kontakt@fermentfreude.at',
          'Telefon: +43 (0) 660 49 43 577',
        ],
      },
      {
        heading: '2. Allgemeines zur Datenverarbeitung',
        body: [
          'Wir verarbeiten personenbezogene Daten ausschließlich im Einklang mit den geltenden Datenschutzbestimmungen, insbesondere der Datenschutz-Grundverordnung.',
          'Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können (z. B. Name, E-Mail-Adresse, Telefonnummer).',
        ],
      },
      {
        heading: '3. Zugriffsdaten (Server-Logfiles)',
        body: [
          'Beim Besuch dieser Website werden automatisch folgende Daten erfasst:',
          '• IP-Adresse',
          '• Datum und Uhrzeit der Anfrage',
          '• Browsertyp und Version',
          '• Betriebssystem',
          '• Referrer URL',
          'Diese Daten dienen der technischen Bereitstellung und Sicherheit der Website.',
          'Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem Betrieb der Website)',
        ],
      },
      {
        heading: '4. Hosting & Infrastruktur',
        body: [
          'Unsere Website wird betrieben über:',
          '• Vercel (Hosting)',
          '• Cloudflare (Content Delivery & Performance)',
          'Diese Anbieter verarbeiten technische Daten (z. B. IP-Adresse), um eine stabile und sichere Bereitstellung der Website zu gewährleisten.',
          'Eine Verarbeitung kann auch außerhalb der EU erfolgen. In diesen Fällen erfolgt die Datenübermittlung auf Grundlage geeigneter Garantien (z. B. Standardvertragsklauseln).',
          'Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO',
        ],
      },
      {
        heading: '5. Kontaktformular',
        body: [
          'Wenn Sie uns über das Kontaktformular kontaktieren, werden folgende Daten verarbeitet:',
          '• Name',
          '• E-Mail-Adresse',
          '• Telefonnummer (optional)',
          'Die Daten werden zur Bearbeitung Ihrer Anfrage verwendet und in unserem CRM-System gespeichert.',
          'Rechtsgrundlage:',
          '• Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen)',
          '• Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Bearbeitung von Anfragen)',
        ],
      },
      {
        heading: '6. Buchungen & Bestellungen',
        body: [
          'Wenn Sie über unsere Website Workshops, Online-Kurse oder zukünftig Produkte buchen bzw. kaufen, verarbeiten wir:',
          '• Name',
          '• E-Mail-Adresse',
          '• Telefonnummer',
          'Diese Daten sind erforderlich zur Durchführung und Abwicklung des Vertrags.',
          'Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)',
        ],
      },
      {
        heading: '7. Zahlungsabwicklung',
        body: [
          'Die Zahlungsabwicklung erfolgt über:',
          '• Stripe',
          'Bei der Zahlung werden Ihre Zahlungsdaten direkt an Stripe übermittelt. Wir speichern keine vollständigen Zahlungsinformationen.',
          'Stripe kann Daten in Drittländer (z. B. USA) übertragen. Die Übermittlung erfolgt auf Basis geeigneter Garantien (z. B. Standardvertragsklauseln).',
          'Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO',
        ],
      },
      {
        heading: '8. Newsletter & E-Mail-Kommunikation',
        body: [
          'Für den Versand von Newslettern und automatisierten E-Mails nutzen wir:',
          '• Brevo',
          'Dabei werden folgende Daten verarbeitet:',
          '• E-Mail-Adresse',
          '• ggf. Name',
          'Die Anmeldung erfolgt über ein Double-Opt-in-Verfahren. Das bedeutet, dass Sie Ihre Anmeldung über eine Bestätigungs-E-Mail verifizieren müssen.',
          'Sie können den Newsletter jederzeit über den Abmeldelink kündigen.',
          'Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)',
        ],
      },
      {
        heading: '9. Tracking & Analyse',
        body: [
          'Wir nutzen folgende Tools:',
          '• Google Analytics',
          '• Meta Pixel',
          'Diese Tools helfen uns, das Nutzerverhalten auf unserer Website zu analysieren und unser Angebot zu verbessern.',
          'Die Nutzung dieser Tools erfolgt ausschließlich nach Ihrer Einwilligung über das Cookie-Banner.',
          'Eine Verarbeitung kann auch in Drittländern (z. B. USA) stattfinden. In diesen Fällen erfolgt die Datenübertragung auf Grundlage geeigneter Garantien.',
          'Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO',
        ],
      },
      {
        heading: '10. Cookies',
        body: [
          'Unsere Website verwendet Cookies.',
          'Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.',
          'Wir unterscheiden zwischen:',
          '• technisch notwendigen Cookies',
          '• Analyse- und Marketing-Cookies',
          'Analyse- und Marketing-Cookies werden nur nach Ihrer ausdrücklichen Einwilligung gesetzt.',
          'Sie können Ihre Cookie-Einstellungen jederzeit über das Cookie-Banner anpassen.',
          'Rechtsgrundlage:',
          '• Art. 6 Abs. 1 lit. f DSGVO (notwendige Cookies)',
          '• Art. 6 Abs. 1 lit. a DSGVO (alle anderen Cookies)',
        ],
      },
      {
        heading: '11. Externe Inhalte & Links',
        body: [
          'Auf unserer Website befinden sich Links zu:',
          '• Instagram',
          '• Facebook',
          '• LinkedIn',
          'Beim Anklicken dieser Links verlassen Sie unsere Website. Für die Datenverarbeitung durch diese Plattformen sind die jeweiligen Anbieter verantwortlich.',
          'Google Maps',
          'Zur Darstellung von Standorten nutzen wir:',
          '• Google Maps',
          'Dabei kann es zur Übertragung von Daten an Google kommen (z. B. IP-Adresse).',
          'Die Nutzung erfolgt nur nach Ihrer Einwilligung.',
          'Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO',
        ],
      },
      {
        heading: '12. Speicherdauer',
        body: [
          'Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.',
        ],
      },
      {
        heading: '13. Ihre Rechte',
        body: [
          'Sie haben jederzeit das Recht auf:',
          '• Auskunft über Ihre gespeicherten Daten',
          '• Berichtigung unrichtiger Daten',
          '• Löschung Ihrer Daten',
          '• Einschränkung der Verarbeitung',
          '• Datenübertragbarkeit',
          'Außerdem haben Sie das Recht, eine erteilte Einwilligung jederzeit zu widerrufen.',
        ],
      },
      {
        heading: '14. Beschwerderecht',
        body: [
          'Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen geltendes Recht verstößt, können Sie sich bei der zuständigen Datenschutzbehörde beschweren.',
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
    deTitle: 'Allgemeine Geschäftsbedingungen (AGB)',
    enTitle: 'Terms and Conditions',
    deDescription: 'Allgemeine Geschäftsbedingungen der Fermentfreude OG.',
    enDescription: 'General terms and conditions of Fermentfreude OG.',
    deSections: [
      {
        heading: 'Fermentfreude OG',
        body: [
          'Fermentfreude OG',
          'Grabenstraße 15',
          '8010 Graz',
          'Österreich',
          'FN 659072 z',
          'Inhaber:',
          'Marcel Raunnigger',
          'David Haider',
          'Telefon: +43 (0) 660 49 43 577',
          'E-Mail: fermentfreude@gmail.com',
          'Website: https://www.ferment-freude.at',
        ],
      },
      {
        heading: '1. Geltungsbereich',
        body: [
          'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Vertragsabschlüsse zwischen der Fermentfreude OG (im Folgenden „Fermentfreude“) und ihren Kundinnen und Kunden über:',
          '• die Teilnahme an Workshops und Veranstaltungen,',
          '• den Erwerb von Gutscheinen,',
          '• sowie den Kauf von Waren über den Online-Shop von Fermentfreude.',
          'Abweichende Bedingungen des Kunden gelten nur, wenn Fermentfreude ihrer Geltung ausdrücklich schriftlich zugestimmt hat.',
          'Kundinnen und Kunden im Sinne dieser AGB sind sowohl Verbraucher im Sinne des Konsumentenschutzgesetzes (KSchG) als auch Unternehmer im Sinne des Unternehmensgesetzbuches (UGB).',
        ],
      },
      {
        heading: '2. Vertragsabschluss',
        body: [
          'Die Präsentation von Workshops oder Waren auf der Website stellt noch kein verbindliches Angebot dar.',
          'Durch das Absenden einer Buchung oder Bestellung gibt der Kunde ein verbindliches Angebot zum Abschluss eines Vertrages ab.',
          'Der Vertrag kommt erst zustande, wenn Fermentfreude die Buchung oder Bestellung ausdrücklich bestätigt oder die Teilnahme bzw. Bestellung annimmt.',
          'Fermentfreude behält sich vor, Buchungen oder Bestellungen ohne Angabe von Gründen abzulehnen.',
        ],
      },
      {
        heading: '3. Preise und Zahlungsbedingungen',
        body: [
          'Alle Preise verstehen sich als Gesamtpreise in Euro.',
          'Fermentfreude ist Kleinunternehmer im Sinne des § 6 Abs. 1 Z 27 UStG, daher wird keine Umsatzsteuer ausgewiesen.',
          'Die Zahlung erfolgt über die auf der Website angebotenen Zahlungsmethoden, insbesondere über Online-Zahlungsdienste wie Stripe.',
          'Der Rechnungsbetrag ist mit Vertragsabschluss fällig.',
        ],
      },
      {
        heading: '4. Workshops und Veranstaltungen',
        body: [],
      },
      {
        heading: '4.1 Buchung',
        body: [
          'Workshops können über die Website oder über andere angebotene Buchungskanäle gebucht werden.',
          'Die Teilnehmerzahl ist begrenzt. Die Teilnahme ist erst nach erfolgreicher Zahlung des Teilnahmebeitrags gesichert.',
        ],
      },
      {
        heading: '4.2 Teilnahmebedingungen',
        body: [
          'Teilnehmer verpflichten sich, während des Workshops den Anweisungen der Veranstalter Folge zu leisten.',
          'Teilnehmer sind verpflichtet, Allergien, Unverträglichkeiten oder gesundheitliche Einschränkungen, die für den Workshop relevant sein könnten, vor Beginn des Workshops mitzuteilen.',
          'Fermentfreude übernimmt keine Haftung für gesundheitliche Reaktionen, sofern diese auf nicht bekannt gegebene Allergien oder Unverträglichkeiten zurückzuführen sind.',
          'Teilnehmer, die den Ablauf erheblich stören oder Sicherheits- bzw. Hygieneanweisungen nicht einhalten, können vom Workshop ausgeschlossen werden. In diesem Fall besteht kein Anspruch auf Rückerstattung.',
        ],
      },
      {
        heading: '4.3 Stornierung durch Teilnehmer',
        body: [
          'Eine Stornierung muss schriftlich per E-Mail erfolgen. Maßgeblich ist der Zeitpunkt des Eingangs der Stornierung bei Fermentfreude.',
          'Es gelten folgende Stornobedingungen:',
          '• bis 14 Tage vor dem Workshoptermin: kostenfreie Stornierung',
          '• 7 bis 14 Tage vor dem Termin: 50 % des Workshoppreises',
          '• weniger als 7 Tage vor dem Termin: keine Rückerstattung',
          'Bei Nichterscheinen ohne vorherige Stornierung besteht kein Anspruch auf Rückerstattung.',
        ],
      },
      {
        heading: '4.4 Ersatzteilnehmer',
        body: [
          'Der Teilnehmer ist berechtigt, jederzeit eine Ersatzperson zu benennen, die an seiner Stelle am Workshop teilnimmt. In diesem Fall entstehen keine zusätzlichen Kosten.',
        ],
      },
      {
        heading: '4.5 Absage oder Änderungen durch Fermentfreude',
        body: [
          'Fermentfreude behält sich vor, Workshops aus wichtigen Gründen abzusagen oder zu verschieben.',
          'Dies gilt insbesondere bei:',
          '• Krankheit des Trainers',
          '• zu geringer Teilnehmerzahl',
          '• höherer Gewalt',
          '• organisatorischen Gründen',
          'In diesem Fall werden bereits bezahlte Teilnahmegebühren vollständig rückerstattet oder auf Wunsch auf einen Ersatztermin übertragen.',
          'Weitergehende Ansprüche, insbesondere Ersatz von Reise- oder Unterkunftskosten, sind ausgeschlossen.',
        ],
      },
      {
        heading: '5. Gutscheine',
        body: [
          'Gutscheine können über die Website oder direkt bei Fermentfreude erworben werden.',
          'Gutscheine sind ab Ausstellungsdatum drei Jahre gültig, sofern nicht anders angegeben.',
          'Eine Barablöse von Gutscheinen ist ausgeschlossen.',
        ],
      },
      {
        heading: '6. Online-Shop und Warenverkauf',
        body: [
          'Fermentfreude bietet ausgewählte Produkte über den Online-Shop an.',
          'Bestellungen sind nur in haushaltsüblichen Mengen möglich.',
          'Der Verkauf erfolgt ausschließlich an volljährige Personen.',
        ],
      },
      {
        heading: '7. Abholung der Ware',
        body: [
          'Derzeit erfolgt die Lieferung der Waren ausschließlich durch Abholung im Geschäftslokal von Fermentfreude.',
          'Der Kunde wird informiert, sobald die Ware zur Abholung bereitsteht.',
          'Die Abholung erfolgt während der bekanntgegebenen Öffnungs- bzw. Abholzeiten.',
          'Bei verderblichen Waren ist eine zeitnahe Abholung erforderlich.',
          'Erfolgt die Abholung nicht innerhalb angemessener Frist, behält sich Fermentfreude vor, vom Vertrag zurückzutreten.',
          'Mit der Übergabe der Ware geht die Gefahr auf den Kunden über.',
        ],
      },
      {
        heading: '8. Widerrufsrecht für Verbraucher',
        body: [
          'Verbrauchern steht grundsätzlich ein 14-tägiges Widerrufsrecht bei Fernabsatzverträgen zu.',
          'Das Widerrufsrecht besteht jedoch nicht bei Verträgen über:',
          '• Dienstleistungen im Zusammenhang mit Freizeitbetätigungen, wenn für die Vertragserfüllung ein bestimmter Termin oder Zeitraum vorgesehen ist (z. B. Workshops),',
          '• Waren, die schnell verderben können oder deren Verfallsdatum schnell überschritten würde.',
        ],
      },
      {
        heading: '9. Gewährleistung',
        body: [
          'Es gelten die gesetzlichen Gewährleistungsbestimmungen.',
          'Bei berechtigten Mängeln hat der Kunde Anspruch auf Verbesserung oder Austausch, sofern dies möglich und wirtschaftlich vertretbar ist.',
        ],
      },
      {
        heading: '10. Haftung',
        body: [
          'Fermentfreude haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen.',
          'Diese Haftungsbeschränkung gilt nicht für:',
          '• Personenschäden',
          '• Schäden nach dem Produkthaftungsgesetz',
          '• Ansprüche, die gesetzlich nicht eingeschränkt werden dürfen.',
        ],
      },
      {
        heading: '11. Bild- und Videoaufnahmen',
        body: [
          'Während Workshops können Foto- oder Videoaufnahmen entstehen.',
          'Diese können für Dokumentations- und Marketingzwecke von Fermentfreude verwendet werden.',
          'Teilnehmer können der Verwendung ihrer Aufnahmen jederzeit widersprechen.',
        ],
      },
      {
        heading: '12. Datenschutz',
        body: [
          'Informationen zur Verarbeitung personenbezogener Daten sind in der Datenschutzerklärung auf der Website von Fermentfreude abrufbar.',
        ],
      },
      {
        heading: '13. Anwendbares Recht und Gerichtsstand',
        body: [
          'Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts.',
          'Gerichtsstand ist das sachlich zuständige Gericht am Sitz von Fermentfreude, soweit dem keine zwingenden verbraucherrechtlichen Bestimmungen entgegenstehen.',
        ],
      },
    ],
    enSections: [
      {
        heading: 'Fermentfreude OG',
        body: [
          'Fermentfreude OG',
          'Grabenstrasse 15',
          '8010 Graz',
          'Austria',
          'FN 659072 z',
          'Owners:',
          'Marcel Raunnigger',
          'David Haider',
          'Phone: +43 (0) 660 49 43 577',
          'Email: fermentfreude@gmail.com',
          'Website: https://www.ferment-freude.at',
        ],
      },
      {
        heading: '1. Scope',
        body: [
          'These General Terms and Conditions (GTC) apply to all contracts concluded between Fermentfreude OG (hereinafter "Fermentfreude") and its customers regarding:',
          '• participation in workshops and events,',
          '• purchase of vouchers,',
          '• and purchase of goods via the Fermentfreude online shop.',
          'Deviating customer terms only apply if Fermentfreude has expressly agreed to them in writing.',
          'Customers within the meaning of these GTC include both consumers under Austrian consumer protection law and entrepreneurs under Austrian commercial law.',
        ],
      },
      {
        heading: '2. Contract Conclusion',
        body: [
          'The presentation of workshops or goods on the website does not constitute a binding offer.',
          'By submitting a booking or order, the customer makes a binding offer to conclude a contract.',
          'The contract is only concluded when Fermentfreude expressly confirms the booking/order or accepts participation/order fulfillment.',
          'Fermentfreude reserves the right to reject bookings or orders without stating reasons.',
        ],
      },
      {
        heading: '3. Prices and Payment Terms',
        body: [
          'All prices are total prices in euros.',
          'Fermentfreude qualifies as a small business under Austrian VAT law (§ 6 para 1 no 27 UStG); therefore, VAT is not shown.',
          'Payment is made via payment methods offered on the website, in particular online payment services such as Stripe.',
          'The invoice amount is due upon conclusion of the contract.',
        ],
      },
      {
        heading: '4. Workshops and Events',
        body: [
          'The following additional provisions apply to workshops and events:',
        ],
      },
      {
        heading: '4.1 Booking',
        body: [
          'Workshops can be booked via the website or other offered booking channels.',
          'Participant numbers are limited. Participation is only secured after successful payment of the participation fee.',
        ],
      },
      {
        heading: '4.2 Participation Requirements',
        body: [
          'Participants must follow the organizers instructions during the workshop.',
          'Participants must inform us before the workshop about allergies, intolerances, or health limitations that may be relevant.',
          'Fermentfreude assumes no liability for health reactions resulting from allergies or intolerances that were not disclosed.',
          'Participants who significantly disrupt workshop operations or fail to follow safety/hygiene instructions may be excluded from the workshop. In this case, there is no right to a refund.',
        ],
      },
      {
        heading: '4.3 Cancellation by Participants',
        body: [
          'Cancellations must be made in writing by email. The relevant time is receipt of the cancellation by Fermentfreude.',
          'The following cancellation terms apply:',
          '• up to 14 days before the workshop date: free cancellation',
          '• 7 to 14 days before the date: 50% of the workshop price',
          '• less than 7 days before the date: no refund',
          'No refund is granted for no-shows without prior cancellation.',
        ],
      },
      {
        heading: '4.4 Replacement Participant',
        body: [
          'Participants may nominate a replacement person at any time to attend in their place. No additional costs apply in this case.',
        ],
      },
      {
        heading: '4.5 Cancellation or Changes by Fermentfreude',
        body: [
          'Fermentfreude reserves the right to cancel or reschedule workshops for important reasons.',
          'This applies in particular in cases of:',
          '• trainer illness',
          '• insufficient number of participants',
          '• force majeure',
          '• organizational reasons',
          'In such cases, already paid participation fees will be fully refunded or, on request, transferred to a replacement date.',
          'Further claims, in particular reimbursement of travel or accommodation costs, are excluded.',
        ],
      },
      {
        heading: '5. Vouchers',
        body: [
          'Vouchers can be purchased via the website or directly from Fermentfreude.',
          'Vouchers are valid for three years from the date of issue unless stated otherwise.',
          'Cash redemption of vouchers is excluded.',
        ],
      },
      {
        heading: '6. Online Shop and Sale of Goods',
        body: [
          'Fermentfreude offers selected products via its online shop.',
          'Orders are only possible in quantities customary for private households.',
          'Sales are made exclusively to persons of legal age.',
        ],
      },
      {
        heading: '7. Collection of Goods',
        body: [
          'Currently, goods are delivered exclusively by pickup at Fermentfreude premises.',
          'Customers are informed as soon as goods are ready for pickup.',
          'Pickup takes place during announced opening/pickup times.',
          'Perishable goods must be collected promptly.',
          'If pickup does not occur within a reasonable period, Fermentfreude reserves the right to withdraw from the contract.',
          'Risk passes to the customer upon handover of the goods.',
        ],
      },
      {
        heading: '8. Right of Withdrawal for Consumers',
        body: [
          'Consumers generally have a 14-day right of withdrawal for distance contracts.',
          'However, the right of withdrawal does not apply to contracts concerning:',
          '• services related to leisure activities if the contract provides for a specific date or period of performance (e.g. workshops),',
          '• goods that can deteriorate quickly or whose expiration date would quickly be exceeded.',
        ],
      },
      {
        heading: '9. Warranty',
        body: [
          'Statutory warranty provisions apply.',
          'In case of justified defects, the customer is entitled to repair or replacement, provided this is possible and economically reasonable.',
        ],
      },
      {
        heading: '10. Liability',
        body: [
          'Fermentfreude is only liable for damages caused by intentional or grossly negligent conduct.',
          'This limitation of liability does not apply to:',
          '• personal injury',
          '• claims under product liability law',
          '• claims that cannot be legally limited.',
        ],
      },
      {
        heading: '11. Photo and Video Recordings',
        body: [
          'Photo and video recordings may be made during workshops.',
          'These may be used by Fermentfreude for documentation and marketing purposes.',
          'Participants may object to the use of recordings showing them at any time.',
        ],
      },
      {
        heading: '12. Data Protection',
        body: [
          'Information on the processing of personal data is available in the Fermentfreude privacy policy on the website.',
        ],
      },
      {
        heading: '13. Applicable Law and Jurisdiction',
        body: [
          'Austrian law applies, excluding the UN Convention on Contracts for the International Sale of Goods.',
          'Place of jurisdiction is the competent court at the registered office of Fermentfreude, unless mandatory consumer protection provisions provide otherwise.',
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
        heading: 'Angaben gemäß § 5 ECG, § 25 MedienG, § 63 GewO und § 14 UGB',
        body: [],
      },
      {
        heading: 'Unternehmen',
        body: [
          'Fermentfreude OG',
          'Grabenstraße 15',
          '8010 Graz',
          'Österreich',
          'Firmenbuchnummer: FN 659072 z',
          'Firmenbuchgericht: Graz',
        ],
      },
      {
        heading: 'Vertretungsberechtigte Gesellschafter',
        body: ['Marcel Raunnigger', 'David Haider'],
      },
      {
        heading: 'Kontakt',
        body: [
          'Telefon: +43 660 4943577',
          'E-Mail: kontakt@fermentfreude.at',
        ],
      },
      {
        heading: 'Unternehmensgegenstand',
        body: [
          'Durchführung von Workshops und Veranstaltungen im Bereich Fermentation sowie Handel mit Waren (E-Commerce)',
        ],
      },
      {
        heading: 'Umsatzsteuer',
        body: [
          'UID-Nummer: ATU82444712',
          'Kleinunternehmer im Sinne des § 6 Abs. 1 Z 27 UStG',
          'Es wird keine Umsatzsteuer ausgewiesen.',
        ],
      },
      {
        heading: 'Medieninhaber und Herausgeber',
        body: ['Fermentfreude OG', 'Grabenstraße 15', '8010 Graz'],
      },
      {
        heading: 'Blattlinie',
        body: [
          'Diese Website dient der Information über die Angebote und Tätigkeiten von Fermentfreude OG im Bereich Fermentation, Workshops und Produkte.',
        ],
      },
      {
        heading: 'Online-Streitbeilegung',
        body: [
          'Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform der Europäischen Kommission zu richten:',
          'https://ec.europa.eu/consumers/odr',
        ],
      },
      {
        heading: 'Haftung für Inhalte',
        body: [
          'Die Inhalte unserer Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.',
        ],
      },
      {
        heading: 'Haftung für Links',
        body: [
          'Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich.',
        ],
      },
      {
        heading: 'Urheberrecht',
        body: [
          'Die Inhalte und Werke auf dieser Website unterliegen dem Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.',
          'Die Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors.',
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
