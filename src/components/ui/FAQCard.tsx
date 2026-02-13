import { cn } from '@/utilities/cn'
import React from 'react'

interface FAQCardProps {
  question: string
  answer: string
  icon?: React.ReactNode
  className?: string
}

/**
 * Individual FAQ card with question and answer.
 * By default shows a question-mark circle icon.
 */
export function FAQCard({ question, answer, icon, className }: FAQCardProps) {
  return (
    <div
      className={cn(
        'flex gap-5 rounded-[35px] border border-ff-border-light bg-ff-card-gray p-8 md:p-10',
        className,
      )}
    >
      {/* Icon */}
      <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-ff-cream md:size-24">
        {icon || (
          <svg
            className="size-10 text-ff-charcoal md:size-12"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {/* Content */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold leading-snug text-ff-gray-text-light md:text-xl">
          {question}
        </h3>
        <p className="text-sm leading-relaxed text-ff-near-black md:text-base">{answer}</p>
      </div>
    </div>
  )
}
