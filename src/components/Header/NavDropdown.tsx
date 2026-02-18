'use client'

import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export interface DropdownItem {
  label: string
  href: string
  description?: string | null
}

interface NavDropdownProps {
  label: string
  /** Optional top-level href — if provided, the label itself is a link */
  href?: string
  items: DropdownItem[]
}

/** Desktop hover dropdown for nav items with sub-links */
export function NavDropdown({ label, href, items }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

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

  const sharedClassName = cn(
    'relative navLink inline-flex items-center gap-1 text-ff-gray-15 dark:text-neutral-300 font-display font-bold text-sm leading-none hover:text-ff-near-black dark:hover:text-white transition-colors',
    { active: isActive },
  )

  const chevron = (
    <ChevronDown
      className={cn('w-3 h-3 transition-transform duration-200', {
        'rotate-180': isOpen,
      })}
      aria-hidden="true"
    />
  )

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {href ? (
        <Link href={href} className={sharedClassName}>
          {label}
          {chevron}
        </Link>
      ) : (
        <button className={sharedClassName}>
          {label}
          {chevron}
        </button>
      )}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50 transition-all duration-200',
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1',
        )}
      >
        <div className="w-56 rounded-xl border border-ff-white-95 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
          <div className="py-1.5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-4 py-2.5 text-sm font-medium text-ff-gray-15 dark:text-neutral-300 hover:bg-ff-ivory dark:hover:bg-neutral-800 transition-colors',
                  {
                    'bg-ff-ivory/50 dark:bg-neutral-800/50 text-ff-charcoal dark:text-white':
                      pathname === item.href,
                  },
                )}
              >
                <span className="font-bold text-sm">{item.label}</span>
                {item.description && (
                  <span className="block text-xs text-ff-gray-text dark:text-neutral-500 mt-0.5">
                    {item.description}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Mobile version — expandable accordion style */
export function NavDropdownMobile({ label, href, items }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isActive = items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between py-2.5 text-base font-bold text-ff-gray-15 dark:text-neutral-300 hover:text-ff-charcoal dark:hover:text-white transition-colors',
          { 'text-ff-charcoal dark:text-white': isActive },
        )}
      >
        {href ? (
          <Link href={href} className="hover:underline">
            {label}
          </Link>
        ) : (
          label
        )}
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
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block py-2 text-sm text-ff-gray-15 dark:text-neutral-400 hover:text-ff-charcoal dark:hover:text-white transition-colors',
                { 'font-bold text-ff-charcoal dark:text-white': pathname === item.href },
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
