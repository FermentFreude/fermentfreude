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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const pathname = usePathname()

  const isActive = items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

  const animateOpen = useCallback(() => {
    if (!panelRef.current) return
    gsap.killTweensOf(panelRef.current)
    gsap.killTweensOf(itemRefs.current)
    gsap.set(panelRef.current, { display: 'block', opacity: 0, y: -8, scale: 0.97 })
    gsap.to(panelRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: 'power3.out',
    })
    // Stagger items in
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

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 180)
  }

  useEffect(() => {
    if (isOpen) {
      animateOpen()
    } else {
      animateClose()
    }
  }, [isOpen, animateOpen, animateClose])

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
          <button className={sharedClassName}>
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
              <Link
                key={item.href}
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
