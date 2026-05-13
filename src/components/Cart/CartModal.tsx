'use client'

import { Price } from '@/components/Price'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { gtmViewCart } from '@/lib/gtm'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { CartIconButton } from '@/components/Header/CartIconButton'
import { Button } from '@/components/ui/button'
import { Product } from '@/payload-types'
import { useLocale } from '@/providers/Locale'
import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import type { SeatDraft } from './WorkshopSeatsEditor'

type WorkshopBooking = {
  appointmentId: string
  bookingId?: string | null
  workshopSlug: string
  workshopTitle: string
  guestCount: number
  date: string
  time: string
  pricePerPerson: number
  totalPrice: number
  locationName?: string | null
  locationAddress?: string | null
  seats?: SeatDraft[]
}

export function CartModal() {
  const { cart } = useCart()
  const { locale } = useLocale()
  const isDe = locale === 'de'
  const [isOpen, setIsOpen] = useState(false)
  const [bookingMetadata, setBookingMetadata] = useState<Record<string, WorkshopBooking>>({})
  const copy = {
    title: isDe ? 'Warenkorb' : 'My Cart',
    description: isDe
      ? 'Verwalte hier deinen Warenkorb und sieh den Gesamtbetrag.'
      : 'Manage your cart here, add items to view the total.',
    empty: isDe ? 'Dein Warenkorb ist leer.' : 'Your cart is empty.',
    total: isDe ? 'Gesamt' : 'Total',
    checkout: isDe ? 'Zur Kasse' : 'Proceed to Checkout',
    workshopBooking: isDe ? 'Workshop Buchung' : 'Workshop booking',
    guests: isDe ? 'Gäste' : 'Guests',
  }

  const pathname = usePathname()

  // Load workshop booking metadata from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('workshopBookings')
      if (stored) {
        try {
          setBookingMetadata(JSON.parse(stored))
        } catch (error) {
          console.error('Failed to parse workshop bookings from localStorage:', error)
        }
      }
    }
  }, [isOpen]) // Reload when cart opens

  useEffect(() => {
    // Close the cart modal when the pathname changes.
    setIsOpen(false)
  }, [pathname])

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined
    return cart.items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)
  }, [cart])

  // Check if cart is truly empty (no Payload items AND no localStorage bookings)
  const isCartEmpty =
    (!cart || cart?.items?.length === 0) && Object.keys(bookingMetadata).length === 0

  // Signal cart-open state to the rest of the app (header reads this to keep
  // the navbar pinned in place while the cart drawer is visible).
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      document.body.dataset.cartOpen = 'true'
    } else {
      delete document.body.dataset.cartOpen
    }
    return () => {
      delete document.body.dataset.cartOpen
    }
  }, [isOpen])

  // GA4: view_cart — fires when cart drawer opens
  useEffect(() => {
    if (isOpen && cart?.items?.length) {
      const items = cart.items.map((item) => {
        const product =
          typeof item.product === 'object' && item.product !== null ? item.product : null
        return {
          item_id: String(
            typeof item.product === 'object' ? (item.product as { id?: string })?.id : item.product,
          ),
          item_name: ((product as Record<string, unknown> | null)?.title as string) ?? '',
          quantity: item.quantity ?? 1,
          price: (product as Record<string, unknown> | null)?.priceInEUR as number | undefined,
        }
      })
      gtmViewCart(items, cart.subtotal ?? 0)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <CartIconButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-hidden">
        <SheetHeader className="shrink-0">
          <SheetTitle>{copy.title}</SheetTitle>

          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>

        {isCartEmpty ? (
          <div className="text-center flex flex-col items-center gap-2 px-4">
            <ShoppingCart className="h-16" />
            <p className="text-center text-2xl font-bold">{copy.empty}</p>
          </div>
        ) : (
          <div className="min-h-0 grow flex flex-col overflow-hidden">
            <ul className="grow overflow-y-auto py-4 px-4 min-h-0">
              {cart?.items?.map((item, i) => {
                const product = item.product
                const variant = item.variant

                if (typeof product !== 'object' || !item || !product || !product.slug)
                  return <React.Fragment key={i} />

                // Check if this is a workshop booking (product slug starts with "workshop-")
                const isWorkshopBooking = product.slug?.startsWith('workshop-')

                const metaImage =
                  product.meta?.image && typeof product.meta?.image === 'object'
                    ? product.meta.image
                    : undefined

                const firstGalleryImage =
                  typeof product.gallery?.[0]?.image === 'object'
                    ? product.gallery?.[0]?.image
                    : undefined

                let image = firstGalleryImage || metaImage
                let price = product.priceInEUR

                const isVariant = Boolean(variant) && typeof variant === 'object'

                if (isVariant) {
                  price = variant?.priceInEUR

                  const imageVariant = product.gallery?.find(
                    (item: {
                      image: string | import('@/payload-types').Media
                      variantOption?: (string | null) | import('@/payload-types').VariantOption
                      id?: string | null
                    }) => {
                      if (!item.variantOption) return false
                      const variantOptionID =
                        typeof item.variantOption === 'object'
                          ? item.variantOption.id
                          : item.variantOption

                      const hasMatch = variant?.options?.some(
                        (option: string | import('@/payload-types').VariantOption) => {
                          if (typeof option === 'object') return option.id === variantOptionID
                          else return option === variantOptionID
                        },
                      )

                      return hasMatch
                    },
                  )

                  if (imageVariant && typeof imageVariant.image === 'object') {
                    image = imageVariant.image
                  }
                }

                // Pre-resolve booking metadata so we can render seats editor outside the <Link>
                const productSlugWithoutPrefix = product.slug?.replace('workshop-', '')
                const matchedBooking = isWorkshopBooking
                  ? (Object.values(bookingMetadata).find(
                      (b) => b.workshopSlug === productSlugWithoutPrefix,
                    ) ?? null)
                  : null
                const guestCountForBooking = matchedBooking
                  ? (item.quantity ?? matchedBooking.guestCount ?? 1)
                  : 0

                return (
                  <li className="flex w-full flex-col" key={i}>
                    <div className="relative flex w-full flex-row justify-between px-1 py-4">
                      <div className="absolute z-40 -mt-2 ml-13.75">
                        <DeleteItemButton item={item} />
                      </div>
                      <Link
                        className="z-30 flex flex-row space-x-4"
                        href={
                          isWorkshopBooking
                            ? `/workshops/${product.slug.replace('workshop-', '')}`
                            : `/products/${(item.product as Product)?.slug}`
                        }
                      >
                        <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                          {image?.url && (
                            <Image
                              alt={image?.alt || product?.title || ''}
                              className="h-full w-full object-cover"
                              height={94}
                              src={image.url}
                              width={94}
                            />
                          )}
                        </div>

                        <div className="flex flex-1 flex-col text-base">
                          <span className="leading-tight">{product?.title}</span>
                          {isWorkshopBooking ? (
                            // For workshop bookings, display full booking details from localStorage
                            (() => {
                              if (matchedBooking) {
                                const guestCount = guestCountForBooking
                                const _lineTotal = matchedBooking.pricePerPerson * guestCount
                                return (
                                  <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-0.5">
                                    <p>{matchedBooking.date}</p>
                                    <p>
                                      {locale === 'de'
                                        ? `${matchedBooking.time} Uhr`
                                        : matchedBooking.time}
                                    </p>
                                    {matchedBooking.locationName && (
                                      <p>
                                        {matchedBooking.locationName}
                                        {matchedBooking.locationAddress
                                          ? ` — ${matchedBooking.locationAddress}`
                                          : ''}
                                      </p>
                                    )}
                                    <p>
                                      {guestCount} {copy.guests}
                                    </p>
                                  </div>
                                )
                              }
                              return (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                  {copy.workshopBooking}
                                </p>
                              )
                            })()
                          ) : isVariant && variant ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                              {variant.options
                                ?.map(
                                  (option: string | import('@/payload-types').VariantOption) => {
                                    if (typeof option === 'object') return option.label
                                    return null
                                  },
                                )
                                .join(', ')}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                      <div className="flex h-16 flex-col justify-between">
                        {isWorkshopBooking ? (
                          // Workshop: show base price per person in euros (convert from cents)
                          <span className="flex justify-end text-right text-sm">
                            €{typeof price === 'number' ? (price / 100).toFixed(2) : '0.00'}
                          </span>
                        ) : (
                          // Regular product: show price and quantity controls
                          <>
                            {typeof price === 'number' && (
                              <Price
                                amount={price}
                                className="flex justify-end space-y-2 text-right text-sm"
                              />
                            )}
                            <div className="ml-auto flex h-9 flex-none flex-row items-center rounded-lg border border-neutral-200 dark:border-neutral-700">
                              <EditItemQuantityButton item={item} type="minus" />
                              <div className="flex h-full min-w-8 shrink-0 items-center justify-center px-1 text-sm tabular-nums leading-none text-neutral-900 dark:text-neutral-100">
                                {item.quantity}
                              </div>
                              <EditItemQuantityButton item={item} type="plus" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-700 px-4 pb-6 pt-4">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {typeof cart?.subtotal === 'number' && cart.subtotal > 0 && (
                  <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-3 pt-1 dark:border-neutral-700">
                    <p>{copy.total}</p>
                    <Price
                      amount={cart?.subtotal}
                      className="text-right text-base text-black dark:text-white"
                    />
                  </div>
                )}

                <Button asChild>
                  <Link className="w-full" href="/checkout">
                    {copy.checkout}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
