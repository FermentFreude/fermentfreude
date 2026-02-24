'use client'

import { useRowLabel } from '@payloadcms/ui'

/**
 * Custom row label for hero slides
 * Shows the slide name (e.g., "Lakto", "Kombucha") instead of "Slide 1"
 */
export const HeroSlideRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ slideId?: string; title?: string }>()

  // Use slideId first, then title, then fallback to generic label
  const label = data?.slideId || data?.title || `Slide ${(rowNumber ?? 0) + 1}`

  // Capitalize first letter
  const displayLabel = label.charAt(0).toUpperCase() + label.slice(1)

  return <span>{displayLabel}</span>
}
