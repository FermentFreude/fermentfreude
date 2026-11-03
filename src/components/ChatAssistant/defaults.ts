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
}

const EN: ChatTexts = {
  launcherLabel: 'Questions?',
  title: 'FermentFreude Assistant',
  greeting:
    "Hi! I'm the FermentFreude assistant. Ask me about workshops, free dates, prices, products or vouchers.",
  inputPlaceholder: 'Type your question…',
  privacyNote:
    'Automatic answers, without guarantee. Please don’t share personal data. [Privacy policy](/datenschutz)',
  suggestedQuestions: [
    'When is the next workshop?',
    'Which workshop is best for beginners?',
    'Can I buy a workshop as a gift?',
  ],
  sendLabel: 'Send',
  closeLabel: 'Close chat',
  resetLabel: 'New chat',
  errorText: 'Sorry, the assistant is not available right now. Please try again later.',
  rateLimitText: 'That was a lot of questions! Please wait a few minutes and try again.',
}

const DE: ChatTexts = {
  launcherLabel: 'Fragen?',
  title: 'FermentFreude Assistent',
  greeting:
    'Hallo! Ich bin der FermentFreude-Assistent. Frag mich zu Workshops, freien Terminen, Preisen, Produkten oder Gutscheinen.',
  inputPlaceholder: 'Deine Frage…',
  privacyNote:
    'Automatische Antworten, ohne Gewähr. Bitte keine persönlichen Daten eingeben. [Datenschutz](/datenschutz)',
  suggestedQuestions: [
    'Wann ist der nächste Workshop?',
    'Welcher Workshop passt für Anfänger:innen?',
    'Kann ich einen Workshop verschenken?',
  ],
  sendLabel: 'Senden',
  closeLabel: 'Chat schließen',
  resetLabel: 'Neuer Chat',
  errorText: 'Der Assistent ist gerade nicht erreichbar. Bitte versuch es später noch einmal.',
  rateLimitText: 'Das waren viele Fragen! Bitte warte ein paar Minuten und versuch es dann noch einmal.',
}

export function defaultChatTexts(locale: string): ChatTexts {
  return locale === 'de' ? DE : EN
}
