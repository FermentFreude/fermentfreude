'use client'

import { GASTRONOMY_SECTION_LABELS, type GastronomySectionId } from '@/fields/gastronomySections'
import { useRowLabel } from '@payloadcms/ui'

export const GastronomySectionRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ section?: GastronomySectionId }>()
  const label = data?.section ? GASTRONOMY_SECTION_LABELS[data.section] : null
  return <span>{label || `Section ${(rowNumber ?? 0) + 1}`}</span>
}
