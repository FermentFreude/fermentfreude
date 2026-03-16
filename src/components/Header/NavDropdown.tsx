'use client'

import { cn } from '@/utilities/cn'
import { gsap } from 'gsap'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MagneticElement } from './MagneticElement'

export interface DropdownItem {
  label: string
  href: string
  description?: string | null
  submenu?: DropdownItem[] | null // Nested submenu items (can be null)
}

interface NavDropdownProps {
  label: string
  /** Optional top-level href — if provided, the label itself is a link */
  href?: string
  items: DropdownItem[]
}

/** Desktop hover dropdown with glassmorphism panel + GSAP animations */
export function NavDropdown({ label, href, items }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const pathname = usePathname()

  const isActive = items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setExpandedSubmenus(new Set())
    }, 180)
  }, [])

  const openSubmenu = useCallback((key: string) => {
    setExpandedSubmenus((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }, [])

  const animateOpen = useCallback(() => {
    if (!panelRef.current) return
    gsap.killTweensOf(panelRef.current)
    gsap.killTweensOf(itemRefs.current)
    gsap.set(panelRef.current, { display: 'block', opacity: 0, y: -8, scale: 0.97 })
    gsap.to(panelRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' })
    gsap.fromTo(
      itemRefs.current.filter(Boolean),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out', delay: 0.08 },
    )
  }, [])

  const animateClose = useCallback(() => {
    if (!panelRef.current) return
    gsap.killTweensOf(panelRef.current)
    gsap.to(panelRef.current, {
      opacity: 0,
      y: -6,
      scale: 0.97,
      duration: 0.25,
      ease: 'power2.inOut',
      onComplete: () => {
        if (panelRef.current) gsap.set(panelRef.current, { display: 'none' })
      },
    })
  }, [])

  useEffect(() => {
    if (isOpen) animateOpen()
    else animateClose()
  }, [isOpen, animateOpen, animateClose])

  // Close on route change
  useEffect(() => {
    setIsOpen(false)
    setExpandedSubmenus(new Set())
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
      className={cn(
        'w-3 h-3 transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]',
        { 'rotate-180': isOpen },
      )}
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
      <MagneticElement strength={0.25}>
        {href ? (
          <Link href={href} className={sharedClassName}>
            {label}
            {chevron}
          </Link>
        ) : (
          <button type="button" onClick={() => setIsOpen((prev) => !prev)} className={sharedClassName}>
            {label}
            {chevron}
          </button>
        )}
      </MagneticElement>

      {/* Glassmorphism dropdown panel */}
      <div
        ref={panelRef}
        className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 cursor-normal-zone"
        style={{ display: 'none' }}
      >
        <div className="dropdown-glass w-60 rounded-2xl overflow-hidden">
          <div className="py-2">
            {items.map((item, i) => (
              <div
                key={item.href}
                className="group/item"
                onMouseEnter={() => {
                  if (item.submenu && item.submenu.length > 0) {
                    openSubmenu(item.href)
                  }
                }}
                onMouseLeave={() => {
                  if (item.submenu && item.submenu.length > 0) {
                    // Keep submenu visible while moving across sibling top-level items.
                    // It will close when leaving the whole dropdown container.
                  }
                }}
              >
                <Link
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  href={item.href}
                  className={cn(
                    'group block px-5 py-3 transition-colors duration-200',
                    'hover:bg-ff-near-black dark:hover:bg-white',
                    {
                      'bg-white/50 dark:bg-white/8': pathname === item.href,
                    },
                  )}
                >
                  <span className="block font-display font-bold text-sm text-ff-gray-15 dark:text-neutral-200 group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="block text-xs text-ff-gray-text/80 dark:text-neutral-500 group-hover:text-white/70 dark:group-hover:text-ff-near-black/60 mt-0.5 transition-colors">
                      {item.description}
                    </span>
                  )}
                </Link>

                {/* Nested submenu if present */}
                {item.submenu && item.submenu.length > 0 && (
                  <div
                    className={cn(
                      'pl-2 pr-3 border-l border-neutral-200 dark:border-neutral-700 ml-3 overflow-hidden transition-all duration-220 ease-out',
                      expandedSubmenus.has(item.href)
                        ? 'max-h-52 opacity-100 mt-1 py-1 pointer-events-auto'
                        : 'max-h-0 opacity-0 mt-0 py-0 pointer-events-none',
                    )}
                  >
                    <div className="rounded-lg p-1 bg-white/30 dark:bg-black/20">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            'group block px-3 py-2 text-xs font-display font-bold text-ff-gray-15 dark:text-neutral-300 hover:bg-ff-near-black dark:hover:bg-white rounded transition-colors',
                            {
                              'bg-white/50 dark:bg-white/8': pathname === subitem.href,
                            },
                          )}
                        >
                          <span className="block group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
                            {subitem.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
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
        type="button"
      >
        {label}
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]',
            { 'rotate-180': isOpen },
          )}
        />
      </button>

      <div ref={contentRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
        <div className="pl-4 pb-3 flex flex-col gap-0.5">
          {href && (
            <Link
              href={href}
              className={cn(
                'block py-2 text-base text-ff-gray-text dark:text-neutral-400 hover:text-ff-charcoal dark:hover:text-white transition-colors',
                { 'font-bold text-ff-charcoal dark:text-white': pathname === href },
              )}
            >
              {label}
            </Link>
          )}
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
