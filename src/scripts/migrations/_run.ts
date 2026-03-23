/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Migration runner — runs all numbered migrations in order.
 *
 * Usage:
 *   pnpm migrate              # runs all pending migrations against DATABASE_URL
 *
 * To run against PRODUCTION:
 *   Temporarily swap DATABASE_URL, R2_BUCKET, R2_PUBLIC_URL in your .env
 *   to point to the production values (see CLAUDE.md → "Seeding Production"),
 *   then run: pnpm migrate
 *   Then IMMEDIATELY swap .env back to staging values.
 *
 * Migration files must:
 *   - Live in src/scripts/migrations/
 *   - Be named NNN-description.ts (e.g. 001-shop-featured-cards.ts)
 *   - Export: export async function migrate(payload: Payload): Promise<void>
 *   - Be idempotent (safe to run twice — check before writing)
 *
 * The runner tracks completed migrations in the target DB under a
 * "_migrations" meta-collection (created automatically on first run via
 * the `payload.db` adapter's raw driver).
 *
 * Alternatively, each migration is fully idempotent, so it's also safe
 * to simply re-run all of them — duplicates are no-ops.
 * ─────────────────────────────────────────────────────────────────────────────
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import config from '@payload-config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function getCompletedMigrations(payload: Payload): Promise<Set<string>> {
  try {
    // Store completion state in a simple JSON file next to the migrations
    const stateFile = path.join(__dirname, '.completed.json')
    if (!fs.existsSync(stateFile)) return new Set()
    const data = JSON.parse(fs.readFileSync(stateFile, 'utf8')) as Record<string, string[]>
    const dbUrl = process.env.DATABASE_URL ?? ''
    const dbKey = dbUrl.includes('fermentfreude-staging') ? 'staging' : 'production'
    return new Set(data[dbKey] ?? [])
  } catch {
    return new Set()
  }
}

async function markMigrationComplete(payload: Payload, name: string): Promise<void> {
  const stateFile = path.join(__dirname, '.completed.json')
  const dbUrl = process.env.DATABASE_URL ?? ''
  const dbKey = dbUrl.includes('fermentfreude-staging') ? 'staging' : 'production'

  let data: Record<string, string[]> = {}
  if (fs.existsSync(stateFile)) {
    data = JSON.parse(fs.readFileSync(stateFile, 'utf8')) as Record<string, string[]>
  }
  data[dbKey] = [...new Set([...(data[dbKey] ?? []), name])]
  fs.writeFileSync(stateFile, JSON.stringify(data, null, 2))
}

async function run() {
  const payload = await getPayload({ config })

  const dbUrl = process.env.DATABASE_URL ?? ''
  const targetLabel = dbUrl.includes('fermentfreude-staging')
    ? '⚠️  STAGING (fermentfreude-staging)'
    : '🔴 PRODUCTION (fermentfreude)'

  console.log(`\n╔══════════════════════════════════════════════════════╗`)
  console.log(`║  FermentFreude Migration Runner`)
  console.log(`║  Target DB: ${targetLabel}`)
  console.log(`╚══════════════════════════════════════════════════════╝\n`)

  // Find all migration files: NNN-description.ts (not _*.ts)
  const files = fs
    .readdirSync(__dirname)
    .filter((f) => /^\d{3}-.*\.ts$/.test(f))
    .sort()

  if (files.length === 0) {
    console.log('No migration files found.')
    process.exit(0)
  }

  const completed = await getCompletedMigrations(payload)
  const skipCompleted = !process.argv.includes('--all')

  let ran = 0
  let skipped = 0
  let failed = 0

  for (const file of files) {
    const name = file.replace(/\.ts$/, '')

    if (skipCompleted && completed.has(name)) {
      console.log(`  ✓ ${name} — already ran, skipping (use --all to force)`)
      skipped++
      continue
    }

    console.log(`\n▶ Running: ${name}`)

    try {
      const modulePath = pathToFileURL(path.join(__dirname, file)).href
      const mod = await import(modulePath) as { migrate?: (p: Payload) => Promise<void> }

      if (typeof mod.migrate !== 'function') {
        throw new Error(`Migration file "${file}" must export: export async function migrate(payload)`)
      }

      await mod.migrate(payload)
      await markMigrationComplete(payload, name)
      console.log(`  ✅ ${name} — done`)
      ran++
    } catch (err) {
      console.error(`  ❌ ${name} — FAILED:`, err instanceof Error ? err.message : err)
      console.error('\nMigration stopped. Fix the error above and re-run.')
      failed++
      process.exit(1)
    }
  }

  console.log(`\n──────────────────────────────────────────────────────`)
  console.log(`Ran: ${ran}  |  Skipped: ${skipped}  |  Failed: ${failed}`)
  if (failed === 0) console.log('✅ All migrations complete.')
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
