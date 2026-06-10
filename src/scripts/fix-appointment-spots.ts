/**
 * fix-appointment-spots.ts
 * Sets the correct available spots based on real booking state provided by founders.
 * Also corrects maxCapacityPerSlot from 12 → 6 on all workshops.
 * Run: pnpm tsx src/scripts/fix-appointment-spots.ts
 */
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function main() {
  const payload = await getPayload({ config: await configPromise })

  // ── 1. Fix maxCapacityPerSlot on all workshops (12 → 6) ──────────────────
  const workshops = await payload.find({ collection: 'workshops', limit: 50, depth: 0, overrideAccess: true })
  for (const w of workshops.docs) {
    const cap = (w as Record<string, unknown>).maxCapacityPerSlot as number | undefined
    if (cap !== 6) {
      await payload.update({ collection: 'workshops', id: w.id, data: { maxCapacityPerSlot: 6 } as never, overrideAccess: true })
      console.log(`✓ Workshop "${(w as Record<string,unknown>).title}" maxCapacityPerSlot: ${cap} → 6`)
    }
  }

  // ── 2. Set availableSpots on upcoming appointments ────────────────────────
  // Based on founders' report (2026-06-10):
  //   June 18 Lakto-Gemüse:  5 of 6 booked → 1 spot left
  //   June 20 Lakto-Gemüse:  5 of 6 booked → 1 spot left
  //   June 25/26 Tempeh:     1 of 6 booked → 5 spots left
  //   Past appointments (May 22, May 29, June 3): set to 0 (session over)

  const corrections: Record<string, number> = {
    '6a1010e85257fd2aca162bb2': 0,  // Lakto May 22 — past
    '6a1010e95257fd2aca162bc4': 0,  // Lakto May 29 — past
    '6a1010e95257fd2aca162bcb': 0,  // Kombucha June 3 — past
    '6a1010e95257fd2aca162bd1': 1,  // Lakto June 18 — 5/6 booked
    '6a1010e95257fd2aca162bd7': 1,  // Lakto June 20 — 5/6 booked
    '6a1010e95257fd2aca162bdd': 5,  // Tempeh June 25/26 — 1/6 booked
  }

  for (const [id, spots] of Object.entries(corrections)) {
    await payload.update({ collection: 'workshop-appointments', id, data: { availableSpots: spots }, overrideAccess: true })
    console.log(`✓ Appointment ${id} → availableSpots: ${spots}`)
  }

  console.log('\n✅ Done.')
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
