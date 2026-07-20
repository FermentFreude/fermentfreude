/**
 * Resolve FeldInsGlas images from Media (read-only).
 */

import type { Media } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function findByAlt(
  payload: Awaited<ReturnType<typeof getPayload>>,
  altFragment: string,
): Promise<Media | null> {
  const result = await payload.find({
    collection: 'media',
    where: { alt: { contains: altFragment } },
    limit: 1,
    depth: 0,
  })
  return (result.docs[0] as Media | undefined) ?? null
}

export type FeldInsGlasImages = {
  hero: Media | null
  hands: Media | null
  jars: Media | null
  konzept: Media | null
  feld: Media | null
  kueche: Media | null
  glas: Media | null
}

/** Read-only: for page render. Does not upload. */
export async function getFeldInsGlasImages(): Promise<FeldInsGlasImages> {
  const payload = await getPayload({ config: configPromise })
  const [heroWheat, hero, hands, jars, konzept, feld, kueche, glas] = await Promise.all([
    findByAlt(payload, 'feld-ins-glas-hero-wheat'),
    findByAlt(payload, 'feld-ins-glas-hero-v2'),
    findByAlt(payload, 'feld-ins-glas-hands-v2'),
    findByAlt(payload, 'feld-ins-glas-jars-v2'),
    findByAlt(payload, 'feld-ins-glas-konzept'),
    findByAlt(payload, 'feld-ins-glas-feld'),
    findByAlt(payload, 'feld-ins-glas-kueche'),
    findByAlt(payload, 'feld-ins-glas-glas'),
  ])

  return {
    hero:
      heroWheat ??
      hero ??
      (await findByAlt(payload, 'feld-ins-glas-hero')),
    hands: hands ?? (await findByAlt(payload, 'feld-ins-glas-produce')),
    jars: jars ?? (await findByAlt(payload, 'feld-ins-glas-ferment')),
    konzept: konzept ?? hands ?? (await findByAlt(payload, 'feld-ins-glas-produce')),
    feld: feld ?? hands ?? (await findByAlt(payload, 'feld-ins-glas-produce')),
    kueche: kueche ?? hands ?? (await findByAlt(payload, 'feld-ins-glas-produce')),
    glas: glas ?? jars ?? (await findByAlt(payload, 'feld-ins-glas-ferment')),
  }
}
