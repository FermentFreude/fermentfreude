import { describe, expect, it } from 'vitest'

import { answerWithoutAI as answerReply } from '@/lib/chat-assistant/answerWithoutAI'
import type { ChatData } from '@/lib/chat-assistant/knowledge'
import { replyToText } from '@/lib/chat-assistant/types'

/** Everything a visitor sees (text, cards, buttons) as one string, for simple assertions. */
function answerWithoutAI(question: string, d: ChatData, history: string[] = []): string {
  const reply = answerReply(question, d, history)
  const hrefs = [...(reply.cards ?? []), ...(reply.actions ?? [])].map((x) => x.href)
  return [replyToText(reply), ...hrefs].join('\n')
}

function data(locale: 'de' | 'en' = 'de'): ChatData {
  return {
    locale,
    contact: { companyName: 'FermentFreude', address: 'Grabenstraße 15, 8010 Graz', email: 'kontakt@example.at', phone: '', website: '' },
    workshops: [
      { slug: 'basics', title: 'Fermentation Basics', price: 99, maxCapacity: 8, description: 'Die Grundlagen.', whatToBring: '' },
      { slug: 'lakto', title: 'Lakto-Gemüse', price: 99, maxCapacity: 8, description: '', whatToBring: '' },
      { slug: 'kombucha', title: 'Kombucha', price: 99, maxCapacity: 8, description: '', whatToBring: '' },
      { slug: 'tempeh', title: 'Tempeh', price: 119, maxCapacity: 8, description: '', whatToBring: '' },
    ],
    appointments: [
      { workshopSlug: 'kombucha', workshopTitle: 'Kombucha', dateTime: '', when: 'Sa., 14. November 2026, 10:00', location: 'Studio Graz', spots: 3 },
      { workshopSlug: 'lakto', workshopTitle: 'Lakto-Gemüse', dateTime: '', when: 'So., 15. November 2026, 10:00', location: 'Studio Graz', spots: 0 },
    ],
    products: [
      { slug: 'kimchi', title: 'Kimchi Classic', price: '€8.90', unitSize: '350 g', outOfStock: false, seasonal: false, shortDescription: 'Scharf.', ingredients: '', allergens: '', storage: '' },
    ],
    courses: [],
    faq: [
      { section: 'Gutscheine', question: 'Kann ich einen Gutschein verschenken oder weitergeben?', answer: 'Ja, Gutscheine sind übertragbar.' },
      { section: 'Buchen', question: 'Wie buche ich einen Workshop?', answer: 'Termin wählen und buchen.' },
      { section: 'Zahlung', question: 'Welche Zahlungsarten akzeptiert ihr?', answer: 'Karte über Stripe.' },
      { section: 'Gastro', question: 'Ist Tempeh vegan und glutenfrei?', answer: 'Ja, vegan und glutenfrei.' },
    ],
    extraKnowledge: '',
  }
}

describe('answerWithoutAI', () => {
  it('lists upcoming dates with free spots', () => {
    const answer = answerWithoutAI('Wann ist der nächste Workshop?', data())
    expect(answer).toContain('Kombucha')
    const reply = answerReply('Wann ist der nächste Workshop?', data())
    const dates = (reply.cards ?? []).filter((c) => c.kind === 'date')
    expect(dates.map((c) => c.kind === 'date' && c.spots)).toEqual([3, 0])
  })

  it('filters dates by the workshop the visitor names', () => {
    const answer = answerWithoutAI('Gibt es noch Plätze im Kombucha Workshop?', data())
    expect(answer).toContain('Kombucha')
    expect(answer).not.toContain('Lakto')
    expect(answer).toContain('/workshops/kombucha')
  })

  it('answers prices', () => {
    expect(answerWithoutAI('Was kostet der Tempeh Workshop?', data())).toContain('€119 ')
  })

  it('uses the FAQ for general questions', () => {
    expect(answerWithoutAI('Welche Zahlungsarten gibt es?', data())).toContain('Stripe')
    expect(answerWithoutAI('Ist Tempeh vegan?', data())).toContain('vegan und glutenfrei')
  })

  it('answers voucher questions from voucher FAQs and links the voucher page', () => {
    const answer = answerWithoutAI('Kann ich einen Workshop verschenken?', data())
    expect(answer).toContain('übertragbar')
    expect(answer).toContain('/voucher')
  })

  it('finds products', () => {
    expect(answerWithoutAI('Habt ihr Kimchi?', data())).toContain('/products/kimchi')
  })

  it('answers in English on the English site', () => {
    const reply = answerReply('When is the next workshop?', data('en'))
    expect(reply.text).toMatch(/[a-z]/i)
    expect(reply.suggestions?.[0]).toMatch(/^[A-Z][a-z ]+/)
    expect(reply.text).not.toMatch(/Termin|Workshops gibt/)
  })

  it('tolerates typos in workshop names', () => {
    expect(answerWithoutAI('Wann ist der nächste Kombucah Workshop?', data())).toContain('/workshops/kombucha')
  })

  it('understands follow-up questions about the workshop named before', () => {
    expect(answerWithoutAI('Und was kostet der?', data(), ['Wann ist der Tempeh Workshop?'])).toContain('€119')
  })

  it('always offers follow-up suggestions', () => {
    expect(answerReply('Welche Zahlungsarten gibt es?', data()).suggestions?.length).toBeGreaterThan(0)
  })

  it('falls back to the contact email for unknown questions', () => {
    expect(answerWithoutAI('Was ist die Hauptstadt von Frankreich?', data())).toContain('kontakt@example.at')
  })
})
