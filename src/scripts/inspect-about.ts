import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })

  const doc = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    limit: 1,
    depth: 1,
    locale: 'de',
  })

  console.log(
    JSON.stringify(
      {
        total: doc.totalDocs,
        id: doc.docs[0]?.id,
        title: doc.docs[0]?.title,
        hero: doc.docs[0]?.hero,
        layout: doc.docs[0]?.layout?.map((b: any) => ({
          id: b.id,
          blockType: b.blockType,
          label: (b as any).label,
          heading: (b as any).heading,
        })),
      },
      null,
      2,
    ),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

