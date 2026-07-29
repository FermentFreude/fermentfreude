import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/revalidate-global?slug=<global-slug>
 *
 *  Manual escape hatch for any global's cache (see getCachedGlobal in
 *  src/utilities/getGlobals.ts) — covers every global, not just Header.
 *  Normally unnecessary: saving a global through /admin already revalidates
 *  it instantly via revalidateGlobal.ts. This exists for the case that
 *  hook can't cover — a global edited by a seed script (no live Next.js
 *  request context, so the tag-based revalidation silently no-ops) stays
 *  cached until the 5-minute safety-net expiry in getCachedGlobal. Hit
 *  this to clear it immediately instead of waiting.
 * ═══════════════════════════════════════════════════════════════ */

const KNOWN_GLOBAL_SLUGS = [
  'header',
  'footer',
  'business-info',
  'invoice-counter',
  'testimonials-global',
  'product-detail-labels-global',
  'product-slider-global',
  'sponsors-bar-global',
  'workshop-slider-global',
  'workshop-cards-global',
  'voucher-cta-global',
] as const

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')

  if (!slug) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Missing "slug" query param. Known globals: ${KNOWN_GLOBAL_SLUGS.join(', ')}`,
      },
      { status: 400 },
    )
  }

  if (!KNOWN_GLOBAL_SLUGS.includes(slug as (typeof KNOWN_GLOBAL_SLUGS)[number])) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Unknown global slug "${slug}". Known globals: ${KNOWN_GLOBAL_SLUGS.join(', ')}`,
      },
      { status: 400 },
    )
  }

  revalidateTag(`global_${slug}`)

  return NextResponse.json({
    status: 'ok',
    message: `Cache revalidated for global "${slug}"`,
    revalidated: true,
  })
}
