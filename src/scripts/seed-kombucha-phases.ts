/**
 * Seed the WorkshopPhases block for the kombucha page layout.
 *
 * This block replaces the old "experienceCards" from workshopDetailFields.
 * It's now a standalone, reusable block that can be added to any workshop page.
 *
 * Handles bilingual seeding (DE + EN) with proper ID reuse pattern.
 *
 * Run:  pnpm seed kombucha-phases
 *       pnpm seed kombucha-phases --force   (overwrite existing layout)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const isForce = process.argv.includes('--force')

// ═══════════════════════════════════════════════════════════════
//  DE — German seed data for Kombucha Phases
// ═══════════════════════════════════════════════════════════════

const phasesDE = [
  {
    label: 'THEORIE',
    title: 'Kombucha-Mikrobiologie',
    description:
      'Entdecke die Wissenschaft hinter Kombucha. Lerne, wie Bakterien und Hefen zusammenarbeiten, warum eine SCOBY so wertvoll ist, und welche Vorteile probiotische Getränke bieten.',
    image: null,
  },
  {
    label: 'PRAXIS',
    title: 'Dein Kombucha brauen',
    description:
      'Unter fachkundiger Anleitung stellst du deine erste Charge Kombucha her. Mit einer frischen SCOBY und hochwertigen Zutaten kreierst du einen lebendigen Ferment zum Mitnehmen.',
    image: null,
  },
  {
    label: 'GESCHMACK',
    title: 'Kreative Variationen',
    description:
      'Erkunde unzählige Geschmackskombinationen — von fruchtigen Varianten bis zu würzigen Experimenten. Verkoste verschiedene Variationen und finde deine Lieblingskombination.',
    image: null,
  },
]

const blockDE = {
  blockType: 'workshopPhases' as const,
  eyebrow: 'WAS DICH ERWARTET',
  heading: 'Dein Workshop-Erlebnis',
  phases: phasesDE,
}

// ═══════════════════════════════════════════════════════════════
//  EN — English seed data for Kombucha Phases
// ═══════════════════════════════════════════════════════════════

const phasesEN = [
  {
    label: 'THEORY',
    title: 'Kombucha Microbiology',
    description:
      'Discover the science behind kombucha. Learn how bacteria and yeasts work together, why a SCOBY is so valuable, and what benefits probiotic drinks offer.',
    image: null,
  },
  {
    label: 'PRACTICE',
    title: 'Brew Your Kombucha',
    description:
      "Under expert guidance, brew your first batch of kombucha. With a fresh SCOBY and quality ingredients, you'll create a living ferment to take home.",
    image: null,
  },
  {
    label: 'FLAVOR',
    title: 'Creative Variations',
    description:
      'Explore endless flavor possibilities — from fruity variations to spicy experiments. Taste different options and discover your favorite combination.',
    image: null,
  },
]

const blockEN = {
  blockType: 'workshopPhases' as const,
  eyebrow: 'WHAT TO EXPECT',
  heading: 'Your Workshop Experience',
  phases: phasesEN,
}

// ═══════════════════════════════════════════════════════════════
//  MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════

async function seedKombuchaPhases() {
  try {
    const payload = await getPayload({ config })

    const pageSlug = 'kombucha'

    // Find the page
    const pageResult = await payload.find({
      collection: 'pages',
      where: { slug: { equals: pageSlug } },
      limit: 1,
      depth: 0,
      locale: 'de',
    })

    if (!pageResult.docs || pageResult.docs.length === 0) {
      payload.logger.error(`❌ Page "${pageSlug}" not found.`)
      process.exit(1)
    }

    const page = pageResult.docs[0]
    const pageId = page.id as string

    console.log(`\n🌱 Seeding: kombucha-phases\n`)
    console.log(`── Kombucha Workshop Phases Block ──\n`)

    // STEP 1: Read current layout and find/update the workshopPhases block for DE
    console.log(`[${new Date().toLocaleTimeString()}] Reading current layout (DE)...`)
    const dePageFull = await payload.findByID({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      depth: 0,
    })

    const deLayout = dePageFull.layout || []

    // Find existing workshopPhases block or create position for it
    const existingBlockIdx = deLayout.findIndex((b) => {
      const block = b as { blockType: string }
      return block.blockType === 'workshopPhases'
    })

    if (!isForce && existingBlockIdx !== -1) {
      console.log(`✨ WorkshopPhases block already exists. Skipping (use --force to overwrite).\n`)
      process.exit(0)
    }

    // If updating, replace the block; otherwise add it
    const updatedLayout = [...deLayout]
    if (existingBlockIdx !== -1) {
      updatedLayout[existingBlockIdx] = blockDE
      console.log(`[${new Date().toLocaleTimeString()}] Updating existing WorkshopPhases block...`)
    } else {
      updatedLayout.push(blockDE)
      console.log(
        `[${new Date().toLocaleTimeString()}] Adding new WorkshopPhases block to layout...`,
      )
    }

    // STEP 2: Save German layout
    console.log(`[${new Date().toLocaleTimeString()}] Seeding "${pageSlug}" layout (DE)...`)
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      data: { layout: updatedLayout },
      context: ctx,
    })

    // STEP 3: Read back and capture any generated IDs
    console.log(
      `[${new Date().toLocaleTimeString()}] Reading saved German layout to capture generated IDs...`,
    )
    const dePageUpdated = await payload.findByID({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      depth: 0,
    })

    const dePhasesBlock = dePageUpdated.layout?.find((b) => {
      const block = b as { blockType: string }
      return block.blockType === 'workshopPhases'
    }) as { phases: Array<{ id?: string | null }> } | undefined
    const dePhasesWithIds = dePhasesBlock?.phases || []

    // STEP 4: Build EN block with same IDs
    const enPhases = blockEN.phases.map((en, i) => ({
      ...en,
      id: dePhasesWithIds[i]?.id,
    }))

    const blockENWithIds = {
      ...blockEN,
      phases: enPhases,
    }

    // STEP 5: Build full EN layout with updated block
    const enPageFull = await payload.findByID({
      collection: 'pages',
      id: pageId,
      locale: 'en',
      depth: 0,
    })

    const enLayout = enPageFull.layout || []
    const enExistingBlockIdx = enLayout.findIndex((b) => {
      const block = b as { blockType: string }
      return block.blockType === 'workshopPhases'
    })

    const enUpdatedLayout = [...enLayout]
    if (enExistingBlockIdx !== -1) {
      enUpdatedLayout[enExistingBlockIdx] = blockENWithIds
    } else {
      enUpdatedLayout.push(blockENWithIds)
    }

    // STEP 6: Save English layout
    console.log(`[${new Date().toLocaleTimeString()}] Seeding "${pageSlug}" layout (EN)...`)
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'en',
      data: { layout: enUpdatedLayout },
      context: ctx,
    })

    payload.logger.info(`✅ German WorkshopPhases block seeded for "${pageSlug}".`)
    payload.logger.info(`✅ English WorkshopPhases block seeded for "${pageSlug}".`)
    console.log(`\n✨ Successfully seeded "${pageSlug}" WorkshopPhases block in both languages!`)
    process.exit(0)
  } catch (error) {
    console.error(`❌ Error seeding WorkshopPhases:`, error)
    process.exit(1)
  }
}

seedKombuchaPhases()
