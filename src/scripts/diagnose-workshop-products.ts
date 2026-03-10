/**
 * Diagnostic Script — Workshop Products & Cart System
 *
 * Checks:
 * 1. Does database connection work?
 * 2. Do workshop products exist?
 * 3. Are they published and have correct slugs?
 * 4. Do workshop appointments exist?
 * 5. Can API find products by slug?
 */

// Load .env file
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config } from 'dotenv'
config()

import payloadConfig from '@payload-config'
import { getPayload } from 'payload'

async function diagnose() {
  console.log('\n' + '═'.repeat(70))
  console.log('🔍 WORKSHOP PRODUCTS DIAGNOSTIC')
  console.log('═'.repeat(70) + '\n')

  try {
    const payload = await getPayload({ config: payloadConfig })
    console.log('✅ Database connection: OK\n')

    // 1. Check products
    console.log('📦 Checking Products Collection...')
    const allProducts = await payload.find({
      collection: 'products',
      limit: 1000,
    })
    console.log(`   Total products in database: ${allProducts.totalDocs}\n`)

    // 2. Check workshop products specifically
    const workshopProducts = await payload.find({
      collection: 'products',
      where: {
        slug: {
          like: 'workshop',
        },
      },
      limit: 100,
    })

    console.log(`📍 Workshop products found: ${workshopProducts.totalDocs}`)
    if (workshopProducts.docs.length === 0) {
      console.log('   ❌ NO WORKSHOP PRODUCTS FOUND!\n')
    } else {
      workshopProducts.docs.forEach((product) => {
        console.log(`   ✅ ${product.slug}`)
        console.log(`      ID: ${product.id}`)
        console.log(`      Title (DE): ${product.title}`)
        console.log(`      Price: €${product.priceInUSD}`)
        console.log(`      Status: ${(product as any)._status}`)
      })
    }
    console.log()

    // 3. Test each slug lookup (what the API does)
    console.log('🔎 Testing slug lookups (like the API does)...')
    const slugsToTest = ['workshop-kombucha', 'workshop-lakto', 'workshop-tempeh']

    for (const slug of slugsToTest) {
      try {
        const result = await payload.find({
          collection: 'products',
          where: { slug: { equals: slug } },
          limit: 1,
        })

        if (result.docs.length > 0) {
          console.log(`   ✅ "${slug}" found`)
          console.log(`      ID: ${result.docs[0].id}`)
        } else {
          console.log(`   ❌ "${slug}" NOT FOUND`)
        }
      } catch (error) {
        console.log(`   ❌ "${slug}" ERROR: ${error}`)
      }
    }
    console.log()

    // 4. Check workshop appointments
    console.log('📅 Checking Workshop Appointments...')
    const appointments = await payload.find({
      collection: 'workshop-appointments',
      limit: 100,
      depth: 1,
    })
    console.log(`   Total appointments: ${appointments.totalDocs}`)
    if (appointments.docs.length > 0) {
      console.log(`   Sample appointment:`)
      const apt = appointments.docs[0]
      console.log(
        `   - Workshop: ${typeof apt.workshop === 'object' ? apt.workshop.title : apt.workshop}`,
      )
      console.log(`   - Date: ${apt.dateTime}`)
      console.log(`   - Available Spots: ${apt.availableSpots}`)
      console.log(`   - Published: ${apt.isPublished}`)
    }
    console.log()

    // 5. Summary and recommendations
    console.log('📋 SUMMARY & RECOMMENDATIONS:')
    console.log('─────────────────────────────')

    if (workshopProducts.totalDocs === 0) {
      console.log('❌ PROBLEM: No workshop products found in database')
      console.log('   ACTION: Run: pnpm seed workshop-products')
    } else if (workshopProducts.totalDocs === 3) {
      console.log('✅ All 3 workshop products exist')
      console.log('   Kombucha, Lakto, Tempeh are in the database')

      // Check if all have IDs
      const allHaveIds = workshopProducts.docs.every((p) => p.id)
      if (allHaveIds) {
        console.log('✅ All products have valid IDs')
      } else {
        console.log('❌ Some products missing IDs - database corruption?')
      }
    } else {
      console.log(`⚠️  Found ${workshopProducts.totalDocs} workshop products (expected 3)`)
    }

    console.log()
    console.log('═'.repeat(70) + '\n')
  } catch (error) {
    console.error('❌ FATAL ERROR:', error)
    process.exit(1)
  }
}

diagnose()
