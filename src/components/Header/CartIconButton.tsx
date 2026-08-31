'use client'

import { ShoppingBag } from 'lucide-react'
import React from 'react'

export function CartIconButton({
  quantity,
  ...rest
}: {
  quantity?: number
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="relative flex items-center justify-center size-10 text-ff-charcoal dark:text-neutral-300 hover:text-ff-near-black dark:hover:text-white transition-colors"
      aria-label={`Cart${quantity ? ` (${quantity} items)` : ''}`}
      {...rest}
    >
      <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.75} />
      {quantity ? (
        <span className="absolute top-1.5 right-1.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-ff-charcoal dark:bg-white text-[9px] font-bold text-white dark:text-ff-near-black leading-none">
          {quantity > 9 ? '9+' : quantity}
        </span>
      ) : null}
    </button>
  )
}
