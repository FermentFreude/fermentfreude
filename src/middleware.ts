import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const previewPassword = process.env.PREVIEW_PASSWORD

  // If no password is set, site is public — skip gate
  if (!previewPassword) return NextResponse.next()

  const { pathname } = request.nextUrl

  // Allow these paths through without password
  if (
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/api/preview-access') ||
    pathname.startsWith('/api/maintenance-waitlist') ||
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

  // Redirect to maintenance page
  return NextResponse.rewrite(new URL('/maintenance', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
