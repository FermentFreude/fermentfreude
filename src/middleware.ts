import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const previewPassword = process.env.PREVIEW_PASSWORD

  // If no password is set, site is public — skip gate
  if (!previewPassword) return NextResponse.next()

  const { pathname } = request.nextUrl

  // Allow these paths through without password
  if (
    pathname.startsWith('/coming-soon') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/media') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.ico') ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next()
  }

  // Check if visitor has the access cookie
  const accessCookie = request.cookies.get('preview-access')
  if (accessCookie?.value === 'granted') {
    return NextResponse.next()
  }

  // Redirect to coming soon page
  return NextResponse.rewrite(new URL('/coming-soon', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
