import { NextResponse } from 'next/server'

// Site is fully public. Password gate intentionally removed —
// previously gated by PREVIEW_PASSWORD env var, which is no longer honoured.
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
