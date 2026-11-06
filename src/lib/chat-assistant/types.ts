/**
 * Shapes shared by the chat API and the chat window. Safe to import from
 * client components (no server-only code here).
 */

export type ChatAction = { label: string; href: string }

export type ChatCard =
  | {
      kind: 'date'
      title: string
      when: string
      location: string
      spots: number
      href: string
    }
  | {
      kind: 'workshop'
      title: string
      description: string
      price: string
      nextDate: string | null
      href: string
    }
  | {
      kind: 'product'
      title: string
      description: string
      price: string | null
      outOfStock: boolean
      href: string
    }

/** A structured reply (free mode). AI replies stream plain Markdown text instead. */
export type ChatReply = {
  text: string
  cards?: ChatCard[]
  actions?: ChatAction[]
  suggestions?: string[]
  /**
   * Show the "ask our team" form: 'unanswered' when the assistant couldn't help
   * (the form is prefilled with the question), 'contact' when the visitor asked how to reach us.
   */
  handoff?: 'unanswered' | 'contact'
}

/** Content type the API uses when it returns a JSON ChatReply instead of streamed text. */
export const CHAT_REPLY_JSON_TYPE = 'application/json'

/** Plain-text version of a reply (sent back as conversation history, used in tests). */
export function replyToText(reply: ChatReply): string {
  const cardLines = (reply.cards ?? []).map((c) =>
    c.kind === 'date'
      ? `• ${c.title}: ${c.when}${c.location ? `, ${c.location}` : ''} (${c.spots > 0 ? `${c.spots} free` : 'sold out'})`
      : `• ${c.title}${c.price ? ` (${c.price})` : ''}`,
  )
  return [reply.text, ...cardLines].filter(Boolean).join('\n')
}
