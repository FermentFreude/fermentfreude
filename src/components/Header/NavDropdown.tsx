'use client'

import { cn } from '@/utilities/cn'
import { gsap } from 'gsap'
import { ChevronDown, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { MagneticElement } from './MagneticElement'

export interface DropdownItem {
  label: string
  href: string
  description?: string | null
  isDivider?: boolean | null
  submenu?: DropdownItem[]
}

interface NavDropdownProps {
  label: string
  href?: string
  items: DropdownItem[]
}

/** Simple CSS hover-based dropdown with nested support */
export function NavDropdownDesktop({ label, items }: NavDropdownProps) {
  const pathname = usePathname()

  const isActive = items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

  const sharedClassName = cn(
    'relative navLink inline-flex items-center gap-1 text-ff-gray-15 dark:text-neutral-300 font-display font-bold text-sm leading-none hover:text-ff-near-black dark:hover:text-white transition-colors',
    { active: isActive },
  )

  return (
    <div className="relative group">
      <MagneticElement strength={0.25}>
        <button className={sharedClassName}>
          {label}
          {items.length > 0 && <Plus className="w-3 h-3 transition-transform" />}
        </button>
      </MagneticElement>

      {/* Dropdown Menu - appears on hover */}
      <ul
        className="absolute top-full left-0 mt-1 min-w-max flex flex-col rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 shadow-lg"
        style={{
          background: 'rgba(236, 229, 222, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        {items.map((item, idx) => (
          <li key={item.href} className="relative group/item">
            <Link
              href={item.href}
              className={cn(
                'block px-4 py-3 text-sm font-display font-bold text-ff-near-black transition-colors whitespace-nowrap',
                'hover:bg-ff-near-black hover:text-white dark:hover:bg-white dark:hover:text-ff-near-black',
                idx === 0 && 'rounded-t-lg',
                idx === items.length - 1 && 'rounded-b-lg',
                pathname === item.href && 'bg-ff-near-black/8',
              )}
            >
              <div className="flex items-center gap-2">
                {item.label}
                {item.submenu && item.submenu.length > 0 && (
                  <Plus className="w-3 h-3 transition-transform" />
                )}
              </div>
            </Link>

            {/* Nested submenu */}
            {item.submenu && (
              <ul
                className="absolute left-full top-0 ml-1 min-w-max flex flex-col rounded-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 shadow-lg"
                style={{
                  background: 'rgba(236, 229, 222, 0.95)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                {item.submenu.map((subitem, subIdx) => (
                  <li key={subitem.href}>
                    <Link
                      href={subitem.href}
                      className={cn(
                        'block px-4 py-3 text-sm font-display font-bold text-ff-near-black transition-colors whitespace-nowrap',
                        'hover:bg-ff-near-black hover:text-white dark:hover:bg-white dark:hover:text-ff-near-black',
                        subIdx === 0 && 'rounded-t-lg',
                        subIdx === item.submenu.length - 1 && 'rounded-b-lg',
                        pathname === subitem.href && 'bg-ff-near-black/8',
                      )}
                    >
                      {subitem.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Mobile version — expandable accordion with GSAP animation */
export function NavDropdownMobile({ label, href, items }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isActive = items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

  useEffect(() => {
    if (!contentRef.current) return
    if (isOpen) {
      gsap.to(contentRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
      })
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.inOut',
      })
    }
  }, [isOpen])

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between py-3 font-display font-bold text-lg text-ff-gray-15 dark:text-neutral-300 hover:text-ff-charcoal dark:hover:text-white transition-colors',
          { 'text-ff-charcoal dark:text-white': isActive },
        )}
      >
        {href ? (
          <Link href={href} className="hover:opacity-80 transition-opacity">
            {label}
          </Link>
        ) : (
          label
        )}
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]',
            { 'rotate-180': isOpen },
          )}
        />
      </button>

      <div ref={contentRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
        <div className="pl-4 pb-3 flex flex-col gap-0.5">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block py-2 text-base text-ff-gray-text dark:text-neutral-400 hover:text-ff-charcoal dark:hover:text-white transition-colors',
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
