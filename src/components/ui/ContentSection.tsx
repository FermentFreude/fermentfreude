import { cn } from '@/utilities/cn'
import React from 'react'

interface ContentSectionProps {
  children: React.ReactNode
  className?: string
  bg?: 'ivory' | 'ivory-mist' | 'warm-gray' | 'cream' | 'white' | 'none'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  id?: string
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
  sm: 'section-padding-sm',
  md: 'section-padding-md',
  lg: 'section-padding-lg',
  xl: 'section-padding-xl',
}

/**
 * Reusable content section wrapper with consistent padding and background colors.
 * Uses design-system tokens for vertical rhythm and container padding.
 */
export function ContentSection({
  children,
  className,
  bg = 'none',
  padding = 'md',
  id,
}: ContentSectionProps) {
  return (
    <section id={id} className={cn(bgStyles[bg], paddingStyles[padding], className)}>
      <div className="container mx-auto container-padding">{children}</div>
    </section>
  )
}
