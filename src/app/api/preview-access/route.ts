import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  const previewPassword = process.env.PREVIEW_PASSWORD

  if (!previewPassword) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  if (password === previewPassword) {
    const cookieStore = await cookies()
    cookieStore.set('preview-access', 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}
