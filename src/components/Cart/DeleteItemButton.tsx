'use client'

import type { CartItem } from '@/components/Cart'
import { gtmRemoveFromCart } from '@/lib/gtm'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { XIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'

export function DeleteItemButton({ item }: { item: CartItem }) {
  const { cart, isLoading, removeItem, refreshCart } = useCart()
  const itemId = item.id
  const [isRemoving, setIsRemoving] = useState(false)
  const removingRef = useRef(false)

  const releaseWorkshopSpotsIfNeeded = async () => {
    const product =
      typeof item.product === 'object' && item.product !== null ? item.product : null
    const productSlug = product?.slug
    if (!productSlug || !productSlug.startsWith('workshop-')) return

    try {
      const stored = localStorage.getItem('workshopBookings')
      if (!stored) return

      const bookings = JSON.parse(stored) as Record<
        string,
        {
          appointmentId?: string
          bookingId?: string | null
          workshopSlug?: string
          guestCount?: number
        }
      >

      const workshopSlug = productSlug.replace('workshop-', '')
      // Match the exact cart line via `item.a` (last 6 hex chars of the
      // appointment ID — see the `carts` config in src/plugins/index.ts),
      // not just workshopSlug. Two different dates for the same workshop
      // type can both be in the cart at once (e.g. switching dates without
      // fully clearing state first); matching by slug alone would release
      // spots for whichever entry happens to come first in the object,
      // potentially releasing the wrong appointment while leaving the one
      // actually being removed stuck holding its reserved spots forever.
      const entry = Object.entries(bookings).find(
        ([, booking]) =>
          booking.workshopSlug === workshopSlug &&
          (!item.a || booking.appointmentId?.slice(-6) === item.a),
      )
      if (!entry) return

      const [bookingKey, booking] = entry
      if (!booking.appointmentId || !booking.guestCount) return

      await fetch('/api/cart/release-spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: booking.appointmentId,
          guestCount: booking.guestCount,
          bookingId: booking.bookingId ?? undefined,
        }),
      })

      delete bookings[bookingKey]
      localStorage.setItem('workshopBookings', JSON.stringify(bookings))
    } catch (error) {
      console.error('[DeleteItemButton] Failed to release workshop spots:', error)
    }
  }

  const busy = !itemId || isLoading || isRemoving

  return (
    <form>
      <button
        aria-label="Remove cart item"
        className={clsx(
          'ease hover:cursor-pointer flex h-4.25 w-4.25 items-center justify-center rounded-full bg-neutral-500 transition-all duration-200',
          {
            'cursor-not-allowed px-0': busy,
          },
        )}
        disabled={busy}
        onClick={async (e: React.FormEvent<HTMLButtonElement>) => {
          e.preventDefault()
          if (!itemId || removingRef.current) return

          removingRef.current = true
          setIsRemoving(true)

          try {
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

            await releaseWorkshopSpotsIfNeeded()

            // Item may already be gone (double-click / another tab cleared the cart).
            const stillInCart = cart?.items?.some((cartItem) => cartItem.id === itemId)
            if (stillInCart) {
              await removeItem(itemId)
            }

            // Plugin does not refresh cart when remove returns 4xx ("not found").
            // Sync so ghost rows disappear.
            await refreshCart()
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            // Plugin returns 4xx when the row ID is already absent — treat as done.
            if (!message.includes('not found in cart')) {
              console.error('[DeleteItemButton] Failed to remove item:', error)
            }
            try {
              await refreshCart()
            } catch {
              // ignore refresh errors
            }
          } finally {
            removingRef.current = false
            setIsRemoving(false)
          }
        }}
        type="button"
      >
        <XIcon className="hover:text-accent-3 mx-px h-4 w-4 text-white dark:text-black" />
      </button>
    </form>
  )
}
