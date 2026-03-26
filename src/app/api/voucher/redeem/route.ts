import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/voucher/redeem
 *
 *  Redeems a voucher code during checkout. Marks the voucher as
 *  redeemed and returns the voucher value so the checkout can
 *  apply the discount.
 *
 *  One-time operation — once redeemed, cannot be used again.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, workshopTitle } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Voucher code is required.' },
        { status: 400 },
      )
    }

    const sanitizedCode = code.trim().toUpperCase()

    const config = await configPromise
    const payload = await getPayload({ config })

    // ─── Find & Validate Voucher ─────────────────────────────────

    const result = await payload.find({
      collection: 'vouchers',
      where: { code: { equals: sanitizedCode } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (result.docs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Voucher code not found.' },
        { status: 404 },
      )
    }

    const voucher = result.docs[0]

    if (voucher.status === 'redeemed' || voucher.redeemed) {
      return NextResponse.json(
        { success: false, error: 'This voucher has already been redeemed.' },
        { status: 410 },
      )
    }

    if (voucher.status === 'expired') {
      return NextResponse.json(
        { success: false, error: 'This voucher has expired.' },
        { status: 410 },
      )
    }

    // ─── Mark Voucher as Redeemed ────────────────────────────────

    await payload.update({
      collection: 'vouchers',
      id: voucher.id,
      overrideAccess: true,
      data: {
        status: 'redeemed',
        redeemed: true,
        redeemedOn: new Date().toISOString(),
        redeemedForWorkshop: workshopTitle || undefined,
      },
    })

    payload.logger.info(
      `[voucher/redeem] Voucher ${voucher.code} redeemed${workshopTitle ? ` for ${workshopTitle}` : ''}`,
    )

    return NextResponse.json({
      success: true,
      voucher: {
        code: voucher.code,
        value: voucher.value,
      },
    })
  } catch (error) {
    console.error('[voucher/redeem] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    )
  }
}
