'use client'

import type { CartItem } from '@/components/Cart'
import { gtmRemoveFromCart } from '@/lib/gtm'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { XIcon } from 'lucide-react'
import React from 'react'

export function DeleteItemButton({ item }: { item: CartItem }) {
  const { isLoading, removeItem } = useCart()
  const itemId = item.id

  return (
    <form>
      <button
        aria-label="Remove cart item"
        className={clsx(
          'ease hover:cursor-pointer flex h-4.25 w-4.25 items-center justify-center rounded-full bg-neutral-500 transition-all duration-200',
          {
            'cursor-not-allowed px-0': !itemId || isLoading,
          },
        )}
        disabled={!itemId || isLoading}
        onClick={(e: React.FormEvent<HTMLButtonElement>) => {
          e.preventDefault()
          if (itemId) {
            const product =
              typeof item.product === 'object' && item.product !== null ? item.product : null
            gtmRemoveFromCart({
              item_id: String(
                typeof item.product === 'object'
                  ? (item.product as { id?: string })?.id
                  : item.product,
              ),
              item_name: ((product as Record<string, unknown> | null)?.title as string) ?? '',
              quantity: item.quantity ?? 1,
              price: (product as Record<string, unknown> | null)?.priceInEUR as number | undefined,
            })
            removeItem(itemId)
          }
        }}
        type="button"
      >
        <XIcon className="hover:text-accent-3 mx-px h-4 w-4 text-white dark:text-black" />
      </button>
    </form>
  )
}
