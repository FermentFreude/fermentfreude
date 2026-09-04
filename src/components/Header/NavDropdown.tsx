'use client'

import { dropdownItemIsInactive } from '@/components/Header/nav-defaults'
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
  disabled?: boolean | null
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
    (item) =>
      !dropdownItemIsInactive(item) &&
      (pathname === item.href || pathname.startsWith(item.href + '/')),
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
          'relative navLink inline-flex items-center gap-1.5 font-display font-bold text-[12px] xl:text-[13px] leading-none uppercase cursor-pointer',
          { active: isActive },
        )}
      >
        {href ? (
          <Link href={href} className="flex items-center gap-1.5">
            {label}
            <ChevronDown
              className={cn('w-3 h-3 transition-transform duration-250 opacity-70', {
                'rotate-180': isOpen,
              })}
              aria-hidden="true"
            />
          </Link>
        ) : (
          <>
            {label}
            <ChevronDown
              className={cn('w-3 h-3 transition-transform duration-250 opacity-70', {
                'rotate-180': isOpen,
              })}
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
        <div className="w-56 rounded-xl overflow-hidden dropdown-glass">
          <div className="py-1.5">
            {items.map((item, idx) =>
              dropdownItemIsInactive(item) ? (
                <div
                  key={`${item.href}-${idx}`}
                  className="block px-4 py-2.5 cursor-default select-none text-ff-gray-text opacity-70"
                  aria-disabled="true"
                >
                  <span
                    className={cn(
                      'block font-display font-bold',
                      item.isSmall ? 'text-xs' : 'text-sm',
                    )}
                  >
                    {item.label}
                  </span>
                  {item.description && !item.isSmall && (
                    <span className="block text-xs mt-0.5 font-sans font-normal opacity-80">
                      {item.description}
                    </span>
                  )}
                </div>
              ) : (
                <Link
                  key={`${item.href}-${idx}`}
                  href={item.href}
                  className="block px-4 py-2.5 text-ff-charcoal transition-colors duration-150 hover:bg-ff-charcoal hover:text-ff-ivory"
                >
                  <span
                    className={cn(
                      'block font-display font-bold',
                      item.isSmall ? 'text-xs' : 'text-sm',
                    )}
                  >
                    {item.label}
                  </span>
                  {item.description && !item.isSmall && (
                    <span className="block text-xs mt-0.5 font-sans font-normal opacity-75">
                      {item.description}
                    </span>
                  )}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
