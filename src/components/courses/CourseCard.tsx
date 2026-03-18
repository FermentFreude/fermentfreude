'use client'

import { BookOpen, ChevronDown, Lock, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export interface CourseLesson {
  id?: string
  title?: string
  locked?: boolean
}

export interface CourseModule {
  id?: string
  title?: string
  /** Short description shown below the title on the card */
  description?: string
  /** Number of lessons (derived if not set) */
  lessonCount?: number
  /** URL to the course detail / viewer page */
  detailUrl?: string
  /** Label for the CTA button */
  detailLabel?: string
  /** Price string (e.g. "€49,00") */
  price?: string
  lessons?: CourseLesson[]
}

export function CourseCard({ course }: { course: CourseModule }) {
  const [expanded, setExpanded] = useState(false)
  const lessons = course.lessons ?? []
  const lessonCount = course.lessonCount ?? lessons.length
  const unlockedCount = lessons.filter((l) => !l.locked).length

  return (
    <div className="group rounded-xl border border-ff-border-light bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-ff-gold-accent/30">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
        aria-expanded={expanded}
      >
        {/* Icon */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-ff-gold-accent/15 transition-colors group-hover:bg-ff-gold-accent/25">
          <BookOpen className="size-5 text-ff-gold-accent-dark" strokeWidth={2} />
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-subheading font-bold text-ff-near-black leading-snug">
            {course.title ?? ''}
          </h3>
          <p className="mt-0.5 text-body-sm text-ff-gray-text">
            {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
            {unlockedCount > 0 && lessonCount > 0 && (
              <span className="ml-2 text-ff-gold-accent-dark font-medium">
                · {unlockedCount} free preview{unlockedCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {/* Price pill (optional) */}
        {course.price && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-ff-cream px-3 py-1 font-display text-sm font-bold text-ff-near-black">
            {course.price}
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          className={`size-5 shrink-0 text-ff-gray-muted transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {/* Expandable lesson list */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-500 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="border-t border-ff-border-light px-5 pb-5 pt-3 sm:px-6">
          <ul className="space-y-2">
            {lessons.map((lesson, j) => (
              <li
                key={lesson.id ?? `l-${j}`}
                className="flex items-center gap-3 rounded-lg bg-ff-cream/40 px-3.5 py-2.5 text-body"
              >
                <div className="flex size-5 shrink-0 items-center justify-center">
                  {lesson.locked ? (
                    <Lock className="size-4 text-ff-gray-muted" strokeWidth={2} />
                  ) : (
                    <PlayCircle className="size-4 text-ff-gold-accent" strokeWidth={2} />
                  )}
                </div>
                <span
                  className={`flex-1 text-left ${lesson.locked ? 'text-ff-gray-muted' : 'text-ff-near-black'}`}
                >
                  {lesson.title}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {course.detailUrl && (
            <div className="mt-4">
              <Link
                href={course.detailUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ff-gold-accent px-6 py-3 font-display font-bold text-ff-near-black transition-all hover:bg-ff-gold-accent-dark hover:scale-[1.01] active:scale-[0.99]"
              >
                {course.detailLabel ?? 'View Course'}
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
      </div>
    </div>
  )
}
