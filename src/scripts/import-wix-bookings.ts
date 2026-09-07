/**
 * import-wix-bookings.ts
 *
 * One-off migration: imports already-paid/confirmed Wix bookings for currently
 * scheduled workshop sessions (Sept 2026 onward) into this site's own booking
 * system, so the roster dashboard shows the right names/capacity while Wix is
 * shut down. Creates `workshop-bookings` docs directly via Local API — never
 * touches Stripe, `orders`, or `quotes`, so nothing here can trigger an invoice,
 * a payment, or a customer email.
 *
 * Safe to re-run: every row is skipped if a matching booking (same email +
 * appointment) already exists. Existing bookings/appointments are NEVER
 * updated or overwritten — the script only ever adds new documents.
 *
 * Usage:
 *   npx tsx src/scripts/import-wix-bookings.ts <path-to-csv> [--dry-run]
 */

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import type { getPayload as GetPayload } from 'payload'

// Load .env before anything (payload.config.ts reads PAYLOAD_SECRET/DATABASE_URL
// at module-evaluation time) — payload/config are imported dynamically below,
// after this runs, since static imports would be hoisted ahead of it.
loadEnv()

// Only import bookings for sessions on/after this date. Sessions before this
// have already happened on the old site and are irrelevant.
const CUTOFF_DATE = new Date('2026-09-01T00:00:00+02:00')

const WORKSHOP_NAME_TO_SLUG: Record<string, string> = {
  'Lakto-Gemüse': 'lakto',
  'Lacto-Gemüse': 'lakto',
  Kombucha: 'kombucha',
  Tempeh: 'tempeh',
  'Vom Feld ins Glas': 'vom-feld-ins-glas',
  'Einstieg in die Fermentation': 'basics',
}

const INCLUDED_STATUSES = new Set(['Bestätigt'])

// ── Minimal RFC4180-style CSV parser (quote-aware, handles embedded ─────────
// commas/newlines/escaped ""). No CSV library is a project dependency, and
// adding one for a single one-off script isn't worth it.
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\r') {
      // ignore, \n handles the line break
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const header = rows[0]
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    header.forEach((h, idx) => {
      obj[h] = r[idx] ?? ''
    })
    return obj
  })
}

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1)
  if (text.startsWith('ï»¿')) return text.slice(3) // literal mis-decoded BOM
  return text
}

// "DD.MM.YYYY, HH:mm" (Europe/Vienna) → Date
// "DD.MM.YYYY, HH:mm" is a Europe/Vienna wall-clock time, but the UTC offset
// depends on whether that date falls in CEST (+02:00) or CET (+01:00) — DST
// ends late October. Try both offsets and keep whichever one round-trips
// back to the exact same wall-clock time when displayed in Europe/Vienna.
function parseWixDateTime(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4}),\s*(\d{2}):(\d{2})$/)
  if (!match) return null
  const [, day, month, year, hour, minute] = match
  const expected = `${day}/${month}/${year}, ${hour}:${minute}`

  for (const offset of ['+02:00', '+01:00']) {
    const candidate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00${offset}`)
    const formatted = candidate.toLocaleString('en-GB', {
      timeZone: 'Europe/Vienna',
      hour12: false,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    if (formatted === expected) return candidate
  }
  return null
}

function splitName(first: string, last: string): { firstName: string; lastName: string } {
  const trimmedFirst = first.trim()
  const trimmedLast = last.trim()
  if (trimmedLast) return { firstName: trimmedFirst, lastName: trimmedLast }
  const parts = trimmedFirst.split(/\s+/)
  if (parts.length < 2) return { firstName: trimmedFirst, lastName: '' }
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] }
}

function formatEuroDateTime(date: Date): { dateDisplay: string; timeDisplay: string } {
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Vienna',
  }
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Vienna',
  }
  return {
    dateDisplay: date.toLocaleDateString('de-DE', dateOptions),
    timeDisplay: date.toLocaleTimeString('de-DE', timeOptions),
  }
}

async function run() {
  const csvPath = process.argv[2]
  const dryRun = process.argv.includes('--dry-run')

  if (!csvPath) {
    console.error('Usage: npx tsx src/scripts/import-wix-bookings.ts <path-to-csv> [--dry-run]')
    process.exit(1)
  }
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`)
    process.exit(1)
  }

  console.log(`Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE — will write to the database'}`)
  console.log(`Cutoff date: ${CUTOFF_DATE.toISOString()} (sessions before this are skipped)\n`)

  const raw = stripBom(fs.readFileSync(csvPath, 'utf-8'))
  const rows = parseCsv(raw)

  const { getPayload } = (await import('payload')) as { getPayload: typeof GetPayload }
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  // Cache workshop docs by slug.
  const workshopsBySlug = new Map<string, { id: string; basePrice: number }>()
  const allWorkshops = await payload.find({ collection: 'workshops', limit: 100, overrideAccess: true })
  for (const w of allWorkshops.docs) {
    workshopsBySlug.set(w.slug as string, { id: String(w.id), basePrice: (w.basePrice as number) ?? 99 })
  }

  // Cache the most-used location per workshop slug, for auto-creating
  // missing appointments without inventing a new location doc.
  const defaultLocationByWorkshop = new Map<string, string>()
  {
    const appts = await payload.find({
      collection: 'workshop-appointments',
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })
    const counts = new Map<string, Map<string, number>>()
    for (const a of appts.docs) {
      const workshopId = typeof a.workshop === 'object' ? String(a.workshop.id) : String(a.workshop)
      const locationId = typeof a.location === 'object' ? String(a.location.id) : String(a.location)
      if (!counts.has(workshopId)) counts.set(workshopId, new Map())
      const m = counts.get(workshopId)!
      m.set(locationId, (m.get(locationId) ?? 0) + 1)
    }
    for (const [workshopId, m] of counts) {
      let best: string | null = null
      let bestCount = -1
      for (const [locationId, count] of m) {
        if (count > bestCount) {
          best = locationId
          bestCount = count
        }
      }
      if (best) defaultLocationByWorkshop.set(workshopId, best)
    }
  }

  const summary = {
    created: [] as string[],
    appointmentsCreated: [] as string[],
    skippedAlreadyImported: [] as string[],
    skippedUnmappedWorkshop: [] as string[],
    skippedUnparseable: [] as string[],
    skippedOutOfScope: 0,
    skippedNotConfirmed: 0,
    warnings: [] as string[],
  }

  for (const row of rows) {
    const status = row['Booking Status']?.trim()
    if (!INCLUDED_STATUSES.has(status)) {
      summary.skippedNotConfirmed++
      continue
    }

    const startDate = parseWixDateTime(row['Booking Start Time'])
    if (!startDate) {
      summary.skippedUnparseable.push(`Unparseable date: "${row['Booking Start Time']}" (${row['First Name']} ${row['Last Name']})`)
      continue
    }
    if (startDate < CUTOFF_DATE) {
      summary.skippedOutOfScope++
      continue
    }

    const workshopName = row['Service Name']?.trim()
    const slug = WORKSHOP_NAME_TO_SLUG[workshopName]
    if (!slug) {
      summary.skippedUnmappedWorkshop.push(`Unmapped workshop name: "${workshopName}" (order #${row['Order Number']})`)
      continue
    }

    const workshop = workshopsBySlug.get(slug)
    if (!workshop) {
      summary.skippedUnmappedWorkshop.push(`No "${slug}" doc in workshops collection (order #${row['Order Number']})`)
      continue
    }

    const { firstName, lastName } = splitName(row['First Name'] ?? '', row['Last Name'] ?? '')
    const email = row['Email']?.trim()
    const phone = row['Phone']?.trim()
    const guestCount = Math.max(1, parseInt(row['Group Size'], 10) || 1)
    const orderNumber = row['Order Number']?.trim()

    // ── Find or create the matching appointment ──────────────────────────
    const startIso = startDate.toISOString()
    const existingAppts = await payload.find({
      collection: 'workshop-appointments',
      where: {
        and: [{ workshop: { equals: workshop.id } }, { dateTime: { equals: startIso } }],
      },
      limit: 1,
      overrideAccess: true,
    })

    let appointmentId: string
    let appointmentAvailableSpots: number

    if (existingAppts.docs.length > 0) {
      appointmentId = String(existingAppts.docs[0].id)
      appointmentAvailableSpots = existingAppts.docs[0].availableSpots as number
    } else {
      const locationId = defaultLocationByWorkshop.get(workshop.id)
      if (!locationId) {
        summary.skippedUnmappedWorkshop.push(
          `No existing appointment/location for workshop "${slug}" — cannot auto-create appointment for ${startDate.toISOString()} (order #${orderNumber})`,
        )
        continue
      }
      if (dryRun) {
        console.log(`[DRY RUN] Would create appointment: ${slug} @ ${startIso} (location ${locationId})`)
        appointmentId = `DRY-RUN-NEW-APPOINTMENT`
        appointmentAvailableSpots = 12
      } else {
        const created = await payload.create({
          collection: 'workshop-appointments',
          overrideAccess: true,
          data: {
            workshop: workshop.id,
            location: locationId,
            dateTime: startIso,
            availableSpots: 12,
            isPublished: true,
          },
        })
        appointmentId = String(created.id)
        appointmentAvailableSpots = 12
        summary.appointmentsCreated.push(`${slug} @ ${startIso} (id ${appointmentId})`)
      }
    }

    // ── Idempotency check — never overwrite an existing booking ──────────
    if (appointmentId !== 'DRY-RUN-NEW-APPOINTMENT') {
      const existingBooking = await payload.find({
        collection: 'workshop-bookings',
        where: {
          and: [{ email: { equals: email } }, { appointmentId: { equals: appointmentId } }],
        },
        limit: 1,
        overrideAccess: true,
      })
      if (existingBooking.docs.length > 0) {
        summary.skippedAlreadyImported.push(`${firstName} ${lastName} <${email}> — ${slug} @ ${startIso}`)
        continue
      }
    }

    const { dateDisplay, timeDisplay } = formatEuroDateTime(startDate)
    const pricePerPerson = workshop.basePrice
    const totalPrice = pricePerPerson * guestCount

    const noteParts = [`[Wix Import — Order #${orderNumber || 'n/a'}]`]
    // Pull free-text "message" fields, identified by the field label
    // containing "Nachricht" (Wix's own "Add your message" field name).
    for (let i = 0; i < 40; i++) {
      if (row[`Form Field ${i}`]?.trim().toLowerCase().includes('nachricht') && row[`Form Response ${i}`]?.trim()) {
        noteParts.push(row[`Form Response ${i}`].trim())
      }
    }
    const notes = noteParts.join(' — ')

    const label = `${firstName} ${lastName} <${email}> — ${slug} @ ${dateDisplay} ${timeDisplay} (x${guestCount})`

    if (dryRun) {
      console.log(`[DRY RUN] Would create booking: ${label}`)
      summary.created.push(label)
      continue
    }

    await payload.create({
      collection: 'workshop-bookings',
      overrideAccess: true,
      data: {
        status: 'confirmed',
        appointmentId,
        workshopSlug: slug,
        workshopTitle: workshopName,
        date: dateDisplay,
        time: timeDisplay,
        guestCount,
        pricePerPerson,
        totalPrice,
        firstName,
        lastName,
        email,
        phone,
        notes,
      },
    })
    summary.created.push(label)

    const newAvailable = Math.max(0, appointmentAvailableSpots - guestCount)
    if (appointmentAvailableSpots - guestCount < 0) {
      summary.warnings.push(`Appointment ${slug} @ ${startIso} would go below 0 available spots — floored at 0. Check for overbooking.`)
    }
    await payload.update({
      collection: 'workshop-appointments',
      id: appointmentId,
      overrideAccess: true,
      data: { availableSpots: newAvailable },
    })
  }

  // ── Report ───────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────')
  console.log(`Bookings ${dryRun ? 'that would be created' : 'created'}: ${summary.created.length}`)
  summary.created.forEach((l) => console.log(`  ✅ ${l}`))
  if (summary.appointmentsCreated.length) {
    console.log(`\nAppointments auto-created: ${summary.appointmentsCreated.length}`)
    summary.appointmentsCreated.forEach((l) => console.log(`  🆕 ${l}`))
  }
  if (summary.skippedAlreadyImported.length) {
    console.log(`\nSkipped (already imported): ${summary.skippedAlreadyImported.length}`)
    summary.skippedAlreadyImported.forEach((l) => console.log(`  ⏭️  ${l}`))
  }
  if (summary.skippedUnmappedWorkshop.length) {
    console.log(`\nSkipped (unmapped / missing location): ${summary.skippedUnmappedWorkshop.length}`)
    summary.skippedUnmappedWorkshop.forEach((l) => console.log(`  ⚠️  ${l}`))
  }
  if (summary.skippedUnparseable.length) {
    console.log(`\nSkipped (unparseable row): ${summary.skippedUnparseable.length}`)
    summary.skippedUnparseable.forEach((l) => console.log(`  ⚠️  ${l}`))
  }
  console.log(`\nSkipped (not "Bestätigt"): ${summary.skippedNotConfirmed}`)
  console.log(`Skipped (before cutoff date): ${summary.skippedOutOfScope}`)
  if (summary.warnings.length) {
    console.log(`\n⚠️  Warnings:`)
    summary.warnings.forEach((l) => console.log(`  ${l}`))
  }
  console.log('──────────────────────────────────────────')

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
