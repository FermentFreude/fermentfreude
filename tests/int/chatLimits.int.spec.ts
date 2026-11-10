import { describe, expect, it, vi } from 'vitest'

// In-memory stand-in for the MongoDB `chat_limits` collection.
const store = new Map<string, number>()
const collection = {
  createIndex: vi.fn(async () => 'ok'),
  findOneAndUpdate: vi.fn(async (filter: { _id: string }) => {
    const count = (store.get(filter._id) ?? 0) + 1
    store.set(filter._id, count)
    return { _id: filter._id, count, expireAt: new Date() }
  }),
}

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ db: { connection: { collection: () => collection } } }) }))

import { takeAiAnswer, VISITOR_LIMIT, visitorLimited } from '@/lib/chat-assistant/limits'

describe('chat limits', () => {
  it('stops a visitor after the limit, without storing the raw IP', async () => {
    for (let i = 0; i < VISITOR_LIMIT; i++) expect(await visitorLimited('1.2.3.4')).toBe(false)
    expect(await visitorLimited('1.2.3.4')).toBe(true)
    expect(await visitorLimited('5.6.7.8')).toBe(false)
    expect([...store.keys()].some((k) => k.includes('1.2.3.4'))).toBe(false)
  })

  it('enforces the daily AI budget from Admin', async () => {
    expect(await takeAiAnswer(0)).toBe(false)
    expect(await takeAiAnswer(2)).toBe(true)
    expect(await takeAiAnswer(2)).toBe(true)
    expect(await takeAiAnswer(2)).toBe(false)
  })

  it('skips AI when the counter is unreachable', async () => {
    collection.findOneAndUpdate.mockRejectedValueOnce(new Error('db down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await takeAiAnswer(100)).toBe(false)
  })
})
