'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Admin list label: "01 · KÄFERBOHNEN TEMPEH" instead of "Product 01". */
export const ProductShowcaseRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ bigWord?: string; label?: string }>()
  const number = String((rowNumber ?? 0) + 1).padStart(2, '0')
  const text = (data?.label || data?.bigWord || '').replace(/\s+/g, ' ').trim()
  return (
    <span>
      {number} · {text || 'New product'}
    </span>
  )
}
