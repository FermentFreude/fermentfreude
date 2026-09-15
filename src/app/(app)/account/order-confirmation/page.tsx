import { OrderConfirmation } from '@/components/checkout/confirmation/OrderConfirmation'
import { getOrderConfirmationData } from '@/lib/orderConfirmation'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
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

  const payload = await getPayload({ config: configPromise })
  const data = await getOrderConfirmationData({ payload, orderId, type, locale })

  // This route lives behind the account layout's auth guard, so anyone
  // reaching it is signed in.
  return (
    <OrderConfirmation data={data} orderId={orderId} type={type} locale={locale} isLoggedIn />
  )
}
