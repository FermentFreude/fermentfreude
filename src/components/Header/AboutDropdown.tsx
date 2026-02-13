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
]

export function AboutDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = pathname === '/about' || pathname.includes('/fermentation')

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
        <div className="w-48 rounded-xl border border-ff-white-95 bg-white shadow-lg overflow-hidden">
          <div className="py-1.5">
            {aboutItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-4 py-2.5 text-sm font-medium text-ff-gray-15 hover:bg-ff-ivory transition-colors',
                  { 'bg-ff-ivory/50 text-ff-charcoal': pathname === item.href },
                )}
              >
                <span className="font-bold text-sm">{item.label}</span>
                <span className="block text-xs text-ff-gray-text mt-0.5">{item.description}</span>
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
  const isActive = pathname === '/about' || pathname.includes('/fermentation')

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
