import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/checkout/attach-customer-name
 *
 *  Stores the guest buyer's contact information on the pending Stripe transaction
 *  identified by `paymentIntentID`. Called by the checkout form right
 *  after Stripe confirms the payment but before the plugin's
 *  confirmOrder endpoint creates the Order. The Order beforeChange hook
 *  `copyCustomerNameFromTransaction` then promotes the values onto the
 *  Order so confirmation emails and admin notifications have the data.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const paymentIntentID =
      body && typeof body.paymentIntentID === 'string' ? body.paymentIntentID.trim() : ''
    const customerFirstName =
      body && typeof body.customerFirstName === 'string' ? body.customerFirstName.trim() : ''
    const customerLastName =
      body && typeof body.customerLastName === 'string' ? body.customerLastName.trim() : ''
    const customerName = [customerFirstName, customerLastName].filter(Boolean).join(' ')
    const customerEmail =
      body && typeof body.customerEmail === 'string' ? body.customerEmail.trim() : ''
    const customerPhone =
      body && typeof body.customerPhone === 'string' ? body.customerPhone.trim() : ''
    const customerDietSpecs =
      body && typeof body.customerDietSpecs === 'string' ? body.customerDietSpecs.trim() : ''

    if (!paymentIntentID) {
      return NextResponse.json(
        { success: false, error: 'paymentIntentID is required.' },
        { status: 400 },
      )
    }
    if (customerFirstName.length < 1 || customerFirstName.length > 250) {
      return NextResponse.json(
        { success: false, error: 'customerFirstName is required (1-250 characters).' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: await configPromise })

    const tx = await payload.find({
      collection: 'transactions',
      where: { 'stripe.paymentIntentID': { equals: paymentIntentID } },
      limit: 1,
      overrideAccess: true,
    })

    if (tx.totalDocs === 0 || !tx.docs[0]) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found.' },
        { status: 404 },
      )
    }

    const updateData: Record<string, unknown> = {
      customerFirstName: customerFirstName.slice(0, 250),
      customerName: customerName.slice(0, 500),
    }

    if (customerLastName) updateData.customerLastName = customerLastName.slice(0, 250)
    if (customerEmail) updateData.customerEmail = customerEmail
    if (customerPhone) updateData.customerPhone = customerPhone
    if (customerDietSpecs) updateData.customerDietSpecs = customerDietSpecs

    const pickupDate = body && typeof body.pickupDate === 'string' ? body.pickupDate.trim() : ''
    const pickupTime = body && typeof body.pickupTime === 'string' ? body.pickupTime.trim() : ''
    const pickupLocation = body && typeof body.pickupLocation === 'string' ? body.pickupLocation.trim() : ''
    const pickupAddress = body && typeof body.pickupAddress === 'string' ? body.pickupAddress.trim() : ''
    if (pickupDate) updateData.pickupDate = pickupDate
    if (pickupTime) updateData.pickupTime = pickupTime
    if (pickupLocation) updateData.pickupLocation = pickupLocation
    if (pickupAddress) updateData.pickupAddress = pickupAddress

    await payload.update({
      collection: 'transactions',
      id: tx.docs[0].id,
      data: updateData,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[attach-customer-name] Error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to attach customer data.' },
      { status: 500 },
    )
  }
}
