/**
 * Debug script: Compare Header data in BOTH MongoDB databases
 * Shows what's seeded in fermentfreude-staging vs fermentfreude (production)
 */

import { MongoClient } from 'mongodb'

async function debugHeaderInBothDbs() {
  const atlasUser = process.env.MONGODB_ATLAS_USERNAME
  const atlasPassword = process.env.MONGODB_ATLAS_PASSWORD
  const atlasCluster = process.env.MONGODB_ATLAS_CLUSTER

  if (!atlasUser || !atlasPassword || !atlasCluster) {
    console.error('❌ Missing env: MONGODB_ATLAS_USERNAME, MONGODB_ATLAS_PASSWORD, MONGODB_ATLAS_CLUSTER')
    process.exit(1)
  }

  const baseUri = `mongodb+srv://${atlasUser}:${atlasPassword}@${atlasCluster}.mongodb.net`

  // Query both databases
  const databases = [
    { name: 'fermentfreude-staging (LOCAL DEV)', uri: `${baseUri}/fermentfreude-staging?retryWrites=true&w=majority` },
    { name: 'fermentfreude (PRODUCTION)', uri: `${baseUri}/fermentfreude?retryWrites=true&w=majority` },
  ]

  for (const dbConfig of databases) {
    console.log(`\n${'='.repeat(70)}`)
    console.log(`📊 DATABASE: ${dbConfig.name}`)
    console.log('='.repeat(70))

    const client = new MongoClient(dbConfig.uri)
    try {
      await client.connect()
      const db = client.db()
      const globalsCollection = db.collection('globals')

      // Find the header global
      const header = await globalsCollection.findOne({ globalType: 'header' })

      if (!header) {
        console.log('❌ No Header found in this database')
        continue
      }

      console.log('\n✅ Header exists\n')

      // Check DE locale
      const deNavItems = header.navItems || []
      console.log(`📌 DE LOCALE (German):`)
      console.log(`   Nav items count: ${deNavItems.length}`)

      const deWorkshopsDropdown = deNavItems[4]?.dropdownItems?.find(
        (dd: any) => dd.label === 'Alle Workshops' || dd.label === 'View All Workshops',
      )

      if (deWorkshopsDropdown?.submenu) {
        console.log(`   Workshops submenu items: ${deWorkshopsDropdown.submenu.length}`)
        deWorkshopsDropdown.submenu.forEach((sub: any, i: number) => {
          console.log(`     [${i}] label: "${sub.label}" → ${sub.href}`)
        })
      } else {
        console.log('   ❌ No submenu items found')
      }

      // Check EN locale
      const enNavItems = header['navItems:en'] || []
      console.log(`\n📌 EN LOCALE (English):`)
      console.log(`   Nav items count: ${enNavItems.length}`)

      const enWorkshopsDropdown = enNavItems[4]?.dropdownItems?.find(
        (dd: any) => dd.label === 'Alle Workshops' || dd.label === 'View All Workshops',
      )

      if (enWorkshopsDropdown?.submenu) {
        console.log(`   Workshops submenu items: ${enWorkshopsDropdown.submenu.length}`)
        enWorkshopsDropdown.submenu.forEach((sub: any, i: number) => {
          console.log(`     [${i}] label: "${sub.label}" → ${sub.href}`)
        })
      } else {
        console.log('   ❌ No submenu items found')
      }
    } catch (error) {
      console.error(`❌ Error querying ${dbConfig.name}:`, error)
    } finally {
      await client.close()
    }
  }

  console.log(`\n${'='.repeat(70)}`)
  console.log('✅ Debug complete\n')
}

debugHeaderInBothDbs()
