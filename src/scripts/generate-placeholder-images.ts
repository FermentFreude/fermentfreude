/**
 * Generates placeholder images for seed scripts.
 * Run before `pnpm seed` if you don't have real seed-assets.
 *
 * - Copies existing assets from public/ where available
 * - Uses sharp to generate placeholder PNGs for missing images
 *
 * Run: pnpm seed:placeholders
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = process.cwd()
const SEED_ASSETS = path.join(ROOT, 'seed-assets')
const PUBLIC = path.join(ROOT, 'public')

/** Placeholder PNGs to generate (path relative to seed-assets, width x height) */
const PLACEHOLDERS: Array<{ file: string; width: number; height: number; color?: string }> = [
  // Workshops (media/workshops + images/ for seed-home compatibility)
  { file: 'media/workshops/lakto.png', width: 800, height: 600 },
  { file: 'images/lakto.png', width: 800, height: 600 },
  { file: 'images/lakto1.png', width: 800, height: 600 },
  { file: 'images/kombucha.png', width: 800, height: 600 },
  { file: 'images/kombucha1.png', width: 800, height: 600 },
  { file: 'images/tempeh.png', width: 800, height: 600 },
  { file: 'images/tempeh1.png', width: 800, height: 600 },
  { file: 'media/workshops/kombucha.png', width: 800, height: 600 },
  { file: 'media/workshops/tempeh.png', width: 800, height: 600 },
  // Hero slides
  { file: 'media/hero/hero-slide-1.png', width: 1200, height: 800 },
  { file: 'media/hero/hero-slide-2.png', width: 1200, height: 800 },
  { file: 'media/hero/hero-slide-3.png', width: 1200, height: 800 },
  { file: 'media/hero/hero-slide-4.png', width: 1200, height: 800 },
  { file: 'media/hero/lakto1.png', width: 800, height: 600 },
  { file: 'media/hero/lakto2.png', width: 800, height: 600 },
  { file: 'media/hero/kombucha1.png', width: 800, height: 600 },
  { file: 'media/hero/kombucha2.png', width: 800, height: 600 },
  { file: 'media/hero/tempeh1.png', width: 800, height: 600 },
  { file: 'media/hero/tempeh2.png', width: 800, height: 600 },
  { file: 'media/hero/DavidHeroCopy.png', width: 800, height: 600 },
  { file: 'media/hero/MarcelHero.png', width: 800, height: 600 },
  // Gallery
  { file: 'images/gallery/gallery-1.png', width: 800, height: 600 },
  { file: 'images/gallery/gallery-2.png', width: 800, height: 600 },
  { file: 'images/gallery/gallery-3.png', width: 800, height: 600 },
  { file: 'images/gallery/gallery-4.png', width: 800, height: 600 },
  { file: 'images/gallery/gallery-5.png', width: 800, height: 600 },
  { file: 'images/gallery/gallery-6.png', width: 800, height: 600 },
  { file: 'images/gallery/gallery-7.png', width: 800, height: 600 },
  { file: 'images/gallery/gallery-8.png', width: 800, height: 600 },
  // Shared images
  { file: 'images/Banner.png', width: 1920, height: 1080 },
  { file: 'images/david-heider.jpg', width: 600, height: 800 },
  { file: 'images/marcel-rauminger.jpg', width: 600, height: 800 },
  { file: 'images/sponsor-logo.png', width: 200, height: 80 },
  { file: 'images/sponsor-logo-2.png', width: 200, height: 80 },
  { file: 'images/sponsor-logo-3.png', width: 200, height: 80 },
  { file: 'images/sponsor-logo-4.png', width: 200, height: 80 },
  // Contact
  { file: 'images/contact-form.png', width: 800, height: 600 },
  { file: 'images/workshop-slider.png', width: 800, height: 600 },
  { file: 'images/workshop-kombucha.png', width: 800, height: 600 },
  { file: 'images/company-b2b.png', width: 800, height: 600 },
  // Gastronomy
  { file: 'images/gastronomy-slide-fermentation-jars.png', width: 800, height: 600 },
  { file: 'images/gastronomy-slide-flatlay-fermentation.png', width: 800, height: 600 },
  { file: 'images/gastronomy-slide-01-cutting-board.png', width: 800, height: 600 },
  { file: 'images/gastronomy-cutting-board-fermentation.png', width: 800, height: 600 },
  { file: 'images/gastronomy-slide-professional-training.png', width: 800, height: 600 },
  { file: 'images/gastronomy-slide-menu-development.png', width: 800, height: 600 },
  { file: 'images/gastronomy-slide-corporate-events.png', width: 800, height: 600 },
  // Fermentation (reuses gastronomy images)
  { file: 'images/gastronomy/gastronomy-cutting-board-fermentation.png', width: 800, height: 600 },
  { file: 'images/gastronomy/gastronomy-slide-fermentation-jars.png', width: 800, height: 600 },
  { file: 'images/gastronomy/gastronomy-slide-flatlay-fermentation.png', width: 800, height: 600 },
  { file: 'images/gastronomy/gastronomy-slide-01-cutting-board.png', width: 800, height: 600 },
  { file: 'images/gastronomy/gastronomy-slide-professional-training.png', width: 800, height: 600 },
  // Voucher
  { file: 'images/Image (Gift Set).png', width: 800, height: 600 },
  { file: 'images/Geburtstage.png', width: 400, height: 400 },
  { file: 'images/hochzeit.png', width: 400, height: 400 },
  { file: 'images/Team_Events.png', width: 400, height: 400 },
  { file: 'images/Weihnachten.png', width: 400, height: 400 },
]

/** Copy from public if exists */
const COPY_MAP: Array<{ from: string; to: string }> = [
  { from: 'icon-logo.svg', to: 'images/submark.svg' },
  { from: 'assets/images/feature-probiotics.svg', to: 'images/icons/probiotics.svg' },
  { from: 'assets/images/feature-nutrients.svg', to: 'images/icons/nutrients.svg' },
  { from: 'assets/images/feature-taste.svg', to: 'images/icons/taste.svg' },
  // Gastronomy images are in seed-assets/ (not public/) — copy from there
];

/** Copy from seed-assets if exists */
const SEED_COPY_MAP: Array<{ from: string; to: string }> = [
  { from: 'images/gastronomy/gastronomy-slide-01-cutting-board.png', to: 'images/gastronomy-slide-01-cutting-board.png' },
  { from: 'images/gastronomy/gastronomy-slide-fermentation-jars.png', to: 'images/gastronomy-slide-fermentation-jars.png' },
  { from: 'images/gastronomy/gastronomy-slide-flatlay-fermentation.png', to: 'images/gastronomy-slide-flatlay-fermentation.png' },
  { from: 'images/gastronomy/gastronomy-cutting-board-fermentation.png', to: 'images/gastronomy-cutting-board-fermentation.png' },
  { from: 'images/gastronomy/gastronomy-slide-professional-training.png', to: 'images/gastronomy-slide-professional-training.png' },
  { from: 'images/gastronomy/gastronomy-slide-menu-development.png', to: 'images/gastronomy-slide-menu-development.png' },
  { from: 'images/gastronomy/gastronomy-slide-corporate-events.png', to: 'images/gastronomy-slide-corporate-events.png' },
]

async function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true })
}

async function generatePlaceholder(
  filePath: string,
  width: number,
  height: number,
  isJpeg = false,
): Promise<void> {
  const fullPath = path.join(SEED_ASSETS, filePath)
  if (fs.existsSync(fullPath)) {
    console.log(`  ⏭️  ${filePath} (exists)`)
    return
  }
  await ensureDir(path.dirname(fullPath))

  const bg = Buffer.from(
    `<svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#ECE5DE"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#8a8a8a" text-anchor="middle" dy=".3em">${path.basename(filePath)}</text>
    </svg>`,
  )

  let pipeline = sharp(bg)
  if (isJpeg) {
    pipeline = pipeline.jpeg({ quality: 80 })
  } else {
    pipeline = pipeline.png()
  }
  await pipeline.toFile(fullPath)
  console.log(`  ✅ ${filePath}`)
}

async function main() {
  console.log('🖼️  Generating seed-assets placeholders…\n')

  await ensureDir(SEED_ASSETS)

  // Copy from public
  for (const { from, to } of COPY_MAP) {
    const src = path.join(PUBLIC, from)
    const dest = path.join(SEED_ASSETS, to)
    if (fs.existsSync(src)) {
      await ensureDir(path.dirname(dest))
      fs.copyFileSync(src, dest)
      console.log(`  📋 ${to} (from public)`)
    }
  }

  // Copy from seed-assets (gastronomy images moved out of public/)
  for (const { from, to } of SEED_COPY_MAP) {
    const src = path.join(SEED_ASSETS, from)
    const dest = path.join(SEED_ASSETS, to)
    if (fs.existsSync(src)) {
      await ensureDir(path.dirname(dest))
      fs.copyFileSync(src, dest)
      console.log(`  📋 ${to} (from seed-assets)`)
    }
  }

  // Generate placeholders
  for (const { file, width, height } of PLACEHOLDERS) {
    const isJpeg = file.endsWith('.jpg')
    await generatePlaceholder(file, width, height, isJpeg)
  }

  console.log('\n✅ Placeholder images ready. Run: pnpm seed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
