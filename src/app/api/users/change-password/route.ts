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

    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      )
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { password: newPassword },
      overrideAccess: false,
      user,
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
