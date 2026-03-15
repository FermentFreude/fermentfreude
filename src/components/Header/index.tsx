import type { Header as HeaderGlobal } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { cookies } from 'next/headers'

import { HeaderClient } from './index.client'
import './index.css'

export async function Header() {
  const cookieStore = await cookies()
  const localeValue = cookieStore.get('fermentfreude-locale')?.value
  const locale = (localeValue === 'en' ? 'en' : 'de') as 'de' | 'en'
  const header = (await getCachedGlobal<HeaderGlobal>('header', 3, locale)()) as HeaderGlobal

  return <HeaderClient header={header} />
}
