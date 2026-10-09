'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Admin list label: "01 · Unser Produkt — Käferbohnen-Tempeh" instead of "Slide 01". */
export const TempehSlideRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ label?: string; title?: string; product?: unknown }>()
  const number = String((rowNumber ?? 0) + 1).padStart(2, '0')
  const text = [data?.label?.trim(), data?.title?.trim()].filter(Boolean).join(' — ')
  return (
    <span>
      {number} · {text || 'New slide'}
      {data?.product ? ' 🛒' : ''}
    </span>
  )
}
