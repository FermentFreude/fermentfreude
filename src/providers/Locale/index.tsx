'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

export type Locale = 'de' | 'en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'de',
  setLocale: () => null,
})

/**
 * initialLocale comes from the server (RootLayout reads the
 * `fermentfreude-locale` cookie via getLocale()) so the client's first
 * render already matches what was server-rendered — no post-hydration
 * flash of the wrong language.
 */
export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    document.cookie = `fermentfreude-locale=${newLocale};path=/;max-age=31536000`
    // Refresh so server components re-fetch with the new locale
    window.location.reload()
  }, [])

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
}

export const useLocale = () => useContext(LocaleContext)
