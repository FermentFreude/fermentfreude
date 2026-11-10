import { beforeEach, describe, expect, it, vi } from 'vitest'

const send = vi.fn(async (_args: { htmlContent: string; replyTo?: { email: string } }) => ({ success: true }))
vi.mock('@/lib/brevo', () => ({ sendTransactionalEmail: (args: never) => send(args) }))

vi.mock('@/lib/chat-assistant/limits', () => ({ contactLimited: async () => false }))

import { POST } from '@/app/api/chat/contact/route'

let ip = 0
function req(body: unknown) {
  ip += 1
  return new Request('http://localhost/api/chat/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${ip}` },
    body: JSON.stringify(body),
  }) as never
}

describe('POST /api/chat/contact', () => {
  beforeEach(() => send.mockClear())

  it('emails the team with reply-to set to the visitor and escapes HTML', async () => {
    const res = await POST(req({ name: 'Ana', email: 'ana@example.com', message: '<b>Hi</b>', transcript: [{ role: 'user', content: 'Parken?' }] }))
    expect(res.status).toBe(200)
    const args = send.mock.calls[0][0]
    expect(args.replyTo?.email).toBe('ana@example.com')
    expect(args.htmlContent).toContain('&lt;b&gt;Hi&lt;/b&gt;')
    expect(args.htmlContent).toContain('Parken?')
  })

  it('rejects an invalid email', async () => {
    expect((await POST(req({ email: 'nope', message: 'x' }))).status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })

  it('silently drops bots that fill the honeypot', async () => {
    expect((await POST(req({ email: 'a@b.co', message: 'x', website: 'spam' }))).status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })
})
