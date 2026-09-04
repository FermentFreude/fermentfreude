import { getCachedGlobal } from '@/utilities/getGlobals'
import { getNavWorkshopItems } from '@/utilities/getNavWorkshopItems'
import { cookies } from 'next/headers'
import type { Header } from '@/payload-types'

import { HeaderClient } from './index.client'
import './index.css'

export async function Header() {
  const cookieStore = await cookies()
  const localeValue = cookieStore.get('fermentfreude-locale')?.value
  const locale = (localeValue === 'en' ? 'en' : 'de') as 'de' | 'en'
  const header = (await getCachedGlobal('header', 1, locale)()) as Header

  let navWorkshops: Awaited<ReturnType<typeof getNavWorkshopItems>> = []
  try {
    navWorkshops = await getNavWorkshopItems(locale)
  } catch (error) {
    console.error('[Header] Failed to load workshop nav items:', error)
  }

  return <HeaderClient header={header} locale={locale} navWorkshops={navWorkshops} />
}
