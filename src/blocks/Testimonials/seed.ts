/**
 * Seed data builder for the Testimonials block.
 */

export function buildTestimonials() {
  const de = {
    blockType: 'testimonials' as const,
    eyebrow: 'Testimonials',
    heading: 'Was IHNEN AN UNSEREM Fermentationskurs gefällt',
    buttonLabel: 'Alle Bewertungen',
    buttonLink: 'https://www.google.com/maps/place/Fermentfreude//@?entry=ttu&reviews=1',
    testimonials: [
      {
        quote:
          'Den Kurs besuchen zu können, war eines der besten Geburtstagsgeschenke, an die ich mich erinnern kann. Es war wunderbar zu sehen, wie Marcel seine Leidenschaft für Fermentation mit den Teilnehmern teilte. Und das Beste: Es eröffnet mir eine ganz neue kulinarische Welt.',
        authorName: 'Ernst Michael Preininger',
        authorRole: 'Workshop-Teilnehmer',
        rating: 5,
      },
      {
        quote:
          'Ein sehr empfehlenswerter Workshop, sowohl für Anfänger als auch für Teilnehmer mit etwas Erfahrung. Marcel vermittelt die faszinierenden Techniken mit Leidenschaft, detaillierten aber nie langweiligen Erklärungen und einer guten Prise Humor. Das Highlight war definitiv die exzellente Verkostung.',
        authorName: 'Mme Kuchar',
        authorRole: 'Workshop-Teilnehmerin',
        rating: 5,
      },
      {
        quote:
          'Marcel und David sind unglaublich nette Menschen, die ihr Wissen in verschiedenen Workshops mit echter Freude weitergeben. Der Kombucha-Workshop war der perfekte Einstieg in die faszinierende Welt des Kombuchas! Sehr empfehlenswert für alle, die sich für Fermentation interessieren!',
        authorName: 'Vera Wagner',
        authorRole: 'Workshop-Teilnehmerin',
        rating: 5,
      },
      {
        quote:
          'Ich habe meinen Geburtstag bei Ferment-Freude nachgefeiert. Es hat super viel Spaß gemacht, und David hat uns fantastisch durch den Nachmittag geführt. Wir haben das Fachwissen sofort in die Praxis umgesetzt. Sehr empfehlenswert für alle, die einen coolen Nachmittag wollen oder etwas zu feiern haben!',
        authorName: 'Andi Wind',
        authorRole: 'Workshop-Teilnehmer',
        rating: 5,
      },
      {
        quote:
          'Sehr informative Workshops von einem ausgebildeten Koch mit Leidenschaft für Fermentation, mit viel praktischer Erfahrung und tollen selbstgemachten Geschenken zum Mitnehmen. Die selbstgemachten fermentierten Produkte bei der Verkostung waren exquisit! Der nächste Workshop ist schon gebucht.',
        authorName: 'Jorche Kanipcki',
        authorRole: 'Workshop-Teilnehmer',
        rating: 5,
      },
      {
        quote:
          'Wir hatten einen wunderbaren Abend beim Tempeh-Workshop. Wir haben viel gelernt und die Verkostung der verschiedenen fermentierten Lebensmittel war ein kulinarisches Highlight.',
        authorName: 'Marlies Kern',
        authorRole: 'Workshop-Teilnehmerin',
        rating: 5,
      },
    ],
  }

  const en = {
    blockType: 'testimonials' as const,
    eyebrow: 'Testimonials',
    heading: 'What THEY LIKE ABOUT Our Fermentation Class',
    buttonLabel: 'View All Reviews',
    buttonLink: 'https://www.google.com/maps/place/Fermentfreude//@?entry=ttu&reviews=1',
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
