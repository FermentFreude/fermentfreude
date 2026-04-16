/**
 * Google Tag Manager — dataLayer utilities
 *
 * All GA4 e-commerce events and Meta Pixel standard events are triggered
 * through GTM tags that listen to these dataLayer pushes.
 *
 * Usage:
 *   import { gtmEvent, gtmViewItem, gtmAddToCart, gtmBeginCheckout, gtmPurchase } from '@/lib/gtm'
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

/** Push any event to GTM dataLayer (safe in SSR — no-ops on server) */
export function gtmEvent(event: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(event)
}

// ─── Typed event helpers ───────────────────────────────────────────────────

export type GtmItem = {
  item_id: string
  item_name: string
  item_category?: string
  price?: number
  quantity?: number
  currency?: string
}

/** GA4: view_item — fires on product / workshop detail page */
export function gtmViewItem(item: GtmItem): void {
  gtmEvent({
    event: 'view_item',
    ecommerce: {
      currency: item.currency ?? 'EUR',
      value: item.price ?? 0,
      items: [{ ...item, quantity: item.quantity ?? 1 }],
    },
  })
}

/** GA4: add_to_cart — fires when user adds item to cart */
export function gtmAddToCart(item: GtmItem): void {
  gtmEvent({
    event: 'add_to_cart',
    ecommerce: {
      currency: item.currency ?? 'EUR',
      value: (item.price ?? 0) * (item.quantity ?? 1),
      items: [{ ...item, quantity: item.quantity ?? 1 }],
    },
  })
}

/** GA4: begin_checkout — fires when checkout page loads */
export function gtmBeginCheckout(items: GtmItem[], value: number): void {
  gtmEvent({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'EUR',
      value,
      items,
    },
  })
}

/** GA4: purchase — fires after order is confirmed */
export function gtmPurchase(params: {
  transaction_id: string
  value: number
  items: GtmItem[]
}): void {
  gtmEvent({
    event: 'purchase',
    ecommerce: {
      currency: 'EUR',
      transaction_id: params.transaction_id,
      value: params.value,
      items: params.items,
    },
  })
}

/** GA4: remove_from_cart — fires when user removes item from cart */
export function gtmRemoveFromCart(item: GtmItem): void {
  gtmEvent({
    event: 'remove_from_cart',
    ecommerce: {
      currency: item.currency ?? 'EUR',
      value: (item.price ?? 0) * (item.quantity ?? 1),
      items: [{ ...item, quantity: item.quantity ?? 1 }],
    },
  })
}

/** GA4: view_cart — fires when cart drawer opens */
export function gtmViewCart(items: GtmItem[], value: number): void {
  gtmEvent({
    event: 'view_cart',
    ecommerce: {
      currency: 'EUR',
      value,
      items,
    },
  })
}
