/**
 * fix-appointment-spots.ts
 * Sets the correct available spots based on real booking state provided by founders.
 * Corrects maxCapacityPerSlot: Lakto=6, Kombucha=8, Tempeh=8.
 * Run: pnpm tsx src/scripts/fix-appointment-spots.ts
 */
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function main() {
  const payload = await getPayload({ config: await configPromise })

  // ── 1. Fix maxCapacityPerSlot per workshop type ──────────────────────────
  // Lakto: 6, Kombucha: 8, Tempeh: 8
  const capacityByTitle: Record<string, number> = {
    'Lakto-fermentiertes Gemüse': 6,
    'Kombucha': 8,
    'Tempeh': 8,
  }
  const workshops = await payload.find({ collection: 'workshops', limit: 50, depth: 0, overrideAccess: true })
  for (const w of workshops.docs) {
    const title = (w as Record<string, unknown>).title as string
    const target = capacityByTitle[title]
    if (target !== undefined) {
      await payload.update({ collection: 'workshops', id: w.id, data: { maxCapacityPerSlot: target } as never, overrideAccess: true })
      console.log(`✓ "${title}" maxCapacityPerSlot → ${target}`)
    }
  }

  // ── 2. Set availableSpots on appointments ─────────────────────────────────
  // Based on founders' report (2026-06-10):
  //   Past appointments: 0 (sessions over)
  //   June 18 Lakto:  1 spot left (5/6 booked)
  //   June 20 Lakto:  1 spot left (5/6 booked)
  //   June 25 Tempeh: 5 spots left (1/8 booked) — to be confirmed
  //   June 26 Tempeh: 5 spots left (1/8 booked) — to be confirmed
  const corrections: Record<string, number> = {
    '6a1010e85257fd2aca162bb2': 0,  // Lakto May 22 — past
    '6a1010e95257fd2aca162bc4': 0,  // Lakto May 29 — past
    '6a1010e95257fd2aca162bcb': 0,  // Kombucha June 3 — past
    '6a1010e95257fd2aca162bd1': 1,  // Lakto June 18 — 5/6 booked
    '6a1010e95257fd2aca162bd7': 1,  // Lakto June 20 — 5/6 booked
    '6a1010e95257fd2aca162bdd': 5,  // Tempeh June 25
    '6a29470ff41bdead42e050db': 5,  // Tempeh June 26 (new session)
  }

  for (const [id, spots] of Object.entries(corrections)) {
    await payload.update({ collection: 'workshop-appointments', id, data: { availableSpots: spots }, overrideAccess: true })
    console.log(`✓ Appointment ${id} → availableSpots: ${spots}`)
  }

  console.log('\n✅ Done.')
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
