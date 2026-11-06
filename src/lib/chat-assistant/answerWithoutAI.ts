import type { ChatAppointment, ChatData, ChatFaq, ChatProduct, ChatWorkshop } from './knowledge'
import type { ChatAction, ChatCard, ChatReply } from './types'
export { replyToText } from './types'

/**
 * Free chat answerer (no AI). Used when ANTHROPIC_API_KEY is not set.
 *
 * Answers from live CMS data by recognising what the visitor asks about
 * (dates, prices, vouchers, bookings, contact, a specific workshop or product)
 * and by matching the question against the Help & FAQ page. Returns a
 * structured reply (text + date/workshop/product cards + buttons + follow-up
 * suggestions) that the chat window renders nicely. Anything it does not
 * recognise gets a friendly "ask the team" reply with the contact email.
 */

const MAX_DATES = 4

const STOPWORDS = new Set(
  `a an and are as at be bei bin bis bitte can das dass dein deine dem den der des die do does du ein eine einen einem einer es for gibt habe haben hat have how i ich ihr im in is ist it ja kann kannst man me mein meine mich mir mit my nach nicht noch nur of oder on or so the to und uns unser von vor was we what wenn wer wie wir with wo you your zu zum zur auch am auf aus fuer about any bei hallo hi hey frage question bitte danke also gerne mal welche welcher welches which there this that workshop workshops`.split(
    /\s+/,
  ),
)

// Words that are too generic to identify a specific workshop or product.
const GENERIC = new Set(['workshop', 'workshops', 'kurs', 'kurse', 'fermentation', 'fermentieren', 'basic', 'online', 'classic', 'natur'])

const MONTHS: Array<[RegExp, number]> = [
  [/\b(jaenner|januar|january|jan)\b/, 0],
  [/\b(feber|februar|february|feb)\b/, 1],
  [/\b(maerz|march|mar)\b/, 2],
  [/\b(april|apr)\b/, 3],
  [/\b(mai|may)\b/, 4],
  [/\b(juni|june|jun)\b/, 5],
  [/\b(juli|july|jul)\b/, 6],
  [/\b(august|aug)\b/, 7],
  [/\b(september|sept?)\b/, 8],
  [/\b(oktober|october|okt|oct)\b/, 9],
  [/\b(november|nov)\b/, 10],
  [/\b(dezember|december|dez|dec)\b/, 11],
]

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

/** Edit distance, capped: returns max+1 as soon as it is clearly above max. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      rowMin = Math.min(rowMin, cur[j])
    }
    if (rowMin > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

/** True when the question mentions `word`, allowing a small typo ("kombutcha", "tempe"). */
function mentions(q: string, word: string): boolean {
  if (q.includes(word)) return true
  if (word.length < 5) return false
  const max = word.length >= 7 ? 2 : 1
  return q.split(/[\s-]+/).some((token) => token.length >= 4 && distance(token, word, max) <= max)
}

const INTENTS = {
  greeting: /^(hallo|hi|hey|servus|gruess gott|guten (tag|morgen|abend)|hello|good (morning|evening|afternoon))\b/,
  thanks: /\b(danke|dankeschoen|vielen dank|thanks|thank you|thx|merci)\b/,
  list: /\b(welche workshops|what workshops|which workshops|alle workshops|all workshops|workshops (gibt|habt|bietet)|angebot\w*|what do you offer|was bietet|uebersicht|overview)\b/,
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
  // "und was kostet der?", "and how much is it?" — refers back to the last topic
  followUp: /\b(der|den|dem|die|das|es|dort|da|it|that|this one|there)\b/,
}

type Lang = 'de' | 'en'

function t(lang: Lang, de: string, en: string): string {
  return lang === 'de' ? de : en
}

function workshopWords(w: ChatWorkshop): string[] {
  const words = [w.slug, ...normalize(w.title).split(/[\s-]+/)].filter((word) => word.length >= 4 && !GENERIC.has(word))
  // "lacto" spelled with c, "lakto" with k
  return [...new Set([...words, ...words.map((word) => word.replace(/k/g, 'c'))])]
}

function matchWorkshops(q: string, workshops: ChatWorkshop[]): ChatWorkshop[] {
  return workshops.filter((w) => workshopWords(w).some((word) => mentions(q, word)))
}

function matchProducts(q: string, products: ChatProduct[]): ChatProduct[] {
  return products.filter((p) =>
    normalize(p.title)
      .split(/[\s-]+/)
      .some((word) => word.length >= 4 && !GENERIC.has(word) && mentions(q, word)),
  )
}

function matchMonth(q: string): number | null {
  for (const [pattern, month] of MONTHS) if (pattern.test(q)) return month
  return null
}

/** Each line of Admin → Chat Assistant → "Extra knowledge" becomes a searchable entry. */
function extraFaq(extra: string): ChatFaq[] {
  return extra
    .split('\n')
    .map((line) => line.replace(/^\s*[-•*]\s*/, '').trim())
    .filter((line) => line.length > 3)
    .map((line) => ({ section: 'Info', question: line, answer: line }))
}

function bestFaq(question: string, faq: ChatFaq[], filter?: RegExp): { item: ChatFaq; score: number } | null {
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

const euro = (n: number) => `€${n.toFixed(2).replace(/\.00$/, '')}`

function dateCard(a: ChatAppointment): ChatCard {
  return {
    kind: 'date',
    title: a.workshopTitle,
    when: a.when,
    location: a.location,
    spots: a.spots,
    href: `/workshops/${a.workshopSlug}`,
  }
}

function workshopCard(lang: Lang, w: ChatWorkshop, data: ChatData): ChatCard {
  const next = data.appointments.find((a) => a.workshopSlug === w.slug && a.spots > 0)
  return {
    kind: 'workshop',
    title: w.title,
    description: w.description.length > 140 ? `${w.description.slice(0, 140).trimEnd()}…` : w.description,
    price: `${euro(w.price)} ${t(lang, 'pro Person', 'per person')}`,
    nextDate: next ? next.when : null,
    href: `/workshops/${w.slug}`,
  }
}

function productCard(p: ChatProduct): ChatCard {
  return {
    kind: 'product',
    title: p.title,
    description: [p.unitSize, p.shortDescription].filter(Boolean).join(' · '),
    price: p.price,
    outOfStock: p.outOfStock,
    href: `/products/${p.slug}`,
  }
}

function contactText(lang: Lang, data: ChatData): string {
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

/** Default follow-up questions, so the visitor always has a next step to tap. */
function suggestionsFor(lang: Lang, topics: Set<string>): string[] {
  const all: Array<[string, string, string]> = [
    ['dates', 'Wann sind die nächsten Termine?', 'When are the next dates?'],
    ['price', 'Was kostet ein Workshop?', 'How much is a workshop?'],
    ['voucher', 'Kann ich einen Gutschein verschenken?', 'Can I give a voucher as a gift?'],
    ['bring', 'Was muss ich mitbringen?', 'What should I bring?'],
    ['manage', 'Wie kann ich umbuchen oder stornieren?', 'How can I reschedule or cancel?'],
    ['list', 'Welche Workshops gibt es?', 'Which workshops do you offer?'],
  ]
  return all
    .filter(([topic]) => !topics.has(topic))
    .slice(0, 3)
    .map(([, de, en]) => t(lang, de, en))
}

// Topic words that are fine to send to the AI even when no FAQ matches.
const DOMAIN =
  /\b(workshop\w*|kurs\w*|termin\w*|datum|plaetze|platz|ausgebucht|schedule|adresse|address|anfahrt|parken|parking|ferment\w*|kimchi|kombucha|tempeh|lakto\w*|lacto\w*|sauerkraut|miso|kefir|kraut|gemuese|vegetables?|essen|food|lebensmittel|rezept\w*|recipe\w*|glas|jar|zutat\w*|ingredient\w*|allerg\w*|vegan\w*|vegetar\w*|gluten\w*|laktose|lactose|halal|kinder|kids?|child\w*|gruppe\w*|group\w*|firm\w*|team ?event\w*|company|corporate|geburtstag|birthday|studio|graz|zahl\w*|bezahl\w*|pay\w*|rechnung|invoice|konto|account|login|passwort|password|newsletter|koch\w*|chef\w*|gastro\w*|restaurant\w*|barriere\w*|rollstuhl|wheelchair|hund\w*|dog|haustier|pet|dauer|dauert|how long|lange|uhrzeit|zeit|time|sprache|language|englisch|english|deutsch|german)\b/

/**
 * Decides whether a question may go to the AI at all. Off-topic questions
 * (homework, code, politics, other companies, …) are answered by the keyword
 * answerer instead, which offers the "ask our team" form. Keeps the AI on
 * FermentFreude topics and saves the daily AI budget.
 */
export function isOnTopic(question: string, data: ChatData, history: string[] = []): boolean {
  const q = normalize(question)
  if (!q) return false
  // Intents with clearly shop-related words. "dates" / "location" / "followUp" are left out
  // because words like "wann", "nächste" or "wo" appear in any question.
  const strong: Array<keyof typeof INTENTS> = ['list', 'price', 'voucher', 'manage', 'book', 'contact', 'bring', 'courses', 'shop']
  if (strong.some((name) => INTENTS[name].test(q))) return true
  if (DOMAIN.test(q)) return true
  if (matchWorkshops(q, data.workshops).length || matchProducts(q, data.products).length) return true
  const qWords = new Set(keywords(question))
  const known = [...data.faq.map((f) => f.question), ...extraFaq(data.extraKnowledge).map((f) => f.question)]
  if (known.some((text) => keywords(text).some((word) => qWords.has(word)))) return true
  // Short follow-ups in an ongoing chat ("und am Wochenende?") stay on topic.
  return history.length > 0 && q.split(' ').length <= 6
}

/**
 * @param question the visitor's latest message
 * @param data     live CMS data (see knowledge.ts)
 * @param history  the visitor's earlier messages, newest last — used for follow-ups like "und was kostet der?"
 */
export function answerWithoutAI(question: string, data: ChatData, history: string[] = []): ChatReply {
  const lang: Lang = data.locale
  const q = normalize(question)
  const has = (intent: keyof typeof INTENTS) => INTENTS[intent].test(q)
  const topics = new Set<string>()

  let workshops = matchWorkshops(q, data.workshops)
  // Follow-up without a name ("und wann ist der nächste?") → reuse the workshop from earlier.
  if (!workshops.length && (has('followUp') || has('dates') || has('price') || has('bring'))) {
    for (const earlier of [...history].reverse()) {
      const found = matchWorkshops(normalize(earlier), data.workshops)
      if (found.length) {
        workshops = found
        break
      }
    }
  }
  const products = matchProducts(q, data.products).filter(
    // A workshop name like "Tempeh" can also match a product; prefer the
    // workshop when the visitor says "workshop" or asks for dates.
    () => !(workshops.length && (has('dates') || /workshop|kurs/.test(q))),
  )
  // For voucher questions only look at voucher FAQs, so "Workshop verschenken"
  // doesn't land on the general booking answer.
  const faqPool = [...data.faq, ...extraFaq(data.extraKnowledge)]
  const faq = has('voucher')
    ? (bestFaq(question, faqPool, /gutschein|voucher|gift|geschenk/) ?? bestFaq(question, faqPool))
    : bestFaq(question, faqPool)
  const strongFaq = faq && faq.score >= 0.5 ? faq.item : null

  const text: string[] = []
  const cards: ChatCard[] = []
  const actions: ChatAction[] = []
  const addAction = (label: string, href: string) => {
    if (!actions.some((a) => a.href === href)) actions.push({ label, href })
  }
  let handoff: ChatReply['handoff']
  const reply = (): ChatReply => ({
    text: text.join('\n\n'),
    ...(handoff ? { handoff } : {}),
    ...(cards.length ? { cards } : {}),
    ...(actions.length ? { actions: actions.slice(0, 3) } : {}),
    suggestions: suggestionsFor(lang, topics),
  })

  const words = q.split(' ').filter(Boolean)
  if (words.length <= 4 && (has('greeting') || has('thanks')) && !workshops.length && !products.length) {
    text.push(
      has('thanks')
        ? t(lang, 'Sehr gerne! Melde dich, wenn du noch Fragen hast. 🙂', "You're welcome! Let me know if you have any other questions. 🙂")
        : t(lang, 'Hallo! 👋 Wie kann ich dir helfen?', 'Hi! 👋 How can I help?'),
    )
    return reply()
  }

  // A clear FAQ match wins for general questions (payment, allergies, deadlines, …),
  // as long as the visitor isn't asking for live data like dates or prices.
  const namesSomething = workshops.length > 0 || products.length > 0
  if (strongFaq && !has('dates') && !has('price') && (faq!.score >= 0.75 || (faq!.score >= 0.6 && !namesSomething))) {
    text.push(strongFaq.answer)
    if (has('manage')) {
      topics.add('manage')
      addAction(t(lang, 'Buchung verwalten', 'Manage booking'), '/manage-booking')
    }
    if (has('voucher')) {
      topics.add('voucher')
      addAction(t(lang, 'Gutschein kaufen', 'Buy a voucher'), '/voucher')
    }
    if (has('bring')) topics.add('bring')
    addAction(t(lang, 'Alle FAQ', 'All FAQ'), '/help')
    return reply()
  }

  if (has('manage')) {
    topics.add('manage')
    text.push(
      strongFaq?.answer ??
        t(
          lang,
          'Deine Buchung kannst du selbst verwalten, also umbuchen oder stornieren. Du brauchst dafür die E-Mail-Adresse deiner Buchung.',
          'You can manage your booking yourself (reschedule or cancel). You need the email address you booked with.',
        ),
    )
    addAction(t(lang, 'Buchung verwalten', 'Manage booking'), '/manage-booking')
  }

  if (has('voucher')) {
    topics.add('voucher')
    if (strongFaq && !text.includes(strongFaq.answer)) text.push(strongFaq.answer)
    text.push(
      t(
        lang,
        'Workshop-Gutscheine sind das perfekte Geschenk 🎁 Sie werden bei der Buchung eingelöst.',
        'Workshop vouchers make a great gift 🎁 They are redeemed when booking.',
      ),
    )
    addAction(t(lang, 'Gutschein kaufen', 'Buy a voucher'), '/voucher')
  }

  if (has('list') && !workshops.length) {
    topics.add('list')
    text.push(t(lang, 'Das sind unsere Workshops:', 'These are our workshops:'))
    cards.push(...data.workshops.map((w) => workshopCard(lang, w, data)))
    addAction(t(lang, 'Alle Workshops', 'All workshops'), '/workshops')
    return reply()
  }

  if (has('dates') || (has('book') && !has('manage'))) {
    topics.add('dates')
    const slugs = new Set(workshops.map((w) => w.slug))
    const month = matchMonth(q)
    const upcoming = data.appointments.filter(
      (a) =>
        (!slugs.size || slugs.has(a.workshopSlug)) &&
        (month === null || !a.dateTime || new Date(a.dateTime).getMonth() === month),
    )
    const which = workshops.map((w) => w.title).join(', ')
    if (!upcoming.length) {
      text.push(
        t(
          lang,
          `Für ${which || 'unsere Workshops'} sind ${month !== null ? 'in diesem Monat ' : ''}gerade keine Termine online. Schau bald wieder vorbei, oder melde dich bei uns${data.contact.email ? ` unter [${data.contact.email}](mailto:${data.contact.email})` : ''}.`,
          `There are no dates online for ${which || 'our workshops'}${month !== null ? ' in that month' : ''} right now. Check back soon or contact us${data.contact.email ? ` at [${data.contact.email}](mailto:${data.contact.email})` : ''}.`,
        ),
      )
    } else {
      const free = upcoming.filter((a) => a.spots > 0).length
      text.push(
        t(
          lang,
          free
            ? `Hier sind die nächsten Termine${which ? ` für **${which}**` : ''}. Plätze sind begrenzt, also am besten bald buchen:`
            : `Die nächsten Termine${which ? ` für **${which}**` : ''} sind leider ausgebucht. Neue Termine kommen laufend dazu.`,
          free
            ? `Here are the next dates${which ? ` for **${which}**` : ''}. Spots are limited, so book soon:`
            : `The next dates${which ? ` for **${which}**` : ''} are sold out. New dates are added regularly.`,
        ),
      )
      cards.push(...upcoming.slice(0, MAX_DATES).map(dateCard))
    }
    addAction(t(lang, 'Alle Termine', 'All dates'), workshops.length === 1 ? `/workshops/${workshops[0].slug}` : '/workshops')
  }

  if (has('price')) {
    topics.add('price')
    const priced = workshops.length || products.length ? workshops : data.workshops
    const lines = [
      ...priced.map((w) => `• **${w.title}**: ${euro(w.price)} ${t(lang, 'pro Person', 'per person')}`),
      ...products.filter((p) => p.price).map((p) => `• **${p.title}**: ${p.price}${p.unitSize ? ` (${p.unitSize})` : ''}`),
    ]
    if (lines.length) {
      text.push(`${t(lang, 'Die Preise:', 'Prices:')}\n${lines.join('\n')}`)
      for (const w of priced.slice(0, 2)) addAction(t(lang, `${w.title} buchen`, `Book ${w.title}`), `/workshops/${w.slug}`)
    }
  }

  if (has('bring')) {
    topics.add('bring')
    const list = (workshops.length ? workshops : data.workshops).filter((w) => w.whatToBring)
    text.push(
      list.length
        ? list.map((w) => `**${w.title}**: ${w.whatToBring}`).join('\n')
        : strongFaq?.answer ??
            t(lang, 'Alles Nötige stellen wir bereit. Details stehen in deiner Buchungsbestätigung.', 'We provide everything you need. Details are in your booking confirmation.'),
    )
  }

  if (has('location') && !text.length) {
    const places = [...new Set(data.appointments.map((a) => a.location).filter(Boolean))].slice(0, 3)
    if (places.length) {
      text.push(`${t(lang, 'Unsere Workshops finden hier statt:', 'Our workshops take place at:')}\n${places.map((p) => `• ${p}`).join('\n')}`)
    } else if (strongFaq) {
      text.push(strongFaq.answer)
    }
    if (data.extraKnowledge && /parken|parking|anfahrt/.test(q)) text.push(data.extraKnowledge)
  }

  if (has('contact') && !text.length) {
    text.push(
      `${contactText(lang, data)}\n\n${t(lang, 'Du kannst uns auch gleich hier im Chat schreiben, wir antworten dir per E-Mail:', 'You can also write to us right here in the chat and we will reply by email:')}`,
    )
    handoff = 'contact'
    addAction(t(lang, 'Zur Kontaktseite', 'Contact page'), '/contact')
  }

  if (!text.length && has('beginner') && data.workshops.length) {
    const basics = data.workshops.find((w) => /basic|grundl|einsteig/.test(normalize(`${w.slug} ${w.title}`)))
    text.push(
      basics
        ? t(
            lang,
            `Für den Einstieg empfehlen wir **${basics.title}**: Dort lernst du die Grundlagen, ganz ohne Vorkenntnisse. Aber keine Sorge, alle unsere Workshops sind anfängerfreundlich.`,
            `For beginners we recommend **${basics.title}**, where you learn the basics with no experience needed. All our workshops are beginner-friendly though.`,
          )
        : t(lang, 'Alle unsere Workshops sind anfängerfreundlich, Vorkenntnisse brauchst du keine:', 'All our workshops are beginner-friendly, no experience needed:'),
    )
    cards.push(...(basics ? [basics] : data.workshops).map((w) => workshopCard(lang, w, data)))
  }

  if (!text.length && workshops.length) {
    text.push(workshops.length === 1 ? t(lang, 'Gute Wahl! 😊', 'Great choice! 😊') : t(lang, 'Diese Workshops passen dazu:', 'These workshops match:'))
    cards.push(...workshops.slice(0, 3).map((w) => workshopCard(lang, w, data)))
  }

  if (!text.length && products.length) {
    text.push(t(lang, 'Das haben wir im Shop:', 'Here is what we have in the shop:'))
    cards.push(...products.slice(0, 3).map(productCard))
    addAction(t(lang, 'Zum Shop', 'Go to shop'), '/shop')
  }

  if (!text.length && has('courses') && data.courses.length) {
    text.push(
      `${t(lang, 'Unsere Online-Kurse:', 'Our online courses:')}\n${data.courses
        .map((c) => `• **${c.title}**${c.meta ? ` (${c.meta})` : ''}${c.comingSoon ? t(lang, ', bald verfügbar', ', coming soon') : ''}`)
        .join('\n')}`,
    )
    for (const c of data.courses.slice(0, 2)) addAction(c.title, c.path)
  }

  if (!text.length && strongFaq) {
    text.push(strongFaq.answer)
    addAction(t(lang, 'Alle FAQ', 'All FAQ'), '/help')
  }

  if (!text.length && has('shop')) {
    text.push(t(lang, 'Im Shop findest du zum Beispiel:', 'In our shop you can find, for example:'))
    cards.push(...data.products.slice(0, 3).map(productCard))
    addAction(t(lang, 'Ganzen Shop ansehen', 'See the whole shop'), '/shop')
  }

  // A weaker FAQ match is still better than nothing.
  if (!text.length && faq && faq.score >= 0.34) {
    text.push(faq.item.answer)
    addAction(t(lang, 'Alle FAQ', 'All FAQ'), '/help')
  }

  if (!text.length && !cards.length) {
    const email = data.contact.email
    text.push(
      t(
        lang,
        `Hmm, das kann ich leider nicht sicher beantworten. 🤔 Schick deine Frage einfach unten an unser Team, wir antworten dir persönlich per E-Mail.${email ? ` Oder schreib direkt an [${email}](mailto:${email}).` : ''}`,
        `Hmm, I can't answer that reliably. 🤔 Just send your question to our team below and we'll reply personally by email.${email ? ` Or write to [${email}](mailto:${email}).` : ''}`,
      ),
    )
    handoff = 'unanswered'
    addAction(t(lang, 'Hilfe & FAQ', 'Help & FAQ'), '/help')
  }

  return reply()
}
