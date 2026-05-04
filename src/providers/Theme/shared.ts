import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

// Force light mode until dark mode is fully implemented
export const getImplicitPreference = (): Theme | null => {
  return 'light'
}
