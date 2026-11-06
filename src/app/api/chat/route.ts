import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

import { answerWithoutAI, isOnTopic } from '@/lib/chat-assistant/answerWithoutAI'
import { buildKnowledgeSheet, getChatData } from '@/lib/chat-assistant/knowledge'
import { takeAiAnswer, visitorLimited } from '@/lib/chat-assistant/limits'
import { CHAT_SYSTEM_PROMPT, knowledgeBlock } from '@/lib/chat-assistant/prompt'
import { replyToText } from '@/lib/chat-assistant/types'
import { startWorkersAIStream, workersAIConfig } from '@/lib/chat-assistant/workersAI'
import { normalizeAppLocale } from '@/utilities/payloadLocaleQuery'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/chat — website chat assistant.
 *
 * Body: { messages: { role: 'user' | 'assistant', content: string }[], locale?: 'de' | 'en' }
 * Response: streamed plain text (AI mode) or a JSON ChatReply (free mode,
 * with cards, action buttons and follow-up suggestions).
 *
 * Three modes, picked by env vars:
 * - ANTHROPIC_API_KEY set → Claude answers, streamed (CHATBOT_MODEL optional).
 * - CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_AI_TOKEN set → free Cloudflare Workers AI
 *   answers, streamed (src/lib/chat-assistant/workersAI.ts). If Workers AI
 *   refuses (free allowance used up etc.) the keyword answerer takes over.
 * - neither → free keyword answerer (src/lib/chat-assistant/answerWithoutAI.ts).
 *
 * Limits: questions up to 500 characters, 30 questions per visitor per 10
 * minutes and a daily AI budget, both counted in MongoDB
 * (src/lib/chat-assistant/limits.ts). Off-topic questions never reach the AI.
 *
 * Read-only either way: only public CMS content (see
 * src/lib/chat-assistant/knowledge.ts), no tools, so it cannot change data.
 */

// Haiku 5.5 is the cheapest current Claude model ($0.10 / $0.50 per million
// tokens) and plenty for FAQ-style answers. CHATBOT_MODEL can switch it.
const MODEL = process.env.CHATBOT_MODEL || 'claude-haiku-5-5'
// Server-side refusal fallbacks exist for Opus / Sonnet / Fable, not Haiku.
const FALLBACKS: Pick<Anthropic.Beta.MessageCreateParamsStreaming, 'betas' | 'fallbacks'> =
  /^claude-(opus|sonnet|fable)-/.test(MODEL) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}
const MAX_MESSAGES = 20
const MAX_MESSAGE_CHARS = 500

function parseMessages(raw: unknown): Anthropic.Beta.BetaMessageParam[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const trimmed = raw.slice(-MAX_MESSAGES)
  const messages: Anthropic.Beta.BetaMessageParam[] = []
  for (const m of trimmed) {
    if (!m || typeof m !== 'object') return null
    const { role, content } = m as { role?: unknown; content?: unknown }
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    // Visitors may ask up to 500 characters; earlier assistant answers can be longer.
    const text = content.trim().slice(0, role === 'user' ? MAX_MESSAGE_CHARS : MAX_MESSAGE_CHARS * 4)
    if (!text) continue
    messages.push({ role, content: text })
  }
  // The conversation must start and end with the visitor.
  while (messages.length && messages[0].role !== 'user') messages.shift()
  if (!messages.length || messages[messages.length - 1].role !== 'user') return null
  return messages
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await visitorLimited(ip)) {
    return NextResponse.json({ error: 'Too many messages', code: 'RATE_LIMITED' }, { status: 429 })
  }

  let body: { messages?: unknown; locale?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const messages = parseMessages(body.messages)
  if (!messages) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
  }
  const locale = normalizeAppLocale(typeof body.locale === 'string' ? body.locale : undefined)

  let data: Awaited<ReturnType<typeof getChatData>>
  try {
    data = await getChatData(locale)
  } catch (error) {
    console.error('[Chat] Failed to load knowledge:', error)
    return NextResponse.json({ error: 'Chat unavailable', code: 'CHAT_UNAVAILABLE' }, { status: 503 })
  }

  const question = String(messages[messages.length - 1].content)
  const earlier = messages
    .slice(0, -1)
    .filter((m) => m.role === 'user')
    .map((m) => String(m.content))
  const keywordReply = () =>
    NextResponse.json(answerWithoutAI(question, data, earlier), { headers: { 'Cache-Control': 'no-store' } })

  const workersAI = process.env.ANTHROPIC_API_KEY ? null : workersAIConfig()
  if (!process.env.ANTHROPIC_API_KEY && !workersAI) return keywordReply()

  // Control what reaches the AI: only Fermentfreude topics, and only within
  // today's budget (Admin → Chat Assistant → "AI answers per day").
  // Everything else gets the free keyword answer, which offers the team form.
  if (!isOnTopic(question, data, earlier)) return keywordReply()
  if (!(await takeAiAnswer(data.aiDailyLimit))) return keywordReply()

  if (workersAI) {
    const pieces = await startWorkersAIStream(workersAI, [
      { role: 'system', content: `${CHAT_SYSTEM_PROMPT}\n\n${knowledgeBlock(buildKnowledgeSheet(data), locale)}` },
      ...messages.map((m) => ({ role: m.role, content: String(m.content) })),
    ])
    if (!pieces) return keywordReply()

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let wroteText = false
        try {
          for await (const piece of pieces) {
            wroteText = true
            controller.enqueue(encoder.encode(piece))
          }
        } catch (error) {
          console.error('[Chat] Workers AI stream broke:', error)
        }
        // Nothing came back → answer with the keyword answerer instead of an empty bubble.
        if (!wroteText) controller.enqueue(encoder.encode(replyToText(answerWithoutAI(question, data, earlier))))
        controller.close()
      },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  const knowledge = buildKnowledgeSheet(data)

  const client = new Anthropic()
  const encoder = new TextEncoder()
  const fallbackError =
    locale === 'de'
      ? 'Entschuldige, da ist gerade etwas schiefgelaufen. Bitte versuch es gleich noch einmal.'
      : 'Sorry, something went wrong. Please try again in a moment.'

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 4000,
          // Low effort: chat answers are short and should feel snappy.
          output_config: { effort: 'low' },
          ...FALLBACKS,
          system: [
            { type: 'text', text: CHAT_SYSTEM_PROMPT },
            {
              type: 'text',
              text: knowledgeBlock(knowledge, locale),
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages,
        })

        let wroteText = false
        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            wroteText = true
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }

        const final = await response.finalMessage()
        if (final.stop_reason === 'refusal' || !wroteText) {
          controller.enqueue(encoder.encode(wroteText ? '' : fallbackError))
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          console.warn('[Chat] Anthropic rate limit hit')
        } else if (error instanceof Anthropic.APIError) {
          console.error(`[Chat] Anthropic API error ${error.status}:`, error.message)
        } else {
          console.error('[Chat] Unexpected error:', error)
        }
        controller.enqueue(encoder.encode(`\n${fallbackError}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
