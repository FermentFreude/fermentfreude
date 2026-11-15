import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/**
 * Light count for the CMS sidebar badge: unread team notifications plus unread customer activity for the signed-in admin.
 * Same rule as the Management dashboard (`isUnread` in AttentionPanel). Read-only.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: req.headers })
    const u = user as { role?: string; roles?: string[] } | null
    const isAdmin = u?.role === 'admin' || u?.roles?.includes('admin') || (user as Record<string, unknown> | null)?.['admin'] === true
    if (!user || !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const me = String(user.id)
    const res = await payload.find({
      collection: 'attention-notes',
      where: { status: { equals: 'open' } },
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })
    let unread = 0
    for (const n of res.docs) {
      if (n.kind === 'ack') continue
      const messages = Array.isArray(n.messages) ? n.messages : []
      const involved = n.createdById === me || n.assignedTo === me || n.assignedTo === 'all'
      const seen =
        n.seenBy && typeof n.seenBy === 'object' && !Array.isArray(n.seenBy) ? Number((n.seenBy as Record<string, unknown>)[me] ?? 0) : 0
      const last = messages[messages.length - 1] as { byId?: string } | undefined
      if (involved && messages.length > seen && last?.byId !== me) unread++
    }
    // Unread customer activity (orders, vouchers, rebookings, refunds) counts too — it lives inside Notifications now.
    const activity = await payload.find({
      collection: 'activity-events',
      where: { readBy: { not_in: [user.id] } },
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })
    const refunds = await payload.count({
      collection: 'refund-requests',
      where: { status: { in: ['requested', 'acknowledged', 'processing'] } },
      overrideAccess: true,
    })
    return NextResponse.json({ unread: unread + activity.totalDocs, refunds: refunds.totalDocs })
  } catch (err) {
    console.error('[notification-count] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
