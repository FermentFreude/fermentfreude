import type { Payload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  Exactly-once completion of a Stripe payment
 *
 *  A paid purchase (voucher, shop order, workshop booking) can be
 *  completed from two places:
 *    1. the customer's browser, when it comes back to the success /
 *       confirm-order page after paying, and
 *    2. the Stripe webhook (payment_intent.succeeded / charge.succeeded),
 *       which arrives whether or not the customer ever comes back
 *       (closed tab, Klarna / PayPal / bank app, lost connection).
 *
 *  Both can arrive at the same moment, and Stripe sends two "succeeded"
 *  events per payment, so the work is guarded by a lock row keyed by the
 *  PaymentIntent ID. MongoDB's _id is always unique, so inserting the row
 *  is atomic: exactly one caller wins and does the work; everyone else
 *  waits for its result. If the winner fails, it deletes the row so the
 *  next attempt (a browser retry or Stripe's own webhook retry) can try
 *  again. A row left behind by a crash is taken over after STALE_MS.
 *
 *  MongoDB Atlas M0: no transactions — this lock is the guard instead.
 * ═══════════════════════════════════════════════════════════════ */

const LOCKS_COLLECTION = 'stripe_fulfilment_locks'
const STALE_MS = 2 * 60 * 1000

type LockDoc = { _id: string; createdAt: Date; done?: boolean }

// Any Payload model gives us the shared Mongo connection.
const locks = (payload: Payload) =>
  payload.db.collections.transactions.db.collection<LockDoc>(LOCKS_COLLECTION)

const isDuplicateKey = (err: unknown) =>
  typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000

async function claim(payload: Payload, paymentIntentID: string): Promise<boolean> {
  try {
    await locks(payload).insertOne({ _id: paymentIntentID, createdAt: new Date() })
    return true
  } catch (err) {
    if (!isDuplicateKey(err)) throw err
  }
  // Someone holds it. Take it over only if they died mid-way.
  const takeover = await locks(payload).updateOne(
    {
      _id: paymentIntentID,
      done: { $ne: true },
      createdAt: { $lt: new Date(Date.now() - STALE_MS) },
    },
    { $set: { createdAt: new Date() } },
  )
  return takeover.modifiedCount === 1
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Runs `fulfil` at most once per PaymentIntent and returns its result —
 * or, when it already ran (or is running elsewhere), the existing result
 * found by `findExisting`. Throws if nothing appears within `waitMs`, so
 * the caller (browser or Stripe) retries later.
 */
export async function fulfilOnce<T>(
  payload: Payload,
  paymentIntentID: string,
  {
    findExisting,
    fulfil,
    waitMs,
  }: {
    findExisting: () => Promise<T | null>
    fulfil: () => Promise<T>
    waitMs: number
  },
): Promise<T> {
  const deadline = Date.now() + waitMs

  for (;;) {
    const existing = await findExisting()
    if (existing) return existing

    if (await claim(payload, paymentIntentID)) {
      try {
        // Completed before this lock existed (older purchases)
        const already = await findExisting()
        const result = already ?? (await fulfil())
        await locks(payload).updateOne({ _id: paymentIntentID }, { $set: { done: true } })
        return result
      } catch (err) {
        await locks(payload).deleteOne({ _id: paymentIntentID, done: { $ne: true } })
        throw err
      }
    }

    if (Date.now() > deadline) {
      throw new Error(`Payment ${paymentIntentID} is still being completed — try again shortly`)
    }
    await sleep(1000)
  }
}
