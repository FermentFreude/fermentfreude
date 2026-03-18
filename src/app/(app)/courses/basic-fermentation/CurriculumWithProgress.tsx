'use client'

import { ChevronDown, Lock, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/** First N lessons are always free to preview, even without enrollment. */
const FREE_PREVIEW_COUNT = 2

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
  toggleDone,
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
  toggleDone: (id: string) => void
  locale: 'de' | 'en'
}) {
  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])
  const fallbackUrl =
    videoFilename && origin
      ? `${origin}/media/${videoFilename}`
      : videoFilename
        ? `/media/${videoFilename}`
        : undefined
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
            onEnded={() => isLoggedIn && lessonId && !completed && toggleDone(lessonId)}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-ff-warm-gray text-body text-ff-gray-text">
            {locale === 'de' ? 'Video wird geladen…' : 'Loading video…'}
          </div>
        )}
      </div>
      {isLoggedIn && lessonId && (
        <button
          type="button"
          onClick={() => toggleDone(lessonId)}
          className={`rounded-full px-4 py-2 text-caption font-semibold tracking-wide shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2 ${
            completed
              ? 'bg-ff-near-black text-white hover:bg-ff-gold-accent hover:text-ff-near-black'
              : 'bg-ff-gold-accent text-ff-near-black hover:bg-ff-near-black hover:text-white'
          }`}
        >
          {completed
            ? locale === 'de'
              ? '✓ Erledigt'
              : '✓ Done'
            : locale === 'de'
              ? 'Als erledigt markieren'
              : 'Mark as done'}
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
  /** False = first FREE_PREVIEW_COUNT lessons are playable, the rest are locked. */
  isEnrolled?: boolean
}

export function CurriculumWithProgress({
  modules,
  completedLessonIds,
  courseSlug,
  locale,
  curriculumHeading,
  isLoggedIn = false,
  isEnrolled = true,
}: Props) {
  const router = useRouter()
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({})
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set(completedLessonIds))

  // Sync server state into local on re-render (e.g. after router.refresh)
  useEffect(() => {
    setLocalCompleted(new Set(completedLessonIds))
  }, [completedLessonIds])

  // Compute a global lesson index across all modules for the preview gate.
  let globalLessonCounter = 0
  const modulesWithIndex = modules.map((mod) => ({
    ...mod,
    lessons: (mod.lessons ?? []).map((lesson) => ({
      ...lesson,
      globalIndex: globalLessonCounter++,
    })),
  }))

  function toggleModule(idx: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  async function toggleDone(lessonId: string) {
    if (!isLoggedIn) return
    // Optimistic toggle
    setLocalCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(lessonId)) next.delete(lessonId)
      else next.add(lessonId)
      return next
    })
    try {
      const res = await fetch(`/api/courses/${courseSlug}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
        credentials: 'include',
      })
      if (res.ok) router.refresh()
    } catch {
      // Revert on error
      setLocalCompleted((prev) => {
        const next = new Set(prev)
        if (next.has(lessonId)) next.delete(lessonId)
        else next.add(lessonId)
        return next
      })
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
        {modulesWithIndex.map((mod, idx) => {
          const lessonCount = mod.lessons?.length ?? 0
          const isOpen = expandedModules.has(idx)
          return (
            <div
              key={mod.id ?? idx}
              className="rounded-2xl border border-ff-border-light/80 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Module header — clickable accordion trigger */}
              <button
                type="button"
                onClick={() => toggleModule(idx)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-4 p-6 text-left md:p-8"
              >
                {/* Big number */}
                <span
                  className="shrink-0 font-display text-4xl font-bold text-ff-gold-accent leading-none mt-1"
                  aria-hidden
                >
                  {idx + 1}
                </span>

                {/* Title + description */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-bold text-ff-near-black md:text-2xl">
                    {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="mt-1 text-body-sm text-ff-gray-text">{mod.description}</p>
                  )}
                </div>

                {/* Lesson count + chevron */}
                <div className="flex shrink-0 flex-col items-end gap-1 mt-1">
                  <span className="text-caption font-semibold text-ff-gray-text">
                    {lessonLabel(lessonCount)}
                  </span>
                  <ChevronDown
                    className={`size-7 text-ff-gray-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                  />
                </div>
              </button>

              {/* Collapsible lesson list */}
              {isOpen && mod.lessons && mod.lessons.length > 0 && (
                <div className="border-t border-ff-border-light/60 px-6 pb-6 pt-4 md:px-8 md:pb-8">
                  <ul className="space-y-4">
                    {mod.lessons.map((lesson, lidx) => {
                      const completed = lesson.id ? localCompleted.has(lesson.id) : false
                      const hasVideo = Boolean(
                        lesson.videoMediaId ?? lesson.videoUrl ?? lesson.videoFilename,
                      )
                      const rowKey = `${mod.id ?? idx}-${lesson.id ?? lidx}`
                      const isExpanded = expandedKey === rowKey
                      const onToggleVideo = () => setExpandedKey(isExpanded ? null : rowKey)
                      const isLocked = !isEnrolled && lesson.globalIndex >= FREE_PREVIEW_COUNT
                      return (
                        <li key={lesson.id ?? lidx} className="flex flex-col gap-3">
                          <div
                            className={`flex flex-wrap items-center gap-3 gap-y-1 rounded-xl px-3 py-2 transition-colors ${isLocked ? 'opacity-60' : 'hover:bg-ff-warm-gray/30'}`}
                          >
                            {/* Icon slot */}
                            {isLocked ? (
                              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ff-warm-gray/60 text-ff-gray-text">
                                <Lock className="size-5" aria-hidden />
                              </span>
                            ) : hasVideo ? (
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

                            {/* Title + description */}
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

                            {/* Duration */}
                            {lesson.durationMinutes != null && (
                              <span className="shrink-0 text-caption text-ff-gray-text">
                                {lesson.durationMinutes} min
                              </span>
                            )}

                            {/* Action slot — toggle button */}
                            {isLocked ? (
                              <span className="shrink-0 text-caption font-semibold text-ff-gray-text">
                                {locale === 'de' ? 'Gesperrt' : 'Locked'}
                              </span>
                            ) : hasVideo ? (
                              <button
                                type="button"
                                onClick={onToggleVideo}
                                className="shrink-0 text-caption font-medium text-ff-gold-accent underline transition hover:no-underline focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2 rounded"
                              >
                                {isExpanded
                                  ? locale === 'de'
                                    ? 'Video schließen'
                                    : 'Close video'
                                  : locale === 'de'
                                    ? 'Video ansehen'
                                    : 'Watch video'}
                              </button>
                            ) : isLoggedIn && lesson.id ? (
                              <button
                                type="button"
                                onClick={() => toggleDone(lesson.id!)}
                                className={`shrink-0 rounded-full px-4 py-2 text-caption font-semibold tracking-wide shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2 ${
                                  completed
                                    ? 'bg-ff-near-black text-white hover:bg-ff-gold-accent hover:text-ff-near-black'
                                    : 'bg-ff-gold-accent text-ff-near-black hover:bg-ff-near-black hover:text-white'
                                }`}
                              >
                                {completed
                                  ? locale === 'de'
                                    ? '✓ Erledigt'
                                    : '✓ Done'
                                  : locale === 'de'
                                    ? 'Als erledigt markieren'
                                    : 'Mark as done'}
                              </button>
                            ) : null}
                          </div>

                          {/* Video player — only rendered when not locked and expanded */}
                          {hasVideo && isExpanded && !isLocked && (
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
                              toggleDone={toggleDone}
                              locale={locale}
                            />
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
