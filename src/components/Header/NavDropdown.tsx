'use client'

import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export interface DropdownItem {
  label: string
  href: string
  description?: string | null
  isSmall?: boolean | null
}

interface NavDropdownProps {
  label: string
  href?: string
  items: DropdownItem[]
}

/** Simple desktop dropdown - hover to show items */
export function NavDropdown({ label, href, items }: NavDropdownProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger button/link */}
      <div
        className={cn(
          'relative navLink inline-flex items-center gap-1 text-ff-gray-15 dark:text-neutral-300 font-display font-bold text-sm leading-none hover:text-ff-near-black dark:hover:text-white transition-colors cursor-pointer',
          { active: isActive },
        )}
      >
        {href ? (
          <Link href={href} className="flex items-center gap-1">
            {label}
            <ChevronDown
              className={cn('w-3 h-3 transition-transform duration-300', { 'rotate-180': isOpen })}
              aria-hidden="true"
            />
          </Link>
        ) : (
          <>
            {label}
            <ChevronDown
              className={cn('w-3 h-3 transition-transform duration-300', { 'rotate-180': isOpen })}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {/* Dropdown panel - shows on hover */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 origin-top transition-all duration-200 pointer-events-none group-hover:pointer-events-auto',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible',
        )}
      >
        <div className="w-60 rounded-2xl overflow-hidden shadow-lg bg-[#f5f2ed] dark:bg-[#f5f2ed]">
          <div className="py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-5 py-3 transition-colors duration-150 group',
                  'text-ff-near-black hover:bg-ff-near-black hover:text-white',
                )}
              >
                <span
                  className={cn(
                    'block font-display font-bold transition-colors',
                    item.isSmall ? 'text-xs' : 'text-sm',
                  )}
                >
                  {item.label}
                </span>
                {item.description && !item.isSmall && (
                  <span className="block text-xs mt-0.5 transition-colors">{item.description}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
