import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/voucher/validate
 *
 *  Validates a voucher code and returns its value.
 *  Does NOT redeem the voucher — just checks if it's valid.
 *  Used at checkout to verify a voucher before applying it.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Voucher code is required.' },
        { status: 400 },
      )
    }

    // Sanitize: uppercase, trim whitespace
    const sanitizedCode = code.trim().toUpperCase()

    if (sanitizedCode.length < 5 || sanitizedCode.length > 30) {
      return NextResponse.json(
        { success: false, error: 'Invalid voucher code format.' },
        { status: 400 },
      )
    }

    const config = await configPromise
    const payload = await getPayload({ config })

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
        {
          success: false,
          error: 'This voucher has already been redeemed.',
          redeemedOn: voucher.redeemedOn,
        },
        { status: 410 },
      )
    }

    if (voucher.status === 'expired') {
      return NextResponse.json(
        { success: false, error: 'This voucher has expired.' },
        { status: 410 },
      )
    }

    return NextResponse.json({
      success: true,
      voucher: {
        code: voucher.code,
        value: voucher.value,
      },
    })
  } catch (error) {
    console.error('[voucher/validate] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    )
  }
}
