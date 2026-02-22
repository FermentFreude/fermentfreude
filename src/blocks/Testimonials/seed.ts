/**
 * Seed data builder for the Testimonials block.
 */

export function buildTestimonials() {
  const de = {
    blockType: 'testimonials' as const,
    eyebrow: 'Testimonials',
    heading: 'Was ihnen an unserem Fermentationskurs gefällt',
    buttonLabel: 'Alle Bewertungen',
    buttonLink: '/reviews',
    testimonials: [
      {
        quote:
          'Der Kombucha-Workshop war ein absolutes Highlight! David und Marcel erklären alles so verständlich und mit so viel Leidenschaft. Mein selbstgebrauter Kombucha schmeckt fantastisch.',
        authorName: 'Sophie M.',
        authorRole: 'Künstlerin',
        rating: 5,
      },
      {
        quote:
          'Als Koch war ich beeindruckt von der Tiefe des Wissens. Die Lakto-Fermentation hat meine Speisekarte komplett verändert. Absolute Empfehlung für Profis und Hobbyköche.',
        authorName: 'Thomas K.',
        authorRole: 'Koch',
        rating: 5,
      },
      {
        quote:
          'Ich habe den Tempeh-Workshop als Geschenk bekommen und es war das beste Geschenk überhaupt. Die Atmosphäre war warm und einladend, und ich habe so viel gelernt.',
        authorName: 'Anna L.',
        authorRole: 'Bloggerin',
        rating: 5,
      },
      {
        quote:
          'Super organisiert, tolle Materialien und ein wunderbares Team. Mein Mann und ich machen jetzt jede Woche eigenes Sauerkraut. Danke FermentFreude!',
        authorName: 'Maria B.',
        authorRole: 'Lehrerin',
        rating: 4,
      },
    ],
  }

  const en = {
    blockType: 'testimonials' as const,
    eyebrow: 'Testimonials',
    heading: 'What They Like About Our Fermentation Class',
    buttonLabel: 'View All Reviews',
    buttonLink: '/reviews',
    testimonials: [
      {
        quote:
          'The kombucha workshop was an absolute highlight! David and Marcel explain everything so clearly and with so much passion. My home-brewed kombucha tastes fantastic.',
        authorName: 'Sophie M.',
        authorRole: 'Artist',
        rating: 5,
      },
      {
        quote:
          'As a chef, I was impressed by the depth of knowledge. The lacto-fermentation completely changed my menu. Absolutely recommended for professionals and home cooks alike.',
        authorName: 'Thomas K.',
        authorRole: 'Chef',
        rating: 5,
      },
      {
        quote:
          'I received the tempeh workshop as a gift and it was the best gift ever. The atmosphere was warm and welcoming, and I learned so much.',
        authorName: 'Anna L.',
        authorRole: 'Blogger',
        rating: 5,
      },
      {
        quote:
          'Super organised, great materials, and a wonderful team. My husband and I now make our own sauerkraut every week. Thank you FermentFreude!',
        authorName: 'Maria B.',
        authorRole: 'Teacher',
        rating: 4,
      },
    ],
  }

  return { de, en }
}

type TestimonialsBlock = {
  id?: string
  testimonials?: { id?: string }[]
}

export function mergeTestimonialsEN(
  en: ReturnType<typeof buildTestimonials>['en'],
  fresh: TestimonialsBlock,
) {
  return {
    ...en,
    id: fresh.id,
    testimonials: en.testimonials.map((t, i) => ({ ...t, id: fresh.testimonials?.[i]?.id })),
  }
}
