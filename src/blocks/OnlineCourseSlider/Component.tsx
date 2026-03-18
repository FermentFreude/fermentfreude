import { LessonList } from '@/components/courses/LessonList'
import { NotifyMeDialog } from '@/components/courses/NotifyMeDialog'
import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import { ContentSection } from '@/components/ui/ContentSection'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { Bell, BookOpen, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

import type { Media as MediaType, OnlineCourse, Product } from '@/payload-types'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  showComingSoon?: boolean | null
  comingSoonEyebrow?: string | null
  comingSoonHeading?: string | null
  comingSoonDescription?: string | null
}

function isResolvedMedia(v: unknown): v is MediaType {
  return typeof v === 'object' && v !== null && 'url' in v
}

function isResolvedProduct(v: unknown): v is Product {
  return typeof v === 'object' && v !== null && 'id' in v && 'title' in v
}

export async function OnlineCourseSliderBlock(props: Props) {
  const {
    eyebrow,
    heading,
    showComingSoon = true,
    comingSoonEyebrow,
    comingSoonHeading,
    comingSoonDescription,
  } = props

  const locale = await getLocale()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'online-courses',
    where: { isActive: { equals: true } },
    sort: 'sortOrder',
    limit: 50,
    depth: 1,
    locale,
  })

  const allCourses = result.docs as OnlineCourse[]
  const activeCourses = allCourses.filter((c) => !c.isComingSoon)
  const comingSoonCourses = allCourses.filter((c) => c.isComingSoon)

  const seeAllLabel = locale === 'de' ? 'Alle Lektionen anzeigen' : 'See all lessons'
  const notifyLabel = locale === 'de' ? 'Benachrichtige mich' : 'Notify Me When Available'

  const PLACEHOLDER_VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

  return (
    <>
      {/* Active courses — flat lesson list (first module only) */}
      {activeCourses.length > 0 && (
        <ContentSection bg="white" padding="sm" className="pt-6! md:pt-8!">
          <FadeIn delay={100}>
            {(eyebrow || heading) && (
              <div className="relative mx-auto max-w-3xl text-center">
                {eyebrow && (
                  <span className="text-caption font-display font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
                    {eyebrow}
                  </span>
                )}
                {heading && (
                  <h2 className="mt-2 font-display text-section-heading font-bold text-ff-near-black">
                    {heading}
                  </h2>
                )}
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-ff-gold-accent" aria-hidden />

                {/* Price pill — positioned top-right */}
                {(() => {
                  const firstCourse = activeCourses[0]
                  const product = isResolvedProduct(firstCourse?.product)
                    ? firstCourse.product
                    : undefined
                  const rawPrice = product?.priceInEUR
                  const normalizedPrice =
                    rawPrice != null ? (rawPrice > 1000 ? rawPrice / 100 : rawPrice) : undefined
                  if (!normalizedPrice) return null
                  const priceFormatted = new Intl.NumberFormat(
                    locale === 'de' ? 'de-DE' : 'en-US',
                    {
                      style: 'currency',
                      currency: 'EUR',
                    },
                  ).format(normalizedPrice)
                  return (
                    <span className="absolute -top-2 right-0 inline-flex items-center rounded-full bg-ff-cream px-4 py-2 font-display text-base font-bold text-ff-near-black shadow-sm sm:text-lg">
                      {priceFormatted}
                    </span>
                  )
                })()}
              </div>
            )}

            {/* Render first module of each active course */}
            <div className="mx-auto mt-10 max-w-2xl">
              {activeCourses.map((course, i) => {
                const firstModule = course.modules?.[0]
                if (!firstModule) return null

                const lessonsForList = (firstModule.lessons ?? []).map((l) => {
                  // Resolve video upload → URL string
                  const videoMedia =
                    typeof l.video === 'object' && l.video !== null && 'url' in l.video
                      ? (l.video as MediaType)
                      : null
                  const videoUrl = videoMedia?.url ?? (!l.locked ? PLACEHOLDER_VIDEO : null)

                  return {
                    id: l.id ?? undefined,
                    title: l.title,
                    locked: l.locked ?? true,
                    videoUrl,
                  }
                })

                return (
                  <FadeIn key={course.id} delay={150 + i * 60} from="bottom">
                    <LessonList
                      modules={[
                        {
                          id: firstModule.id ?? undefined,
                          title: course.title,
                          lessons: lessonsForList,
                        },
                      ]}
                    />

                    {/* CTA to full course viewer */}
                    {course.courseViewerUrl && (
                      <div className="mt-6 text-center">
                        <Link
                          href={course.courseViewerUrl}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-ff-gold-accent px-8 py-3 font-display font-bold text-ff-near-black transition-all hover:bg-ff-gold-accent-dark hover:scale-[1.01] active:scale-[0.99]"
                        >
                          {seeAllLabel}
                          <svg
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </FadeIn>
                )
              })}
            </div>
          </FadeIn>
        </ContentSection>
      )}

      {/* Coming soon courses — image cards */}
      {showComingSoon && comingSoonCourses.length > 0 && (
        <section id="coming-soon">
          <ContentSection bg="white" padding="sm">
            <FadeIn delay={150}>
              <div className="mx-auto max-w-3xl text-center">
                {comingSoonEyebrow && (
                  <span className="text-caption font-display font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
                    {comingSoonEyebrow}
                  </span>
                )}
                {comingSoonHeading && (
                  <h2 className="mt-3 font-display text-section-heading font-bold text-ff-near-black">
                    {comingSoonHeading}
                  </h2>
                )}
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-ff-gold-accent" aria-hidden />
                {comingSoonDescription && (
                  <p className="mt-4 text-body-lg leading-relaxed text-ff-gray-text">
                    {comingSoonDescription}
                  </p>
                )}
              </div>
              <div
                className={`mt-14 grid auto-rows-fr gap-6 sm:gap-8 ${
                  comingSoonCourses.length <= 2
                    ? 'mx-auto max-w-4xl sm:grid-cols-2'
                    : 'sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {comingSoonCourses.map((course, i) => {
                  const image = isResolvedMedia(course.cardImage) ? course.cardImage : null

                  return (
                    <FadeIn
                      key={course.id}
                      delay={180 + i * 60}
                      duration={0.6}
                      from="bottom"
                      className="h-full min-h-0"
                    >
                      <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ff-border-light">
                        <div className="relative aspect-3/2 shrink-0 overflow-hidden">
                          {image ? (
                            <Media
                              resource={image}
                              fill
                              imgClassName="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                              className="relative aspect-3/2"
                            />
                          ) : (
                            <div className="size-full bg-ff-warm-gray" />
                          )}
                          {course.comingSoonBadge && (
                            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-ff-gold-accent px-3 py-1.5 text-ff-near-black shadow-sm">
                              <Bell className="size-4 shrink-0" strokeWidth={2} />
                              <span className="text-sm font-semibold">
                                {course.comingSoonBadge}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col p-6">
                          <h3 className="font-display text-[1.125rem] font-bold leading-snug text-ff-near-black">
                            {course.title}
                          </h3>
                          {course.description && (
                            <p className="mt-2 text-[0.875rem] leading-relaxed text-ff-gray-text">
                              {course.description}
                            </p>
                          )}
                          <div className="mt-4 space-y-2 text-[0.8125rem] text-ff-gray-text">
                            {course.instructor && (
                              <div className="flex items-center gap-2">
                                <User
                                  className="size-4 shrink-0 text-ff-gray-muted"
                                  strokeWidth={2}
                                />
                                <span>{course.instructor}</span>
                              </div>
                            )}
                            {course.durationText && (
                              <div className="flex items-center gap-2">
                                <Clock
                                  className="size-4 shrink-0 text-ff-gray-muted"
                                  strokeWidth={2}
                                />
                                <span>{course.durationText}</span>
                              </div>
                            )}
                            {course.levelText && (
                              <div className="flex items-center gap-2">
                                <BookOpen
                                  className="size-4 shrink-0 text-ff-gray-muted"
                                  strokeWidth={2}
                                />
                                <span>{course.levelText}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-5 flex-1" aria-hidden />
                          <NotifyMeDialog
                            courseTitle={course.title}
                            courseSlug={course.slug}
                            locale={locale}
                            buttonLabel={notifyLabel}
                            triggerClassName="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ff-border-light bg-ff-cream/50 py-3 text-[0.875rem] font-semibold text-ff-gray-text transition-colors hover:bg-ff-cream"
                          />
                        </div>
                      </div>
                    </FadeIn>
                  )
                })}
              </div>
            </FadeIn>
          </ContentSection>
        </section>
      )}
    </>
  )
}
