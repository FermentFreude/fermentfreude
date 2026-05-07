/**
 * One-shot script to mark all existing users as verified, so that enabling
 * `auth.verify` on the Users collection does NOT lock them out of their accounts.
 *
 * USAGE:
 *   pnpm tsx scripts/mark-existing-users-verified.ts
 *
 * Run this BEFORE flipping on `auth.verify` in `src/collections/Users/index.ts`.
 * Safe to re-run (idempotent — only updates users where _verified is not true).
 */
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'users',
    where: { _verified: { not_equals: true } },
    limit: 10000,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })

  payload.logger.info(`[verify-backfill] Found ${docs.length} unverified user(s).`)

  let ok = 0
  for (const user of docs) {
    try {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: { _verified: true } as never,
        overrideAccess: true,
        context: { skipAutoTranslate: true, skipRevalidate: true },
      })
      ok++
    } catch (err) {
      payload.logger.error(
        `[verify-backfill] Failed for ${user.email}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  payload.logger.info(`[verify-backfill] Marked ${ok}/${docs.length} user(s) as verified.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
