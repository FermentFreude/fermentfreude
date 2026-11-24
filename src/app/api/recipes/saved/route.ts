import { mergeSaved, parseSavedInput } from '@/lib/savedRecipes'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  /api/recipes/saved — the ♥ list of the LOGGED-IN customer
 *
 *  GET  → { slugs }            (published recipes only, newest first)
 *  POST { add?, remove? } → { slugs }   (slugs; also used to move the
 *       hearts saved on the device into the account after login)
 *
 *  Only ever touches the caller's own user (from the session cookie);
 *  401 without login. Guests keep their hearts in the browser.
 * ═══════════════════════════════════════════════════════════════ */

const noStore = { 'Cache-Control': 'private, no-store' }

type Payload = Awaited<ReturnType<typeof getPayload>>

const idOf = (v: unknown) => (typeof v === 'object' && v !== null && 'id' in v ? String((v as { id: unknown }).id) : String(v))

async function publishedSlugs(payload: Payload, ids: string[]): Promise<string[]> {
  if (!ids.length) return []
  const { docs } = await payload.find({
    collection: 'recipes',
    where: { id: { in: ids }, _status: { equals: 'published' } },
    pagination: false,
    depth: 0,
    select: { slug: true },
  })
  const byId = new Map(docs.map((d) => [String(d.id), d.slug]))
  return ids.map((id) => byId.get(id)).filter((s): s is string => Boolean(s))
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.collection !== 'users') return NextResponse.json({ error: 'Not logged in' }, { status: 401, headers: noStore })

    const me = await payload.findByID({ collection: 'users', id: user.id, depth: 0, overrideAccess: true, select: { savedRecipes: true } })
    const slugs = await publishedSlugs(payload, (me.savedRecipes ?? []).map(idOf))
    return NextResponse.json({ slugs }, { headers: noStore })
  } catch (error) {
    console.error('[recipes/saved] GET failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: noStore })
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = parseSavedInput(await request.json().catch(() => null))
    if (!input) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStore })

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user || user.collection !== 'users') return NextResponse.json({ error: 'Not logged in' }, { status: 401, headers: noStore })

    // slugs → ids (published recipes only; unknown slugs are ignored)
    const wanted = [...input.add, ...input.remove]
    const { docs } = await payload.find({
      collection: 'recipes',
      where: { slug: { in: wanted }, _status: { equals: 'published' } },
      pagination: false,
      depth: 0,
      select: { slug: true },
    })
    const idBySlug = new Map(docs.map((d) => [d.slug, String(d.id)]))
    const add = input.add.map((s) => idBySlug.get(s)).filter((v): v is string => Boolean(v))
    const remove = input.remove.map((s) => idBySlug.get(s)).filter((v): v is string => Boolean(v))

    const me = await payload.findByID({ collection: 'users', id: user.id, depth: 0, overrideAccess: true, select: { savedRecipes: true } })
    const next = mergeSaved((me.savedRecipes ?? []).map(idOf), add, remove)

    // own user only, only this one field (the field itself is admin-only for the REST API)
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { savedRecipes: next },
      overrideAccess: true,
      depth: 0,
      context: { skipAutoTranslate: true },
    })

    return NextResponse.json({ slugs: await publishedSlugs(payload, next) }, { headers: noStore })
  } catch (error) {
    console.error('[recipes/saved] POST failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: noStore })
  }
}
