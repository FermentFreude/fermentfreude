/**
 * Check what submenu data exists in BOTH production and staging databases
 */

import { MongoClient } from 'mongodb'

async function checkBothDatabases() {
  const user = process.env.MONGODB_ATLAS_USERNAME
  const pass = process.env.MONGODB_ATLAS_PASSWORD
  const cluster = process.env.MONGODB_ATLAS_CLUSTER

  if (!user || !pass || !cluster) {
    console.error('Missing env: MONGODB_ATLAS_USERNAME, PASSWORD, CLUSTER')
    process.exit(1)
  }

  const baseUri = `mongodb+srv://${user}:${pass}@${cluster}.mongodb.net`

  const dbs = [
    { name: 'STAGING (fermentfreude-staging)', uri: `${baseUri}/fermentfreude-staging?retryWrites=true&w=majority` },
    { name: 'PRODUCTION (fermentfreude)', uri: `${baseUri}/fermentfreude?retryWrites=true&w=majority` },
  ]

  for (const dbInfo of dbs) {
    console.log(`\n${'='.repeat(70)}`)
    console.log(`📊 ${dbInfo.name}`)
    console.log('='.repeat(70))

    const client = new MongoClient(dbInfo.uri)
    try {
      await client.connect()
      const db = client.db()
      const header = await db.collection('globals').findOne({ globalType: 'header' })

      if (!header) {
        console.log('❌ No header found')
        continue
      }

      const workshops = header.navItems?.[4]
      if (!workshops) {
        console.log('❌ No Workshops item')
        continue
      }

      console.log(`✅ Workshops item found`)
      console.log(`   Label: ${workshops.link?.label}`)

      const firstDropdown = workshops.dropdownItems?.[0]
      if (!firstDropdown) {
        console.log(`❌ No dropdown items`)
        continue
      }

      console.log(`\n📌 First dropdown: "${firstDropdown.label}"`)
      console.log(`   Submenu count: ${firstDropdown.submenu?.length || 0}`)

      if (firstDropdown.submenu && firstDropdown.submenu.length > 0) {
        console.log(`\n✅ SUBMENUS PRESENT:`)
        firstDropdown.submenu.forEach((sub: any, i: number) => {
          console.log(`   [${i}] ${sub.label}`)
        })
      } else {
        console.log(`\n❌ NO SUBMENU ITEMS`)
      }
    } catch (error) {
      console.error(`❌ Error:`, (error as any).message)
    } finally {
      await client.close()
    }
  }

  console.log(`\n${'='.repeat(70)}\n`)
}

checkBothDatabases()
