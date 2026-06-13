'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { gtmPurchase } from '@/lib/gtm'
import { useAuth } from '@/providers/Auth'
import { useLocale } from '@/providers/Locale'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const ConfirmOrder: React.FC = () => {
  const { user } = useAuth()
  const { confirmOrder } = usePayments()
  const { cart, clearCart } = useCart()
  const { locale } = useLocale()

  const searchParams = useSearchParams()
  const router = useRouter()
  const isConfirming = useRef(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  useEffect(() => {
    const paymentIntentID = searchParams.get('payment_intent')
    const email = searchParams.get('email')
    const checkoutEmail = email || user?.email

    if (!paymentIntentID) {
      router.push('/')
      return
    }

    // Don't attempt until we know whether the user session is ready.
    // `user` is undefined while the Auth provider is hydrating — wait one cycle.
    // But don't wait forever for the cart: on redirect-based payments (iDEAL,
    // Klarna) the Stripe webhook may have already created the Order and cleared
    // the cart before the browser lands here, so we proceed even with an empty
    // cart and let the ecommerce plugin resolve the order by payment intent ID.

    if (!isConfirming.current) {
      isConfirming.current = true

      // Attach the buyer name to the transaction (best-effort) so the Order
      // beforeChange hook can promote it onto the Order — keeps confirmation
      // emails personalised for redirect-based payment methods (Klarna,
      // iDEAL, etc.) that round-trip through this page.
      let stashedName = ''
      try {
        stashedName = sessionStorage.getItem('checkoutCustomerName') || ''
      } catch {
        // ignore
      }
      const attachPromise =
        stashedName.trim().length >= 2
          ? fetch('/api/checkout/attach-customer-name', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentIntentID,
                customerName: stashedName.trim(),
              }),
            }).catch(() => null)
          : Promise.resolve(null)

      attachPromise
        .then(() =>
          confirmOrder('stripe', {
            additionalData: {
              paymentIntentID,
              ...(checkoutEmail ? { customerEmail: checkoutEmail } : {}),
            },
          }),
        )
        .then((result) => {
          try {
            sessionStorage.removeItem('checkoutCustomerName')
          } catch {
            // ignore
          }

          if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
            // GA4 + Meta Pixel: purchase event
            if (cart?.items?.length) {
              const items = cart.items.map((item) => {
                const product =
                  typeof item.product === 'object' && item.product !== null ? item.product : null
                return {
                  item_id: String(
                    typeof item.product === 'object'
                      ? (item.product as { id?: string })?.id
                      : item.product,
                  ),
                  item_name: ((product as Record<string, unknown> | null)?.title as string) ?? '',
                  quantity: item.quantity ?? 1,
                  price: (product as Record<string, unknown> | null)?.priceInEUR as
                    | number
                    | undefined,
                }
              })
              gtmPurchase({
                transaction_id: String(result.orderID),
                value: cart.subtotal ?? 0,
                items,
              })
            }

            clearCart()

            const hasWorkshop = cart?.items?.some((item) => {
              if (typeof item.product !== 'object' || item.product === null) return false
              const p = item.product as { productType?: string; slug?: string }
              return (
                p.productType === 'workshop' ||
                (typeof p.slug === 'string' && p.slug.startsWith('workshop-'))
              )
            })
            const hasCourse = cart?.items?.some((item) => {
              if (typeof item.product !== 'object' || item.product === null) return false
              const p = item.product as { courseSlug?: string; slug?: string }
              return (
                Boolean(p.courseSlug) ||
                (typeof p.slug === 'string' && p.slug.toLowerCase().includes('course'))
              )
            })

            const type = hasCourse ? 'course' : hasWorkshop ? 'workshop' : 'order'
            const emailParam = checkoutEmail ? `&email=${encodeURIComponent(checkoutEmail)}` : ''
            router.push(
              `/checkout/order-confirmation?orderId=${result.orderID}&type=${type}${emailParam}`,
            )
          } else {
            // confirmOrder returned but without an orderID — surface a recoverable error
            setConfirmError(
              locale === 'de'
                ? 'Bestellung konnte nicht bestätigt werden. Bitte kontaktiere uns.'
                : 'Order could not be confirmed. Please contact us.',
            )
          }
        })
        .catch((err: unknown) => {
          try {
            sessionStorage.removeItem('checkoutCustomerName')
          } catch {
            // ignore
          }
          const msg = err instanceof Error ? err.message : String(err)
          console.error('[ConfirmOrder] confirmOrder failed:', msg)
          setConfirmError(
            locale === 'de'
              ? 'Fehler bei der Bestellbestätigung. Bitte kontaktiere uns.'
              : 'Error confirming order. Please contact us.',
          )
        })
    }
  }, [searchParams, confirmOrder, router, clearCart, user, cart, locale])

  if (confirmError) {
    return (
      <div className="text-center w-full flex flex-col items-center justify-start gap-4">
        <h1 className="text-2xl font-display">
          {locale === 'de' ? 'Etwas ist schiefgelaufen' : 'Something went wrong'}
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">{confirmError}</p>
        <a href="mailto:kontakt@fermentfreude.at" className="underline text-sm">
          kontakt@fermentfreude.at
        </a>
      </div>
    )
  }

  return (
    <div className="text-center w-full flex flex-col items-center justify-start gap-4">
      <h1 className="text-2xl font-display">
        {locale === 'de' ? 'Bestellung wird bestätigt' : 'Confirming Order'}
      </h1>

      <LoadingSpinner className="w-12 h-6" />
    </div>
  )
}
