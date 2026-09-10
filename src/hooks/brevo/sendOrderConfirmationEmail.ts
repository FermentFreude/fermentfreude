import type { CollectionAfterChangeHook } from 'payload'

import { getAdminRecipients } from '@/lib/adminNotification'
import { BREVO_TEMPLATES, sendTemplateEmail, sendTransactionalEmail } from '@/lib/brevo'

/**
 * Send order confirmation email via Brevo after a new order is created.
 * Orders are only created after Stripe confirms payment, so
 * operation === 'create' means the payment succeeded.
 */
export const sendOrderConfirmationEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc
  // Set by callers that already send their own customer + admin notification
  // for this order (e.g. voucher purchases — see sendVoucherPurchaseEmail.ts)
  // to avoid double-emailing the customer and double-pinging the admin.
  if (req?.context?.skipOrderConfirmationEmail) return doc

  const customerId = typeof doc.customer === 'object' ? doc.customer?.id : doc.customer

  try {
    let recipientEmail: string | undefined
    let recipientName: string | undefined

    if (customerId) {
      const user = await req.payload.findByID({
        collection: 'users',
        id: customerId,
        depth: 0,
        overrideAccess: true,
      })
      recipientEmail = user?.email
      recipientName = user?.name || undefined
    } else if (doc.customerEmail) {
      recipientEmail = doc.customerEmail
    }

    if (
      !recipientName &&
      typeof doc.customerName === 'string' &&
      doc.customerName.trim().length > 0
    ) {
      recipientName = doc.customerName.trim()
    }

    if (!recipientEmail) return doc

    const items: {
      product?: string | { id?: string; title?: string } | null
      variant?: string | { id?: string; title?: string } | null
      quantity?: number
    }[] = doc.items ?? []

    const fmtEuro = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`

    // ─── Resolve product details for each line item (image, sku, price) ───
    type ResolvedItem = {
      title: string
      sku: string
      thumbUrl: string
      shortDesc: string
      qty: number
      unitCents: number | null
    }
    const resolvedItems: ResolvedItem[] = []
    for (const item of items) {
      const qty = item.quantity ?? 1
      let productDoc: (Record<string, unknown> & { id?: string; title?: string }) | undefined
      const productRef = item.product
      if (typeof productRef === 'string') {
        try {
          productDoc = (await req.payload.findByID({
            collection: 'products',
            id: productRef,
            depth: 2,
            overrideAccess: true,
          })) as unknown as Record<string, unknown> & { id?: string; title?: string }
        } catch {
          productDoc = undefined
        }
      } else if (productRef && typeof productRef === 'object') {
        productDoc = productRef as unknown as Record<string, unknown> & {
          id?: string
          title?: string
        }
      }

      const title = (productDoc?.title as string | undefined) ?? 'Product'
      const shortDesc = (productDoc?.shortDescription as string | undefined) ?? ''
      const sku = (productDoc?.sku as string | undefined) ?? ''
      const unitCentsRaw = productDoc?.priceInEUR
      const unitCents = typeof unitCentsRaw === 'number' ? unitCentsRaw : null

      // Resolve thumbnail from first gallery image
      let thumbUrl = ''
      const gallery = productDoc?.gallery as { image?: { url?: string } | string }[] | undefined
      if (Array.isArray(gallery) && gallery.length > 0) {
        const first = gallery[0]
        if (first && typeof first.image === 'object' && first.image?.url) {
          thumbUrl = first.image.url
        }
      }

      // For workshop products with no gallery image, try the workshops collection cover image
      const productSlugRaw = productDoc?.slug as string | undefined
      if (!thumbUrl && typeof productSlugRaw === 'string' && productSlugRaw.startsWith('workshop-')) {
        const wsSlug = productSlugRaw.replace('workshop-', '')
        try {
          const wsResult = await req.payload.find({
            collection: 'workshops',
            where: { slug: { equals: wsSlug } },
            limit: 1,
            depth: 2,
            overrideAccess: true,
          })
          const ws = wsResult.docs[0] as unknown as
            | Record<string, unknown>
            | undefined
          if (ws) {
            const heroImg = ws.heroImage as { url?: string } | undefined
            if (heroImg?.url) thumbUrl = heroImg.url
            if (!thumbUrl) {
              const wsGallery = ws.gallery as { image?: { url?: string } }[] | undefined
              thumbUrl = wsGallery?.[0]?.image?.url ?? ''
            }
          }
        } catch {
          // non-fatal — fall through to placeholder below
        }
        // Placeholder: the dark submark served from the Next.js public folder
        if (!thumbUrl) {
          thumbUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'}/submark-dark.png`
        }
      }

      resolvedItems.push({ title, sku, thumbUrl, shortDesc, qty, unitCents })
    }

    // Plain-text comma string (for ORDER_ITEMS param)
    const itemSummary = resolvedItems.map((i) => `${i.title} x${i.qty}`).join(', ')

    // Structured items array for the Brevo template loop `{% for item in params.ITEMS %}`
    type BrevoItem = { IMAGE_URL: string; TITLE: string; QUANTITY: string; PRICE: string }
    const itemsArray: BrevoItem[] = resolvedItems.map((i) => {
      const lineCents = i.unitCents !== null ? i.unitCents * i.qty : null
      return {
        IMAGE_URL: i.thumbUrl,
        TITLE: i.title,
        QUANTITY: String(i.qty),
        PRICE: lineCents !== null ? fmtEuro(lineCents) : '',
      }
    })

    // ─── Extract Workshop Details ───────────────────────────────
    // Look for workshop-bookings that match this order by checking the cart/transaction
    // For now, extract from items if any are workshop products
    let workshopDate = ''
    let workshopTime = ''
    let workshopLocation = ''
    let guestCount = 0
    let workshopPrice = ''
    // Display name per seat across all workshop bookings on this order — the
    // admin notification lists these individually rather than just a count,
    // same "Gast von {buyer}" fallback the roster dashboard uses for an
    // unnamed extra seat, so every guest is traceable at a glance.
    const guestNames: string[] = []

    // Cart-derived monetary breakdown
    let cartSubtotal: number | null = null
    let cartShipping: number | null = null
    let isPickup = false

    // Try to find workshop bookings associated with this order
    try {
      // Read the transaction off doc.transactions (already populated — it's
      // part of the `data` the ecommerce plugin's confirmOrder passes into
      // payload.create()) rather than querying transactions by `order: {equals:
      // doc.id}`. That reverse link is written in a SEPARATE payload.update()
      // call the plugin makes only AFTER payload.create() (and therefore every
      // Order afterChange hook, this one included) has already finished — so
      // querying by it here always returns zero results, workshopDate never
      // gets populated, and the skip-guard below never fires. Confirmed via
      // @payloadcms/plugin-ecommerce's stripe/confirmOrder.js. Same pattern
      // confirmWorkshopBookings.ts and redeemVoucherOnOrderComplete.ts already
      // use correctly for this exact reason.
      const transactionRef = Array.isArray(doc.transactions) ? doc.transactions[0] : undefined
      const transactionId =
        transactionRef && typeof transactionRef === 'object' ? transactionRef.id : transactionRef

      const transaction = transactionId
        ? await req.payload.findByID({
            collection: 'transactions',
            id: String(transactionId),
            depth: 0,
            overrideAccess: true,
          })
        : null

      if (transaction) {
        const cartId =
          typeof transaction.cart === 'object' ? transaction.cart?.id : transaction.cart

        if (cartId) {
          // Pull cart for subtotal/shipping breakdown
          try {
            const cart = await req.payload.findByID({
              collection: 'carts',
              id: cartId,
              depth: 0,
              overrideAccess: true,
            })
            const c = cart as unknown as Record<string, unknown>
            if (typeof c?.subtotal === 'number') cartSubtotal = c.subtotal as number
            if (typeof c?.shipmentTotal === 'number') cartShipping = c.shipmentTotal as number
            else if (typeof c?.shipping === 'number') cartShipping = c.shipping as number
          } catch {
            // ignore — cart fields are best-effort
          }

          // Find ALL workshop bookings with this cart ID (A5 — was docs[0])
          const bookings = await req.payload.find({
            collection: 'workshop-bookings',
            where: {
              cartSlug: {
                equals: cartId,
              },
            },
            limit: 50,
            overrideAccess: true,
          })

          if (bookings.totalDocs > 0) {
            // Surface first booking through the legacy singular params
            const first = bookings.docs[0]
            workshopDate = first.date || ''
            workshopTime = first.time || ''
            guestCount = first.guestCount || 0
            workshopPrice = first.totalPrice ? `€${first.totalPrice.toFixed(2)}` : ''

            // Add workshop bookings to items array for the Brevo template loop
            for (const b of bookings.docs) {
              let locName = ''
              let locAddress = ''
              if (b.appointmentId) {
                try {
                  const appointment = await req.payload.findByID({
                    collection: 'workshop-appointments',
                    id: b.appointmentId,
                    depth: 1,
                    overrideAccess: true,
                  })
                  if (appointment && (appointment as { location?: unknown }).location) {
                    const loc = (appointment as { location?: unknown }).location
                    if (typeof loc === 'object' && loc !== null) {
                      const l = loc as { name?: string; address?: string }
                      locName = l.name ?? ''
                      locAddress = l.address ?? ''
                    } else if (typeof loc === 'string') {
                      locName = loc
                    }
                  }
                } catch {
                  // ignore — location is best-effort
                }
              }
              if (!workshopLocation && locName) workshopLocation = locName

              const linePrice =
                typeof b.totalPrice === 'number'
                  ? `€${b.totalPrice.toFixed(2).replace('.', ',')}`
                  : ''
              const guestCountNum = typeof b.guestCount === 'number' ? b.guestCount : 1

              const bBuyerName =
                [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email || '—'
              const bSeats = Array.isArray(
                (b as unknown as { seats?: Array<{ recipientName?: string }> }).seats,
              )
                ? (b as unknown as { seats?: Array<{ recipientName?: string }> }).seats!
                : []
              for (let si = 0; si < Math.max(guestCountNum, 1); si++) {
                const isBuyerSeat = si === 0
                const seatName = bSeats[si]?.recipientName?.trim()
                guestNames.push(seatName || (isBuyerSeat ? bBuyerName : `Gast von ${bBuyerName}`))
              }

              const titleParts = [
                String(b.workshopTitle ?? 'Workshop'),
                [String(b.date ?? ''), String(b.time ?? '')].filter((s) => s).join(' '),
              ]
              if (locName) titleParts.push(locName + (locAddress ? `, ${locAddress}` : ''))
              itemsArray.push({
                IMAGE_URL: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'}/submark-dark.png`,
                TITLE: titleParts.filter((s) => s).join(' · '),
                QUANTITY: `${guestCountNum} ${guestCountNum === 1 ? 'Person' : 'Personen'}`,
                PRICE: linePrice,
              })
            }

            // Pickup detection: any workshop booking implies on-site pickup
            isPickup = true
          }
        }
      }
    } catch (err) {
      req.payload.logger.warn(
        `[Brevo] Could not fetch workshop details for order ${doc.id}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    // Pickup also true if no shipping address and no shipping cost
    const addrHasContent = !!(
      doc.shippingAddress &&
      (doc.shippingAddress.addressLine1 || doc.shippingAddress.postalCode)
    )
    if (!addrHasContent && (cartShipping === null || cartShipping === 0)) {
      isPickup = true
    }

    // Payload ecommerce / Stripe store amounts in the smallest currency unit (cents).
    // Convert to euros for display.
    const fmtMoney = (cents: number) => `€${(cents / 100).toFixed(2).replace('.', ',')}`

    const orderTotalNum = typeof doc.amount === 'number' ? doc.amount : null
    const computedSubtotal =
      cartSubtotal ??
      (orderTotalNum !== null && cartShipping !== null ? orderTotalNum - cartShipping : null)

    // SHIPPING param: for pickup orders show "Abholung — {locationName}",
    // otherwise the formatted shipping cost (or €0,00 fallback).
    // PICKUP_BOOKING_URL: only for a non-workshop pickup order (workshopDate
    // empty) — the Google Appointment Schedule link the customer uses to
    // book their exact pickup time. Workshop orders are unaffected — they
    // keep their own appointment system.
    let shippingDisplay: string
    let pickupBookingUrl = ''
    let pickupLabel = ''
    if (isPickup) {
      pickupLabel = workshopLocation
      if (!pickupLabel && workshopDate) {
        // Workshop order with no location resolved yet — unchanged fallback.
        try {
          const locations = await req.payload.find({
            collection: 'workshop-locations',
            limit: 1,
            overrideAccess: true,
          })
          const loc = locations.docs[0] as { name?: string } | undefined
          if (loc?.name) pickupLabel = loc.name
        } catch {
          // ignore
        }
      } else if (!workshopDate) {
        // Physical-product order — the shop's own fixed pickup address, not
        // a workshop venue.
        try {
          const settings = await req.payload.findGlobal({
            slug: 'product-pickup-settings',
            depth: 0,
            overrideAccess: true,
          })
          if (settings?.locationName) pickupLabel = settings.locationName
          if (settings?.googleScheduleUrl) pickupBookingUrl = settings.googleScheduleUrl
        } catch {
          // ignore
        }
      }
      shippingDisplay = pickupLabel ? `Abholung — ${pickupLabel}` : 'Abholung'
    } else {
      shippingDisplay = cartShipping !== null ? fmtMoney(cartShipping) : '€0,00'
    }

    // Format shipping address (best effort)
    let shippingAddressStr = ''
    const addr = doc.shippingAddress as Record<string, string | null | undefined> | undefined
    if (addr) {
      const lines = [
        [addr.firstName, addr.lastName].filter(Boolean).join(' '),
        addr.company,
        addr.addressLine1,
        addr.addressLine2,
        [addr.postalCode, addr.city].filter(Boolean).join(' '),
        addr.country,
      ].filter((l) => l && String(l).trim())
      shippingAddressStr = lines.join('\n')
    }

    const orderNumber = String(doc.id).slice(-8).toUpperCase()

    const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fermentfreude.at'

    // Download token is generated by the generateDownloadToken beforeChange hook
    // before the order is saved — so it is always present in doc by the time this
    // afterChange hook fires.
    const downloadToken =
      typeof (doc as { downloadToken?: unknown }).downloadToken === 'string'
        ? (doc as { downloadToken?: string }).downloadToken!
        : ''
    if (!downloadToken) {
      req.payload.logger.warn(
        `[Brevo] Order ${doc.id} has no downloadToken — receipt link will be empty.`,
      )
    }

    const RECEIPT_URL = downloadToken
      ? `${siteUrl}/api/orders/${doc.id}/receipt?token=${downloadToken}`
      : ''

    // ─── Resolve ORDER_ITEMS_HTML and SUBTOTAL with safe fallbacks ────────
    // If the order has no product line items (e.g. workshop-only purchase),
    // fall back to the workshop booking blocks so the email is never empty.
    // SUBTOTAL must always have a value — fall back to total minus shipping,
    // or the total itself if we have nothing else.
    const safeOrderItemsSummary =
      itemSummary ||
      (workshopDate ? `Workshop ${workshopDate}${workshopTime ? ` ${workshopTime}` : ''}` : '')
    const safeSubtotal =
      computedSubtotal !== null
        ? fmtMoney(computedSubtotal)
        : orderTotalNum !== null
          ? fmtMoney(orderTotalNum)
          : ''

    const emailParams: Record<string, string | BrevoItem[]> = {
      ORDER_ID: String(doc.id),
      ORDER_NUMBER: orderNumber,
      ORDER_TOTAL: orderTotalNum !== null ? fmtMoney(orderTotalNum) : '',
      TOTAL: orderTotalNum !== null ? fmtMoney(orderTotalNum) : '',
      SUBTOTAL: safeSubtotal,
      SHIPPING: shippingDisplay,
      SHIPPING_ADDRESS: shippingAddressStr,
      ORDER_ITEMS: safeOrderItemsSummary,
      ITEMS: itemsArray,
      CUSTOMER_NAME: recipientName || recipientEmail,
      FIRST_NAME: recipientName?.split(' ')[0] || recipientName || recipientEmail,
      // Pinned to Europe/Vienna — without an explicit timeZone this reads the
      // SERVER's local date (UTC on Vercel), which can format an evening
      // Vienna order to the previous calendar day.
      ORDER_DATE: new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Vienna' }),
      // ORDER_URL is only shown for registered users (template uses IS_REGISTERED_USER guard)
      ORDER_URL: `${siteUrl}/account/orders`,
      SHOP_URL: `${siteUrl}/workshops`,
      RECEIPT_URL,
      ...(pickupBookingUrl ? { PICKUP_BOOKING_URL: pickupBookingUrl } : {}),
      // 1 = registered user, '' = guest — template uses this to conditionally show "View order" button
      IS_REGISTERED_USER: customerId ? '1' : '',
      PRIVACY_URL: `${siteUrl}/datenschutz`,
      AGB_URL: `${siteUrl}/agb`,
    }

    // Add workshop details if found
    if (workshopDate) {
      emailParams.WORKSHOP_DATE = workshopDate
    }
    if (workshopTime) {
      emailParams.WORKSHOP_TIME = workshopTime
    }
    if (workshopLocation) {
      emailParams.WORKSHOP_LOCATION = workshopLocation
    }
    if (guestCount > 0) {
      emailParams.GUEST_COUNT = String(guestCount)
    }
    if (workshopPrice) {
      emailParams.TOTAL_PRICE = workshopPrice
    }

    // Workshop orders already got their confirmation email — with the same
    // invoice-download button — from confirmWorkshopBookings (runs earlier in
    // this same afterChange chain). Sending this one too would double-email
    // the customer for one purchase. The admin notification below still runs
    // unconditionally — it's the one place that pings admin for every order.
    let customerSendFailed = false
    if (!workshopDate) {
      const result = await sendTemplateEmail({
        to: [{ email: recipientEmail, name: recipientName }],
        templateId: BREVO_TEMPLATES.ORDER_CONFIRMATION,
        params: emailParams,
      })
      customerSendFailed = !result.success
      if (customerSendFailed) {
        req.payload.logger.error(
          `[Brevo] Order confirmation email FAILED to send for order ${doc.id} (${recipientEmail}) — see prior [Brevo] log line for the API error.`,
        )
      }
    } else {
      req.payload.logger.info(
        `[Brevo] Skipping duplicate order-confirmation email for order ${doc.id} — workshop booking confirmation already covers this.`,
      )
    }

    // ─── Admin notification — the ONE notification for this order ─────────
    // Every order, regardless of how it was created (Stripe checkout, or a
    // voucher redeemed via voucher/place-order with no Stripe transaction at
    // all), passes through this hook exactly once — so this is the single
    // place that pings admin, describing what actually happened rather than
    // a generic "order created". confirmWorkshopBookings (which runs earlier
    // in this same afterChange chain) intentionally does NOT send its own
    // admin email anymore, to avoid double-notifying for one purchase.
    try {
      const warningBlock = customerSendFailed
        ? `<p style="font-family:sans-serif;background:#FEF3C7;color:#92400E;padding:12px 16px;border-radius:8px;margin:0 0 16px">
             ⚠️ Die Bestellbestätigung an den/die Kund:in konnte NICHT gesendet werden (Brevo-Fehler). Bitte manuell nachfassen.
           </p>`
        : ''

      const isWorkshopOrder = Boolean(workshopDate)
      // Set by voucher/place-order when the order was paid entirely with a
      // redeemed voucher (amount = 0) — without this, a €0,00 order reads
      // like a mistake instead of what it actually is.
      const paidByVoucher =
        typeof req.context?.paidByVoucher === 'string' ? (req.context.paidByVoucher as string) : null

      const workshopTitle = resolvedItems[0]?.title || 'Workshop'
      const headingLabel = isWorkshopOrder
        ? `Neue Buchung: ${workshopTitle}`
        : `Neue Bestellung: ${orderNumber}`
      const subjectSuffix = paidByVoucher
        ? ` · bezahlt mit Gutschein ${paidByVoucher}`
        : orderTotalNum !== null
          ? ` · ${fmtMoney(orderTotalNum)}`
          : ''
      const amountDisplay = paidByVoucher
        ? `Gutschein ${paidByVoucher}`
        : orderTotalNum !== null
          ? fmtMoney(orderTotalNum)
          : ''

      const customerPhone =
        typeof doc.customerPhone === 'string' && doc.customerPhone.trim() ? doc.customerPhone.trim() : ''
      const customerDietSpecs =
        typeof doc.customerDietSpecs === 'string' && doc.customerDietSpecs.trim()
          ? doc.customerDietSpecs.trim()
          : ''

      const productPickupStatus =
        typeof doc.pickupStatus === 'string' && doc.pickupStatus ? doc.pickupStatus : 'pending'

      const orderPlacedAt =
        typeof doc.createdAt === 'string' && doc.createdAt
          ? `${new Date(doc.createdAt).toLocaleString('de-DE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Vienna',
            })} Uhr`
          : '—'

      const paymentMethodDisplay = paidByVoucher
        ? `Gutschein (${paidByVoucher})`
        : doc.paymentMethod === 'manual'
          ? 'Manuell erfasst'
          : 'Online (Stripe)'

      // Brand tokens — mirrors BRAND in rosterTheme.tsx (the roster
      // dashboard's own palette), kept as a plain hex copy here since email
      // HTML can't import from the app bundle.
      const GOLD = '#E6BE68'
      const GOLD_DARK = '#D4A654'
      const NEAR_BLACK = '#1A1A1A'
      const sectionTitle = (label: string) =>
        `<h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:${GOLD_DARK};font-weight:700">${label}</h3>`
      const row = (label: string, value: string) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#888;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:4px 0;color:${NEAR_BLACK}">${value}</td></tr>`

      // Itemized line-item table — itemsArray already includes both product
      // lines AND workshop-booking lines (pushed in the loop above), so this
      // one table covers everything purchased, with images where available.
      const itemRowsHtml =
        itemsArray.length > 0
          ? itemsArray
              .map((item) => {
                const qtyDisplay = /^\d+$/.test(item.QUANTITY) ? `×${item.QUANTITY}` : item.QUANTITY
                return `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #f2f2f2;color:${NEAR_BLACK}">${
      item.IMAGE_URL
        ? `<img src="${item.IMAGE_URL}" width="32" height="32" style="border-radius:6px;vertical-align:middle;margin-right:10px;object-fit:cover" alt="" />`
        : ''
    }<span style="vertical-align:middle">${item.TITLE}</span></td>
    <td style="padding:8px 0;border-bottom:1px solid #f2f2f2;text-align:center;color:#888;white-space:nowrap">${qtyDisplay}</td>
    <td style="padding:8px 0;border-bottom:1px solid #f2f2f2;text-align:right;white-space:nowrap;font-weight:600;color:${NEAR_BLACK}">${item.PRICE}</td>
  </tr>`
              })
              .join('')
          : `<tr><td style="padding:8px 0;color:#888">${safeOrderItemsSummary || '—'}</td></tr>`

      const guestsBlock =
        guestNames.length > 0
          ? `
${sectionTitle(`Gäste (${guestNames.length})`)}
<p style="margin:0 0 24px;font-size:14px;color:${NEAR_BLACK};line-height:1.6">${guestNames.map((n) => `• ${n}`).join('<br/>')}</p>`
          : ''

      const workshopBlock = isWorkshopOrder
        ? `
${sectionTitle('Workshop-Termin')}
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
  ${row('Datum', `${workshopDate}${workshopTime ? ` · ${workshopTime}` : ''}`)}
  ${workshopLocation ? row('Ort', workshopLocation) : ''}
</table>`
        : ''

      const pickupBlock =
        !isWorkshopOrder && isPickup
          ? `
${sectionTitle('Abholung')}
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
  ${row('Abholort', pickupLabel || (typeof doc.pickupLocation === 'string' && doc.pickupLocation) || '—')}
  ${row('Status', productPickupStatus)}
  ${pickupBookingUrl ? row('Terminlink', `<a href="${pickupBookingUrl}" style="color:${NEAR_BLACK}">Google-Terminplan öffnen</a>`) : ''}
</table>`
          : ''

      const shippingBlock =
        !isPickup && shippingAddressStr
          ? `
${sectionTitle('Lieferadresse')}
<p style="margin:0 0 24px;font-size:14px;color:${NEAR_BLACK};line-height:1.5;white-space:pre-line">${shippingAddressStr}</p>`
          : ''

      const adminOrderUrl = `${siteUrl}/admin/collections/orders/${doc.id}`

      const htmlContent = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
${warningBlock}
<div style="background:${NEAR_BLACK};padding:20px 28px;border-radius:12px 12px 0 0">
  <p style="margin:0;color:${GOLD};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700">Fermentfreude · Admin</p>
  <h2 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700">${headingLabel}</h2>
</div>
<div style="border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px">

${sectionTitle('Bestellübersicht')}
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
  ${row('Bestell-ID', `<span style="font-family:monospace">${orderNumber}</span>`)}
  ${row('Bestellt am', orderPlacedAt)}
  ${row('Betrag', `<span style="font-weight:700;font-size:16px">${amountDisplay}</span>`)}
  ${row('Zahlart', paymentMethodDisplay)}
</table>

${sectionTitle('Kund:in')}
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
  ${row('Name', recipientName || '—')}
  ${row('E-Mail', `<a href="mailto:${recipientEmail}" style="color:${NEAR_BLACK}">${recipientEmail}</a>`)}
  ${customerPhone ? row('Telefon', customerPhone) : ''}
  ${customerDietSpecs ? row('Ernährungshinweise', customerDietSpecs) : ''}
</table>

${sectionTitle('Artikel')}
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
${itemRowsHtml}
</table>
${guestsBlock}${workshopBlock}${pickupBlock}${shippingBlock}
<a href="${adminOrderUrl}" style="display:inline-block;margin-top:4px;padding:11px 22px;background:${GOLD};color:${NEAR_BLACK};text-decoration:none;border-radius:999px;font-weight:700;font-size:13px">Bestellung im Admin ansehen →</a>
</div>
</div>`

      await sendTransactionalEmail({
        to: getAdminRecipients(),
        subject: `${headingLabel}${subjectSuffix}`,
        htmlContent,
      })
      req.payload.logger.info(`[Brevo] Sent admin notification email for order ${doc.id}`)
    } catch (adminError) {
      req.payload.logger.error(
        `[Brevo] Failed to send admin notification for order ${doc.id}: ${adminError instanceof Error ? adminError.message : String(adminError)}`,
      )
    }
  } catch (error) {
    req.payload.logger.error(
      `[Brevo] Order confirmation email FAILED for order ${doc.id}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}
