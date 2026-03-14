'use client'

import { cn } from '@/utilities/cn'
import { gsap } from 'gsap'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MagneticElement } from './MagneticElement'

export interface DropdownItem {
  label: string
  href: string
  description?: string | null
  isDivider?: boolean | null
}

interface NavDropdownProps {
  label: string
  /** Optional top-level href — if provided, the label itself is a link */
  href?: string
  items: DropdownItem[]
}

/** Desktop Megamenu Modal with Internal Navigation Tabs */
export function NavDropdownDesktop({ label, href, items }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
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

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // Close only if clicking directly on the backdrop (not on the modal card)
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      document.body.style.overflow = ''
    }
  }, [])

  const chevron = (
    <ChevronDown
      className={cn(
        'w-3 h-3 transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]',
        { 'rotate-180': isOpen },
      )}
      aria-hidden="true"
    />
  )

  const sharedClassName = cn(
    'relative navLink inline-flex items-center gap-1 text-ff-gray-15 dark:text-neutral-300 font-display font-bold text-sm leading-none hover:text-ff-near-black dark:hover:text-white transition-colors',
    { active: isActive },
  )

  return (
    <>
      {/* Button trigger */}
      <div
        className="contents"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <MagneticElement strength={0.25}>
          <button className={sharedClassName}>
            {label}
            {chevron}
          </button>
        </MagneticElement>
      </div>

      {/* Modal rendered via portal */}
      {isOpen &&
        createPortal(
          <div
            className={cn(
              'fixed inset-0 flex items-center justify-center cursor-normal-zone md:flex p-4 transition-opacity duration-300',
              isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
            )}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
            }}
            onClick={handleBackdropClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Modal Card */}
            <div className={cn(
              'dropdown-glass rounded-3xl overflow-hidden max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl transition-all duration-300',
              isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
            )}>
              {/* Modal Header with Tabs */}
              <div className="border-b border-white/10 dark:border-white/10 bg-linear-to-r from-white/5 to-white/5 dark:from-white/5 dark:to-white/5 backdrop-blur-xl px-8 py-6">
                <h2 className="text-2xl font-display font-bold text-ff-near-black dark:text-white mb-6">
                  {label}
                </h2>
              </div>

              {/* Modal Content - Grid */}
              <div className="overflow-y-auto flex-1 px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'group flex flex-col gap-2 py-4 px-4 rounded-xl transition-all duration-300',
                        'hover:bg-ff-near-black dark:hover:bg-white cursor-pointer',
                        pathname === item.href && 'bg-ff-near-black/10 dark:bg-white/10',
                      )}
                    >
                      <h4 className="font-display font-bold text-sm md:text-base text-ff-near-black dark:text-white group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
                        {item.label}
                      </h4>
                      {item.description && (
                        <p className="text-xs md:text-sm text-ff-gray-text/70 dark:text-neutral-400 leading-relaxed group-hover:text-white/80 dark:group-hover:text-ff-near-black/80 transition-colors">
                          {item.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
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
