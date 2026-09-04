import { revalidateTag } from 'next/cache'

/* ═══════════════════════════════════════════════════════════════
 *  GET /api/revalidate-pages
 *
 *  Manual escape hatch for the 'pages' cache tag (see getCachedPage in
 *  [slug]/page.tsx, used by /shop for its layout blocks). Mirrors
 *  revalidate-header/revalidate-global's pattern for the same reason:
 *  a Pages document edited by a standalone script (no live Next.js
 *  request context) never actually fires revalidateTag, since that only
 *  works inside a real request — the write succeeds but stays cached
 *  until this is hit, or the tag's own revalidate window naturally expires.
 * ═══════════════════════════════════════════════════════════════ */

export async function GET() {
  revalidateTag('pages')

  return Response.json({
    status: 'ok',
    message: 'Pages cache revalidated',
    revalidated: true,
  })
}
