import { cn } from '@/utilities/cn'
import React from 'react'

interface SectionTagProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'light' | 'dark'
}

/**
 * Small tag/badge label used above section headings.
 * Example: "About fermentation", "Our story"
 */
export function SectionTag({ children, className, variant = 'default' }: SectionTagProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border px-5 py-2 text-sm font-medium tracking-wide',
        {
          'border-ff-charcoal/30 text-ff-charcoal': variant === 'default',
          'border-white/30 text-white': variant === 'light',
          'border-ff-near-black/30 text-ff-near-black': variant === 'dark',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}
