import { OrderConfirmation } from '@/components/checkout/confirmation/OrderConfirmation'
import { getOrderConfirmationData } from '@/lib/orderConfirmation'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

export const metadata = {
  title: 'Order Confirmation - FermentFreude',
  description: 'Order confirmation',
}

interface OrderConfirmationPageProps {
  searchParams: Promise<{
    orderId?: string
    type?: string
    email?: string
  }>
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { orderId, type } = await searchParams
  const locale = await getLocale()

  // Detect authenticated user — guests get different CTAs (no /account/* links)
  const reqHeaders = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: reqHeaders })

  const data = await getOrderConfirmationData({ payload, orderId, type, locale })

  return (
    <OrderConfirmation
      data={data}
      orderId={orderId}
      type={type}
      locale={locale}
      isLoggedIn={!!user}
    />
  )
}
