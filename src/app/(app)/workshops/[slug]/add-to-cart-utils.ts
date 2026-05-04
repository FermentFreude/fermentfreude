'use client'

import { gtmAddToCart } from '@/lib/gtm'
import { toast } from 'sonner'

/* ═══════════════════════════════════════════════════════════════
 *  addWorkshopToCart — Production-Ready Helper
 *
 *  1. Validates appointment availability via API (server-side)
 *  2. Prevents race conditions and overbooking
 *  3. Adds to cart only after validation passes
 * ═══════════════════════════════════════════════════════════════ */

type AddWorkshopToCartParams = {
  addItemAction: (item: { product: string; variant?: string }, quantity?: number) => Promise<void>
  appointmentId: string
  workshopSlug: string
  workshopTitle: string
  guestCount: number
  locale?: 'de' | 'en'
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
  appointmentId,
  workshopSlug,
  workshopTitle,
  guestCount,
  locale = 'de',
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
      workshopTitle,
      guestCount,
      date: data.cartItem.metadata.date,
      time: data.cartItem.metadata.time,
      pricePerPerson: data.cartItem.metadata.pricePerPerson,
      totalPrice: data.cartItem.metadata.totalPrice,
      locationName: data.cartItem.metadata.locationName ?? null,
      locationAddress: data.cartItem.metadata.locationAddress ?? null,
      timestamp: Date.now(),
    }
    const existingBookings = JSON.parse(localStorage.getItem('workshopBookings') || '{}')
    existingBookings[appointmentId] = bookingMetadata
    localStorage.setItem('workshopBookings', JSON.stringify(existingBookings))

    // Step 4: Add to cart with correct quantity (guestCount)
    // This ensures Payload cart calculates: basePrice × quantity = totalPrice
    // NOTE: addItem from the ecommerce plugin silently swallows errors —
    // it never throws, so we verify success by checking localStorage after a delay.
    const cartBefore = localStorage.getItem('cart')
    console.log('[addWorkshopToCart] Before addItem — cartID in localStorage:', cartBefore)

    await addItemAction(
      { product: data.cartItem.productId },
      guestCount, // Pass quantity as second argument, not inside item object
    )

    // Wait for React state to commit to localStorage via useEffect
    await new Promise((resolve) => setTimeout(resolve, 200))

    const cartAfter = localStorage.getItem('cart')
    console.log('[addWorkshopToCart] After addItem — cartID in localStorage:', cartAfter)

    if (!cartAfter) {
      // addItem failed silently — cart was not created/updated
      console.error(
        '[addWorkshopToCart] addItem failed silently — no cart in localStorage after 200ms',
      )
      // Clean up the booking metadata we just stored
      const bookings = JSON.parse(localStorage.getItem('workshopBookings') || '{}')
      delete bookings[appointmentId]
      localStorage.setItem('workshopBookings', JSON.stringify(bookings))

      toast.error(t.reloadAndRetry)
      throw new Error('addItem failed silently — cart not created')
    }

    if (bookingMetadata.bookingId) {
      await fetch('/api/cart/link-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingMetadata.bookingId,
          cartId: cartAfter,
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
          error.message.includes('addItem failed silently'))
      )
    ) {
      // Only show generic error if we haven't already shown a specific one
      toast.error(t.genericError)
    }
    throw error
  }
}
