'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Locale = 'de' | 'en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const localeStorageKey = 'fermentfreude-locale'

const LocaleContext = createContext<LocaleContextType>({
  locale: 'de',
  setLocale: () => null,
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('de')

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    window.localStorage.setItem(localeStorageKey, newLocale)
    // Set cookie so server components can read it
    document.cookie = `fermentfreude-locale=${newLocale};path=/;max-age=31536000`
    // Refresh so server components re-fetch with the new locale
    window.location.reload()
  }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem(localeStorageKey)
    if (stored === 'de' || stored === 'en') {
      setLocaleState(stored)
      document.cookie = `fermentfreude-locale=${stored};path=/;max-age=31536000`
    }
  }, [])

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
}

export const useLocale = () => useContext(LocaleContext)
