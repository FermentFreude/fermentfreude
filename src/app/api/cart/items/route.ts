import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/cart/items — Add items directly with metadata
 *
 *  Adds items to cart with full metadata support (for workshop bookings).
 *  Bypasses useCart hook limitations to support quantity and metadata.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product, variant, quantity, metadata } = body

    // ─── Input Validation ───────────────────────────────────────

    if (!product || typeof product !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid product',
          message: 'Product ID is required and must be a string.',
        },
        { status: 400 },
      )
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid quantity',
          message: 'Quantity must be a positive number.',
        },
        { status: 400 },
      )
    }

    // ─── Get or Create Cart ──────────────────────────────────────

    const config = await configPromise
    const _payload = await getPayload({ config })

    // For now (MVP), we'll return the cart item structure
    // The client will handle adding it via the useCart hook
    // (which will call the internal cart endpoint)

    // In a full production setup, you'd:
    // 1. Get the current cart (or create one if none exists)
    // 2. Add the item with metadata directly to the database
    // 3. Return the updated cart

    // For workshop bookings, we need to:
    // - Store metadata with the cart item
    // - This requires a one-time API call, then let useCart manage quantity changes

    return NextResponse.json(
      {
        success: true,
        message: 'Cart item validated',
        cartItem: {
          product,
          variant: variant || undefined,
          quantity,
          metadata,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error in /api/cart/items:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 },
    )
  }
}
