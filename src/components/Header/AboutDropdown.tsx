'use client'

import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const aboutItems = [
  {
    label: 'Über uns',
    href: '/about',
    description: 'Unser Team & Mission',
  },
  {
    label: 'Fermentation',
    href: '/fermentation',
    description: 'Was ist Fermentation?',
  },
  {
    label: 'Kontakt',
    href: '/contact',
    description: 'Kontaktieren Sie uns',
  },
]

export function AboutDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive =
    pathname === '/about' || pathname === '/contact' || pathname.includes('/fermentation')

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
      <button
        className={cn(
          'relative navLink flex items-center gap-1 text-ff-gray-15 font-semibold text-sm hover:text-ff-charcoal transition-colors',
          { active: isActive },
        )}
      >
        About
        <ChevronDown
          className={cn('w-3 h-3 transition-transform duration-200', {
            'rotate-180': isOpen,
          })}
          aria-hidden="true"
        />
      </button>

      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50 transition-all duration-200',
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1',
        )}
      >
        <div className="dropdown-glass w-60 rounded-2xl overflow-hidden">
          <div className="py-2">
            {aboutItems.map((item) => (
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
export function AboutDropdownMobile() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isActive =
    pathname === '/about' || pathname === '/contact' || pathname.includes('/fermentation')

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between py-2.5 text-base font-bold text-ff-gray-15 hover:text-ff-charcoal transition-colors',
          { 'text-ff-charcoal': isActive },
        )}
      >
        About
        <ChevronDown
          className={cn('w-4 h-4 transition-transform duration-200', {
            'rotate-180': isOpen,
          })}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="pl-4 pb-2 flex flex-col gap-1">
          {aboutItems.map((item) => (
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
