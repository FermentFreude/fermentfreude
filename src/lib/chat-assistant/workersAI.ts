/**
 * Free AI mode: Cloudflare Workers AI (https://developers.cloudflare.com/workers-ai/).
 *
 * Used by /api/chat when CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_TOKEN are set
 * and no ANTHROPIC_API_KEY is. Workers AI has a free daily allowance; when it
 * runs out (or anything else fails) the route falls back to the free keyword
 * answerer, so visitors always get an answer.
 */

export const DEFAULT_WORKERS_AI_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'

export type WorkersAIConfig = { accountId: string; token: string; model: string }

export function workersAIConfig(): WorkersAIConfig | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
  const token = process.env.CLOUDFLARE_AI_TOKEN?.trim()
  if (!accountId || !token) return null
  return { accountId, token, model: process.env.CLOUDFLARE_AI_MODEL?.trim() || DEFAULT_WORKERS_AI_MODEL }
}

type Message = { role: 'system' | 'user' | 'assistant'; content: string }

/**
 * Pull the text out of one Server-Sent-Events chunk from Workers AI.
 * Handles the native format ({"response":"…"}) and the OpenAI-style one
 * ({"choices":[{"delta":{"content":"…"}}]}). Returns the leftover partial line.
 */
export function parseWorkersAISSE(buffer: string): { text: string; rest: string; done: boolean } {
  const lines = buffer.split('\n')
  const rest = lines.pop() ?? ''
  let text = ''
  let done = false
  for (const raw of lines) {
    const line = raw.trim()
    if (!line.startsWith('data:')) continue
    const payload = line.slice(5).trim()
    if (payload === '[DONE]') {
      done = true
      continue
    }
    try {
      const json = JSON.parse(payload) as {
        response?: unknown
        choices?: { delta?: { content?: unknown } }[]
      }
      if (typeof json.response === 'string') text += json.response
      else if (typeof json.choices?.[0]?.delta?.content === 'string') text += json.choices[0].delta.content
    } catch {
      // Ignore keep-alives and malformed lines.
    }
  }
  return { text, rest, done }
}

/**
 * Start a streamed answer. Resolves to an async iterator of text pieces, or
 * null when Workers AI refuses the request (quota used up, bad token, …) so
 * the caller can fall back before sending anything to the visitor.
 */
export async function startWorkersAIStream(
  config: WorkersAIConfig,
  messages: Message[],
): Promise<AsyncGenerator<string> | null> {
  let res: Response
  try {
    res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/ai/run/${config.model}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, stream: true, max_tokens: 700, temperature: 0.3 }),
        signal: AbortSignal.timeout(30_000),
      },
    )
  } catch (error) {
    console.error('[Chat] Workers AI request failed:', error)
    return null
  }
  if (!res.ok || !res.body) {
    console.error(`[Chat] Workers AI error ${res.status}:`, (await res.text().catch(() => '')).slice(0, 300))
    return null
  }

  const reader = res.body.getReader()
  return (async function* () {
    const decoder = new TextDecoder()
    let buffer = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parsed = parseWorkersAISSE(buffer)
      buffer = parsed.rest
      if (parsed.text) yield parsed.text
      if (parsed.done) return
    }
    const last = parseWorkersAISSE(`${buffer}${decoder.decode()}\n`)
    if (last.text) yield last.text
  })()
}
