import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers.js'

export async function POST(request: NextRequest) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addressData = await request.json()

    const address = await payload.create({
      collection: 'addresses',
      data: {
        ...addressData,
        customer: user.id,
      },
      overrideAccess: false,
      user,
    })

    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
  }
}
