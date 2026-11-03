import type { ChatData, ChatFaq, ChatProduct, ChatWorkshop } from './knowledge'

/**
 * Free chat answerer (no AI). Used when ANTHROPIC_API_KEY is not set.
 *
 * Answers from live CMS data by recognising what the visitor asks about
 * (dates, prices, vouchers, bookings, contact, a specific workshop or product)
 * and by matching the question against the Help & FAQ page. Anything it does
 * not recognise gets a friendly "ask the team" reply with the contact email.
 */

const MAX_DATES = 5

const STOPWORDS = new Set(
  `a an and are as at be bei bin bis bitte can das dass dein deine dem den der des die do does du ein eine einen einem einer es for gibt habe haben hat have how i ich ihr im in is ist it ja kann kannst man me mein meine mich mir mit my nach nicht noch nur of oder on or so the to und uns unser von vor was we what wenn wer wie wir with wo you your zu zum zur auch am auf aus fuer about any bei hallo hi hey frage question bitte danke also gerne mal welche welcher welches which there this that workshop workshops`.split(
    /\s+/,
  ),
)

// Words that are too generic to identify a specific workshop or product.
const GENERIC = new Set(['workshop', 'workshops', 'kurs', 'kurse', 'fermentation', 'fermentieren', 'basic', 'online'])

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9€\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stem(token: string): string {
  return token.length > 5 ? token.slice(0, 5) : token
}

function keywords(text: string): string[] {
  return [
    ...new Set(
      normalize(text)
        .split(/[\s-]+/)
        .filter((t) => t.length > 2 && !STOPWORDS.has(t))
        .map(stem),
    ),
  ]
}

const INTENTS = {
  greeting: /^(hallo|hi|hey|servus|gruess gott|guten (tag|morgen|abend)|hello|good (morning|evening|afternoon))\b/,
  thanks: /\b(danke|dankeschoen|vielen dank|thanks|thank you|thx|merci)\b/,
  dates: /\b(wann|termin\w*|datum|daten|naechste\w*|next|when|dates?|frei\w*|plaetze|platz|spots?|available|verfuegbar\w*|ausgebucht|sold out|schedule|kalender)\b/,
  price: /(€|\b(preis\w*|kost\w*|euro|price\w*|costs?|how much|wie ?viel|teuer|guenstig)\b)/,
  voucher: /\b(gutschein\w*|geschenk\w*|schenk\w*|verschenk\w*|voucher\w*|gift\w*)\b/,
  manage: /\b(storn\w*|absag\w*|absagen|cancel\w*|umbuch\w*|verschieb\w*|reschedul\w*|aender\w*|change|refund\w*|rueckerstatt\w*|erstatt\w*)\b/,
  book: /\b(buch\w*|book\w*|anmeld\w*|register\w*|reserv\w*|sign up)\b/,
  contact: /\b(kontakt\w*|e ?mail|telefon\w*|anruf\w*|phone|call|contact|erreichen|reach)\b/,
  location: /\b(wo|where|ort|location|adresse|address|anfahrt|standort|parken|parking)\b/,
  bring: /\b(mitbring\w*|mitnehm\w*|bring\w*|brauche ich|need to bring)\b/,
  courses: /\b(online\w*|e-?learning|video\w*)\b/,
  beginner: /\b(anfaeng\w*|beginner\w*|einsteig\w*|einstieg|neuling\w*|first time|erste[rsn]? mal|keine erfahrung|no experience|starten|start)\b/,
  shop: /\b(shop|kaufen|buy|produkt\w*|products?|bestell\w*|order\w*|liefer\w*|versand|shipping|deliver\w*)\b/,
}

type Lang = 'de' | 'en'

function t(lang: Lang, de: string, en: string): string {
  return lang === 'de' ? de : en
}

function matchWorkshops(q: string, workshops: ChatWorkshop[]): ChatWorkshop[] {
  return workshops.filter((w) => {
    const words = [w.slug, ...normalize(w.title).split(' ')].filter(
      (word) => word.length >= 4 && !GENERIC.has(word),
    )
    // "lacto" spelled with c, "lakto" with k
    const alt = words.map((word) => word.replace(/k/g, 'c'))
    return [...words, ...alt].some((word) => q.includes(word))
  })
}

function matchProducts(q: string, products: ChatProduct[]): ChatProduct[] {
  return products.filter((p) =>
    normalize(p.title)
      .split(' ')
      .some((word) => word.length >= 4 && !GENERIC.has(word) && q.includes(word)),
  )
}

function bestFaq(
  question: string,
  faq: ChatFaq[],
  filter?: RegExp,
): { item: ChatFaq; score: number } | null {
  const qWords = keywords(question)
  if (filter) faq = faq.filter((item) => filter.test(normalize(`${item.section} ${item.question}`)))
  if (!qWords.length) return null
  let best: { item: ChatFaq; score: number } | null = null
  for (const item of faq) {
    const inQuestion = new Set(keywords(item.question))
    const inAnswer = new Set(keywords(item.answer))
    let score = 0
    for (const word of qWords) {
      if (inQuestion.has(word)) score += 1
      else if (inAnswer.has(word)) score += 0.4
    }
    score = score / qWords.length
    if (!best || score > best.score) best = { item, score }
  }
  return best
}

function workshopLink(slug: string, title: string): string {
  return `[${title}](/workshops/${slug})`
}

function datesPart(lang: Lang, data: ChatData, only: ChatWorkshop[]): string {
  const slugs = new Set(only.map((w) => w.slug))
  const upcoming = data.appointments.filter((a) => !slugs.size || slugs.has(a.workshopSlug))
  if (!upcoming.length) {
    const which = only.length ? only.map((w) => w.title).join(', ') : ''
    return t(
      lang,
      `Für ${which || 'die Workshops'} sind gerade keine neuen Termine online. Schau bald wieder auf [Workshops](/workshops) vorbei oder schreib uns${data.contact.email ? ` an ${data.contact.email}` : ''}.`,
      `There are no upcoming dates online for ${which || 'our workshops'} right now. Check [Workshops](/workshops) again soon or email us${data.contact.email ? ` at ${data.contact.email}` : ''}.`,
    )
  }
  const lines = upcoming.slice(0, MAX_DATES).map((a) => {
    const spots =
      a.spots > 0
        ? t(lang, `${a.spots} ${a.spots === 1 ? 'Platz' : 'Plätze'} frei`, `${a.spots} ${a.spots === 1 ? 'spot' : 'spots'} left`)
        : t(lang, 'ausgebucht', 'sold out')
    return `• **${a.workshopTitle}**: ${a.when}${a.location ? `, ${a.location}` : ''} (${spots})`
  })
  const more = upcoming.length > MAX_DATES ? t(lang, '\nWeitere Termine findest du auf der Workshop-Seite.', '\nMore dates are on the workshop page.') : ''
  const book =
    only.length === 1
      ? t(lang, `\nBuchen kannst du direkt hier: ${workshopLink(only[0].slug, only[0].title)}`, `\nYou can book here: ${workshopLink(only[0].slug, only[0].title)}`)
      : t(lang, '\nBuchen kannst du auf der jeweiligen [Workshop-Seite](/workshops).', '\nBook on the [workshop page](/workshops).')
  return `${t(lang, 'Die nächsten Termine (Stand jetzt):', 'Next dates (current status):')}\n${lines.join('\n')}${more}${book}`
}

function pricePart(lang: Lang, workshops: ChatWorkshop[], products: ChatProduct[]): string {
  const lines = [
    ...workshops.map(
      (w) => `• ${workshopLink(w.slug, w.title)}: €${w.price.toFixed(2)} ${t(lang, 'pro Person', 'per person')}`,
    ),
    ...products
      .filter((p) => p.price)
      .map((p) => `• [${p.title}](/products/${p.slug}): ${p.price}${p.unitSize ? ` (${p.unitSize})` : ''}`),
  ]
  return lines.length ? `${t(lang, 'Preise:', 'Prices:')}\n${lines.join('\n')}` : ''
}

function workshopPart(lang: Lang, w: ChatWorkshop): string {
  const about = w.description ? `${w.description}\n` : ''
  const size = w.maxCapacity ? t(lang, `, max. ${w.maxCapacity} Personen`, `, max ${w.maxCapacity} people`) : ''
  return `**${w.title}**\n${about}${t(lang, 'Preis', 'Price')}: €${w.price.toFixed(2)} ${t(lang, 'pro Person', 'per person')}${size}. ${t(lang, 'Mehr Infos & Buchung', 'Details & booking')}: ${workshopLink(w.slug, w.title)}`
}

function productPart(lang: Lang, p: ChatProduct): string {
  const facts = [
    p.price,
    p.unitSize,
    p.outOfStock ? t(lang, 'gerade ausverkauft', 'currently out of stock') : null,
    p.seasonal ? t(lang, 'saisonal', 'seasonal') : null,
  ].filter(Boolean)
  const extra = [
    p.ingredients && `${t(lang, 'Zutaten', 'Ingredients')}: ${p.ingredients}`,
    p.allergens && `${t(lang, 'Allergene', 'Allergens')}: ${p.allergens}`,
  ].filter(Boolean)
  return [
    `**[${p.title}](/products/${p.slug})**${facts.length ? ` (${facts.join(', ')})` : ''}`,
    p.shortDescription,
    ...extra,
  ]
    .filter(Boolean)
    .join('\n')
}

function contactPart(lang: Lang, data: ChatData): string {
  const c = data.contact
  const lines = [
    c.email && `E-Mail: [${c.email}](mailto:${c.email})`,
    c.phone && `${t(lang, 'Telefon', 'Phone')}: ${c.phone}`,
    c.address && `${t(lang, 'Adresse', 'Address')}: ${c.address}`,
  ].filter(Boolean)
  return lines.length
    ? `${t(lang, 'So erreichst du uns:', 'You can reach us here:')}\n${lines.join('\n')}`
    : t(lang, 'Alle Kontaktmöglichkeiten findest du auf der [Hilfe-Seite](/help).', 'All contact options are on the [Help page](/help).')
}

function fallback(lang: Lang, data: ChatData): string {
  const email = data.contact.email
  return t(
    lang,
    `Das kann ich leider nicht sicher beantworten. ${email ? `Schreib uns am besten an [${email}](mailto:${email}), wir helfen dir gerne weiter.` : 'Schau gern auf unserer [Hilfe-Seite](/help) vorbei.'}\nIch kann dir z. B. sagen, wann die nächsten [Workshops](/workshops) stattfinden, was sie kosten oder was es im [Shop](/shop) gibt.`,
    `Sorry, I can't answer that reliably. ${email ? `Please email us at [${email}](mailto:${email}) and we'll be happy to help.` : 'Have a look at our [Help page](/help).'}\nI can tell you when the next [workshops](/workshops) are, what they cost, or what's in the [shop](/shop).`,
  )
}

export function answerWithoutAI(question: string, data: ChatData): string {
  const lang: Lang = data.locale
  const q = normalize(question)
  const has = (intent: keyof typeof INTENTS) => INTENTS[intent].test(q)

  const workshops = matchWorkshops(q, data.workshops)
  const products = matchProducts(q, data.products).filter(
    // A workshop name like "Kombucha" can also match a product; prefer the
    // workshop when the visitor says "workshop" or asks for dates.
    () => !(workshops.length && (has('dates') || /workshop|kurs/.test(q))),
  )
  // For voucher questions only look at voucher FAQs, so "Workshop verschenken"
  // doesn't land on the general booking answer.
  const faq = has('voucher')
    ? (bestFaq(question, data.faq, /gutschein|voucher|gift|geschenk/) ?? bestFaq(question, data.faq))
    : bestFaq(question, data.faq)
  const strongFaq = faq && faq.score >= 0.5 ? faq.item : null
  const parts: string[] = []

  const words = q.split(' ').filter(Boolean)
  if (words.length <= 4 && (has('greeting') || has('thanks')) && !workshops.length && !products.length) {
    return has('thanks')
      ? t(lang, 'Sehr gerne! Melde dich, wenn du noch Fragen hast. 🙂', "You're welcome! Let me know if you have any other questions. 🙂")
      : t(
          lang,
          'Hallo! Wie kann ich dir helfen? Frag mich z. B. nach den nächsten Workshop-Terminen, Preisen oder Gutscheinen.',
          'Hi! How can I help? Ask me about upcoming workshop dates, prices or vouchers.',
        )
  }

  // A clear FAQ match wins for general questions (payment, allergies, deadlines, …),
  // as long as the visitor isn't asking for live data like dates or prices.
  const namesSomething = workshops.length > 0 || products.length > 0
  if (strongFaq && !has('dates') && !has('price') && (faq!.score >= 0.75 || (faq!.score >= 0.6 && !namesSomething))) {
    const link = has('manage')
      ? t(lang, '\n\n[Buchung verwalten](/manage-booking)', '\n\n[Manage booking](/manage-booking)')
      : has('voucher')
        ? t(lang, '\n\n[Gutschein kaufen](/voucher)', '\n\n[Buy a voucher](/voucher)')
        : ''
    return `${strongFaq.answer}${link}`
  }

  if (has('manage')) {
    if (strongFaq) parts.push(strongFaq.answer)
    parts.push(
      t(
        lang,
        'Deine Buchung kannst du hier selbst verwalten (umbuchen oder stornieren): [Buchung verwalten](/manage-booking).',
        'You can manage your booking yourself (reschedule or cancel) here: [Manage booking](/manage-booking).',
      ),
    )
  }

  if (has('voucher')) {
    if (strongFaq && !parts.includes(strongFaq.answer)) parts.push(strongFaq.answer)
    parts.push(
      t(
        lang,
        'Workshop-Gutscheine kannst du hier kaufen: [Gutschein](/voucher). Eingelöst wird er bei der Buchung.',
        'You can buy workshop vouchers here: [Voucher](/voucher). It is redeemed when booking.',
      ),
    )
  }

  if (has('dates') || (has('book') && !has('manage'))) {
    parts.push(datesPart(lang, data, workshops))
  }

  if (has('price')) {
    const priceText = pricePart(lang, workshops.length || products.length ? workshops : data.workshops, products)
    if (priceText) parts.push(priceText)
  }

  if (has('bring')) {
    const list = (workshops.length ? workshops : data.workshops).filter((w) => w.whatToBring)
    parts.push(
      list.length
        ? list.map((w) => `**${w.title}**: ${w.whatToBring}`).join('\n')
        : t(lang, 'Alles Nötige stellen wir bereit. Details stehen in deiner Buchungsbestätigung.', 'We provide everything you need. Details are in your booking confirmation.'),
    )
  }

  if (has('location') && !parts.length) {
    const places = [...new Set(data.appointments.map((a) => a.location).filter(Boolean))].slice(0, 3)
    if (places.length) {
      parts.push(`${t(lang, 'Unsere Workshops finden hier statt:', 'Our workshops take place at:')}\n${places.map((p) => `• ${p}`).join('\n')}`)
    }
    if (data.extraKnowledge && /parken|parking|anfahrt/.test(q)) parts.push(data.extraKnowledge)
  }

  if (has('contact') && !parts.length) parts.push(contactPart(lang, data))

  if (!parts.length && has('beginner') && data.workshops.length) {
    const basics = data.workshops.find((w) => /basic|grundl|einsteig/.test(normalize(`${w.slug} ${w.title}`)))
    parts.push(
      basics
        ? t(
            lang,
            `Für den Einstieg empfehlen wir ${workshopLink(basics.slug, basics.title)}. Dort lernst du die Grundlagen, ganz ohne Vorkenntnisse. Alle Workshops sind aber auch für Anfänger:innen geeignet: [Workshops](/workshops).`,
            `For beginners we recommend ${workshopLink(basics.slug, basics.title)}, where you learn the basics with no experience needed. All our workshops are beginner-friendly though: [Workshops](/workshops).`,
          )
        : t(
            lang,
            `Alle unsere Workshops sind für Anfänger:innen geeignet, Vorkenntnisse brauchst du keine. Zur Auswahl: ${data.workshops.map((w) => workshopLink(w.slug, w.title)).join(', ')}.`,
            `All our workshops are beginner-friendly, no experience needed. Choose from: ${data.workshops.map((w) => workshopLink(w.slug, w.title)).join(', ')}.`,
          ),
    )
  }

  if (!parts.length && workshops.length) {
    parts.push(...workshops.slice(0, 2).map((w) => workshopPart(lang, w)))
    const next = data.appointments.find((a) => a.workshopSlug === workshops[0].slug && a.spots > 0)
    if (next) parts.push(t(lang, `Nächster freier Termin: ${next.when}.`, `Next available date: ${next.when}.`))
  }

  if (!parts.length && products.length) {
    parts.push(...products.slice(0, 3).map((p) => productPart(lang, p)))
  }

  if (!parts.length && has('courses') && data.courses.length) {
    parts.push(
      `${t(lang, 'Unsere Online-Kurse:', 'Our online courses:')}\n${data.courses
        .map((c) => `• [${c.title}](${c.path})${c.meta ? ` (${c.meta})` : ''}${c.comingSoon ? t(lang, ' (bald verfügbar)', ' (coming soon)') : ''}`)
        .join('\n')}`,
    )
  }

  if (!parts.length && strongFaq) parts.push(strongFaq.answer)

  if (!parts.length && has('shop')) {
    const list = data.products.slice(0, 6).map((p) => `• [${p.title}](/products/${p.slug})${p.price ? `: ${p.price}` : ''}`)
    parts.push(
      `${t(lang, 'Im Shop findest du zum Beispiel:', 'In our shop you can find, for example:')}\n${list.join('\n')}\n${t(lang, 'Alles ansehen', 'See everything')}: [Shop](/shop)`,
    )
  }

  // A weaker FAQ match is still better than nothing.
  if (!parts.length && faq && faq.score >= 0.34) parts.push(faq.item.answer)

  return parts.length ? parts.join('\n\n') : fallback(lang, data)
}
