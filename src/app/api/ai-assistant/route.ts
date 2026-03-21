import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import configPromise from '@payload-config'
import { buildContext } from '@/lib/ai-assistant/context-builder'
import { sanitizeData } from '@/lib/ai-assistant/sanitizer'
import { checkRateLimit } from '@/lib/ai-assistant/rate-limiter'
import { buildSystemPrompt } from '@/lib/ai-assistant/system-prompt'
import type { AIRequestBody, AIMessage } from '@/lib/ai-assistant/types'

const MAX_MESSAGE_LENGTH = 2000
const MAX_HISTORY_MESSAGES = 6

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  return new Anthropic({ apiKey })
}

function validateMessage(message: unknown): message is string {
  if (typeof message !== 'string' || !message.trim()) return false
  if (message.length > MAX_MESSAGE_LENGTH) return false
  return true
}

export async function POST(request: Request) {
  try {
    // 1. AUTHENTICATION
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. AUTHORIZATION — only admins can use the assistant
    const roles = (user as { roles?: string[] }).roles ?? []
    if (!roles.includes('admin')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. RATE LIMITING
    const rateLimitResult = checkRateLimit(user.id)
    if (!rateLimitResult.allowed) {
      return Response.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 },
      )
    }

    // 4. PARSE & VALIDATE
    const body = (await request.json()) as AIRequestBody
    const { message, conversationHistory = [], collection, documentId } = body

    if (!validateMessage(message)) {
      return Response.json({ error: 'Invalid or missing message' }, { status: 400 })
    }

    // 5. BUILD SAFE CONTEXT
    const context = await buildContext({ collection, documentId, payload, user: { id: String(user.id) } })
    const safeContext = sanitizeData(context) as typeof context

    // 6. CONSTRUCT MESSAGES
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = (
      conversationHistory as AIMessage[]
    )
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content }))

    const messages = [...history, { role: 'user' as const, content: message }]

    // 7. CALL ANTHROPIC (streaming)
    const client = getAnthropicClient()
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: buildSystemPrompt(safeContext),
      messages,
      temperature: 0.7,
    })

    // 8. RETURN SSE STREAM
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              'delta' in event &&
              (event.delta as { type: string }).type === 'text_delta'
            ) {
              const text = (event.delta as { text: string }).text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          console.error('AI stream error:', err)
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI Assistant error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
