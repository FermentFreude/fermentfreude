'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useLocale } from '@/providers/Locale'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { FormItem } from '@/components/forms/FormItem'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Checkbox } from '@/components/ui/checkbox'
import { cssVariables } from '@/cssVariables'
import { gtmBeginCheckout } from '@/lib/gtm'
import { Address } from '@/payload-types'
import { formatTimeForLocale } from '@/utilities/formatTime'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from 'sonner'

const CHECKOUT_DE = {
  processingPayment: 'Zahlung wird verarbeitet…',
  cartEmpty: 'Dein Warenkorb ist leer.',
  continueShopping: 'Weiter einkaufen?',
  contact: 'Kontakt',
  loginBtn: 'Anmelden',
  createAccount: 'Konto erstellen',
  notYou: 'Nicht du?',
  logOut: 'Abmelden',
  guestPrompt: 'Gib deinen Namen und deine E-Mail-Adresse ein, um als Gast zu bestellen.',
  nameLabel: 'Vor- und Nachname',
  namePlaceholder: 'z. B. Maria Musterfrau',
  emailLabel: 'E-Mail-Adresse',
  continueAsGuest: 'Als Gast fortfahren',
  address: 'Adresse',
  noShipping: 'Workshop / digitales Produkt — keine Lieferadresse erforderlich.',
  storePickup: 'Abholung im Geschäft',
  pickupWorkshopNote:
    'Dein Warenkorb enthält auch einen Workshop. Die Abholdetails gelten nur für die physischen Produkte — dein Workshop-Termin bleibt unverändert.',
  viewOnMaps: 'Auf Google Maps ansehen',
  pickupDateLabel: 'Abholdatum',
  pickupTimeLabel: 'Abholzeit',
  selectTime: 'Zeit auswählen',
  remove: 'Entfernen',
  billingAddress: 'Rechnungsadresse',
  shippingSameAsBilling: 'Lieferadresse identisch mit Rechnungsadresse',
  shippingAddress: 'Lieferadresse',
  shippingAddressPrompt: 'Bitte wähle eine Lieferadresse.',
  voucherCode: 'Gutschein-Code',
  voucherPlaceholder: 'FF-GIFT-XXXXXXXX',
  voucherRedeem: 'Einlösen',
  voucherRemove: 'Entfernen',
  voucherEmptyError: 'Bitte gib einen Gutschein-Code ein.',
  voucherInvalidError: 'Ungültiger Gutschein-Code.',
  voucherNetworkError: 'Verbindungsfehler. Bitte versuche es erneut.',
  voucherApplied: (value: number) => `Gutschein €${value} angewendet!`,
  payment: 'Zahlung',
  payWithVoucher: 'Jetzt mit Gutschein bestellen',
  processingOrder: 'Bestellung wird bearbeitet…',
  goToPayment: 'Zur Zahlung',
  cancelPayment: 'Zahlung abbrechen',
  tryAgain: 'Erneut versuchen',
  yourCart: 'Warenkorb',
  orderFailed: 'Bestellung fehlgeschlagen.',
  connectionError: 'Verbindungsfehler. Bitte versuche es erneut.',
  or: 'oder',
  total: 'Gesamt',
  errorPrefix: 'Fehler',
}

const CHECKOUT_EN = {
  processingPayment: 'Processing your payment…',
  cartEmpty: 'Your cart is empty.',
  continueShopping: 'Continue shopping?',
  contact: 'Contact',
  loginBtn: 'Log in',
  createAccount: 'Create an account',
  notYou: 'Not you?',
  logOut: 'Log out',
  guestPrompt: 'Enter your name and email to checkout as a guest.',
  nameLabel: 'Full name',
  namePlaceholder: 'e.g. Jane Doe',
  emailLabel: 'Email Address',
  continueAsGuest: 'Continue as guest',
  address: 'Address',
  noShipping: 'Workshop / digital product — no shipping address required.',
  storePickup: 'Store Pickup',
  pickupWorkshopNote:
    'Your cart also includes a workshop. The pickup details below apply to the physical products only — your workshop date stays as booked.',
  viewOnMaps: 'View on Google Maps',
  pickupDateLabel: 'Pickup Date',
  pickupTimeLabel: 'Pickup Time',
  selectTime: 'Select a time',
  remove: 'Remove',
  billingAddress: 'Billing address',
  shippingSameAsBilling: 'Shipping is the same as billing',
  shippingAddress: 'Shipping address',
  shippingAddressPrompt: 'Please select a shipping address.',
  voucherCode: 'Voucher Code',
  voucherPlaceholder: 'FF-GIFT-XXXXXXXX',
  voucherRedeem: 'Redeem',
  voucherRemove: 'Remove',
  voucherEmptyError: 'Please enter a voucher code.',
  voucherInvalidError: 'Invalid voucher code.',
  voucherNetworkError: 'Connection error. Please try again.',
  voucherApplied: (value: number) => `Voucher €${value} applied!`,
  payment: 'Payment',
  payWithVoucher: 'Order with voucher',
  processingOrder: 'Processing order…',
  goToPayment: 'Go to payment',
  cancelPayment: 'Cancel payment',
  tryAgain: 'Try again',
  yourCart: 'Your cart',
  orderFailed: 'Order failed.',
  connectionError: 'Connection error. Please try again.',
  or: 'or',
  total: 'Total',
  errorPrefix: 'Error',
}

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

// Default pickup location — overridden at runtime by the first active
// workshop-locations record (admin-managed). Kept here as a static fallback
// in case the fetch fails or no locations are configured yet.
const DEFAULT_PICKUP_LOCATION = {
  id: 'the-ginery',
  name: 'The Ginery',
  address: 'Grabenstraße 15, 8010 Graz, Austria',
  mapLink: 'https://www.google.com/maps/search/The+Ginery+Grabenstra%C3%9Fe+15+Graz/',
  openingHours: {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '10:00', close: '16:00' },
    sunday: { open: 'closed', close: 'closed' },
  },
}

const buildMapLink = (name: string, address: string) =>
  `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${address}`)}`

const PICKUP_TIME_VALUES = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const { locale } = useLocale()
  const isDe = locale === 'de'
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [error, setError] = useState<null | string>(null)
  /**
   * State to manage the email input for guest checkout.
   */
  const [email, setEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  /* ── Pickup State ── */
  const [pickupDate, setPickupDate] = useState<string>('')
  const [pickupTime, setPickupTime] = useState<string>('')
  const [pickupLocation, setPickupLocation] = useState(DEFAULT_PICKUP_LOCATION)

  /* ── Voucher Code State ── */
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherApplied, setVoucherApplied] = useState<{
    code: string
    value: number
  } | null>(null)
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [voucherLoading, setVoucherLoading] = useState(false)
  // Workshop booking metadata (date/time/pricePerPerson) — stored in localStorage by add-to-cart-utils
  // because the Payload ecommerce plugin has no per-item metadata field.
  const [bookingMetadata, setBookingMetadata] = useState<
    Record<
      string,
      {
        workshopSlug: string
        date: string
        time: string
        pricePerPerson: number
        guestCount: number
        locationName?: string | null
        locationAddress?: string | null
      }
    >
  >({})
  const checkoutEmail = email || user?.email || ''
  const t = isDe ? CHECKOUT_DE : CHECKOUT_EN

  // Load workshop bookings from localStorage so we can show appointment date/time per item.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('workshopBookings')
    if (!stored) return
    try {
      setBookingMetadata(JSON.parse(stored))
    } catch (error) {
      console.error('Failed to parse workshop bookings from localStorage:', error)
    }
  }, [])

  // Fetch the active pickup location from the workshop-locations collection.
  // Falls back to DEFAULT_PICKUP_LOCATION on any error / empty result.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `/api/workshop-locations?where[isActive][equals]=true&limit=1&depth=0&locale=${locale}`,
          { cache: 'no-store' },
        )
        if (!res.ok) return
        const json = (await res.json()) as {
          docs?: { id: string; name?: string; address?: string }[]
        }
        const loc = json?.docs?.[0]
        if (!cancelled && loc?.name && loc?.address) {
          setPickupLocation({
            ...DEFAULT_PICKUP_LOCATION,
            id: loc.id,
            name: loc.name,
            address: loc.address,
            mapLink: buildMapLink(loc.name, loc.address),
          })
        }
      } catch {
        // ignore — fallback used
      }
    })()
    return () => {
      cancelled = true
    }
  }, [locale])

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  // Digital products (courses) and workshops don't need a shipping address.
  const isAllDigital = Boolean(
    cart?.items?.length &&
    cart.items.every((item) => {
      if (typeof item.product !== 'object' || item.product === null) return false
      const p = item.product as {
        courseSlug?: string | null
        slug?: string | null
        productType?: string | null
      }
      const hasCourseSlug = Boolean(p.courseSlug)
      const slugIsCourse = typeof p.slug === 'string' && p.slug.toLowerCase().includes('course')
      const isWorkshop =
        p.productType === 'workshop' ||
        (typeof p.slug === 'string' && p.slug.startsWith('workshop-'))
      return hasCourseSlug || slugIsCourse || isWorkshop
    }),
  )

  // Any physical item in the cart triggers store pickup (covers pure-physical AND
  // mixed carts like workshop + jar — the workshop is in-person, the jar is picked up).
  const hasPhysicalItem = Boolean(
    cart?.items?.some((item) => {
      if (typeof item.product !== 'object' || item.product === null) return false
      const p = item.product as {
        productType?: string | null
        courseSlug?: string | null
        slug?: string | null
      }
      const isPhysical = ['jarred', 'fresh', 'bottled'].includes(p.productType || '')
      const notDigital = !p.courseSlug && !(p.slug && p.slug.includes('course'))
      return isPhysical && notDigital
    }),
  )

  // Backwards-compatible alias used by the JSX/payment branch below.
  const isAllPhysicalPickup = hasPhysicalItem

  const hasWorkshop = Boolean(
    cart?.items?.some((item) => {
      if (typeof item.product !== 'object' || item.product === null) return false
      const p = item.product as { productType?: string | null; slug?: string | null }
      return (
        p.productType === 'workshop' ||
        (typeof p.slug === 'string' && p.slug.startsWith('workshop-'))
      )
    }),
  )

  // Button enable rules:
  //   - all-digital cart (workshops + online courses only): email is enough.
  //   - any physical item: email + pickup date + pickup time.
  //   - otherwise (legacy fallback): email + billing/shipping address.
  const canGoToPayment = Boolean(
    checkoutEmail &&
    (isAllDigital
      ? true
      : hasPhysicalItem
        ? pickupDate && pickupTime
        : billingAddress && (billingAddressSameAsShipping || shippingAddress)),
  )

  // Get available pickup time slots (only times 3+ hours from now)
  const getAvailableTimeSlots = useCallback(() => {
    const allTimeSlots = PICKUP_TIME_VALUES.map((value) => ({
      value,
      label: formatTimeForLocale(value, locale),
    }))

    // If no date selected, return all slots
    if (!pickupDate) return allTimeSlots

    const now = new Date()
    const selectedDate = new Date(pickupDate)
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // If selected date is in the future, allow all times
    if (selectedDate > todayDate) {
      return allTimeSlots
    }

    // If selected date is today, filter out times less than 3 hours away
    if (selectedDate.getTime() === todayDate.getTime()) {
      const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000)
      return allTimeSlots.filter((slot) => {
        const [hours, minutes] = slot.value.split(':').map(Number)
        const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
        return slotTime >= threeHoursLater
      })
    }

    return allTimeSlots
  }, [locale, pickupDate])

  // On date change, clear pickup time if it becomes unavailable
  useEffect(() => {
    const availableSlots = getAvailableTimeSlots()
    if (pickupTime && !availableSlots.some((slot) => slot.value === pickupTime)) {
      setPickupTime('')
    }
  }, [pickupDate, pickupTime, getAvailableTimeSlots])

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses, shippingAddress])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  // GA4: begin_checkout — fire once when cart is loaded and non-empty
  useEffect(() => {
    if (!cart?.items?.length) return
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
    gtmBeginCheckout(items, cart.subtotal ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — fire only on mount

  /* ── Voucher Handlers ── */
  const handleApplyVoucher = useCallback(async () => {
    setVoucherError(null)
    const trimmed = voucherCode.trim()
    if (!trimmed) {
      setVoucherError(t.voucherEmptyError)
      return
    }
    setVoucherLoading(true)
    try {
      const res = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setVoucherError(data.error || t.voucherInvalidError)
        return
      }
      setVoucherApplied({ code: data.voucher.code, value: data.voucher.value })
      toast.success(t.voucherApplied(data.voucher.value))
    } catch (_err) {
      setVoucherError(t.voucherNetworkError)
    } finally {
      setVoucherLoading(false)
    }
  }, [voucherCode, t])

  const handleRemoveVoucher = useCallback(() => {
    setVoucherApplied(null)
    setVoucherCode('')
    setVoucherError(null)
  }, [])

  /* ── Computed: voucher covers the full amount? ── */
  // cart.subtotal is in cents; voucher.value is in euros — multiply by 100 to match units
  const discountedTotal = Math.max(0, (cart?.subtotal || 0) - (voucherApplied?.value || 0) * 100)
  const voucherCoversAll = Boolean(voucherApplied && discountedTotal === 0)

  /* ── Place order paid entirely by voucher (no Stripe) ── */
  const handleVoucherOrder = useCallback(async () => {
    if (!voucherApplied) return
    setProcessingPayment(true)
    setError(null)

    try {
      const res = await fetch('/api/voucher/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucherCode: voucherApplied.code,
          customerEmail: email || user?.email,
          customerName: customerName.trim() || user?.name || undefined,
          userId: user?.id,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || t.orderFailed)
        toast.error(data.error || t.orderFailed)
        setProcessingPayment(false)
        return
      }

      // Clear cart client-side
      clearCart()

      const type = hasWorkshop ? 'workshop' : isAllDigital ? 'course' : 'order'
      const emailParam = email ? `&email=${encodeURIComponent(email)}` : ''
      router.push(`/account/order-confirmation?orderId=${data.orderID}&type=${type}${emailParam}`)
    } catch (_err) {
      setError(t.connectionError)
      setProcessingPayment(false)
    }
  }, [voucherApplied, email, customerName, user, clearCart, router, hasWorkshop, isAllDigital, t])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const additionalData: Record<string, unknown> = {
          ...(checkoutEmail ? { customerEmail: checkoutEmail } : {}),
        }

        // For pickup orders, pass pickup info instead of addresses
        if (isAllPhysicalPickup) {
          additionalData.pickupLocation = pickupLocation.name
          additionalData.pickupDate = pickupDate
          additionalData.pickupTime = pickupTime
          additionalData.pickupAddress = pickupLocation.address
        } else {
          // For shipped orders, include addresses
          additionalData.billingAddress = billingAddress
          additionalData.shippingAddress = billingAddressSameAsShipping
            ? billingAddress
            : shippingAddress
        }

        const paymentData = (await initiatePayment(paymentID, {
          additionalData,
        })) as Record<string, unknown>

        if (paymentData) {
          setPaymentData(paymentData)
        }
      } catch (error) {
        const errorData = error instanceof Error ? JSON.parse(error.message) : {}
        let errorMessage = 'An error occurred while initiating payment.'

        if (errorData?.cause?.code === 'OutOfStock') {
          errorMessage = 'One or more items in your cart are out of stock.'
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [
      billingAddress,
      billingAddressSameAsShipping,
      shippingAddress,
      checkoutEmail,
      initiatePayment,
      isAllPhysicalPickup,
      pickupDate,
      pickupTime,
    ],
  )

  if (!stripe) return null

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>{t.processingPayment}</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>{t.cartEmpty}</p>
        <Link href="/search">{t.continueShopping}</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      {/* ── Left Column: Contact, Address, Payment ── */}
      <div className="min-w-0 flex-1 flex flex-col gap-8">
        {/* ── Contact Section ── */}
        <section className="rounded-xl border border-ff-border-light bg-white p-6 sm:p-8">
          <h2 className="mb-6 font-display text-subheading font-bold text-ff-near-black">
            {t.contact}
          </h2>
          {!user && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-[#f5f1e8] p-4">
              <Button asChild variant="outline" className="font-display font-bold">
                <Link href="/login">{t.loginBtn}</Link>
              </Button>
              <span className="text-body-sm text-ff-gray-text-light">{t.or}</span>
              <Link
                href="/create-account"
                className="font-display text-body-sm font-bold text-ff-near-black underline underline-offset-2 hover:text-ff-gold-accent"
              >
                {t.createAccount}
              </Link>
            </div>
          )}
          {user ? (
            <div className="flex items-center justify-between rounded-lg bg-[#f5f1e8] px-5 py-4">
              <div>
                <p className="font-display text-body font-bold text-ff-near-black">{user.email}</p>
                <p className="mt-0.5 text-body-sm text-ff-gray-text-light">
                  {t.notYou}{' '}
                  <Link
                    className="font-bold underline underline-offset-2 hover:text-ff-near-black"
                    href="/logout"
                  >
                    {t.logOut}
                  </Link>
                </p>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ff-near-black">
                <svg
                  className="size-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-body-sm text-ff-gray-text-light">{t.guestPrompt}</p>
              <FormItem>
                <Label
                  htmlFor="customerName"
                  className="font-display text-body-sm font-bold text-ff-near-black"
                >
                  {t.nameLabel}
                </Label>
                <Input
                  disabled={!emailEditable}
                  id="customerName"
                  name="customerName"
                  autoComplete="name"
                  onChange={(e) => setCustomerName(e.target.value)}
                  value={customerName}
                  required
                  type="text"
                  placeholder={t.namePlaceholder}
                  minLength={2}
                  maxLength={250}
                  className="rounded-md border-ff-border-light bg-[#f9f7f3] focus:border-ff-near-black focus:ring-ff-near-black"
                />
              </FormItem>
              <FormItem>
                <Label
                  htmlFor="email"
                  className="font-display text-body-sm font-bold text-ff-near-black"
                >
                  {t.emailLabel}
                </Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  className="rounded-md border-ff-border-light bg-[#f9f7f3] focus:border-ff-near-black focus:ring-ff-near-black"
                />
              </FormItem>
              <Button
                disabled={!email || customerName.trim().length < 2 || !emailEditable}
                onClick={(e) => {
                  e.preventDefault()
                  setEmailEditable(false)
                }}
                className="rounded-full bg-ff-near-black px-6 font-display font-bold text-white hover:bg-ff-near-black/80"
              >
                {t.continueAsGuest}
              </Button>
            </div>
          )}
        </section>

        {/* ── Address/Pickup Section ── */}
        {isAllDigital ? (
          <section className="rounded-xl border border-ff-border-light bg-white p-6 sm:p-8">
            <h2 className="mb-6 font-display text-subheading font-bold text-ff-near-black">
              {t.address}
            </h2>
            <div className="flex flex-row items-center gap-3 rounded-lg bg-[#f5f1e8] px-5 py-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="shrink-0 text-[#555954]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-body-sm font-medium text-[#555954]">{t.noShipping}</span>
            </div>
          </section>
        ) : isAllPhysicalPickup ? (
          <section className="rounded-xl border border-ff-border-light bg-white p-6 sm:p-8">
            <h2 className="mb-6 font-display text-subheading font-bold text-ff-near-black">
              {t.storePickup}
            </h2>
            {hasWorkshop && (
              <div className="mb-6 rounded-lg bg-[#f5f1e8] px-5 py-4 text-body-sm text-[#555954]">
                {t.pickupWorkshopNote}
              </div>
            )}
            {/* Pickup Location */}
            <div className="mb-6 rounded-lg border border-ff-border-light bg-[#f9f7f3] p-4">
              <h3 className="mb-3 font-display font-semibold text-ff-near-black">
                {pickupLocation.name}
              </h3>
              <p className="mb-3 text-body-sm text-ff-gray-text-light">{pickupLocation.address}</p>
              <a
                href={pickupLocation.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-ff-gold-accent underline hover:text-ff-near-black"
              >
                {t.viewOnMaps}
              </a>
            </div>

            {/* Pickup Date */}
            <FormItem className="mb-6">
              <Label
                htmlFor="pickupDate"
                className="font-display text-body-sm font-bold text-ff-near-black"
              >
                {t.pickupDateLabel}
              </Label>
              <Input
                id="pickupDate"
                name="pickupDate"
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                disabled={Boolean(paymentData)}
                min={new Date().toISOString().split('T')[0]}
                className="rounded-md border-ff-border-light bg-white focus:border-ff-near-black focus:ring-ff-near-black"
              />
            </FormItem>

            {/* Pickup Time */}
            <FormItem>
              <Label
                htmlFor="pickupTime"
                className="font-display text-body-sm font-bold text-ff-near-black"
              >
                {t.pickupTimeLabel}
              </Label>
              <select
                id="pickupTime"
                name="pickupTime"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                disabled={Boolean(paymentData) || !pickupDate}
                className="w-full rounded-md border border-ff-border-light bg-white px-4 py-2 text-body-sm focus:border-ff-near-black focus:ring-ff-near-black disabled:opacity-50"
              >
                <option value="">{t.selectTime}</option>
                {getAvailableTimeSlots().map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </FormItem>
          </section>
        ) : (
          <section className="rounded-xl border border-ff-border-light bg-white p-6 sm:p-8">
            <h2 className="mb-6 font-display text-subheading font-bold text-ff-near-black">
              {t.address}
            </h2>

            {billingAddress ? (
              <div>
                <AddressItem
                  actions={
                    <Button
                      variant={'outline'}
                      disabled={Boolean(paymentData)}
                      onClick={(e) => {
                        e.preventDefault()
                        setBillingAddress(undefined)
                      }}
                    >
                      {t.remove}
                    </Button>
                  }
                  address={billingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses heading={t.billingAddress} setAddress={setBillingAddress} />
            ) : (
              <CreateAddressModal
                disabled={!email || Boolean(emailEditable)}
                callback={(address) => {
                  setBillingAddress(address)
                }}
                skipSubmission={true}
              />
            )}

            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="shippingTheSameAsBilling"
                checked={billingAddressSameAsShipping}
                disabled={Boolean(paymentData || (!user && (!email || Boolean(emailEditable))))}
                onCheckedChange={(state) => {
                  setBillingAddressSameAsShipping(state as boolean)
                }}
              />
              <Label
                htmlFor="shippingTheSameAsBilling"
                className="text-body-sm text-ff-gray-text-light"
              >
                {t.shippingSameAsBilling}
              </Label>
            </div>

            {!billingAddressSameAsShipping && (
              <>
                {shippingAddress ? (
                  <div>
                    <AddressItem
                      actions={
                        <Button
                          variant={'outline'}
                          disabled={Boolean(paymentData)}
                          onClick={(e) => {
                            e.preventDefault()
                            setShippingAddress(undefined)
                          }}
                        >
                          {t.remove}
                        </Button>
                      }
                      address={shippingAddress}
                    />
                  </div>
                ) : user ? (
                  <CheckoutAddresses
                    heading={t.shippingAddress}
                    description={t.shippingAddressPrompt}
                    setAddress={setShippingAddress}
                  />
                ) : (
                  <CreateAddressModal
                    callback={(address) => {
                      setShippingAddress(address)
                    }}
                    disabled={!email || Boolean(emailEditable)}
                    skipSubmission={true}
                  />
                )}
              </>
            )}
          </section>
        )}

        {!paymentData && voucherCoversAll ? (
          <Button
            className="mt-2 self-start rounded-full bg-ff-near-black px-8 py-3 font-display font-bold text-white hover:bg-ff-near-black/80"
            disabled={!canGoToPayment || isProcessingPayment}
            onClick={(e) => {
              e.preventDefault()
              void handleVoucherOrder()
            }}
          >
            {isProcessingPayment ? t.processingOrder : t.payWithVoucher}
          </Button>
        ) : !paymentData ? (
          <Button
            className="mt-2 self-start rounded-full bg-ff-near-black px-8 py-3 font-display font-bold text-white hover:bg-ff-near-black/80"
            disabled={!canGoToPayment}
            onClick={(e) => {
              e.preventDefault()
              void initiatePaymentIntent('stripe')
            }}
          >
            {t.goToPayment}
          </Button>
        ) : null}

        {!paymentData?.['clientSecret'] && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <Message error={error} />
            <Button
              onClick={(e) => {
                e.preventDefault()
                router.refresh()
              }}
              className="mt-4 rounded-full bg-ff-near-black px-6 font-display font-bold text-white hover:bg-ff-near-black/80"
            >
              {t.tryAgain}
            </Button>
          </div>
        )}

        <Suspense fallback={<React.Fragment />}>
          {!voucherCoversAll && paymentData && typeof paymentData['clientSecret'] === 'string' && (
            <section className="rounded-xl border border-ff-border-light bg-white p-6 sm:p-8">
              <h2 className="mb-6 font-display text-subheading font-bold text-ff-near-black">
                {t.payment}
              </h2>
              {error && <p className="mb-4 text-body-sm text-red-600">{`${t.errorPrefix}: ${error}`}</p>}
              <Elements
                options={{
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      borderRadius: '0.625rem',
                      colorPrimary: '#1a1a1a',
                      gridColumnSpacing: '20px',
                      gridRowSpacing: '20px',
                      colorBackground: '#f9f7f3',
                      colorDanger: cssVariables.colors.error500,
                      colorDangerText: cssVariables.colors.error500,
                      colorIcon: '#1a1a1a',
                      colorText: '#1a1a1a',
                      colorTextPlaceholder: '#9a9a9a',
                      fontFamily: '"Neue Haas Grotesk Text", sans-serif',
                      fontSizeBase: '16px',
                      fontWeightBold: '600',
                      fontWeightNormal: '500',
                      spacingUnit: '4px',
                    },
                  },
                  clientSecret: paymentData['clientSecret'] as string,
                }}
                stripe={stripe}
              >
                <div className="flex flex-col gap-6">
                  <CheckoutForm
                    customerEmail={checkoutEmail}
                    customerName={customerName.trim() || user?.name || ''}
                    billingAddress={billingAddress}
                    setProcessingPayment={setProcessingPayment}
                    isAllDigital={isAllDigital}
                    hasWorkshop={hasWorkshop}
                    pickupDate={pickupDate}
                    pickupTime={pickupTime}
                  />
                  <button
                    className="self-start font-display text-body-sm font-bold text-ff-gray-text-light underline underline-offset-2 transition-colors hover:text-ff-near-black"
                    onClick={() => setPaymentData(null)}
                  >
                    {t.cancelPayment}
                  </button>
                </div>
              </Elements>
            </section>
          )}
        </Suspense>
      </div>

      {!cartIsEmpty && (
        <aside className="order-first w-full lg:order-last lg:w-95 lg:shrink-0 lg:sticky lg:top-8 lg:max-h-[calc(100vh-9rem)]">
          <div className="rounded-xl border border-ff-border-light bg-white overflow-y-auto max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-8rem)] lg:max-h-none p-6 sm:p-8">
            <h2 className="font-display text-subheading font-bold tracking-tight text-ff-near-black">
              {t.yourCart}
            </h2>

            <div className="mt-6 flex flex-col gap-5">
              {cart?.items?.map((item, index) => {
                if (typeof item.product === 'object' && item.product) {
                  const {
                    product,
                    product: { meta, title, gallery },
                    quantity,
                    variant,
                  } = item

                  if (!quantity) return null

                  let image = gallery?.[0]?.image || meta?.image
                  let price = product?.priceInEUR

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

                    if (imageVariant && typeof imageVariant.image !== 'string') {
                      image = imageVariant.image
                    }
                  }

                  return (
                    <div className="flex items-start gap-4" key={index}>
                      <div className="flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ff-border-light bg-[#f9f7f3]">
                        <div className="relative h-full w-full">
                          {image && typeof image !== 'string' && (
                            <Media fill imgClassName="rounded-lg object-cover" resource={image} />
                          )}
                        </div>
                      </div>
                      <div className="flex grow items-center justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-display text-body-sm font-bold leading-snug text-ff-near-black">
                            {title}
                          </p>
                          {variant && typeof variant === 'object' && (
                            <p className="text-caption text-ff-gray-text-light">
                              {variant.options
                                ?.map(
                                  (option: string | import('@/payload-types').VariantOption) => {
                                    if (typeof option === 'object') return option.label
                                    return null
                                  },
                                )
                                .join(', ')}
                            </p>
                          )}
                          {(() => {
                            const isWorkshopBooking =
                              typeof product.slug === 'string' && product.slug.startsWith('workshop-')
                            if (!isWorkshopBooking) return null
                            const workshopSlug = product.slug!.replace('workshop-', '')
                            const booking = Object.values(bookingMetadata).find(
                              (b) => b.workshopSlug === workshopSlug,
                            )
                            if (!booking) return null
                            return (
                              <div className="text-caption text-ff-gray-text-light">
                                <p>{booking.date}</p>
                                <p>{formatTimeForLocale(booking.time, locale)}</p>
                                {booking.locationName && (
                                  <p>
                                    {booking.locationName}
                                    {booking.locationAddress ? ` — ${booking.locationAddress}` : ''}
                                  </p>
                                )}
                              </div>
                            )
                          })()}
                          <p className="text-caption text-ff-gray-text-light">
                            {'×\u2009'}
                            {quantity}
                          </p>
                        </div>

                        {typeof price === 'number' && (
                          <Price
                            className="font-display text-body-sm font-bold text-ff-near-black"
                            amount={price}
                          />
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>

            <div className="my-6 h-px bg-ff-border-light" />

            {/* Voucher Code Section */}
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-body-sm font-bold uppercase tracking-wider text-ff-near-black">
                {t.voucherCode}
              </h3>
              {voucherApplied ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                  <div>
                    <p className="font-mono text-body-sm font-semibold tracking-wide">
                      {voucherApplied.code}
                    </p>
                    <p className="text-caption font-semibold text-green-700">
                      {`-\u20AC${voucherApplied.value.toFixed(2)}`}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-caption font-display font-bold text-ff-gray-text-light underline underline-offset-2 transition-colors hover:text-ff-near-black"
                  >
                    {t.voucherRemove}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder={t.voucherPlaceholder}
                    className="rounded-lg border-ff-border-light font-mono text-body-sm uppercase focus-visible:ring-ff-gold"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleApplyVoucher()
                      }
                    }}
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={voucherLoading || !voucherCode.trim()}
                    className="shrink-0 rounded-lg border border-ff-near-black bg-ff-near-black px-4 py-2 font-display text-body-sm font-bold text-white transition-colors hover:bg-ff-near-black/90 disabled:opacity-40"
                  >
                    {voucherLoading ? '...' : t.voucherRedeem}
                  </button>
                </div>
              )}
              {voucherError && (
                <p className="text-caption font-medium text-red-600">{voucherError}</p>
              )}
            </div>

            <div className="my-6 h-px bg-ff-border-light" />

            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-body font-bold uppercase tracking-wider text-ff-near-black">
                {t.total}
              </span>
              <div className="flex items-baseline justify-end gap-2 text-right">
                {voucherApplied ? (
                  <span className="text-body-sm text-ff-gray-text-light line-through">
                    <Price amount={cart.subtotal || 0} />
                  </span>
                ) : null}
                <Price
                  className="font-display text-subheading sm:text-section-heading font-bold text-ff-near-black leading-none whitespace-nowrap"
                  amount={Math.max(0, (cart.subtotal || 0) - (voucherApplied?.value || 0) * 100)}
                />
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
