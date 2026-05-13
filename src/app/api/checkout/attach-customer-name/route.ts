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
    const customerName =
      body && typeof body.customerName === 'string' ? body.customerName.trim() : ''
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
    if (customerName.length < 2 || customerName.length > 250) {
      return NextResponse.json(
        { success: false, error: 'customerName must be 2-250 characters.' },
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
      customerName: customerName.slice(0, 250),
    }

    if (customerPhone) {
      updateData.customerPhone = customerPhone
    }

    if (customerDietSpecs) {
      updateData.customerDietSpecs = customerDietSpecs
    }

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
