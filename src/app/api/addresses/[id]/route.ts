import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers.js'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    const updated = await payload.update({
      collection: 'addresses',
      id,
      data,
      overrideAccess: false,
      user,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await payload.delete({
      collection: 'addresses',
      id,
      overrideAccess: false,
      user,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}
