/**
 * Master seed script — seeds EVERYTHING in the correct order,
 * or a single page if you pass its name as an argument.
 *
 * Usage:
 *   pnpm seed              # Seeds everything
 *   pnpm seed header       # Seeds only the header
 *   pnpm seed home         # Seeds only the home page
 *   pnpm seed about        # Seeds only the about page
 *   pnpm seed contact      # Seeds only the contact page
 *   pnpm seed legal --force # Passes flags through to target seed script
 *
 * Order (when seeding all):
 *   1. Header (global — nav items)
 *   2. Home page (hero + workshop slider with images)
 *   3. About page (with images uploaded to Cloudflare R2)
 *   ...
 *   7. Kombucha workshop detail (hero, booking card, FAQ, how-to)
 *   8. Kombucha phases block (WorkshopPhases)
 *
 * Note: `kombucha` (legacy experienceCards) is registered but NOT in allOrder (superseded by kombucha-detail).
 *
 * Run manually: npx tsx src/scripts/seed-all.ts [target]
 */
import { spawnSync } from 'child_process'
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env file
config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const scripts: Record<string, { name: string; file: string }> = {
  backlog: { name: 'Backlog board (internal team tool)', file: 'seed-backlog.ts' },
  header: { name: 'Header (nav items)', file: 'seed-header.ts' },
  home: { name: 'Home (hero + workshop slider)', file: 'seed-home.ts' },
  about: { name: 'About page (with images)', file: 'seed-about.ts' },
  contact: { name: 'Contact page (with images)', file: 'seed-contact.ts' },
  presse: { name: 'Presse / Press page', file: 'seed-presse.ts' },
  'press-banner': {
    name: 'Home Press Banner (before partners)',
    file: 'seed-press-banner.ts',
  },
  help: { name: 'Help & FAQ page', file: 'seed-help.ts' },

  legal: { name: 'Legal pages (datenschutz, agb, impressum)', file: 'seed-legal-pages.ts' },
  voucher: { name: 'Voucher page (with images)', file: 'seed-voucher.ts' },
  kombucha: { name: 'Kombucha workshop (experienceCards)', file: 'seed-kombucha.ts' },
  'kombucha-detail': {
    name: 'Kombucha workshop detail (hero, booking, FAQ, how-to)',
    file: 'seed-kombucha-detail.ts',
  },
  'kombucha-phases': {
    name: 'Kombucha phases block (WorkshopPhases)',
    file: 'seed-kombucha-phases.ts',
  },
}

const allOrder = [
  'header',
  'home',
  'about',
  'contact',
  'presse',
  'press-banner',
  'help',
  'legal',
  'voucher',
  'kombucha-detail',
  'kombucha-phases',
]

function runSeed(key: string, extraArgs: string[] = []): boolean {
  const script = scripts[key]
  if (!script) {
    console.error(`❌ Unknown seed target: "${key}"`)
    console.error(`   Available: ${Object.keys(scripts).join(', ')}`)
    return false
  }

  const scriptPath = path.resolve(__dirname, script.file)
  console.log(`\n── ${script.name} ──`)

  const result = spawnSync('npx', ['tsx', scriptPath, ...extraArgs], {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd(),
    // Keep shell:false so paths with spaces (e.g. "new ferment") are not re-split.
    shell: false,
  })

  if (result.status !== 0) {
    console.error(`❌ ${script.name} failed (exit code ${result.status}).`)
    return false
  }

  console.log(`✅ ${script.name} done`)
  return true
}

const target = process.argv[2]?.toLowerCase()
const extraArgs = process.argv.slice(3)

if (target) {
  console.log(`🌱 Seeding: ${target}`)
  const ok = runSeed(target, extraArgs)
  process.exit(ok ? 0 : 1)
} else {
  console.log('🌱 Seeding everything...')
  let allOk = true
  for (const key of allOrder) {
    if (!runSeed(key)) {
      allOk = false
      break
    }
  }
  console.log(
    allOk
      ? '\n🎉 All seeds complete! Check /admin to verify.'
      : '\n💥 Seeding stopped due to error.',
  )
  process.exit(allOk ? 0 : 1)
}
