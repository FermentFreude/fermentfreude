import configPromise from '@payload-config'
import { createHash } from 'node:crypto'
import { getPayload } from 'payload'

/**
 * Usage limits for the chat assistant, counted in MongoDB so they hold across
 * all of Vercel's serverless instances (an in-memory counter resets per
 * instance). Counters live in the `chat_limits` collection and delete
 * themselves via a TTL index. Visitor IPs are stored only as a salted hash.
 *
 * If the database is unreachable the limits fail open for visitors (with an
 * in-memory fallback) and closed for AI (no AI answer), so a DB problem can
 * never run up AI usage.
 */

export const VISITOR_LIMIT = 30
export const VISITOR_WINDOW_MS = 10 * 60 * 1000
export const DEFAULT_AI_DAILY_LIMIT = 150

type CounterDoc = { _id: string; count: number; expireAt: Date }
type CounterCollection = {
  createIndex(spec: Record<string, 1>, options: { expireAfterSeconds: number }): Promise<unknown>
  findOneAndUpdate(
    filter: { _id: string },
    update: Record<string, unknown>,
    options: { upsert: true; returnDocument: 'after' },
  ): Promise<CounterDoc | { value: CounterDoc | null } | null>
}

let collectionPromise: Promise<CounterCollection> | null = null

async function counters(): Promise<CounterCollection> {
  if (!collectionPromise) {
    collectionPromise = (async () => {
      const payload = await getPayload({ config: configPromise })
      const db = payload.db as unknown as { connection: { collection(name: string): CounterCollection } }
      const collection = db.connection.collection('chat_limits')
      await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
      return collection
    })().catch((error) => {
      collectionPromise = null
      throw error
    })
  }
  return collectionPromise
}

/** Atomically add one to a counter and return the new value. */
async function bump(key: string, ttlMs: number): Promise<number> {
  const collection = await counters()
  const result = await collection.findOneAndUpdate(
    { _id: key },
    { $inc: { count: 1 }, $setOnInsert: { expireAt: new Date(Date.now() + ttlMs) } },
    { upsert: true, returnDocument: 'after' },
  )
  const doc = result && 'value' in result ? result.value : result
  return doc?.count ?? 1
}

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(`${process.env.PAYLOAD_SECRET ?? ''}:${ip}`)
    .digest('hex')
    .slice(0, 24)
}

// Fallback when MongoDB is unreachable.
const memoryHits = new Map<string, number[]>()
function memoryLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (memoryHits.get(ip) ?? []).filter((t) => now - t < VISITOR_WINDOW_MS)
  recent.push(now)
  memoryHits.set(ip, recent)
  if (memoryHits.size > 5000) memoryHits.clear()
  return recent.length > VISITOR_LIMIT
}

/** True when this visitor has asked more than VISITOR_LIMIT questions in the current 10-minute window. */
export async function visitorLimited(ip: string): Promise<boolean> {
  const window = Math.floor(Date.now() / VISITOR_WINDOW_MS)
  try {
    return (await bump(`v:${hashIp(ip)}:${window}`, VISITOR_WINDOW_MS * 2)) > VISITOR_LIMIT
  } catch (error) {
    console.error('[Chat] Limit counter unavailable, using memory:', error)
    return memoryLimited(ip)
  }
}

function viennaDay(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Vienna' }).format(new Date())
}

/**
 * Reserve one AI answer from today's budget (Vienna time). Returns false when
 * the daily limit from Admin → Chat Assistant is reached, set to 0, or the
 * counter can't be read.
 */
export async function takeAiAnswer(dailyLimit: number | undefined): Promise<boolean> {
  const limit = dailyLimit ?? DEFAULT_AI_DAILY_LIMIT
  if (limit <= 0) return false
  try {
    return (await bump(`ai:${viennaDay()}`, 2 * 24 * 60 * 60 * 1000)) <= limit
  } catch (error) {
    console.error('[Chat] AI budget counter unavailable, skipping AI:', error)
    return false
  }
}

/** True when this visitor sent more than 5 "ask our team" emails in the current hour. */
export async function contactLimited(ip: string): Promise<boolean> {
  const hour = 60 * 60 * 1000
  const window = Math.floor(Date.now() / hour)
  try {
    return (await bump(`c:${hashIp(ip)}:${window}`, hour * 2)) > 5
  } catch (error) {
    console.error('[Chat] Limit counter unavailable, using memory:', error)
    return memoryLimited(`c:${ip}`)
  }
}
