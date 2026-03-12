import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    const doc = await payload.findByID({
      collection: 'media',
      id,
      depth: 0,
    })

    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
    const r2Base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
    const d = doc as { url?: string | null; filename?: string | null }
    let url = typeof d.url === 'string' ? d.url : null
    if (!url && typeof d.filename === 'string' && d.filename) {
      const base = r2Base || baseUrl.replace(/\/$/, '')
      url = base ? `${base}/media/${d.filename}` : `/media/${d.filename}`
    }

    if (!url) {
      return NextResponse.json({ error: 'No URL' }, { status: 404 })
    }

    if (!url.startsWith('http') && baseUrl) {
      url = baseUrl + (url.startsWith('/') ? url : `/${url}`)
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Media URL error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
