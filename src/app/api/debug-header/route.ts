import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header } from '@/payload-types'

export async function GET() {
  try {
    const header = (await getCachedGlobal<Header>('header', 2, 'de')()) as Header

    // Check if submenus exist
    const workshopsDropdown = header.navItems
      ?.find((item) => item.link?.label === 'Workshops')
      ?.dropdownItems?.find((dd) => dd.label === 'Alle Workshops')

    const hasSubmenu = workshopsDropdown?.submenu && workshopsDropdown.submenu.length > 0

    return Response.json({
      status: 'ok',
      database: process.env.DATABASE_URL?.split('/').pop() || 'unknown',
      workshopsDropdownFound: !!workshopsDropdown,
      submenuCount: workshopsDropdown?.submenu?.length || 0,
      hasSubmenu,
      submenuData: workshopsDropdown?.submenu || [],
      fullDropdownData: workshopsDropdown,
    })
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
