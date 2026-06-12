import { fetchRosterData } from '@/components/admin/roster/fetchRosterData'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({ headers: req.headers })
    const userAny = user as { role?: string; roles?: string[] } | null
    const isAdmin =
      userAny?.role === 'admin' ||
      userAny?.roles?.includes('admin') ||
      // Payload ecommerce plugin uses a top-level 'admin' field
      (user as Record<string, unknown> | null)?.['admin'] === true

    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await fetchRosterData()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[roster/route] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
