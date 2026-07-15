'use client'

import { useRowLabel } from '@payloadcms/ui'

export const PressItemRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{
    outlet?: string
    title?: string
    categoryLabel?: string
    featured?: boolean
  }>()

  const outlet = data?.outlet?.trim()
  const title = data?.title?.trim()
  const category = data?.categoryLabel?.trim()
  const featured = data?.featured ? '★ ' : ''

  const label =
    [outlet, title].filter(Boolean).join(' — ') ||
    category ||
    `Entry ${(rowNumber ?? 0) + 1}`

  return (
    <span>
      {featured}
      {label}
    </span>
  )
}
