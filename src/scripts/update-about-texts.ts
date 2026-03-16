import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    limit: 1,
    depth: 2,
    locale: 'de',
  })

  const doc = existing.docs[0]
  if (!doc) {
    console.error('About page not found')
    return
  }

  const updatedLayout = (doc.layout || []).map((block: any) => {
    if (block.blockType === 'teamCards') {
      return {
        ...block,
        label: 'Unser Team',
        heading: 'Lernen Sie die Experten hinter FermentFreude kennen',
      }
    }

    if (block.blockType === 'ourStory') {
      return {
        ...block,
        label: 'Unsere Geschichte',
        heading: 'Unsere Geschichte',
        subheading: 'Freude an der Fermentation',
      }
    }

    return block
  })

  await payload.update({
    collection: 'pages',
    id: doc.id,
    locale: 'de',
    data: {
      layout: updatedLayout,
    },
    context: {
      skipRevalidate: true,
      disableRevalidate: true,
      skipAutoTranslate: true,
    },
  })

  console.log('✅ Updated About page DE layout texts.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

