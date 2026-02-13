import { cookies } from 'next/headers'

export type SupportedLocale = 'de' | 'en'

/**
 * Read the user's preferred locale from the cookie (server-side).
 * Falls back to 'de' if no cookie is set.
 */
export async function getLocale(): Promise<SupportedLocale> {
  const cookieStore = await cookies()
  const value = cookieStore.get('fermentfreude-locale')?.value
  return value === 'en' ? 'en' : 'de'
}
