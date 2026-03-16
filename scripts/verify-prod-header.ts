/**
 * Check header submenus in production database using Payload Local API
 * Run with production DATABASE_URL
 */

import config from '@payload-config'
import { getPayload } from 'payload'

async function checkProductionHeader() {
  const payload = await getPayload({ config })

  console.log('\n' + '='.repeat(70))
  console.log('📊 PRODUCTION DATABASE (fermentfreude)')
  console.log('='.repeat(70))

  try {
    const header = await payload.findGlobal({
      slug: 'header',
      locale: 'de',
      depth: 3,
    })

    if (!header || !header.navItems) {
      console.log('❌ No header found or no navItems')
      process.exit(1)
    }

    const workshops = (header.navItems as any[])[4]
    if (!workshops) {
      console.log('❌ No Workshops item at index 4')
      process.exit(1)
    }

    console.log('✅ Header exists')
    console.log(`\n📌 Workshops nav item:`)
    console.log(`   Label: ${(workshops as any).link?.label}`)

    const dropdown = (workshops as any).dropdownItems?.[0]
    if (!dropdown) {
      console.log('❌ No dropdown items')
      process.exit(1)
    }

    console.log(`\n📌 First dropdown: "${(dropdown as any).label}"`)
    console.log(`   Submenu count: ${(dropdown as any).submenu?.length || 0}`)

    if ((dropdown as any).submenu && (dropdown as any).submenu.length > 0) {
      console.log(`\n✅ SUBMENUS FOUND:`)
      ;(dropdown as any).submenu.forEach((sub: any, i: number) => {
        console.log(`   [${i}] ${sub.label}`)
      })
    } else {
      console.log(`\n❌ NO SUBMENU ITEMS IN PRODUCTION DB`)
    }

    console.log('\n' + '='.repeat(70) + '\n')
  } catch (error) {
    console.error('❌ Error:', (error as any).message)
    process.exit(1)
  }

  process.exit(0)
}

checkProductionHeader()
