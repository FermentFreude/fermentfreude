'use client'

import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Address } from '@/payload-types'
import { useLocale } from '@/providers/Locale'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useCallback } from 'react'

const FORM_DE = {
  loading: 'Wird geladen…',
  payNow: 'Jetzt bezahlen',
  somethingWentWrong: 'Etwas ist schiefgelaufen.',
  errorConfirming: (msg: string) => `Fehler bei der Bestellbestätigung: ${msg}`,
  errorSubmitting: (msg: string) => `Fehler beim Absenden der Zahlung: ${msg}`,
}
const FORM_EN = {
  loading: 'Loading…',
  payNow: 'Pay now',
  somethingWentWrong: 'Something went wrong.',
  errorConfirming: (msg: string) => `Error while confirming order: ${msg}`,
  errorSubmitting: (msg: string) => `Error while submitting payment: ${msg}`,
}

type Props = {
  customerEmail?: string
  billingAddress?: Partial<Address>
  shippingAddress?: Partial<Address>
  setProcessingPayment: React.Dispatch<React.SetStateAction<boolean>>
  isAllDigital?: boolean
  hasWorkshop?: boolean
  pickupDate?: string
  pickupTime?: string
}

export const CheckoutForm: React.FC<Props> = ({
  customerEmail,
  billingAddress,
  setProcessingPayment,
  isAllDigital,
  hasWorkshop,
  pickupDate,
  pickupTime,
}) => {
  const { locale } = useLocale()
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = React.useState<null | string>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const { clearCart } = useCart()
  const { confirmOrder } = usePayments()
  const t = locale === 'de' ? FORM_DE : FORM_EN

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setProcessingPayment(true)

      if (stripe && elements) {
        try {
          const returnUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout/confirm-order${customerEmail ? `?email=${customerEmail}` : ''}`

          const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            confirmParams: {
              return_url: returnUrl,
              payment_method_data: {
                billing_details: {
                  email: customerEmail,
                  phone: billingAddress?.phone,
                  address: {
                    line1: billingAddress?.addressLine1,
                    line2: billingAddress?.addressLine2,
                    city: billingAddress?.city,
                    state: billingAddress?.state,
                    postal_code: billingAddress?.postalCode,
                    country: billingAddress?.country,
                  },
                },
              },
            },
            elements,
            redirect: 'if_required',
          })

          if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
              const confirmResult = await confirmOrder('stripe', {
                additionalData: {
                  paymentIntentID: paymentIntent.id,
                  ...(customerEmail ? { customerEmail } : {}),
                  ...(pickupDate ? { pickupDate } : {}),
                  ...(pickupTime ? { pickupTime } : {}),
                },
              })

              if (
                confirmResult &&
                typeof confirmResult === 'object' &&
                'orderID' in confirmResult &&
                confirmResult.orderID
              ) {
                clearCart()

                const emailParam = customerEmail
                  ? `&email=${encodeURIComponent(customerEmail)}`
                  : ''
                const type = hasWorkshop ? 'workshop' : isAllDigital ? 'course' : 'order'
                router.push(
                  `/account/order-confirmation?orderId=${confirmResult.orderID}&type=${type}${emailParam}`,
                )
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : t.somethingWentWrong
              setError(t.errorConfirming(msg))
              setIsLoading(false)
              setProcessingPayment(false)
            }
          }
          if (stripeError?.message) {
            setError(stripeError.message)
            setIsLoading(false)
            setProcessingPayment(false)
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : t.somethingWentWrong
          setError(t.errorSubmitting(msg))
          setIsLoading(false)
          setProcessingPayment(false)
        }
      }
    },
    [
      setProcessingPayment,
      stripe,
      elements,
      customerEmail,
      billingAddress?.phone,
      billingAddress?.addressLine1,
      billingAddress?.addressLine2,
      billingAddress?.city,
      billingAddress?.state,
      billingAddress?.postalCode,
      billingAddress?.country,
      confirmOrder,
      clearCart,
      router,
      isAllDigital,
      hasWorkshop,
      pickupDate,
      pickupTime,
      t,
    ],
  )

  return (
    <form onSubmit={handleSubmit}>
      {error && <Message error={error} />}
      <PaymentElement />
      <div className="mt-8 flex gap-4">
        <Button disabled={!stripe || isLoading} type="submit" variant="default">
          {isLoading ? t.loading : t.payNow}
        </Button>
      </div>
    </form>
  )
}
