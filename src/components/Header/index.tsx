import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from '@/utilities/getLocale'

import { AnnouncementBar } from './AnnouncementBar'
import { HeaderClient } from './index.client'
import './index.css'

export async function Header() {
  const locale = await getLocale()
  const header = await getCachedGlobal('header', 1, locale)()

  return (
    <header className="sticky top-0 z-50 w-full">
      <AnnouncementBar />
      <HeaderClient header={header} />
    </header>
  )
}
