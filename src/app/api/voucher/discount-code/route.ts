import { checkDiscountCode } from '@/lib/discountCodes'
import config from '@/payload.config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/voucher/discount-code  { code, amount }
 *
 *  The "Einlösen" button in the voucher buy panel. Only answers
 *  whether the code works for this voucher and what it costs then;
 *  /api/voucher/checkout checks the code again before charging.
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { code?: unknown; amount?: unknown }
    if (typeof body.code !== 'string' || typeof body.amount !== 'number') {
      return NextResponse.json({ success: false, problem: 'unknown' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const result = await checkDiscountCode(payload, body.code, body.amount)

    if (!result.ok) {
      return NextResponse.json({ success: false, problem: result.problem })
    }
    return NextResponse.json({
      success: true,
      code: result.code,
      amountOff: result.amountOff,
      finalAmount: result.finalAmount,
    })
  } catch (error) {
    console.error('[voucher/discount-code] Error:', error)
    return NextResponse.json({ success: false, problem: 'error' }, { status: 500 })
  }
}
