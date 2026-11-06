/**
 * Fallback texts for the chat window, used when the matching field in
 * Admin → Website → Chat Assistant is empty. The site's default locale is
 * German, so both languages ship a default (English stays the code default).
 */
export type ChatTexts = {
  launcherLabel: string
  title: string
  greeting: string
  inputPlaceholder: string
  privacyNote: string
  suggestedQuestions: string[]
  sendLabel: string
  closeLabel: string
  resetLabel: string
  errorText: string
  rateLimitText: string
  /** Small line under the window title. */
  subtitle: string
  /** Labels on the answer cards. */
  bookLabel: string
  viewLabel: string
  soldOutLabel: string
  /** `{n}` is replaced with the number of free spots. */
  spotsLeftLabel: string
  oneSpotLeftLabel: string
  nextDateLabel: string
  outOfStockLabel: string
  /** "Ask our team" form. */
  handoffButton: string
  handoffTitle: string
  /** Shown when the visitor opens the form with the envelope button in the header. */
  handoffIntro: string
  handoffNameLabel: string
  handoffEmailLabel: string
  handoffMessageLabel: string
  handoffSend: string
  handoffConsent: string
  handoffSuccess: string
  handoffError: string
  /** Thumbs up / down under answers. */
  feedbackQuestion: string
  feedbackYes: string
  feedbackNo: string
  feedbackThanks: string
}

const EN: ChatTexts = {
  launcherLabel: 'Got a question? Ask me!',
  title: 'Fermentfreude Assistant',
  greeting:
    "Hi! I'm the Fermentfreude assistant. Ask me about workshops, free dates, prices, products or vouchers.",
  inputPlaceholder: 'Type your question…',
  privacyNote:
    'Automatic answers, without guarantee. Please don’t share personal data. [Privacy policy](/datenschutz)',
  suggestedQuestions: [
    'When is the next workshop?',
    'Which workshop is best for beginners?',
    'Can I buy a workshop as a gift?',
    'How do I redeem my voucher?',
  ],
  sendLabel: 'Send',
  closeLabel: 'Close chat',
  resetLabel: 'New chat',
  errorText: 'Sorry, the assistant is not available right now. Please try again later.',
  rateLimitText: 'That was a lot of questions! Please wait a few minutes and try again.',
  subtitle: 'Answers right away',
  bookLabel: 'Book',
  viewLabel: 'View',
  soldOutLabel: 'Sold out',
  spotsLeftLabel: '{n} spots left',
  oneSpotLeftLabel: 'Last spot',
  nextDateLabel: 'Next date',
  outOfStockLabel: 'Out of stock',
  handoffButton: 'Ask our team',
  handoffTitle: 'Ask our team directly',
  handoffIntro: "Write to us here and we'll reply by email. You can also use our [contact page](/contact).",
  handoffNameLabel: 'Your name',
  handoffEmailLabel: 'Your email',
  handoffMessageLabel: 'Your question',
  handoffSend: 'Send question',
  handoffConsent: 'We only use your details to answer you. [Privacy policy](/datenschutz)',
  handoffSuccess: "Thanks! Your question has been sent. We'll reply by email as soon as we can. 🙂",
  handoffError: 'Sending didn’t work. Please email us directly instead.',
  feedbackQuestion: 'Was this helpful?',
  feedbackYes: 'Yes',
  feedbackNo: 'No',
  feedbackThanks: 'Thanks for your feedback!',
}

const DE: ChatTexts = {
  launcherLabel: 'Hast du eine Frage? Frag mich!',
  title: 'Fermentfreude Assistent',
  greeting:
    'Hallo! Ich bin der Fermentfreude-Assistent. Frag mich zu Workshops, freien Terminen, Preisen, Produkten oder Gutscheinen.',
  inputPlaceholder: 'Deine Frage…',
  privacyNote:
    'Automatische Antworten, ohne Gewähr. Bitte keine persönlichen Daten eingeben. [Datenschutz](/datenschutz)',
  suggestedQuestions: [
    'Wann ist der nächste Workshop?',
    'Welcher Workshop passt für Anfänger:innen?',
    'Kann ich einen Workshop verschenken?',
    'Wie löse ich meinen Gutschein ein?',
  ],
  sendLabel: 'Senden',
  closeLabel: 'Chat schließen',
  resetLabel: 'Neuer Chat',
  errorText: 'Der Assistent ist gerade nicht erreichbar. Bitte versuch es später noch einmal.',
  rateLimitText: 'Das waren viele Fragen! Bitte warte ein paar Minuten und versuch es dann noch einmal.',
  subtitle: 'Antwortet sofort',
  bookLabel: 'Buchen',
  viewLabel: 'Ansehen',
  soldOutLabel: 'Ausgebucht',
  spotsLeftLabel: 'Noch {n} Plätze',
  oneSpotLeftLabel: 'Letzter Platz',
  nextDateLabel: 'Nächster Termin',
  outOfStockLabel: 'Ausverkauft',
  handoffButton: 'Frag unser Team',
  handoffTitle: 'Frag unser Team direkt',
  handoffIntro: 'Schreib uns hier, wir antworten dir per E-Mail. Oder nutze unsere [Kontaktseite](/contact).',
  handoffNameLabel: 'Dein Name',
  handoffEmailLabel: 'Deine E-Mail',
  handoffMessageLabel: 'Deine Frage',
  handoffSend: 'Frage senden',
  handoffConsent: 'Wir nutzen deine Angaben nur, um dir zu antworten. [Datenschutz](/datenschutz)',
  handoffSuccess: 'Danke! Deine Frage ist bei uns angekommen. Wir antworten dir so schnell wie möglich per E-Mail. 🙂',
  handoffError: 'Das Senden hat leider nicht geklappt. Bitte schreib uns direkt per E-Mail.',
  feedbackQuestion: 'War das hilfreich?',
  feedbackYes: 'Ja',
  feedbackNo: 'Nein',
  feedbackThanks: 'Danke für dein Feedback!',
}

export function defaultChatTexts(locale: string): ChatTexts {
  return locale === 'de' ? DE : EN
}
