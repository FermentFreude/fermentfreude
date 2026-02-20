'use client'

import Link from 'next/link'

type Props = {
  collection: string
  id: string
  label?: string
}

/**
 * Floating link to edit the current page in the Payload admin.
 * Shown on pages that have a corresponding CMS document.
 */
export function EditPageLink({ collection, id, label = 'Edit in Admin' }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const editUrl = `${baseUrl}/admin/collections/${collection}/${id}`

  return (
    <Link
      href={editUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 rounded-lg bg-ff-charcoal px-4 py-2.5 font-display text-sm font-medium text-white shadow-lg transition-all hover:bg-ff-near-black hover:shadow-xl"
      title={label}
    >
      {label}
    </Link>
  )
}
