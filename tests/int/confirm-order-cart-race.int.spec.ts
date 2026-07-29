import { act, cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const confirmOrder = vi.fn()
const clearCart = vi.fn()
const routerPush = vi.fn()

// `useCart` is mutable per-test so we can simulate the cart resolving
// asynchronously (or never resolving) after the component has mounted.
let mockCart: { items: never[]; subtotal: number } | undefined

vi.mock('@payloadcms/plugin-ecommerce/client/react', () => ({
  useCart: () => ({ cart: mockCart, clearCart }),
  usePayments: () => ({ confirmOrder }),
}))

vi.mock('@/providers/Auth', () => ({
  useAuth: () => ({ user: undefined }),
}))

vi.mock('@/providers/Locale', () => ({
  useLocale: () => ({ locale: 'de' }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
  useSearchParams: () =>
    new URLSearchParams({ payment_intent: 'pi_test_1', email: 'guest@example.com' }),
}))

// eslint-disable-next-line import/first
import { ConfirmOrder } from '@/components/checkout/ConfirmOrder'

describe('ConfirmOrder — cart-restore race (Stage: checkout hotfix)', () => {
  beforeEach(() => {
    mockCart = undefined
    confirmOrder.mockReset()
    clearCart.mockReset()
    routerPush.mockReset()
    confirmOrder.mockResolvedValue({ orderID: 'order_1' })
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('does NOT call confirmOrder immediately when the cart has not loaded yet', async () => {
    render(React.createElement(ConfirmOrder))

    // Give React's effects a tick to run, but confirmOrder must not have
    // fired yet — this is the exact window that used to throw "Cart is
    // empty" synchronously before the grace-period fix.
    await vi.advanceTimersByTimeAsync(0)
    expect(confirmOrder).not.toHaveBeenCalled()
  })

  it('calls confirmOrder as soon as the cart resolves, without waiting out the full grace period', async () => {
    const { rerender } = render(React.createElement(ConfirmOrder))
    await vi.advanceTimersByTimeAsync(0)
    expect(confirmOrder).not.toHaveBeenCalled()

    // Cart resolves quickly (simulates the real async localStorage-restore
    // fetch completing) — well before the 2s grace period would elapse.
    mockCart = { items: [], subtotal: 9900 }
    await act(async () => {
      rerender(React.createElement(ConfirmOrder))
      await vi.advanceTimersByTimeAsync(50)
    })

    expect(confirmOrder).toHaveBeenCalledTimes(1)
    expect(confirmOrder).toHaveBeenCalledWith(
      'stripe',
      expect.objectContaining({
        additionalData: expect.objectContaining({ paymentIntentID: 'pi_test_1' }),
      }),
    )
  })

  it('proceeds anyway once the grace period elapses, even if the cart never loads (redirect-based payment methods)', async () => {
    render(React.createElement(ConfirmOrder))
    await vi.advanceTimersByTimeAsync(0)
    expect(confirmOrder).not.toHaveBeenCalled()

    // Cart never resolves — fast-forward past the grace period deterministically.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100)
    })

    expect(confirmOrder).toHaveBeenCalledTimes(1)
  })
})
