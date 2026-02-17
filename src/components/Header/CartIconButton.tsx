'use client'

import { ShoppingCart } from 'lucide-react'
import React from 'react'

export function CartIconButton({
  quantity,
  ...rest
}: {
  quantity?: number
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="relative p-1.5 text-ff-gray-15 dark:text-neutral-300 hover:text-ff-charcoal dark:hover:text-white transition-colors hover:cursor-pointer"
      aria-label={`Cart${quantity ? ` (${quantity} items)` : ''}`}
      {...rest}
    >
      <ShoppingCart className="w-5 h-5" />
      {quantity ? (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ff-charcoal dark:bg-white text-[10px] font-bold text-white dark:text-ff-near-black leading-none">
          {quantity > 9 ? '9+' : quantity}
        </span>
      ) : null}
    </button>
  )
}
