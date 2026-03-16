import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header } from '@/payload-types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = (searchParams.get('lang') === 'en' ? 'en' : 'de') as 'de' | 'en'
    
    const header = (await getCachedGlobal<Header>('header', 3, lang)()) as Header

    // Debug: show full workshops item structure
    const workshopsNav = header.navItems?.find((item) => item.link?.label === 'Workshops')
    
    // Check if submenus exist
    const workshopsDropdown = workshopsNav?.dropdownItems?.find(
      (dd) => dd.label === 'Alle Workshops' || dd.label === 'View All Workshops',
    )

    const hasSubmenu = workshopsDropdown?.submenu && workshopsDropdown.submenu.length > 0

    return Response.json({
      status: 'ok',
      locale: lang,
      database: process.env.DATABASE_URL?.split('/').pop() || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      workshopsNavFound: !!workshopsNav,
      workshopsDropdownFound: !!workshopsDropdown,
      workshopsDropdownLabel: workshopsDropdown?.label,
      submenuCount: workshopsDropdown?.submenu?.length || 0,
      hasSubmenu,
      submenuData: workshopsDropdown?.submenu || [],
      // Debug: full structure
      workshopsNav: workshopsNav ? {
        label: workshopsNav.link?.label,
        dropdownItemsCount: workshopsNav.dropdownItems?.length || 0,
        firstDropdownLabel: workshopsNav.dropdownItems?.[0]?.label,
        firstDropdownSubmenuCount: workshopsNav.dropdownItems?.[0]?.submenu?.length || 0,
      } : null,
    })
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null,
      },
      { status: 500 },
    )
  }
}
