/**
 * Master seed script — seeds EVERYTHING in the correct order,
 * or a single page if you pass its name as an argument.
 *
 * Usage:
 *   pnpm seed              # Seeds everything
 *   pnpm seed header       # Seeds only the header
 *   pnpm seed home         # Seeds only the home page
 *   pnpm seed about        # Seeds only the about page
 *
 * Order (when seeding all):
 *   1. Header (global — nav items)
 *   2. Home page (hero + workshop slider with images)
 *   3. About page (with images uploaded to Vercel Blob)
 *
 * Run manually: set -a && source .env && set +a && npx tsx src/scripts/seed-all.ts [target]
 */
import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const scripts: Record<string, { name: string; file: string }> = {
  header: { name: 'Header (nav items)', file: 'seed-header.ts' },
  home: { name: 'Home (hero + workshop slider)', file: 'seed-home.ts' },
  about: { name: 'About page (with images)', file: 'seed-about.ts' },
}

const allOrder = ['header', 'home', 'about']

function runSeed(key: string): boolean {
  const script = scripts[key]
  if (!script) {
    console.error(`❌ Unknown seed target: "${key}"`)
    console.error(`   Available: ${Object.keys(scripts).join(', ')}`)
    return false
  }

  const scriptPath = path.resolve(__dirname, script.file)
  console.log(`\n── ${script.name} ──`)

  const result = spawnSync('npx', ['tsx', scriptPath], {
    stdio: 'inherit',
    env: process.env,
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
  console.log(allOk ? '\n🎉 All seeds complete! Check /admin to verify.' : '\n💥 Seeding stopped due to error.')
  process.exit(allOk ? 0 : 1)
}
