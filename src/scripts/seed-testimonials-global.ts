import type { TestimonialsGlobal } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Seed testimonials global (single source of truth for all pages).
 * Run: pnpm seed:testimonials-global
 */
async function seedTestimonialsGlobal() {
  const payload = await getPayload({ config })
  console.log('🌱 Seeding Testimonials Global...')

  const context = {
    skipRevalidate: true,
    disableRevalidate: true,
    skipAutoTranslate: true,
  }

  // German version
  const deData = {
    eyebrow: 'Testimonials',
    heading: 'Was gefällt',
    testimonials: [
      {
        quote:
          'Das Kursangebot besuchen zu können, war eines der besten Geburtstagsgeschenke, die ich mir denken kann. Es war wunderbar zu sehen, wie Marcel seine Leidenschaft für Fermentation mit den Teilnehmern teilt. Und das Beste ist: Es öffnet mir eine ganz neue kulinarische Welt.',
        authorName: 'Ernst Michael Preininger',
        authorRole: 'Workshop Teilnehmer',
        rating: 5,
      },
      {
        quote:
          'Ein sehr empfehlenswerter Workshop, sowohl für Anfänger als auch für Erfahrene. Marcel vermittelt die faszinierenden Techniken mit Leidenschaft für das Thema, detaillierten aber nicht langweiligen Erklärungen und einer guten Portion Humor. Das Highlight war definitiv die ausgezeichnete Verkostung.',
        authorName: 'Mme Kuchar',
        authorRole: 'Workshop Teilnehmerin',
        rating: 5,
      },
      {
        quote:
          'Marcel und David sind unglaublich freundliche Menschen, die gerne ihr Wissen in verschiedenen Workshops teilen. Der Kombucha-Workshop war die perfekte Einführung in die faszinierende Welt der Kombucha! Ich empfehle es jedem sehr, der sich für Fermentation interessiert!',
        authorName: 'Vera Wagner',
        authorRole: 'Workshop Teilnehmerin',
        rating: 5,
      },
      {
        quote:
          'Ich habe meinen Geburtstag bei Ferment-Freude gefeiert. Es war riesig Spaß, und David hat uns den Nachmittag wunderbar geleitet. Wir haben sofort alle technischen Informationen in die Praxis umgesetzt. Sehr empfehlenswert für alle, die einen coolen Nachmittag oder etwas zum Feiern möchten!',
        authorName: 'Andi Wind',
        authorRole: 'Workshop Teilnehmer',
        rating: 5,
      },
      {
        quote:
          'Sehr informative Workshops von einem ausgebildeten Koch mit Leidenschaft für Fermentation, mit viel praktischer Erfahrung und großartigen selbstgemachten Geschenken zum Mitnehmen. Die danach verkosteten selbst fermentierten Produkte sind köstlich! Der nächste Workshop ist bereits gebucht.',
        authorName: 'Jorche Kanipcki',
        authorRole: 'Workshop Teilnehmer',
        rating: 5,
      },
      {
        quote:
          'Wir hatten einen wunderschönen Abend beim Tempeh-Workshop. Wir haben viel gelernt und die Verkostung der verschiedenen fermentierten Lebensmittel war ein kulinarischer Höhepunkt.',
        authorName: 'Marlies Kern',
        authorRole: 'Workshop Teilnehmerin',
        rating: 5,
      },
    ],
  }

  // English version
  const enData = {
    eyebrow: 'Testimonials',
    heading: 'What Our Community Says',
    testimonials: [
      {
        quote:
          'Being able to attend the course was one of the best birthday presents I can remember. It was wonderful to see Marcel share his passion for fermentation with the participants. And the best part is: it opens up a whole new culinary world for me.',
        authorName: 'Ernst Michael Preininger',
        authorRole: 'Workshop Participant',
        rating: 5,
      },
      {
        quote:
          'A highly recommended workshop, both for beginners and those with some experience. Marcel conveys the fascinating techniques with a passion for the subject, detailed but not boring explanations, and a good dose of humor. The highlight was definitely the excellent tasting.',
        authorName: 'Mme Kuchar',
        authorRole: 'Workshop Participant',
        rating: 5,
      },
      {
        quote:
          'Marcel and David are incredibly kind people who genuinely enjoy sharing their knowledge in various workshops. The kombucha workshop was the perfect introduction to the fascinating world of kombucha! I highly recommend it to anyone interested in fermentation!',
        authorName: 'Vera Wagner',
        authorRole: 'Workshop Participant',
        rating: 5,
      },
      {
        quote:
          'I celebrated my birthday at Ferment-Freude. It was super fun, and David did a fantastic job guiding us through the afternoon. We immediately put all the technical information into practice. Highly recommended for anyone who wants a cool afternoon or has something to celebrate!',
        authorName: 'Andi Wind',
        authorRole: 'Workshop Participant',
        rating: 5,
      },
      {
        quote:
          'Very informative workshops from a trained chef with a passion for fermentation, with plenty of practical experience and great homemade gifts to take home. The homemade fermented products tasted afterward are exquisite! The next workshop is already booked.',
        authorName: 'Jorche Kanipcki',
        authorRole: 'Workshop Participant',
        rating: 5,
      },
      {
        quote:
          'We had a wonderful evening at the Tempeh workshop. We learned a lot and the tasting of the different fermented foods was a culinary highlight.',
        authorName: 'Marlies Kern',
        authorRole: 'Workshop Participant',
        rating: 5,
      },
    ],
  }

  // Save German version
  await payload.updateGlobal({
    slug: 'testimonials-global',
    locale: 'de',
    data: deData,
    context,
  })
  console.log('✅ Saved DE testimonials global')

  // Save English version (reuse IDs from German to keep consistency)
  const saved = (await payload.findGlobal({
    slug: 'testimonials-global',
    locale: 'de',
    depth: 0,
  })) as TestimonialsGlobal

  const testimonialIds = (saved?.testimonials ?? []).map((t: { id?: string | null }) => t?.id)
  const enTestimonials = enData.testimonials.map((t, idx: number) => ({
    ...t,
    id: testimonialIds[idx],
  }))

  await payload.updateGlobal({
    slug: 'testimonials-global',
    locale: 'en',
    data: {
      ...enData,
      testimonials: enTestimonials,
    },
    context,
  })
  console.log('✅ Saved EN testimonials global')
}

seedTestimonialsGlobal().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
