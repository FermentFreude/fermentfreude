import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { accountI18n } from '@/app/(app)/account/i18n'
import { OrderStatus } from '@/components/OrderStatus'
import { Price } from '@/components/Price'
import { ProductItem } from '@/components/ProductItem'
import { AddressItem } from '@/components/addresses/AddressItem'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utilities/formatDateTime'
import { getLocale } from '@/utilities/getLocale'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { ChevronLeftIcon } from 'lucide-react'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  const { id } = await params
  const { email = '' } = await searchParams

  let order: Order | null = null

  try {
    const {
      docs: [orderResult],
    } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          ...(user
            ? [
                {
                  customer: {
                    equals: user.id,
                  },
                },
              ]
            : []),
          ...(email
            ? [
                {
                  customerEmail: {
                    equals: email,
                  },
                },
              ]
            : []),
        ],
      },
      select: {
        amount: true,
        currency: true,
        items: true,
        customerEmail: true,
        customer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
        downloadToken: true,
      },
    })

    const canAccessAsGuest =
      !user &&
      email &&
      orderResult &&
      orderResult.customerEmail &&
      orderResult.customerEmail === email
    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult
    }
  } catch (error) {
    console.error(error)
  }

  if (!order) {
    notFound()
  }

  // Determine whether this order needs a physical shipping address.
  // Digital courses and workshops never ship — they shouldn't show a shipping section.
  const orderItems = Array.isArray(order.items) ? order.items : []
  const requiresShipping = orderItems.some((item) => {
    const product = item?.product
    if (!product || typeof product !== 'object') return true // unknown → assume physical
    const productType = (product as { productType?: string | null }).productType
    const slug = (product as { slug?: string | null }).slug
    const isDigital = productType === 'digital-course'
    const isWorkshop =
      productType === 'workshop' || (typeof slug === 'string' && slug.startsWith('workshop-'))
    return !isDigital && !isWorkshop
  })

  // Map raw status → user-facing label.
  // For digital/workshop orders, "completed" reads better as "Confirmed".
  let statusLabel: string | undefined
  if (order.status === 'processing') statusLabel = t.statusProcessing
  else if (order.status === 'completed')
    statusLabel = requiresShipping ? t.statusCompleted : t.statusConfirmed
  else if (order.status === 'cancelled') statusLabel = t.statusCancelled
  else if (order.status === 'refunded') statusLabel = t.statusRefunded

  return (
    <div className="">
      <div className="flex gap-8 justify-between items-center mb-6">
        {user ? (
          <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/orders">
                <ChevronLeftIcon />
                {t.allOrders}
              </Link>
            </Button>
          </div>
        ) : (
          <div></div>
        )}

        <h1 className="text-sm uppercase font-mono px-2 bg-primary/10 rounded tracking-[0.07em]">
          <span className="">{`Order #${order.id}`}</span>
        </h1>
      </div>

      <div className="bg-card border rounded-lg px-6 py-4 flex flex-col gap-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="">
            <p className="font-mono uppercase text-primary/50 mb-1 text-sm">{t.orderDate}</p>
            <p className="text-lg">
              <time dateTime={order.createdAt}>
                {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
              </time>
            </p>
          </div>

          <div className="">
            <p className="font-mono uppercase text-primary/50 mb-1 text-sm">{t.total}</p>
            {order.amount && <Price className="text-lg" amount={order.amount} />}
          </div>

          {order.status && (
            <div className="grow max-w-1/3">
              <p className="font-mono uppercase text-primary/50 mb-1 text-sm">{t.status}</p>
              <OrderStatus className="text-sm" status={order.status} label={statusLabel} />
            </div>
          )}
        </div>

        {order.downloadToken && (order.status === 'completed' || order.status === 'processing') && (
          <div>
            <Button asChild variant="outline" size="sm">
              <a
                href={`/api/orders/${order.id}/receipt?token=${encodeURIComponent(order.downloadToken)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.downloadInvoice}
              </a>
            </Button>
          </div>
        )}

        {order.items && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">{t.items}</h2>
            <ul className="flex flex-col gap-6">
              {order.items?.map((item, index) => {
                if (typeof item.product === 'string') {
                  return null
                }

                if (!item.product || typeof item.product !== 'object') {
                  return <div key={index}>{t.itemUnavailable}</div>
                }

                const variant =
                  item.variant && typeof item.variant === 'object' ? item.variant : undefined

                return (
                  <li key={item.id}>
                    <ProductItem
                      product={item.product}
                      quantity={item.quantity}
                      variant={variant}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {requiresShipping && order.shippingAddress && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">
              {t.shippingAddress}
            </h2>

            <AddressItem
              address={{
                ...order.shippingAddress,
                country: order.shippingAddress.country ?? undefined,
              }}
              hideActions
            />
          </div>
        )}

        {!requiresShipping && (
          <div>
            <h2 className="font-mono text-primary/50 mb-2 uppercase text-sm">{t.status}</h2>
            <p className="text-sm text-primary/70">{t.noShippingNeeded}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
    title: `Order ${id}`,
  }
}
