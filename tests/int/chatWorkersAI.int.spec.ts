import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseWorkersAISSE, startWorkersAIStream } from '@/lib/chat-assistant/workersAI'

const config = { accountId: 'acc', token: 'tok', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' }

function sseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder()
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const c of chunks) controller.enqueue(encoder.encode(c))
        controller.close()
      },
    }),
    { status: 200 },
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('Workers AI', () => {
  it('parses native and OpenAI-style SSE lines and keeps partial lines', () => {
    const out = parseWorkersAISSE('data: {"response":"Hal"}\ndata: {"choices":[{"delta":{"content":"lo"}}]}\ndata: {"respo')
    expect(out.text).toBe('Hallo')
    expect(out.rest).toBe('data: {"respo')
    expect(parseWorkersAISSE('data: [DONE]\n').done).toBe(true)
  })

  it('streams text pieces split across network chunks', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse(['data: {"response":"Hal', 'lo"}\n\ndata: {"response":" Welt"}\n\n', 'data: [DONE]\n\n'])))
    const pieces = await startWorkersAIStream(config, [{ role: 'user', content: 'Hi' }])
    let text = ''
    for await (const p of pieces!) text += p
    expect(text).toBe('Hallo Welt')
  })

  it('returns null when Cloudflare refuses (e.g. free allowance used up)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('limit', { status: 429 })))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await startWorkersAIStream(config, [{ role: 'user', content: 'Hi' }])).toBeNull()
  })
})
