import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  try {
    const { email, courseSlug, courseTitle, locale } = await request.json()

    if (!email || !courseSlug || !courseTitle) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const config = await configPromise
    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: 'waitlists',
      where: {
        and: [
          { email: { equals: email } },
          { courseSlug: { equals: courseSlug } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'waitlists',
        data: {
          email,
          courseSlug,
          courseTitle,
          locale,
          status: 'pending',
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error creating waitlist entry', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

