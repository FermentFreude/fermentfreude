'use client'

import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/cn'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-full transition-colors',
        'text-ff-gray-15 dark:text-neutral-300 hover:text-ff-charcoal dark:hover:text-white',
        'hover:bg-ff-ivory dark:hover:bg-neutral-800',
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={cn(
          'h-4 w-4 absolute transition-all duration-300',
          isDark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        )}
      />
      <Moon
        className={cn(
          'h-4 w-4 absolute transition-all duration-300',
          isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0',
        )}
      />
    </button>
  )
}
