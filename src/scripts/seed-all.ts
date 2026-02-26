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
 *   pnpm seed gastronomy         # Seeds only the gastronomy page (Pages collection)
 *
 * Order (when seeding all):
 *   1. Header (global — nav items)
 *   2. Home page (hero + workshop slider with images)
 *   3. About page (with images uploaded to Cloudflare R2)
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
  header: { name: 'Header (nav items)', file: 'seed-header.ts' },
  products: { name: 'Products (kombucha bottles)', file: 'seed-products.ts' },
  home: { name: 'Home (hero + workshop slider)', file: 'seed-home.ts' },
  about: { name: 'About page (with images)', file: 'seed-about.ts' },
  contact: { name: 'Contact page (with images)', file: 'seed-contact.ts' },
  gastronomy: { name: 'Gastronomy page', file: 'seed-gastronomy.ts' },
  fermentation: { name: 'Fermentation page (with images)', file: 'seed-fermentation.ts' },
  voucher: { name: 'Voucher page (with images)', file: 'seed-voucher.ts' },
  shop: { name: 'Shop page (global)', file: 'seed-shop.ts' },
}

const allOrder = [
  'header',
  'products',
  'home',
  'about',
  'contact',
  'gastronomy',
  'fermentation',
  'voucher',
  'shop',
]

function runSeed(key: string): boolean {
  const script = scripts[key]
  if (!script) {
    console.error(`❌ Unknown seed target: "${key}"`)
    console.error(`   Available: ${Object.keys(scripts).join(', ')}`)
    return false
  }

  const scriptPath = path.resolve(__dirname, script.file)
  console.log(`\n── ${script.name} ──`)

  const args = process.argv.slice(2).filter((a) => a !== target)
  const seedEnv = { ...process.env }
  if (key === 'gastronomy') {
    seedEnv.PAYLOAD_SKIP_GASTRONOMY_CONDITION = '1'
  }
  if (key === 'fermentation') {
    seedEnv.PAYLOAD_SKIP_FERMENTATION_CONDITION = '1'
  }
  if (key === 'shop') {
    seedEnv.PAYLOAD_SKIP_SHOP_CONDITION = '1'
  }
  const result = spawnSync('npx', ['tsx', scriptPath, ...args], {
    stdio: 'inherit',
    env: seedEnv,
    cwd: process.cwd(),
    shell: true,
  })

  if (result.status !== 0) {
    console.error(`❌ ${script.name} failed (exit code ${result.status}).`)
    return false
  }

  console.log(`✅ ${script.name} done`)
  return true
}

const target = process.argv[2]?.toLowerCase()

if (target) {
  console.log(`🌱 Seeding: ${target}`)
  const ok = runSeed(target)
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
