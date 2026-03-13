import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

const COURSE_SLUGS = ['basic-fermentation'] as const

function toLessonIds(
  raw: Array<{ lessonId?: string | null }> | null | undefined,
): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => (item && typeof item.lessonId === 'string' ? item.lessonId : null))
    .filter(Boolean) as string[]
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> },
) {
  try {
    const { courseSlug } = await params
    if (!COURSE_SLUGS.includes(courseSlug as (typeof COURSE_SLUGS)[number])) {
      return NextResponse.json(
        { success: false, error: 'Unknown course' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Login required' },
        { status: 401 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const lessonId =
      typeof body?.lessonId === 'string' ? body.lessonId.trim() : null
    if (!lessonId) {
      return NextResponse.json(
        { success: false, error: 'lessonId required' },
        { status: 400 },
      )
    }

    const existing = await payload.find({
      collection: 'course-progress',
      where: {
        and: [
          { user: { equals: user.id } },
          { courseSlug: { equals: courseSlug } },
        ],
      },
      limit: 1,
      user,
    })

    const existingIds = toLessonIds(
      existing.docs[0]?.completedLessonIds as Array<{ lessonId?: string }> | undefined,
    )
    if (existingIds.includes(lessonId)) {
      return NextResponse.json({
        success: true,
        completedLessonIds: existingIds,
      })
    }

    const newIds = [...existingIds, lessonId]
    const newCompleted = newIds.map((id) => ({ lessonId: id }))

    if (existing.docs[0]) {
      await payload.update({
        collection: 'course-progress',
        id: existing.docs[0].id,
        data: { completedLessonIds: newCompleted },
        user,
      })
    } else {
      await payload.create({
        collection: 'course-progress',
        data: {
          user: user.id,
          courseSlug,
          completedLessonIds: newCompleted,
        },
        user,
      })
    }

    return NextResponse.json({
      success: true,
      completedLessonIds: newIds,
    })
  } catch (err) {
    console.error('Course progress update error:', err)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> },
) {
  try {
    const { courseSlug } = await params
    if (!COURSE_SLUGS.includes(courseSlug as (typeof COURSE_SLUGS)[number])) {
      return NextResponse.json(
        { success: false, error: 'Unknown course' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json({
        success: true,
        completedLessonIds: [],
      })
    }

    const result = await payload.find({
      collection: 'course-progress',
      where: {
        and: [
          { user: { equals: user.id } },
          { courseSlug: { equals: courseSlug } },
        ],
      },
      limit: 1,
      user,
    })

    const completedLessonIds = toLessonIds(
      result.docs[0]?.completedLessonIds as Array<{ lessonId?: string }> | undefined,
    )
    return NextResponse.json({
      success: true,
      completedLessonIds,
    })
  } catch (err) {
    console.error('Course progress fetch error:', err)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    )
  }
}
