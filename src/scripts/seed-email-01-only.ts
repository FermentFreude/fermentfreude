import config from '@payload-config'
import { getPayload } from 'payload'

async function seedEmail01() {
  const payload = await getPayload({ config })

  const ctx = { skipAutoTranslate: true, skipBrevoSync: true, skipRevalidate: true }

  console.log('\n🌱 Seeding Email #1: Willkommen (Account Creation)')

  // German version
  const saved = await payload.update({
    collection: 'brevo-templates',
    id: '69e6a13e8848c8da91d727ed', // Willkommen template
    locale: 'de',
    data: {
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
      isActive: true,
    },
    context: ctx,
  })

  console.log(`✅ Email #1 seeded (ID: ${saved.id})`)
}

seedEmail01().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
