import type { Metadata } from 'next'

import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import { ContentSection } from '@/components/ui/ContentSection'
import { getLocale } from '@/utilities/getLocale'
import { getCachedGlobal } from '@/utilities/getGlobals'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Play } from 'lucide-react'

import type { Media as MediaType } from '@/payload-types'

export const dynamic = 'force-dynamic'

const DEFAULT_HERO_TITLE = 'The Complete Fermentation Course'
const DEFAULT_HERO_SUBTITLE = 'Master the Art of Fermenting Foods and Beverages at Home'
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

type Module = {
  id?: string | null
  title: string
  description?: string | null
  lessons?: Array<{
    id?: string | null
    title: string
    description?: string | null
    durationMinutes?: number | null
  }> | null
}

export default async function BasicFermentationCoursePage() {
  const locale = (await getLocale()) as 'de' | 'en'
  const getGlobal = getCachedGlobal('basic-fermentation-course', 2, locale)
  const data = await getGlobal()

  const payload = await getPayload({ config: configPromise })
  const coursesPageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'courses' } },
    limit: 1,
    depth: 0,
    locale,
  })
  const coursesPage = coursesPageResult.docs[0] as { onlineCourses?: { onlineCoursesCurriculumProgressHeading?: string | null } } | undefined
  const progressFromPage = coursesPage?.onlineCourses?.onlineCoursesCurriculumProgressHeading

  const heroEyebrow = data?.heroEyebrow ?? (locale === 'de' ? 'Kurs' : 'Course')
  const heroTitle = data?.heroTitle ?? DEFAULT_HERO_TITLE
  const _heroSubtitle = data?.heroSubtitle ?? null
  const heroDescription = data?.heroDescription ?? DEFAULT_HERO_DESCRIPTION
  const heroImage = data?.heroImage
  const progressHeading =
    progressFromPage ?? data?.heroProgressHeading ?? (locale === 'de' ? 'Dein Fortschritt' : DEFAULT_PROGRESS_HEADING)

  const curriculumHeading = data?.curriculumHeading ?? DEFAULT_CURRICULUM_HEADING
  const modules = (data?.modules ?? []) as Module[]
  const totalLessons = modules.reduce(
    (sum, mod) => sum + (mod.lessons?.length ?? 0),
    0,
  )
  const completedLessons = 0
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
  const learnHeading = data?.learnHeading ?? DEFAULT_LEARN_HEADING
  const learnItems = (data?.learnItems ?? []).map((item) => item?.text ?? '').filter(Boolean)

  return (
    <>
      {/* Hero */}
      <section className="section-padding-lg bg-white">
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
                {/* Subtitle intentionally omitted per design */}
                {heroDescription && (
                  <p className="mt-4 text-body-lg text-ff-gray-text">{heroDescription}</p>
                )}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-caption text-ff-gray-text">
                    <span>{progressHeading}</span>
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
                  <div className="mt-2 h-2 rounded-full bg-ff-warm-gray/60">
                    <div
                      className="h-2 rounded-full bg-ff-near-black"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
            <FadeIn delay={150} className="relative hidden lg:block">
              {heroImage && isResolvedMedia(heroImage) ? (
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <Media
                    resource={heroImage}
                    className="aspect-[4/3] w-full object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] w-full rounded-3xl bg-ff-ivory-mist" />
              )}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Course Curriculum */}
      <ContentSection bg="white" padding="lg" id="curriculum">
        <FadeIn delay={0}>
          <h2 className="text-center font-display text-section-heading font-bold text-ff-near-black">
            {curriculumHeading}
          </h2>
        </FadeIn>
        <div className="mx-auto mt-10 max-w-4xl space-y-6">
          {modules.map((mod, idx) => {
            const lessonCount = mod.lessons?.length ?? 0
            const lessonLabel =
              locale === 'de'
                ? lessonCount === 1
                  ? '1 Lektion'
                  : `${lessonCount} Lektionen`
                : lessonCount === 1
                  ? '1 lesson'
                  : `${lessonCount} lessons`
            return (
              <FadeIn key={mod.id ?? idx} delay={100 + idx * 50}>
                <div className="rounded-2xl bg-ff-warm-gray/50 p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-subheading font-bold text-ff-near-black">
                        {locale === 'de' ? 'Modul' : 'Module'} {idx + 1}: {mod.title}
                      </h3>
                      {mod.description && (
                        <p className="mt-2 text-body-sm text-ff-gray-text">{mod.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-caption font-semibold text-ff-gray-text">
                      {lessonLabel}
                    </span>
                  </div>
                  {mod.lessons && mod.lessons.length > 0 && (
                    <ul className="mt-6 space-y-4 border-t border-ff-warm-gray pt-6">
                      {mod.lessons.map((lesson, lidx) => (
                        <li
                          key={lesson.id ?? lidx}
                          className="flex flex-wrap items-start gap-3 gap-y-1"
                        >
                          <Play
                            className="mt-0.5 size-5 shrink-0 text-ff-gold-accent"
                            strokeWidth={2}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-ff-near-black">
                              {idx + 1}.{lidx + 1} {lesson.title}
                            </span>
                            {lesson.description && (
                              <p className="mt-1 text-body-sm text-ff-gray-text">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          {lesson.durationMinutes != null && (
                            <span className="shrink-0 text-caption text-ff-gray-text">
                              {lesson.durationMinutes} min
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FadeIn>
            )
          })}
        </div>
      </ContentSection>

      {/* What You'll Learn */}
      <ContentSection bg="ivory-mist" padding="lg">
        <FadeIn delay={0}>
          <h2 className="text-center font-display text-section-heading font-bold text-ff-near-black">
            {learnHeading}
          </h2>
        </FadeIn>
        {learnItems.length > 0 && (
          <FadeIn delay={150}>
            <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
              {learnItems.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckIcon className="mt-0.5 size-6 shrink-0 text-ff-gold-accent" />
                  <span className="text-body text-ff-near-black">{text}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        )}
      </ContentSection>
    </>
  )
}
