'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'

export type LessonItem = {
  id?: string | null
  title?: string | null
  description?: string | null
  durationMinutes?: number | null
  videoUrl?: string | null
  videoMediaId?: string | null
  videoFilename?: string | null
}

export type ModuleItem = {
  id?: string | null
  title?: string | null
  description?: string | null
  lessons?: LessonItem[] | null
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function LessonVideoPlayer({
  rowKey,
  videoMediaId,
  videoUrl,
  videoFilename,
  videoUrls,
  setVideoUrls,
  isLoggedIn,
  lessonId,
  completed,
  markDone,
  locale,
}: {
  rowKey: string
  videoMediaId?: string | null
  videoUrl?: string | null
  videoFilename?: string | null
  videoUrls: Record<string, string>
  setVideoUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>
  isLoggedIn: boolean
  lessonId?: string | null
  completed: boolean
  markDone: (id: string) => void
  locale: 'de' | 'en'
}) {
  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])
  const fallbackUrl =
    videoFilename && origin ? `${origin}/media/${videoFilename}` : videoFilename ? `/media/${videoFilename}` : undefined
  const resolvedUrl = videoUrls[rowKey] ?? videoUrl ?? fallbackUrl ?? undefined

  useEffect(() => {
    if (!videoMediaId || resolvedUrl) return
    let cancelled = false
    fetch(`/api/media/${videoMediaId}/url`)
      .then((r) => r.json())
      .then((data: { url?: string }) => {
        if (cancelled || !data?.url) return
        setVideoUrls((prev) => ({ ...prev, [rowKey]: data.url! }))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [videoMediaId, rowKey, setVideoUrls, resolvedUrl])

  return (
    <div className="space-y-3">
      <div className="w-full overflow-hidden rounded-2xl bg-black/5">
        {resolvedUrl ? (
          <video
            key={resolvedUrl}
            src={resolvedUrl}
            controls
            playsInline
            className="h-auto w-full rounded-2xl bg-black"
            onEnded={() => isLoggedIn && lessonId && markDone(lessonId)}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-ff-warm-gray text-body text-ff-gray-text">
            {locale === 'de' ? 'Video wird geladen…' : 'Loading video…'}
          </div>
        )}
      </div>
      {isLoggedIn && lessonId && !completed && (
        <button
          type="button"
          onClick={() => markDone(lessonId)}
          className="rounded-full bg-ff-gold-accent px-4 py-2 text-caption font-semibold tracking-wide text-ff-near-black shadow-sm transition hover:bg-ff-gold-accent-dark hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2"
        >
          {locale === 'de' ? 'Als erledigt markieren' : 'Mark as done'}
        </button>
      )}
    </div>
  )
}

type Props = {
  modules: ModuleItem[]
  completedLessonIds: string[]
  courseSlug: string
  locale: 'de' | 'en'
  curriculumHeading: string
  isLoggedIn?: boolean
}

export function CurriculumWithProgress({
  modules,
  completedLessonIds,
  courseSlug,
  locale,
  curriculumHeading,
  isLoggedIn = false,
}: Props) {
  const router = useRouter()
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({})
  const set = new Set(completedLessonIds)

  async function markDone(lessonId: string) {
    if (!isLoggedIn) return
    try {
      const res = await fetch(`/api/courses/${courseSlug}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
        credentials: 'include',
      })
      if (res.ok) router.refresh()
    } catch {
      // ignore
    }
  }

  const lessonLabel =
    locale === 'de'
      ? (n: number) => (n === 1 ? '1 Lektion' : `${n} Lektionen`)
      : (n: number) => (n === 1 ? '1 lesson' : `${n} lessons`)

  return (
    <>
      <h2 className="text-center font-display text-section-heading font-bold text-ff-near-black">
        {curriculumHeading}
      </h2>
      <div className="mx-auto mt-10 max-w-4xl space-y-6">
        {modules.map((mod, idx) => {
          const lessonCount = mod.lessons?.length ?? 0
          return (
            <div
              key={mod.id ?? idx}
              className="rounded-2xl border border-ff-border-light/80 bg-white p-6 shadow-sm transition hover:shadow-md md:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ff-gold-accent/20 font-display text-subheading font-bold text-ff-near-black"
                    aria-hidden
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-subheading font-bold text-ff-near-black">
                      {mod.title}
                    </h3>
                    {mod.description && (
                      <p className="mt-2 text-body-sm text-ff-gray-text">{mod.description}</p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-caption font-semibold text-ff-gray-text">
                  {lessonLabel(lessonCount)}
                </span>
              </div>
              {mod.lessons && mod.lessons.length > 0 && (
                <ul className="mt-6 space-y-4 border-t border-ff-warm-gray pt-6">
                  {mod.lessons.map((lesson, lidx) => {
                    const completed = lesson.id ? set.has(lesson.id) : false
                    const hasVideo = Boolean(lesson.videoMediaId ?? lesson.videoUrl ?? lesson.videoFilename)
                    const rowKey = `${mod.id ?? idx}-${lesson.id ?? lidx}`
                    const isExpanded = expandedKey === rowKey
                    const onToggleVideo = () => setExpandedKey(isExpanded ? null : rowKey)
                    return (
                      <li key={lesson.id ?? lidx} className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3 gap-y-1 rounded-xl px-3 py-2 transition-colors hover:bg-ff-warm-gray/30">
                          {hasVideo ? (
                            <button
                              type="button"
                              onClick={onToggleVideo}
                              aria-expanded={isExpanded}
                              aria-label={locale === 'de' ? 'Video ansehen' : 'Watch video'}
                              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ff-gold-accent/20 text-ff-gold-accent transition hover:bg-ff-gold-accent/40 focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2"
                            >
                              <Play className="size-6" strokeWidth={2} aria-hidden />
                            </button>
                          ) : completed ? (
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ff-gold-accent/20 text-ff-gold-accent">
                              <CheckIcon className="size-6" aria-hidden />
                            </span>
                          ) : (
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ff-warm-gray/60 text-ff-gray-text">
                              <Play className="size-6" strokeWidth={2} aria-hidden />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-ff-near-black">
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
                          {hasVideo && (
                            <button
                              type="button"
                              onClick={onToggleVideo}
                              className="shrink-0 text-caption font-medium text-ff-gold-accent underline transition hover:no-underline focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2 rounded"
                            >
                              {isExpanded
                                ? (locale === 'de' ? 'Video schließen' : 'Close video')
                                : (locale === 'de' ? 'Video ansehen' : 'Watch video')}
                            </button>
                          )}
                          {!hasVideo && isLoggedIn && lesson.id && !completed && (
                            <button
                              type="button"
                              onClick={() => markDone(lesson.id!)}
                              className="shrink-0 rounded-full bg-ff-gold-accent px-4 py-2 text-caption font-semibold tracking-wide text-ff-near-black shadow-sm transition hover:bg-ff-gold-accent-dark hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2"
                            >
                              {locale === 'de' ? 'Als erledigt markieren' : 'Mark as done'}
                            </button>
                          )}
                        </div>
                        {hasVideo && isExpanded && (
                          <LessonVideoPlayer
                            rowKey={rowKey}
                            videoMediaId={lesson.videoMediaId}
                            videoUrl={lesson.videoUrl}
                            videoFilename={lesson.videoFilename}
                            videoUrls={videoUrls}
                            setVideoUrls={setVideoUrls}
                            isLoggedIn={isLoggedIn}
                            lessonId={lesson.id}
                            completed={completed}
                            markDone={markDone}
                            locale={locale}
                          />
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
