'use client'

import Link from 'next/link'

interface WorkshopCardButtonProps {
  href: string
  label: string
  isOutOfStock: boolean
  locale?: 'de' | 'en'
}

export function WorkshopCardButton({
  href,
  label,
  isOutOfStock,
  locale = 'de',
}: WorkshopCardButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (isOutOfStock) {
      e.preventDefault()
    }
  }

  return (
    <Link
      href={href}
      className={`mt-4 inline-flex items-center rounded-lg px-5 py-2.5 font-display text-sm font-bold transition-colors ${
        isOutOfStock
          ? 'bg-[#d0ccc6] text-[#9a9a9a] cursor-not-allowed'
          : 'bg-[#333333] text-white hover:bg-[#1a1a1a]'
      }`}
      onClick={handleClick}
    >
      {isOutOfStock
        ? locale === 'en'
          ? 'Sold Out'
          : 'Ausgebucht'
        : String(label).replace(/\s+>\s*$/, '')}
    </Link>
  )
}
