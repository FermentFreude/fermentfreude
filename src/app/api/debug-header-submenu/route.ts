import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  try {
    // Fetch header with full depth
    const header = await payload.findGlobal({
      slug: 'header',
      depth: 10, // Max depth to get everything
      locale: 'de',
    })

    // Return just the workshops nav item for debugging
    const workshopsItem = header.navItems?.find(
      (item: any) => item.link?.label === 'Workshops',
    )

    return NextResponse.json({
      status: 'OK',
      locale: 'de',
      workshopsNav: workshopsItem,
      dropdownItems: workshopsItem?.dropdownItems,
      firstDropdown: workshopsItem?.dropdownItems?.[0],
      firstDropdownSubmenu: workshopsItem?.dropdownItems?.[0]?.submenu,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
