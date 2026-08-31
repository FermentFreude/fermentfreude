'use client'

import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/cn'

export function LanguageToggle() {
  const { locale, setLocale } = useLocale()

  return (
    <div
      className="inline-flex items-center h-8 rounded-full border border-ff-border-light dark:border-neutral-600 overflow-hidden font-display text-[10px] font-bold tracking-wider leading-none"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale('de')}
        className={cn(
          'px-2.5 h-full transition-colors',
          locale === 'de'
            ? 'bg-ff-charcoal dark:bg-ff-cream text-ff-ivory dark:text-ff-charcoal'
            : 'text-ff-gray-15 dark:text-neutral-400 hover:text-ff-charcoal dark:hover:text-white',
        )}
        aria-label="Deutsch"
        aria-pressed={locale === 'de'}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={cn(
          'px-2.5 h-full transition-colors',
          locale === 'en'
            ? 'bg-ff-charcoal dark:bg-ff-cream text-ff-ivory dark:text-ff-charcoal'
            : 'text-ff-gray-15 dark:text-neutral-400 hover:text-ff-charcoal dark:hover:text-white',
        )}
        aria-label="English"
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  )
}
