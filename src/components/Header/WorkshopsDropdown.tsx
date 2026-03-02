'use client'

import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const workshopItems = [
  {
    label: 'Lakto Gemüse',
    href: '/workshops/lakto-gemuese',
    description: 'Fermentierte Gemüse-Workshops',
  },
  {
    label: 'Tempeh',
    href: '/workshops/tempeh',
    description: 'Tempeh selber machen',
  },
  {
    label: 'Kombucha',
    href: '/workshops/kombucha',
    description: 'Kombucha brauen lernen',
  },
  {
    label: 'Gutschein',
    href: '/workshops/voucher',
    description: 'Workshop-Gutschein verschenken',
  },
]

export function WorkshopsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = pathname.includes('/workshops')

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/workshops"
        className={cn(
          'relative navLink flex items-center gap-1 text-ff-gray-15 font-semibold text-sm hover:text-ff-charcoal transition-colors',
          { active: isActive },
        )}
      >
        Workshops
        <ChevronDown
          className={cn('w-3 h-3 transition-transform duration-200', {
            'rotate-180': isOpen,
          })}
        />
      </Link>

      {/* Dropdown panel */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 transition-all duration-200',
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1',
        )}
      >
        <div className="dropdown-glass w-60 rounded-2xl overflow-hidden">
          <div className="py-2">
            {workshopItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group block px-5 py-3 transition-colors duration-200',
                  'hover:bg-ff-near-black dark:hover:bg-white',
                  { 'bg-white/50 dark:bg-white/8': pathname === item.href },
                )}
              >
                <span className="block font-display font-bold text-sm text-ff-gray-15 dark:text-neutral-200 group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">{item.label}</span>
                <span className="block text-xs text-ff-gray-text/80 dark:text-neutral-500 group-hover:text-white/70 dark:group-hover:text-ff-near-black/60 mt-0.5 transition-colors">{item.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Mobile version — expandable accordion style */
export function WorkshopsDropdownMobile() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isActive = pathname.includes('/workshops')

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between py-2.5 text-base font-bold text-ff-gray-15 hover:text-ff-charcoal transition-colors',
          { 'text-ff-charcoal': isActive },
        )}
      >
        <Link href="/workshops" className="hover:underline">
          Workshops
        </Link>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform duration-200', {
            'rotate-180': isOpen,
          })}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="pl-4 pb-2 flex flex-col gap-1">
          {workshopItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block py-2 text-sm text-ff-gray-15 hover:text-ff-charcoal transition-colors',
                { 'font-bold text-ff-charcoal': pathname === item.href },
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
