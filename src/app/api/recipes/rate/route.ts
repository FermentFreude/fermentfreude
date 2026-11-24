import { clientIp, parseRatingInput, RATING_HOURLY_LIMIT, ratingHashes, summarize } from '@/lib/recipeRatings'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/recipes/rate  { slug, stars: 1–5 }
 *
 *  Public on purpose (anyone can rate), so it protects itself:
 *  - strict input check, only published recipes
 *  - one vote per person and recipe: voting again changes the vote
 *  - max. RATING_HOURLY_LIMIT votes per connection per hour
 *  - stores only salted hashes, never the IP
 *  Writes are sequential (MongoDB Atlas M0, no transactions).
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const input = parseRatingInput(await request.json().catch(() => null))
    if (!input) return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })

    const secret = process.env.PAYLOAD_SECRET
    if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'recipes',
      where: { slug: { equals: input.slug }, _status: { equals: 'published' } },
      limit: 1,
      depth: 0,
    })
    const recipe = docs[0]
    if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })

    const { voter, ipHash } = ratingHashes(
      secret,
      clientIp(request.headers),
      request.headers.get('user-agent')?.slice(0, 300) ?? '',
      String(recipe.id),
    )

    // hourly limit per connection (new and changed votes both count)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recent = await payload.count({
      collection: 'recipe-ratings',
      where: { ipHash: { equals: ipHash }, updatedAt: { greater_than: hourAgo } },
      overrideAccess: true,
    })
    if (recent.totalDocs >= RATING_HOURLY_LIMIT) {
      return NextResponse.json({ error: 'Too many ratings, please try again later' }, { status: 429 })
    }

    const existing = await payload.find({
      collection: 'recipe-ratings',
      where: { recipe: { equals: recipe.id }, voter: { equals: voter } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      await payload.update({
        collection: 'recipe-ratings',
        id: existing.docs[0].id,
        data: { stars: input.stars },
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'recipe-ratings',
        data: { recipe: recipe.id, stars: input.stars, voter, ipHash },
        overrideAccess: true,
      })
    }

    const all = await payload.find({
      collection: 'recipe-ratings',
      where: { recipe: { equals: recipe.id } },
      pagination: false,
      depth: 0,
      overrideAccess: true,
      select: { stars: true },
    })
    return NextResponse.json({ ok: true, ...summarize(all.docs.map((d) => d.stars)) })
  } catch (error) {
    console.error('[recipes/rate] failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
