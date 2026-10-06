'use client'

import type { CartItem } from '@/components/Cart'
import { releaseWorkshopLine } from '@/lib/checkWorkshopHolds'
import { gtmRemoveFromCart } from '@/lib/gtm'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'

export function DeleteItemButton({ item }: { item: CartItem }) {
  const { cart, isLoading, removeItem, refreshCart } = useCart()
  const router = useRouter()
  const itemId = item.id
  const [isRemoving, setIsRemoving] = useState(false)
  const removingRef = useRef(false)

  const releaseWorkshopSpotsIfNeeded = async () => {
    const product =
      typeof item.product === 'object' && item.product !== null ? item.product : null
    const productSlug = product?.slug
    if (!productSlug || !productSlug.startsWith('workshop-')) return

    try {
      let bookings: Record<
        string,
        { appointmentId?: string; bookingId?: string | null; workshopSlug?: string }
      > = {}
      try {
        bookings = JSON.parse(localStorage.getItem('workshopBookings') || '{}')
      } catch {
        // corrupt entry — the cart line's own `a` is enough below
      }

      const workshopSlug = productSlug.replace('workshop-', '')
      // Match the exact cart line via `item.a` (last 6 hex chars of the
      // appointment ID — see the `carts` config in src/plugins/index.ts),
      // not just workshopSlug: two dates of the same workshop can both be in
      // the cart, and matching by slug alone would release the wrong one.
      const entry = Object.entries(bookings).find(
        ([, booking]) =>
          booking.workshopSlug === workshopSlug &&
          (!item.a || booking.appointmentId?.slice(-6) === item.a),
      )

      // The server works out which seats this basket still holds for this
      // date and gives back exactly those — nothing if the hold already ran
      // out (those seats went back on sale back then). Works even if this
      // browser lost its localStorage entry, via the cart line's `a`.
      await releaseWorkshopLine({
        appointmentId: entry?.[1].appointmentId ?? item.a ?? null,
        bookingId: entry?.[1].bookingId ?? null,
      })

      if (entry) {
        delete bookings[entry[0]]
        localStorage.setItem('workshopBookings', JSON.stringify(bookings))
      }
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

            // Server-side availability (e.g. /workshops) already reflects the
            // release the instant releaseWorkshopSpotsIfNeeded's request lands
            // (see revalidateTag('workshop-appointments') in /api/cart/release-spots)
            // — but this tab's own Server Component tree doesn't know to
            // re-fetch it without this. Without it, a workshop date could look
            // unavailable until a manual page reload even though it's actually free.
            router.refresh()
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            // Plugin returns 4xx when the row ID is already absent — treat as done.
            if (!message.includes('not found in cart')) {
              console.error('[DeleteItemButton] Failed to remove item:', error)
            }
            try {
              await refreshCart()
              router.refresh()
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
