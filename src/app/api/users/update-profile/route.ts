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

    const { name, email } = await request.json()

    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      },
      overrideAccess: false,
      user,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
