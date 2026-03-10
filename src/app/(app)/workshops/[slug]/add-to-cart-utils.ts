'use client'

import { toast } from 'sonner'

/* ═══════════════════════════════════════════════════════════════
 *  addWorkshopToCart — Production-Ready Helper
 *
 *  1. Validates appointment availability via API (server-side)
 *  2. Prevents race conditions and overbooking
 *  3. Adds to cart only after validation passes
 * ═══════════════════════════════════════════════════════════════ */

type AddWorkshopToCartParams = {
  addItem: (item: { product: string; variant?: string }, quantity?: number) => Promise<void>
  appointmentId: string
  workshopSlug: string
  workshopTitle: string
  guestCount: number
}

export async function addWorkshopToCart({
  addItem,
  appointmentId,
  workshopSlug,
  workshopTitle,
  guestCount,
}: AddWorkshopToCartParams) {
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
      const errorMessage = data.message || 'Fehler beim Hinzufügen zum Warenkorb'
      toast.error(errorMessage)
      throw new Error(data.error || 'Failed to add to cart')
    }

    // Step 3: Store booking metadata in localStorage for CartModal display
    // (Payload ecommerce plugin doesn't have a custom metadata field,
    //  so we store appointment details separately for retrieval when showing cart)
    const bookingMetadata = {
      appointmentId,
      workshopSlug,
      workshopTitle,
      guestCount,
      date: data.cartItem.metadata.date,
      time: data.cartItem.metadata.time,
      pricePerPerson: data.cartItem.metadata.pricePerPerson,
      totalPrice: data.cartItem.metadata.totalPrice,
      timestamp: Date.now(),
    }
    const existingBookings = JSON.parse(localStorage.getItem('workshopBookings') || '{}')
    existingBookings[appointmentId] = bookingMetadata
    localStorage.setItem('workshopBookings', JSON.stringify(existingBookings))

    // Step 4: Add to cart with correct quantity (guestCount)
    // This ensures Payload cart calculates: basePrice × quantity = totalPrice
    // NOTE: addItem signature is addItem(item, quantity) - quantity is SECOND parameter
    await addItem(
      { product: data.cartItem.productId },
      guestCount, // Pass quantity as second argument, not inside item object
    )

    // Step 4: Success feedback
    toast.success(
      `${guestCount} ${guestCount === 1 ? 'Platz' : 'Plätze'} für ${workshopTitle} hinzugefügt!`,
    )
  } catch (error) {
    console.error('Error adding workshop to cart:', error)
    if (!(error instanceof Error && error.message.includes('Failed to add to cart'))) {
      // Only show generic error if we haven't already shown a specific one
      toast.error('Fehler beim Hinzufügen zum Warenkorb')
    }
    throw error
  }
}
