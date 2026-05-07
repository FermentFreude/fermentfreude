/**
 * diagnose-appointments.ts — READ ONLY
 *
 * Lists every workshop-appointment in the connected DB with key fields,
 * so we can see exactly what the website filter (`isPublished=true` + future date)
 * will see vs. miss.
 *
 * Run: pnpm tsx src/scripts/diagnose-appointments.ts
 */

import config from '@payload-config'
import { getPayload } from 'payload'

async function run() {
  const payload = await getPayload({ config })

  const now = new Date()
  console.log(`\n🕒 Current time (filter cutoff): ${now.toISOString()}`)
  console.log(`📡 DB: ${process.env.DATABASE_URL?.split('/').pop()?.split('?')[0]}\n`)

  const workshops = await payload.find({ collection: 'workshops', limit: 50, depth: 0 })
  const wsById: Record<string, string> = {}
  for (const w of workshops.docs) {
    wsById[w.id as string] = (w as { slug?: string; title?: string }).slug ?? w.id
  }
  console.log('📚 Workshops:')
  for (const w of workshops.docs) {
    console.log(
      `   ${w.id}  slug=${(w as { slug?: string }).slug}  title=${(w as { title?: string }).title}`,
    )
  }

  const appts = await payload.find({
    collection: 'workshop-appointments',
    limit: 200,
    sort: 'dateTime',
    depth: 0,
    overrideAccess: true,
  })

  console.log(`\n📅 Appointments (total=${appts.docs.length}):\n`)
  console.log(
    'workshop'.padEnd(12) +
      ' | ' +
      'dateTime'.padEnd(25) +
      ' | ' +
      'pub'.padEnd(5) +
      ' | future | spots | id',
  )
  console.log('-'.repeat(110))

  for (const a of appts.docs) {
    const wsId = typeof a.workshop === 'string' ? a.workshop : (a.workshop as { id: string })?.id
    const slug = wsById[wsId] ?? '?'
    const dt = a.dateTime ? new Date(a.dateTime as string) : null
    const isFuture = dt ? dt > now : false
    const willShow = a.isPublished && isFuture
    console.log(
      `${slug.padEnd(12)} | ${(dt?.toISOString() ?? '?').padEnd(25)} | ${String(
        a.isPublished,
      ).padEnd(5)} | ${String(isFuture).padEnd(6)} | ${String(a.availableSpots).padEnd(5)} | ${
        a.id
      }${willShow ? '' : '   ← HIDDEN from website'}`,
    )
  }
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
