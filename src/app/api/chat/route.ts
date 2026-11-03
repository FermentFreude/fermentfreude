import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

import { answerWithoutAI } from '@/lib/chat-assistant/answerWithoutAI'
import { buildKnowledgeSheet, getChatData } from '@/lib/chat-assistant/knowledge'
import { CHAT_SYSTEM_PROMPT, knowledgeBlock } from '@/lib/chat-assistant/prompt'
import { normalizeAppLocale } from '@/utilities/payloadLocaleQuery'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/chat — website chat assistant.
 *
 * Body: { messages: { role: 'user' | 'assistant', content: string }[], locale?: 'de' | 'en' }
 * Response: streamed plain text (the assistant's reply).
 *
 * Two modes:
 * - ANTHROPIC_API_KEY set → Claude answers, streamed (CHATBOT_MODEL optional).
 * - no key → free keyword answerer (src/lib/chat-assistant/answerWithoutAI.ts).
 *
 * Read-only either way: only public CMS content (see
 * src/lib/chat-assistant/knowledge.ts), no tools, so it cannot change data.
 */

const MODEL = process.env.CHATBOT_MODEL || 'claude-opus-5-5'
const MAX_MESSAGES = 20
const MAX_MESSAGE_CHARS = 1500

// Best-effort per-IP limit. In-memory, so it resets per serverless instance —
// enough to stop a single tab from hammering the API, not a hard guarantee.
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(key)
    }
  }
  return recent.length > RATE_LIMIT
}

function parseMessages(raw: unknown): Anthropic.Beta.BetaMessageParam[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const trimmed = raw.slice(-MAX_MESSAGES)
  const messages: Anthropic.Beta.BetaMessageParam[] = []
  for (const m of trimmed) {
    if (!m || typeof m !== 'object') return null
    const { role, content } = m as { role?: unknown; content?: unknown }
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS)
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
  if (rateLimited(ip)) {
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

  if (!process.env.ANTHROPIC_API_KEY) {
    const question = String(messages[messages.length - 1].content)
    return new Response(answerWithoutAI(question, data), {
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
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
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
