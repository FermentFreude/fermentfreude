import config from '@/payload.config'
import { getPayload } from 'payload'

/**
 * Brevo Templates Seed
 * Loads 19 email templates with all text fields editable
 * Each email becomes one collection entry
 */

interface TemplateData {
  brevoTemplateId: number
  templateName: string
  triggerDescription: string
  subject: string
  heroIcon: string
  heroHeading: string
  heroSubheading: string
  greeting: string
  bodySection1: string
  bodySection2: string
  bodySection3: string
  bodySection4: string
  ctaHeading: string
  ctaText: string
  ctaUrl: string
  ctaDescription: string
  footerContent: string
}

// Template mapping
const TEMPLATES: Partial<TemplateData>[] = [
  {
    brevoTemplateId: 27,
    templateName: 'Willkommen',
    triggerDescription: 'Wird gesendet, wenn ein neues Konto erstellt wird',
    subject: 'Willkommen bei FermentFreude!',
    heroIcon: '👋',
    heroHeading: 'WILLKOMMEN',
    heroSubheading: 'Dein Konto wurde erfolgreich erstellt.',
    greeting: 'Hallo {{ params.FIRST_NAME }},',
    bodySection1:
      'schön, dass du dabei bist! Bei FermentFreude dreht sich alles um die faszinierende Welt der Fermentation — von Kombucha über Kimchi bis Tempeh.',
    bodySection2:
      'Entdecke unsere Workshops, stöbere im Shop oder starte direkt mit deinem ersten Online-Kurs.',
    bodySection3:
      'Das erwartet dich bei FermentFreude: Workshops buchen — Lerne Fermentation von Kombucha bis Tempeh in kleinen Gruppen mit Hands-on-Erfahrung. Shop entdecken — Fermentationssets, Zutaten und Bücher — alles für dein nächstes Projekt. Online-Kurse — Lerne in deinem eigenen Tempo mit unseren Schritt-für-Schritt-Videokursen. Gastronomie-Partner — Professionelle Fermentationslösungen für Restaurants und Hotels.',
    bodySection4:
      'So startest du durch: 1. Profil anlegen — Erzähl uns mehr über dich und deine Fermentations-Interessen. 2. Workshop wählen — Finde den perfekten Kurs — von Basics bis Fortgeschrittene. 3. Loslegen — Buche deinen Platz und starte dein Fermentations-Abenteuer.',
    ctaHeading: 'Dein erster Workshop wartet',
    ctaText: 'Mein Konto ansehen',
    ctaUrl: '{{ params.DASHBOARD_URL | default: "https://www.fermentfreude.at/account" }}',
    ctaDescription:
      'Entdecke die Kunst der Fermentation in einem unserer Hands-on-Workshops. Kleine Gruppen, persönliche Betreuung und jede Menge Spaß.',
    footerContent:
      'Fragen? Wir helfen gerne! Schreib uns einfach an kontakt@fermentfreude.at — wir melden uns schnellstmöglich bei dir.',
  },
  {
    brevoTemplateId: 29,
    templateName: 'E-Mail bestätigen',
    triggerDescription: 'Zur Email-Verifikation',
    subject: 'E-Mail bestätigen',
    heroIcon: '✉️',
    heroHeading: 'E-Mail-Adresse bestätigen',
    heroSubheading: 'Klicke auf den Button, um dein Konto zu aktivieren.',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, bitte klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen und dein Konto zu aktivieren.',
    ctaText: 'E-Mail bestätigen',
    ctaUrl: '{{ params.VERIFICATION_URL }}',
    ctaDescription:
      'Button funktioniert nicht? Kopiere diesen Link: {{ params.VERIFICATION_URL }} | Dieser Link ist 24 Stunden gültig.',
    footerContent: 'FermentFreude GmbH | Folge uns auf Instagram & Facebook',
  },
  {
    brevoTemplateId: 28,
    templateName: 'Passwort zurücksetzen',
    triggerDescription: 'Zur Passwort-Zurücksetzen',
    subject: 'Passwort zurücksetzen',
    heroIcon: '🔐',
    heroHeading: 'Passwort zurücksetzen',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, klicke auf den Button, um ein neues Passwort festzulegen.',
    bodySection1: 'Klicke auf den Button unten, um ein neues Passwort festzulegen.',
    ctaText: 'Neues Passwort festlegen',
    ctaUrl: '{{ params.RESET_URL }}',
    ctaDescription:
      'Dieser Link ist 1 Stunde gültig. Falls du keine Passwort-Zurücksetzung angefordert hast, ignoriere diese E-Mail einfach.',
    footerContent: 'FermentFreude GmbH | Datenschutz',
  },
  {
    brevoTemplateId: 30,
    templateName: 'Neue Anmeldung',
    triggerDescription: 'Nach Login mit unbekanntem Gerät',
    subject: 'Neue Anmeldung erkannt',
    heroIcon: '🔔',
    heroHeading: 'Neue Anmeldung erkannt',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, wir haben eine neue Anmeldung auf dein Konto erkannt.',
    bodySection1: 'Gerät: {{ params.DEVICE }}',
    bodySection2: 'Ort: {{ params.LOCATION }}',
    bodySection3: 'Zeit: {{ params.LOGIN_DATE }}',
    ctaText: 'Passwort ändern',
    ctaUrl: '{{ params.RESET_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz',
  },
  {
    brevoTemplateId: 31,
    templateName: 'Buchungsbestätigung',
    triggerDescription: 'Nach Workshop-Buchung',
    subject: 'Buchung bestätigt!',
    heroIcon: '✅',
    heroHeading: 'Deine Buchung ist bestätigt!',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, danke für deine Anmeldung zum Workshop "{{ params.WORKSHOP_TITLE }}".',
    bodySection1: 'Datum: {{ params.WORKSHOP_DATE }} | Zeit: {{ params.WORKSHOP_TIME }}',
    bodySection2: 'Ort: {{ params.WORKSHOP_LOCATION }} | Teilnehmer: {{ params.ATTENDEES }}',
    bodySection3:
      'Gesamtpreis: {{ params.TOTAL_PRICE }} | Booking-Referenz: {{ params.BOOKING_REF }}',
    bodySection4: 'Was du mitbringen solltest: {{ params.WHAT_TO_BRING }}',
    ctaText: 'Buchung ansehen',
    ctaUrl: '{{ params.BOOKING_URL }}',
    footerContent: 'FermentFreude GmbH | AGB | Datenschutz',
  },
  {
    brevoTemplateId: 32,
    templateName: 'Workshop in 7 Tagen',
    triggerDescription: '7 Tage vor Workshop',
    subject: 'Erinnerung: Workshop in 7 Tagen',
    heroIcon: '📅',
    heroHeading: '{{ params.WORKSHOP_TITLE }}',
    greeting: 'Hallo {{ params.FIRST_NAME }}, noch 7 Tage bis zum Workshop!',
    bodySection1: 'Datum: {{ params.WORKSHOP_DATE }} | Zeit: {{ params.WORKSHOP_TIME }}',
    bodySection2: 'Ort: {{ params.WORKSHOP_LOCATION }}',
    bodySection3: 'Vorbereitung: {{ params.PREP_TIPS }}',
    ctaText: 'Zur Buchung',
    ctaUrl: '{{ params.BOOKING_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz',
  },
  {
    brevoTemplateId: 33,
    templateName: 'Workshop ist morgen!',
    triggerDescription: '1 Tag vor Workshop',
    subject: 'Workshop ist morgen!',
    heroIcon: '⏰',
    heroHeading: 'Morgen ist es soweit!',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, der Workshop "{{ params.WORKSHOP_TITLE }}" findet morgen statt!',
    bodySection1: 'Zeit: {{ params.WORKSHOP_TIME }}',
    bodySection2: 'Adresse: {{ params.WORKSHOP_ADDRESS }}',
    bodySection3: 'Was du mitbringen solltest: {{ params.WHAT_TO_BRING }}',
    bodySection4: 'Anfahrtsbeschreibung: {{ params.DIRECTIONS }}',
    ctaText: 'Google Maps öffnen',
    ctaUrl: '{{ params.MAPS_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz',
  },
  {
    brevoTemplateId: 34,
    templateName: 'Danke für deine Teilnahme',
    triggerDescription: 'Nach Workshop-Teilnahme',
    subject: 'Danke für deine Teilnahme!',
    heroIcon: '🙏',
    heroHeading: 'Danke für deine Teilnahme!',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, es war wunderbar, dich beim Workshop "{{ params.WORKSHOP_TITLE }}" zu sehen!',
    bodySection1: 'Gib uns dein Feedback: {{ params.FEEDBACK_URL }}',
    bodySection2:
      'Ähnliche Workshops: {{ params.RELATED_TITLE_1 }} ({{ params.RELATED_DATE_1 }}) | {{ params.RELATED_TITLE_2 }} ({{ params.RELATED_DATE_2 }})',
    ctaText: 'Feedback geben',
    ctaUrl: '{{ params.FEEDBACK_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz | Abmelden',
  },
  {
    brevoTemplateId: 35,
    templateName: 'Dein Feedback',
    triggerDescription: 'Feedback-Anfrage nach Workshop',
    subject: 'Wie war dein Erlebnis?',
    heroIcon: '⭐',
    heroHeading: 'Wie war dein Erlebnis?',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, wir möchten gerne deine Meinung zum Workshop "{{ params.WORKSHOP_TITLE }}" erfahren!',
    ctaText: 'Feedback geben',
    ctaUrl: '{{ params.FEEDBACK_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz | Abmelden',
  },
  {
    brevoTemplateId: 36,
    templateName: 'Bestellbestätigung',
    triggerDescription: 'Nach Bestellung',
    subject: 'Bestellung bestätigt!',
    heroIcon: '📦',
    heroHeading: 'Bestellung bestätigt!',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, danke für deine Bestellung #{{ params.ORDER_NUMBER }}!',
    bodySection1: 'Artikel: {{ item.TITLE }} ({{ item.QUANTITY }}x € {{ item.PRICE }})',
    bodySection2:
      'Summe: {{ params.SUBTOTAL }} + Versand: {{ params.SHIPPING }} = {{ params.TOTAL }}',
    bodySection3: 'Versandadresse: {{ params.SHIPPING_ADDRESS }}',
    ctaText: 'Bestellung ansehen',
    ctaUrl: '{{ params.ORDER_URL }}',
    footerContent: 'FermentFreude GmbH | AGB | Datenschutz',
  },
  {
    brevoTemplateId: 37,
    templateName: 'Versandbestätigung',
    triggerDescription: 'Nach Versand',
    subject: 'Dein Paket ist unterwegs!',
    heroIcon: '🚚',
    heroHeading: 'Dein Paket ist unterwegs!',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, Bestellung #{{ params.ORDER_NUMBER }} wurde versendet!',
    bodySection1: 'Versanddienstleister: {{ params.CARRIER }}',
    bodySection2: 'Tracking-Nummer: {{ params.TRACKING_NUMBER }}',
    bodySection3: 'Erwartete Lieferung: {{ params.ESTIMATED_DELIVERY }}',
    ctaText: 'Paket verfolgen',
    ctaUrl: '{{ params.TRACKING_URL }}',
    footerContent: 'FermentFreude GmbH | AGB | Datenschutz',
  },
  {
    brevoTemplateId: 38,
    templateName: 'Bewerte dein Produkt',
    triggerDescription: 'Review-Anfrage nach Lieferung',
    subject: 'Wie gefällt dir dein Produkt?',
    heroIcon: '✍️',
    heroHeading: 'Wie gefällt dir dein Produkt?',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, wir würden gerne deine Bewertung zum Produkt "{{ params.PRODUCT_TITLE }}" erfahren!',
    bodySection1: 'Bestellt am: {{ params.ORDER_DATE }}',
    ctaText: 'Jetzt bewerten',
    ctaUrl: '{{ params.REVIEW_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz | Abmelden',
  },
  {
    brevoTemplateId: 42,
    templateName: 'Dein Warenkorb wartet',
    triggerDescription: 'Warenkorb-Erinnerung',
    subject: 'Dein Warenkorb wartet',
    heroIcon: '🛒',
    heroHeading: 'Hast du etwas vergessen?',
    greeting: 'Hallo {{ params.FIRST_NAME }}, dein Warenkorb wartet noch!',
    bodySection1:
      'Artikel: {{ item.TITLE }} ({{ item.QUANTITY }}x € {{ item.PRICE }}) | Summe: {{ params.TOTAL }}',
    ctaText: 'Zum Warenkorb',
    ctaUrl: '{{ params.CART_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz | Abmelden',
  },
  {
    brevoTemplateId: 40,
    templateName: 'Willkommen zum Newsletter',
    triggerDescription: 'Newsletter-Anmeldung',
    subject: 'Willkommen zum Newsletter!',
    heroIcon: '📬',
    heroHeading: 'Willkommen bei FermentFreude!',
    greeting: 'Hallo {{ params.FIRST_NAME }}, danke für die Newsletter-Anmeldung!',
    bodySection1: 'Du erhältst jetzt exklusive Updates zu Workshops, Rezepten und Angeboten.',
    ctaText: 'Alle Workshops ansehen',
    ctaUrl: '{{ params.WORKSHOPS_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz | Abmelden',
  },
  {
    brevoTemplateId: 43,
    templateName: 'Kursanmeldung bestätigt',
    triggerDescription: 'Nach Kurs-Anmeldung',
    subject: 'Kursanmeldung bestätigt!',
    heroIcon: '🎓',
    heroHeading: 'Kursanmeldung bestätigt!',
    greeting: 'Hallo {{ params.FIRST_NAME }}, willkommen zum Kurs "{{ params.WORKSHOP_TITLE }}"!',
    bodySection1:
      '{{ params.LESSON_COUNT }} Lektionen | Erste Lektion: {{ params.FIRST_LESSON_TITLE }}',
    bodySection2: '{{ params.FIRST_LESSON_DESCRIPTION }}',
    ctaText: 'Kurs starten',
    ctaUrl: '{{ params.COURSE_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz',
  },
  {
    brevoTemplateId: 45,
    templateName: 'B2B-Anfrage eingegangen',
    triggerDescription: 'B2B-Anfrage über Formular',
    subject: 'B2B-Anfrage eingegangen',
    heroIcon: '💼',
    heroHeading: 'Anfrage eingegangen!',
    greeting:
      'Hallo {{ params.FIRST_NAME }}, danke für deine B2B-Anfrage von {{ params.COMPANY_NAME }}!',
    bodySection1: 'Anfrage-Typ: {{ params.INQUIRY_TYPE }}',
    bodySection2: 'Nachricht: {{ params.MESSAGE }}',
    ctaText: 'Zu B2B-Program',
    ctaUrl: '{{ params.GASTRONOMY_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz',
  },
  {
    brevoTemplateId: 41,
    templateName: 'Wir vermissen dich!',
    triggerDescription: 'Re-engagement nach Inaktivität',
    subject: 'Wir vermissen dich!',
    heroIcon: '💌',
    heroHeading: 'Wir vermissen dich!',
    greeting: 'Hallo {{ params.FIRST_NAME }}, schau dir unsere neuen Workshops an!',
    bodySection1:
      '{{ params.WORKSHOP_EMOJI_1 }} {{ params.WORKSHOP_TITLE_1 }} ({{ params.WORKSHOP_DATE_1 }})',
    bodySection2:
      '{{ params.WORKSHOP_EMOJI_2 }} {{ params.WORKSHOP_TITLE_2 }} ({{ params.WORKSHOP_DATE_2 }})',
    bodySection3:
      'Exklusiv für dich: {{ params.DISCOUNT_PERCENT }}% Rabatt mit Code {{ params.DISCOUNT_CODE }} (gültig bis {{ params.DISCOUNT_EXPIRY }})',
    ctaText: 'Workshops entdecken',
    ctaUrl: '{{ params.WORKSHOPS_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz | Abmelden',
  },
  {
    brevoTemplateId: 44,
    templateName: 'Freunde empfehlen',
    triggerDescription: 'Referral-Programm',
    subject: 'Freunde empfehlen & profitieren!',
    heroIcon: '👥',
    heroHeading: 'Freude teilen, Freude bekommen!',
    greeting: 'Hallo {{ params.FIRST_NAME }}, empfehle FermentFreude weiter und verdiene Rewards!',
    bodySection1: 'Freund erhält: {{ params.FRIEND_DISCOUNT }}% Rabatt',
    bodySection2: 'Du erhältst: {{ params.YOUR_REWARD }}',
    bodySection3: 'Dein Referral-Code: {{ params.REFERRAL_CODE }}',
    ctaText: 'Freunde einladen',
    ctaUrl: '{{ params.REFERRAL_URL }}',
    footerContent: 'FermentFreude GmbH | Datenschutz | Abmelden',
  },
  {
    brevoTemplateId: 39,
    templateName: 'Gutschein erworben',
    triggerDescription: 'Nach Gutschein-Kauf',
    subject: 'Gutschein erworben!',
    heroIcon: '🎁',
    heroHeading: 'Dein Gutschein ist bereit!',
    greeting: 'Hallo {{ params.FIRST_NAME }}, danke für den Gutschein-Kauf!',
    bodySection1: 'Wert: {{ params.VOUCHER_AMOUNT }}',
    bodySection2: 'Code: {{ params.VOUCHER_CODE }}',
    bodySection3: 'Gültig bis: {{ params.VOUCHER_EXPIRY }}',
    ctaText: 'Zum Shop',
    ctaUrl: '{{ params.SHOP_URL }}',
    footerContent: 'FermentFreude GmbH | AGB | Datenschutz',
  },
]

async function seed() {
  const payload = await getPayload({ config })
  console.log('\n🚀 Seeding Brevo email templates...\n')

  // Check for --force flag
  const args = process.argv.slice(2)
  const force = args.includes('--force')

  const ctx = { skipAutoTranslate: true, skipBrevoSync: true, skipRevalidate: true }

  for (const templateData of TEMPLATES) {
    try {
      const tmpl = templateData as TemplateData
      console.log(`📧 ${tmpl.templateName} (ID: ${tmpl.brevoTemplateId})`)

      // German version
      const existingDE = await payload.find({
        collection: 'brevo-templates',
        where: { brevoTemplateId: { equals: tmpl.brevoTemplateId } },
        locale: 'de',
      })

      let templateId: string

      if (existingDE.docs.length > 0 && !force) {
        console.log(`   ✓ Already exists (skipping). Use --force to overwrite.`)
        continue
      }

      // Update existing if force flag is set, otherwise create new
      if (existingDE.docs.length > 0 && force) {
        await payload.update({
          collection: 'brevo-templates',
          id: existingDE.docs[0].id,
          locale: 'de',
          data: {
            brevoTemplateId: tmpl.brevoTemplateId,
            templateName: tmpl.templateName,
            triggerDescription: tmpl.triggerDescription,
            subject: tmpl.subject,
            heroIcon: tmpl.heroIcon,
            heroHeading: tmpl.heroHeading,
            heroSubheading: tmpl.heroSubheading,
            greeting: tmpl.greeting || '',
            bodySection1: tmpl.bodySection1 || '',
            bodySection2: tmpl.bodySection2 || '',
            bodySection3: tmpl.bodySection3 || '',
            bodySection4: tmpl.bodySection4 || '',
            ctaHeading: tmpl.ctaHeading || '',
            ctaText: tmpl.ctaText,
            ctaUrl: tmpl.ctaUrl,
            ctaDescription: tmpl.ctaDescription || '',
            footerContent: tmpl.footerContent,
          } as any,
          context: ctx,
        })
        templateId = existingDE.docs[0].id
      } else {
        const savedDE = await payload.create({
          collection: 'brevo-templates',
          locale: 'de',
          data: {
            brevoTemplateId: tmpl.brevoTemplateId,
            templateName: tmpl.templateName,
            triggerDescription: tmpl.triggerDescription,
            subject: tmpl.subject,
            heroIcon: tmpl.heroIcon,
            heroHeading: tmpl.heroHeading,
            heroSubheading: tmpl.heroSubheading,
            greeting: tmpl.greeting || '',
            bodySection1: tmpl.bodySection1 || '',
            bodySection2: tmpl.bodySection2 || '',
            bodySection3: tmpl.bodySection3 || '',
            bodySection4: tmpl.bodySection4 || '',
            ctaHeading: tmpl.ctaHeading || '',
            ctaText: tmpl.ctaText,
            ctaUrl: tmpl.ctaUrl,
            ctaDescription: tmpl.ctaDescription || '',
            footerContent: tmpl.footerContent,
          } as any,
          context: ctx,
        })
        templateId = savedDE.id
      }

      // English version created via autoTranslateCollection hook (no direct creation needed)
      // This avoids MongoDB M0 write conflicts

      console.log(`   ✓ Saved (ID: ${templateId})`)
    } catch (err) {
      console.error(`   ✗ Error: ${err instanceof Error ? err.message : String(err)}`)
    }

    // M0 database: sequential writes only - extend delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log('\n✅ Brevo templates seeded!\n')
}

seed().catch(console.error)
