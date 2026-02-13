import { cn } from '@/utilities/cn'
import React from 'react'

interface ContentSectionProps {
  children: React.ReactNode
  className?: string
  bg?: 'ivory' | 'ivory-mist' | 'warm-gray' | 'cream' | 'white' | 'none'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

const bgStyles = {
  ivory: 'bg-ff-ivory',
  'ivory-mist': 'bg-ff-ivory-mist',
  'warm-gray': 'bg-ff-warm-gray',
  cream: 'bg-ff-cream',
  white: 'bg-white',
  none: '',
}

const paddingStyles = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
  xl: 'py-24 md:py-40',
}

/**
 * Reusable content section wrapper with consistent padding and background colors.
 * Provides the container layout for page sections.
 */
export function ContentSection({
  children,
  className,
  bg = 'none',
  padding = 'md',
}: ContentSectionProps) {
  return (
    <section className={cn(bgStyles[bg], paddingStyles[padding], className)}>
      <div className="container mx-auto px-6 md:px-12 lg:px-20">{children}</div>
    </section>
  )
}
