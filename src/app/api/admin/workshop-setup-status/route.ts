import { getWorkshopSetupStatus } from '@/utilities/workshopProvisioning/getWorkshopSetupStatus'
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
      (user as Record<string, unknown> | null)?.['admin'] === true

    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workshopId = req.nextUrl.searchParams.get('workshopId')
    if (!workshopId) {
      return NextResponse.json({ error: 'Missing workshopId' }, { status: 400 })
    }

    const status = await getWorkshopSetupStatus(payload, workshopId)
    if (!status) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 })
    }

    return NextResponse.json(status)
  } catch (err) {
    console.error('[workshop-setup-status] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
