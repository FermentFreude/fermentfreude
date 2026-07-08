import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const BASE = 'https://vercel.com/api/v1/web/insights'

async function vercel(endpoint: string, from: number, to: number) {
  const token = process.env.VERCEL_ACCESS_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token || !projectId) return null

  const params = new URLSearchParams({
    projectId,
    from: String(from),
    to: String(to),
    environment: 'production',
    filter: '{}',
    limit: '10',
  })
  if (teamId) params.set('teamId', teamId)

  try {
    const res = await fetch(`${BASE}/${endpoint}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function GET() {
  // Admin-only
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || (user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const configured = !!(process.env.VERCEL_ACCESS_TOKEN && process.env.VERCEL_PROJECT_ID)
  if (!configured) {
    return NextResponse.json({ configured: false })
  }

  const now = Date.now()
  const from30 = now - 30 * 24 * 60 * 60 * 1000

  // Parallel reads — these are GET requests, not MongoDB mutations
  const [stats, referrers, pages, countries, devices, visitors] = await Promise.all([
    vercel('stats', from30, now),
    vercel('referrer', from30, now),
    vercel('page', from30, now),
    vercel('country', from30, now),
    vercel('device', from30, now),
    vercel('visitors', from30, now),
  ])

  return NextResponse.json({ configured: true, stats, referrers, pages, countries, devices, visitors })
}
