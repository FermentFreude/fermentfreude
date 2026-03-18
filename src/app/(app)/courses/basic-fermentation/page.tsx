import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

import Link from 'next/link'

import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import { ContentSection } from '@/components/ui/ContentSection'
import { getLocale } from '@/utilities/getLocale'

import type { Media as MediaType, OnlineCourse } from '@/payload-types'
import { BackToTop } from './BackToTop'
import { CurriculumWithProgress } from './CurriculumWithProgress'
import { StickyCurriculumBar } from './StickyCurriculumBar'

export const dynamic = 'force-dynamic'
const DEFAULT_HERO_TITLE = 'The Complete Fermentation Course'
const DEFAULT_HERO_DESCRIPTION =
  'Learn everything you need to know about fermentation, from basic vegetable ferments to advanced techniques.'
const DEFAULT_CURRICULUM_HEADING = 'Course Curriculum'
const DEFAULT_LEARN_HEADING = "What You'll Learn"
const DEFAULT_PROGRESS_HEADING = 'Your Progress'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Basic Fermentation Course | FermentFreude',
    description:
      'Foundational course on lacto-fermented vegetables. Learn to ferment safely at home with step-by-step modules and short video lessons.',
  }
}

type Lesson = {
  id?: string | null
  title?: string | null
  description?: string | null
  durationMinutes?: number | null
  video?: MediaType | string | null
}

type Module = {
  id?: string | null
  title?: string | null
  description?: string | null
  lessons?: Lesson[] | null
}

function toCompletedIds(raw: Array<{ lessonId?: string | null }> | null | undefined): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => (item && typeof item.lessonId === 'string' ? item.lessonId : null))
    .filter(Boolean) as string[]
}

export default async function BasicFermentationCoursePage() {
  const locale = (await getLocale()) as 'de' | 'en'
  const payload = await getPayload({ config: configPromise })

  // Fetch the course from the OnlineCourses collection
  const courseResult = await payload.find({
    collection: 'online-courses',
    where: { courseSlug: { equals: 'basic-fermentation' } },
    locale,
    depth: 2,
    limit: 1,
  })
  const data = (courseResult.docs[0] ?? null) as OnlineCourse | null

  const heroEyebrow = data?.heroEyebrow ?? (locale === 'de' ? 'Kurs' : 'Course')
  const heroTitle = data?.title ?? DEFAULT_HERO_TITLE
  const heroDescription = data?.heroDescription ?? DEFAULT_HERO_DESCRIPTION
  const heroImage = data?.heroImage
  const heroDuration = data?.heroDuration ?? null
  const heroLessonsCount = data?.heroLessonsCount ?? null
  const progressHeading =
    data?.heroProgressHeading ?? (locale === 'de' ? 'Dein Fortschritt' : DEFAULT_PROGRESS_HEADING)

  const modules = (data?.modules ?? []) as Module[]
  const totalLessons = modules.reduce((sum, mod) => sum + (mod.lessons?.length ?? 0), 0)

  let completedLessonIds: string[] = []
  let isEnrolled = false
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (user) {
    // Check enrollment
    const enrollment = await payload.find({
      collection: 'enrollments',
      where: {
        and: [{ user: { equals: user.id } }, { courseSlug: { equals: 'basic-fermentation' } }],
      },
      limit: 1,
      overrideAccess: true,
    })
    isEnrolled = enrollment.totalDocs > 0

    const progress = await payload.find({
      collection: 'course-progress',
      where: {
        and: [{ user: { equals: user.id } }, { courseSlug: { equals: 'basic-fermentation' } }],
      },
      limit: 1,
      user,
    })
    completedLessonIds = toCompletedIds(
      progress.docs[0]?.completedLessonIds as Array<{ lessonId?: string }> | undefined,
    )
  }
  const completedLessons = completedLessonIds.length
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const curriculumHeading = data?.curriculumHeading ?? DEFAULT_CURRICULUM_HEADING
  const learnHeading = data?.learnHeading ?? DEFAULT_LEARN_HEADING
  const learnItems = (data?.learnItems ?? []).map((item) => item?.text ?? '').filter(Boolean)

  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/$/, '')
  const r2Base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

  // Build curriculum data for the client component — resolve video URLs via depth: 2
  const curriculumForClient = modules.map((mod) => ({
    id: mod.id,
    title: mod.title,
    description: mod.description,
    lessons: (mod.lessons ?? []).map((lesson) => {
      let videoMediaId: string | null = null
      let videoUrl: string | null = null
      let videoFilename: string | null = null

      if (isResolvedMedia(lesson.video)) {
        const media = lesson.video as MediaType
        videoMediaId = typeof media.id === 'string' ? media.id : String(media.id ?? '')
        videoFilename = typeof media.filename === 'string' ? media.filename : null
        videoUrl = typeof media.url === 'string' ? media.url : null
        if (!videoUrl && videoFilename) {
          videoUrl = r2Base
            ? `${r2Base}/media/${videoFilename}`
            : `${baseUrl}/media/${videoFilename}`
        }
        if (videoUrl && !videoUrl.startsWith('http') && baseUrl) {
          videoUrl = baseUrl + (videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`)
        }
      } else if (typeof lesson.video === 'string' && lesson.video) {
        videoMediaId = lesson.video
      }

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        durationMinutes: lesson.durationMinutes,
        videoUrl,
        videoMediaId,
        videoFilename,
      }
    }),
  }))

  const coursesLabel = locale === 'de' ? 'Kurse' : 'Courses'
  const curriculumCtaLabel = locale === 'de' ? 'Zum Lehrplan' : 'View curriculum'
  const loginToSaveLabel =
    locale === 'de'
      ? 'Einloggen, um deinen Fortschritt zu speichern'
      : 'Log in to save your progress'
  const loginLabel = locale === 'de' ? 'Einloggen' : 'Log in'
  const ctaHeading =
    locale === 'de'
      ? 'Los geht’s — dein Fermentations-Abenteuer wartet!'
      : "Let's go — your fermentation adventure awaits!"
  const ctaDescription =
    locale === 'de'
      ? 'Starte mit Modul 1, lerne in deinem Tempo und hab Spaß beim Fermentieren.'
      : 'Start with Module 1, learn at your own pace, and have fun fermenting.'
  const ctaContactLabel = locale === 'de' ? 'Fragen? Schreib uns' : 'Questions? Get in touch'

  return (
    <>
      {/* Hero */}
      <section className="section-padding-lg bg-ff-ivory-mist/50">
        <div className="container mx-auto container-padding">
          <div className="grid min-h-0 grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <FadeIn delay={0}>
                <p className="text-caption font-display font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
                  {heroEyebrow}
                </p>
                <h1 className="mt-2 font-display text-hero font-bold text-ff-near-black">
                  {heroTitle}
                </h1>
                {(heroDuration != null || heroLessonsCount != null || totalLessons > 0) && (
                  <p className="mt-2 text-caption font-medium text-ff-gray-text">
                    {[
                      heroLessonsCount ??
                        (totalLessons > 0
                          ? `${totalLessons} ${locale === 'de' ? 'Lektionen' : 'lessons'}`
                          : null),
                      heroDuration,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                {heroDescription && (
                  <p className="mt-4 text-body-lg text-ff-gray-text">{heroDescription}</p>
                )}
                {isEnrolled && (
                  <div className="mt-6 rounded-2xl bg-white/80 p-4 shadow-sm">
                    <div className="flex items-center justify-between text-body-sm text-ff-near-black">
                      <span className="font-semibold">{progressHeading}</span>
                      <span>
                        {completedLessons} {locale === 'de' ? 'von' : 'of'} {totalLessons}{' '}
                        {locale === 'de'
                          ? totalLessons === 1
                            ? 'Lektion'
                            : 'Lektionen'
                          : totalLessons === 1
                            ? 'lesson'
                            : 'lessons'}
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-ff-warm-gray/80">
                      <div
                        className="h-2.5 rounded-full bg-ff-gold-accent transition-[width] duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
                {!user && (
                  <div className="mt-6 rounded-2xl bg-white/80 p-4 shadow-sm">
                    <p className="text-center text-caption text-ff-gray-text">
                      {loginToSaveLabel}{' '}
                      <Link
                        href="/login"
                        className="font-semibold text-ff-gold-accent underline transition hover:text-ff-gold-accent-dark"
                      >
                        {loginLabel}
                      </Link>
                    </p>
                  </div>
                )}
              </FadeIn>
            </div>
            <FadeIn delay={150} className="relative hidden lg:block">
              {heroImage && isResolvedMedia(heroImage) ? (
                <div className="relative overflow-hidden rounded-3xl shadow-lg ring-1 ring-ff-border-light/50">
                  <Media
                    resource={heroImage}
                    className="h-64 md:h-80 w-full object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="h-64 md:h-80 w-full rounded-3xl bg-ff-ivory-mist shadow-md" />
              )}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Enrollment CTA banner — free preview notice for non-enrolled visitors */}
      {!isEnrolled && (
        <section className="border-b border-ff-border-light bg-ff-near-black py-4">
          <div className="container mx-auto container-padding flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-body-sm text-white/80 text-center sm:text-left">
              {locale === 'de'
                ? '🎬 Kostenlose Vorschau: Die ersten 2 Lektionen sind freigeschaltet. Kauf den Kurs, um alle Inhalte zu sehen.'
                : '🎬 Free preview: First 2 lessons unlocked. Purchase the course to access all content.'}
            </p>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/products/basic-fermentation-course"
                className="inline-flex items-center gap-2 rounded-full bg-ff-gold-accent px-5 py-2 text-body-sm font-bold text-ff-near-black transition hover:bg-ff-gold-accent-dark"
              >
                {locale === 'de' ? 'Kurs kaufen' : 'Get This Course'}
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-body-sm font-semibold text-white transition hover:border-white/60"
                >
                  {locale === 'de' ? 'Einloggen' : 'Log In'}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Course Curriculum */}
      <section id="curriculum">
        <ContentSection bg="white" padding="lg" className="pt-10 md:pt-14">
          <FadeIn delay={0}>
            <CurriculumWithProgress
              modules={curriculumForClient}
              completedLessonIds={completedLessonIds}
              courseSlug="basic-fermentation"
              locale={locale}
              curriculumHeading={curriculumHeading}
              isLoggedIn={Boolean(user)}
              isEnrolled={isEnrolled}
            />
          </FadeIn>
        </ContentSection>
      </section>

      {/* What You'll Learn */}
      <ContentSection bg="white" padding="lg" className="pt-0">
        <FadeIn delay={0}>
          <h2 className="text-center font-display text-section-heading font-bold text-ff-near-black">
            {learnHeading}
          </h2>
        </FadeIn>
        {learnItems.length > 0 && (
          <FadeIn delay={150}>
            <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
              {learnItems.map((text, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-ff-border-light bg-white/90 p-4 shadow-sm transition hover:shadow-md"
                >
                  <CheckIcon className="mt-0.5 size-6 shrink-0 text-ff-gold-accent" />
                  <span className="text-body text-ff-near-black">{text}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        )}
        {!isEnrolled && (
          <FadeIn delay={200}>
            <div className="mt-10 text-center">
              <Link
                href="/products/basic-fermentation-course"
                className="inline-flex items-center justify-center rounded-full bg-ff-gold-accent px-8 py-3 font-display font-bold text-ff-near-black shadow-sm transition hover:bg-ff-near-black hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2"
              >
                {locale === 'de' ? 'Kurs kaufen' : 'Purchase Course'}
              </Link>
            </div>
          </FadeIn>
        )}
      </ContentSection>

      <StickyCurriculumBar label={curriculumCtaLabel} />
      <BackToTop />
    </>
  )
}
