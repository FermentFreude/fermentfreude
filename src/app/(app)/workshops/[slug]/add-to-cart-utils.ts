'use client'

import { gtmAddToCart } from '@/lib/gtm'
import { toast } from 'sonner'

/* ═══════════════════════════════════════════════════════════════
 *  addWorkshopToCart — Production-Ready Helper
 *
 *  1. Validates appointment availability via API (server-side)
 *  2. Prevents race conditions and overbooking
 *  3. Adds to cart only after validation passes
 *  4. Releases spots if addItem fails (prevents spot leaking)
 *  5. Clears stale cart on failure so next attempt starts fresh
 * ═══════════════════════════════════════════════════════════════ */

type AddWorkshopToCartParams = {
  addItemAction: (item: { product: string; variant?: string }, quantity?: number) => Promise<void>
  clearCart?: () => Promise<void>
  appointmentId: string
  /** DB / product slug (e.g. "lakto") — used by /api/cart/add-workshop */
  workshopSlug: string
  workshopTitle: string
  guestCount: number
  locale?: 'de' | 'en'
  /** Frontend page slug for cart links (e.g. "vom-feld-ins-glas") */
  pageSlug?: string
  /** Optional location override (Marktgarten vs studio) */
  locationName?: string | null
  locationAddress?: string | null
}

/** Verifies that a product ID exists in the Payload ecommerce cart. */
async function verifyItemInCart(
  cartId: string | null,
  cartSecret: string | null,
  productId: string,
): Promise<boolean> {
  if (!cartId) return false
  try {
    const url = cartSecret
      ? `/api/carts/${cartId}?secret=${encodeURIComponent(cartSecret)}`
      : `/api/carts/${cartId}`
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) return false
    const cart = (await res.json()) as {
      items?: Array<{ product?: string | { id?: string } }>
    }
    return (
      cart.items?.some((item) => {
        const pId = typeof item.product === 'string' ? item.product : item.product?.id
        return pId === productId
      }) ?? false
    )
  } catch {
    return false
  }
}

const TOASTS_DE = {
  genericError: 'Fehler beim Hinzufügen zum Warenkorb',
  reloadAndRetry: 'Fehler beim Hinzufügen zum Warenkorb. Bitte lade die Seite neu und versuche es erneut.',
  success: (count: number, title: string) =>
    `${count} ${count === 1 ? 'Platz' : 'Plätze'} für ${title} hinzugefügt!`,
}
const TOASTS_EN = {
  genericError: 'Failed to add to cart',
  reloadAndRetry: 'Failed to add to cart. Please reload the page and try again.',
  success: (count: number, title: string) =>
    `${count} ${count === 1 ? 'spot' : 'spots'} for ${title} added!`,
}

export async function addWorkshopToCart({
  addItemAction,
  clearCart,
  appointmentId,
  workshopSlug,
  workshopTitle,
  guestCount,
  locale = 'de',
  pageSlug,
  locationName,
  locationAddress,
}: AddWorkshopToCartParams) {
  const t = locale === 'en' ? TOASTS_EN : TOASTS_DE
  try {
    // Step 1: Validate server-side (prevents race conditions)
    const response = await fetch('/api/cart/add-workshop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId,
        workshopSlug,
        guestCount,
      }),
    })

    const data = await response.json()

    // Step 2: Handle validation errors
    if (!response.ok || !data.success) {
      const errorMessage = data.message || t.genericError
      toast.error(errorMessage)
      throw new Error(data.error || 'Failed to add to cart')
    }

    // Step 3: Store booking metadata in localStorage for CartModal display
    // (Payload ecommerce plugin doesn't have a custom metadata field,
    //  so we store appointment details separately for retrieval when showing cart)
    const bookingMetadata = {
      appointmentId,
      bookingId: (data.bookingId as string | null) ?? null,
      workshopSlug,
      pageSlug: pageSlug ?? workshopSlug,
      workshopTitle,
      guestCount,
      date: data.cartItem.metadata.date,
      time: data.cartItem.metadata.time,
      pricePerPerson: data.cartItem.metadata.pricePerPerson,
      totalPrice: data.cartItem.metadata.totalPrice,
      locationName: locationName ?? data.cartItem.metadata.locationName ?? null,
      locationAddress: locationAddress ?? data.cartItem.metadata.locationAddress ?? null,
      timestamp: Date.now(),
    }
    const existingBookings = JSON.parse(localStorage.getItem('workshopBookings') || '{}')
    existingBookings[appointmentId] = bookingMetadata
    localStorage.setItem('workshopBookings', JSON.stringify(existingBookings))

    // Step 4: Add to cart with correct quantity (guestCount)
    // This ensures Payload cart calculates: basePrice × quantity = totalPrice
    // NOTE: addItem from the ecommerce plugin silently swallows errors — it never
    // throws. We verify success by fetching the cart and checking for the product.
    await addItemAction(
      { product: data.cartItem.productId },
      guestCount, // Pass quantity as second argument, not inside item object
    )

    // Wait for React state to commit to localStorage via useEffect
    await new Promise((resolve) => setTimeout(resolve, 500))

    const cartId = localStorage.getItem('cart')
    const cartSecret = localStorage.getItem('cart_secret')
    const itemAdded = await verifyItemInCart(cartId, cartSecret, data.cartItem.productId)

    if (!itemAdded) {
      // addItem failed silently (e.g. 403 from stale/expired session cart).
      // Release the spots that were decremented by the API so users can re-book.
      console.error(
        '[addWorkshopToCart] addItem verification failed — releasing spots and clearing stale cart',
      )

      await fetch('/api/cart/release-spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          guestCount,
          bookingId: data.bookingId,
        }),
      }).catch((err) => console.error('[addWorkshopToCart] release-spots failed:', err))

      // Clear stale cart from localStorage so next page load starts with a fresh cart
      localStorage.removeItem('cart')
      localStorage.removeItem('cart_secret')
      if (clearCart) await clearCart().catch(() => {})

      // Clean up the booking metadata we stored
      const bookingsMeta = JSON.parse(localStorage.getItem('workshopBookings') || '{}') as Record<
        string,
        unknown
      >
      delete bookingsMeta[appointmentId]
      localStorage.setItem('workshopBookings', JSON.stringify(bookingsMeta))

      toast.error(t.reloadAndRetry)
      throw new Error('addItem verification failed — spots released, please reload and retry')
    }

    if (bookingMetadata.bookingId) {
      await fetch('/api/cart/link-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingMetadata.bookingId,
          cartId,
        }),
      }).catch((error) => {
        console.error('[addWorkshopToCart] Failed to link booking to cart:', error)
      })
    }

    // Step 5: Success feedback
    toast.success(t.success(guestCount, workshopTitle))

    gtmAddToCart({
      item_id: data.cartItem.productId,
      item_name: workshopTitle,
      item_category: 'Workshop',
      price: data.cartItem.metadata.pricePerPerson,
      quantity: guestCount,
    })
  } catch (error) {
    console.error('Error adding workshop to cart:', error)
    if (
      !(
        error instanceof Error &&
        (error.message.includes('Failed to add to cart') ||
          error.message.includes('addItem verification failed'))
      )
    ) {
      // Only show generic error if we haven't already shown a specific one
      toast.error(t.genericError)
    }
    throw error
  }
}
