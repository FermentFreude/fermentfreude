import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function main() {
  const payload = await getPayload({ config: await configPromise })
  const appts = await payload.find({ collection: 'workshop-appointments', limit: 50, depth: 2, overrideAccess: true })
  for (const a of appts.docs) {
    const w = typeof a.workshop === 'object' ? (a.workshop as any)?.title : a.workshop
    const max = typeof a.workshop === 'object' ? (a.workshop as any)?.maxCapacityPerSlot : null
    console.log(JSON.stringify({ id: a.id, workshop: w, dateTime: (a as any).dateTime, available: a.availableSpots, max }))
  }
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
