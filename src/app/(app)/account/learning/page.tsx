import configPromise from '@payload-config'
import { BookOpen, CheckCircle2, Play } from 'lucide-react'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Learning — FermentFreude',
  description: 'Your online courses and progress',
}

const KNOWN_COURSES = [
  {
    slug: 'basic-fermentation',
    href: '/courses/basic-fermentation',
    description: 'Master lacto-fermentation and vegetable ferments from the ground up.',
  },
]

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

export default async function MyLearningPage() {
  const headersObj = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: headersObj })

  if (!user) return null

  const locale = (await getLocale()) as 'de' | 'en'

  // Fetch all enrollment records for this user
  const enrollmentResult = await payload.find({
    collection: 'enrollments',
    where: { user: { equals: user.id } },
    limit: 20,
    overrideAccess: true,
  })

  // Map: courseSlug → true (enrolled)
  const enrolledSlugs = new Set(enrollmentResult.docs.map((e) => e.courseSlug))

  // Also fetch CourseProgress for lesson completion counts
  const progressResult = await payload.find({
    collection: 'course-progress',
    where: { user: { equals: user.id } },
    limit: 20,
    overrideAccess: false,
    user,
  })

  // Fetch course data from online-courses collection
  const courseResult = await payload.find({
    collection: 'online-courses',
    where: { courseSlug: { equals: 'basic-fermentation' } },
    locale,
    depth: 1,
    limit: 1,
  })
  const courseData = courseResult.docs[0] ?? null

  const heroTitle = courseData?.title ?? 'Basic Fermentation Course'
  const heroImage = isResolvedMedia(courseData?.heroImage) ? courseData.heroImage : null
  const totalLessons = (courseData?.modules ?? []).reduce(
    (acc, m) => acc + (m.lessons?.length ?? 0),
    0,
  )

  // Map: courseSlug → completedCount
  const progressBySlug = new Map(
    progressResult.docs.map((p) => [
      p.courseSlug,
      Array.isArray(p.completedLessonIds) ? p.completedLessonIds.length : 0,
    ]),
  )

  // Build enrolled list — courses where user has an Enrollment record
  const enrolled = KNOWN_COURSES.filter((c) => enrolledSlugs.has(c.slug)).map((c) => {
    const completed = progressBySlug.get(c.slug) ?? 0
    const total = c.slug === 'basic-fermentation' ? totalLessons : 0
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    const title = c.slug === 'basic-fermentation' ? heroTitle : c.slug
    const image = c.slug === 'basic-fermentation' ? heroImage : null
    return { ...c, title, image, completed, total, pct }
  })

  return (
    <div className="max-w-3xl space-y-10">
      {/* Header */}
      <div className="pb-8 border-b border-[#e8e4d9]">
        <p className="text-eyebrow font-bold text-ff-gold-accent mb-3">My Account</p>
        <h1 className="font-display text-[2rem] font-bold text-[#1a1a1a] tracking-tight leading-tight">
          My Learning
        </h1>
        <p className="mt-2 text-sm text-[#626160]">
          Your online courses and progress. Pick up where you left off.
        </p>
      </div>

      {enrolled.length === 0 ? (
        /* Empty state */
        <div className="bg-white border border-[#1a1a1a]/20 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f5f3f0] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-5 h-5 text-[#9e9189]" />
          </div>
          <p className="font-display font-semibold text-[#1a1a1a] text-base mb-1">No courses yet</p>
          <p className="text-sm text-[#626160] mb-6 max-w-xs mx-auto">
            Purchase an online course to access it here and track your progress.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {enrolled.map((course) => (
            <div
              key={course.slug}
              className="bg-white border border-[#1a1a1a]/20 rounded-xl overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="sm:w-52 h-44 sm:h-auto bg-[#ece5de] shrink-0 overflow-hidden">
                  {course.image ? (
                    <Media
                      resource={course.image}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-[#c4bbb3]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col gap-4 min-w-0">
                  <div>
                    <p className="text-eyebrow text-[#9e9189] mb-1.5">Online Course</p>
                    <h2 className="font-display font-bold text-[1.15rem] text-[#1a1a1a] leading-snug">
                      {course.title}
                    </h2>
                    <p className="mt-1 text-[13px] text-[#626160] line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#4b4b4b] font-medium">
                        {course.completed} / {course.total} lessons completed
                      </span>
                      <span
                        className={
                          course.pct === 100
                            ? 'text-green-600 font-semibold'
                            : 'text-[#9e9189] font-medium'
                        }
                      >
                        {course.pct === 100 ? '✓ Complete' : `${course.pct}%`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f0ece5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1a1a1a] rounded-full transition-all duration-500"
                        style={{ width: `${course.pct > 0 ? Math.max(course.pct, 2) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={course.href}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#333333] text-white text-[13px] font-medium rounded-lg transition-colors self-start"
                  >
                    {course.pct === 0 ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Start Course
                      </>
                    ) : course.pct === 100 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Review Course
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Continue Learning
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {enrolled.length > 0 && (
        <div className="pt-2 border-t border-[#e8e4d9]">
          <Link
            href="/courses"
            className="text-[13px] font-medium text-[#4b4b4b] hover:text-[#1a1a1a] transition-colors"
          >
            Browse more courses →
          </Link>
        </div>
      )}
    </div>
  )
}
