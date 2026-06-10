/**
 * fix-appointment-spots.ts
 * Sets the correct available spots and times based on founders' booking system.
 * Run: pnpm tsx src/scripts/fix-appointment-spots.ts
 */
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function main() {
  const payload = await getPayload({ config: await configPromise })

  // ── 1. maxCapacityPerSlot per workshop type ───────────────────────────────
  // Lakto: 6, Kombucha: 8, Tempeh: 6 (confirmed from booking system screenshot)
  const capacityByTitle: Record<string, number> = {
    'Lakto-fermentiertes Gemüse': 6,
    'Kombucha': 8,
    'Tempeh': 6,
  }
  const workshops = await payload.find({ collection: 'workshops', limit: 50, depth: 0, overrideAccess: true })
  for (const w of workshops.docs) {
    const title = ((w as unknown) as Record<string, unknown>).title as string
    const target = capacityByTitle[title]
    if (target !== undefined) {
      await payload.update({ collection: 'workshops', id: w.id, data: { maxCapacityPerSlot: target } as never, overrideAccess: true })
      console.log(`✓ "${title}" maxCapacityPerSlot → ${target}`)
    }
  }

  // ── 2. Correct appointment times and available spots ─────────────────────
  // Ground truth: founders' booking system screenshot (2026-06-10)
  //   June 18 Lakto:  17:30 CEST (15:30 UTC) | 5/6 booked → 1 free
  //   June 20 Lakto:  10:00 CEST (08:00 UTC) | 5/6 booked → 1 free
  //   June 26 Tempeh: 15:30 CEST (13:30 UTC) | 1/6 booked → 5 free
  //   Past sessions (May 22, May 29, June 3): 0 available
  const corrections: Record<string, { dateTime: string; availableSpots: number }> = {
    '6a1010e85257fd2aca162bb2': { dateTime: '2026-05-22T16:00:00.000Z', availableSpots: 0 },  // Lakto May 22 — past
    '6a1010e95257fd2aca162bc4': { dateTime: '2026-05-29T16:00:00.000Z', availableSpots: 0 },  // Lakto May 29 — past
    '6a1010e95257fd2aca162bcb': { dateTime: '2026-06-03T16:00:00.000Z', availableSpots: 0 },  // Kombucha June 3 — past
    '6a1010e95257fd2aca162bd1': { dateTime: '2026-06-18T15:30:00.000Z', availableSpots: 1 },  // Lakto June 18 — 17:30 CEST
    '6a1010e95257fd2aca162bd7': { dateTime: '2026-06-20T08:00:00.000Z', availableSpots: 1 },  // Lakto June 20 — 10:00 CEST
    '6a29470ff41bdead42e050db': { dateTime: '2026-06-26T13:30:00.000Z', availableSpots: 5 },  // Tempeh June 26 — 15:30 CEST
  }

  for (const [id, data] of Object.entries(corrections)) {
    await payload.update({ collection: 'workshop-appointments', id, data, overrideAccess: true })
    console.log(`✓ Appointment ${id} → ${data.dateTime} / availableSpots:${data.availableSpots}`)
  }

  console.log('\n✅ Done.')
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
