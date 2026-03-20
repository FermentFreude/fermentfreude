import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET() {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await payload.find({
      collection: 'addresses',
      where: { customer: { equals: user.id } },
      depth: 0,
      limit: 0,
      pagination: false,
      overrideAccess: false,
      user,
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

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
