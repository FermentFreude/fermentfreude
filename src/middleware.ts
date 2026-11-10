import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const previewPassword = process.env.PREVIEW_PASSWORD
  // MAINTENANCE MODE (off unless explicitly "true"): visitors see the "Gleich wieder da"
  // screen (/wartung) with status 503. The team gets in with the same password as the
  // preview gate: open /maintenance, enter PREVIEW_PASSWORD, then browse normally.
  // To switch on: set MAINTENANCE_MODE=true AND PREVIEW_PASSWORD in Vercel, then redeploy.
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  if (!maintenanceMode) {
    // Local dev: no preview gate (set PREVIEW_PASSWORD only on staging/production)
    if (process.env.NODE_ENV === 'development') return NextResponse.next()

    // If no password is set, site is public — skip gate
    if (!previewPassword) return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow these paths through without password
  if (
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/wartung') ||
    pathname.startsWith('/api/preview-access') ||
    pathname.startsWith('/api/maintenance-waitlist') ||
    // Stripe can't pass the gate (no cookie) — without this, payments on a
    // gated environment are taken but the order is never confirmed.
    pathname.startsWith('/api/payments/stripe/webhooks') ||
    // Daily workshop-reminder job (Vercel Cron). The route itself refuses to run without CRON_SECRET.
    pathname.startsWith('/api/emails/workshop-reminders') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/media') ||
    pathname === '/robots.txt' ||
    // Static public files (images, fonts, etc.)
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Check if visitor has the access cookie
  const accessCookie = request.cookies.get('preview-access')
  if (accessCookie?.value === 'granted') {
    return NextResponse.next()
  }

  if (maintenanceMode) {
    // 503 + Retry-After tells Google this is temporary (the pages keep their ranking)
    return NextResponse.rewrite(new URL('/wartung', request.url), {
      status: 503,
      headers: { 'Retry-After': '3600', 'Cache-Control': 'no-store' },
    })
  }

  // Redirect to maintenance page
  return NextResponse.rewrite(new URL('/maintenance', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
