'use client'

import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/cn'

export function LanguageToggle() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center rounded-full border border-ff-white-95 dark:border-neutral-700 overflow-hidden text-xs font-semibold">
      <button
        onClick={() => setLocale('de')}
        className={cn(
          'px-2 py-1 transition-colors',
          locale === 'de'
            ? 'bg-ff-charcoal dark:bg-white text-white dark:text-ff-near-black'
            : 'text-ff-gray-15 dark:text-neutral-400 hover:text-ff-charcoal dark:hover:text-white',
        )}
        aria-label="Deutsch"
      >
        DE
      </button>
      <button
        onClick={() => setLocale('en')}
        className={cn(
          'px-2 py-1 transition-colors',
          locale === 'en'
            ? 'bg-ff-charcoal dark:bg-white text-white dark:text-ff-near-black'
            : 'text-ff-gray-15 dark:text-neutral-400 hover:text-ff-charcoal dark:hover:text-white',
        )}
        aria-label="English"
      >
        EN
      </button>
    </div>
  )
}
