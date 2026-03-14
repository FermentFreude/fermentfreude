'use client'

import type { Theme } from '@/providers/Theme/types'

import React, { createContext, useCallback, useContext, useState } from 'react'

import { canUseDOM } from '@/utilities/canUseDOM'

export interface ContextType {
  headerTheme?: Theme | null
  setHeaderTheme: (theme: Theme | undefined) => void
  heroBackgroundColor?: string | null
  setHeroBackgroundColor: (color: string | undefined) => void
}

const initialContext: ContextType = {
  headerTheme: undefined,
  setHeaderTheme: () => null,
  heroBackgroundColor: undefined,
  setHeroBackgroundColor: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTheme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )
  const [heroBackgroundColor, setColorState] = useState<string | undefined>(undefined)

  const setHeaderTheme = useCallback((themeToSet: Theme | undefined) => {
    setThemeState(themeToSet)
  }, [])

  const setHeroBackgroundColor = useCallback((colorToSet: string | undefined) => {
    setColorState(colorToSet)
  }, [])

  return (
    <HeaderThemeContext.Provider
      value={{ headerTheme, setHeaderTheme, heroBackgroundColor, setHeroBackgroundColor }}
    >
      {children}
    </HeaderThemeContext.Provider>
  )
}

export const useHeaderTheme = (): ContextType => useContext(HeaderThemeContext)
