'use client'

import type { Header } from '@/payload-types'
import { gsap } from 'gsap'
import { ChevronDown, X } from 'lucide-react'

import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CHAR_REVEAL } from './anim'
import { defaultDropdowns, defaultNavItems, getDefaultDropdownKey } from './nav-defaults'

interface Props {
  menu: Header['navItems'] | null
  isActive: boolean
  setIsActive: (v: boolean) => void
  headerHeight?: number
}

interface NavOverlayItem {
  id: string
  label: string
  href: string
  description?: string | null
  isSmall?: boolean
  children?: NavOverlayItem[]
}

/**
 * Mobile menu overlay with accordion-style dropdowns.
 * - Clean, single-level list view
 * - Inline expandable dropdowns (no absolute positioning)
 * - Per-character reveal animations
 * - Smooth transitions
 */
export function MobileMenu({ menu, isActive, setIsActive, headerHeight = 0 }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const charRefs = useRef<Map<string, HTMLSpanElement[]>>(new Map())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [detailViewItem, setDetailViewItem] = useState<string | null>(null)
  const animTimeline = useRef<gsap.core.Timeline | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  // Measure where the header actually ends on screen (accounts for AdminBar above)
  const [menuTop, setMenuTop] = useState(headerHeight)
  useEffect(() => {
    if (!isActive) return
    const header = document.querySelector('header')
    if (header) {
      setMenuTop(Math.max(header.getBoundingClientRect().bottom, 0))
    }
  }, [isActive, headerHeight])

  const hasRealCMSItems = menu && menu.length > 0 && menu.some((i) => i.link?.label)

  // Build nav items list
  const navItemsList = buildNavItems(menu, !!hasRealCMSItems)

  // Close on route change
  useEffect(() => {
    if (isActive) setIsActive(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // Lock body scroll
  useEffect(() => {
    // Only run on client
    if (typeof document === 'undefined') return

    if (isActive) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [isActive])

  // Register character refs
  const setCharRef = useCallback((itemIdx: number, charIdx: number, el: HTMLSpanElement | null) => {
    const key = String(itemIdx)
    if (!charRefs.current.has(key)) {
      charRefs.current.set(key, [])
    }
    const arr = charRefs.current.get(key)!
    if (el) {
      arr[charIdx] = el
    }
  }, [])

  // Toggle dropdown expansion
  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Open detail view for Workshops
  const openDetailView = (id: string) => {
    setDetailViewItem(id)
    if (detailRef.current) {
      gsap.fromTo(
        detailRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      )
    }
  }

  // Close detail view
  const closeDetailView = () => {
    if (detailRef.current) {
      gsap.to(detailRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setDetailViewItem(null),
      })
    } else {
      setDetailViewItem(null)
    }
  }

  // Navigate and close
  const handleClose = useCallback(
    (href?: string) => {
      if (!navRef.current) {
        setIsActive(false)
        if (href) router.push(href)
        return
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setIsActive(false)
          if (href) router.push(href)
        },
      })

      // Reverse character animations
      charRefs.current.forEach((chars) => {
        const validChars = chars.filter(Boolean)
        validChars.forEach((char, i) => {
          tl.to(
            char,
            {
              y: '100%',
              duration: 0.4,
              ease: 'power4.inOut',
            },
            i * CHAR_REVEAL.exitStagger,
          )
        })
      })

      // Footer fade out
      if (footerRef.current) {
        tl.to(footerRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0)
      }

      // Nav fade out
      tl.to(navRef.current, { opacity: 0, duration: 0.5, ease: 'power4.inOut' }, 0.2)
    },
    [setIsActive, router],
  )

  // Animate open
  useEffect(() => {
    if (!isActive) return
    if (!navRef.current) return

    animTimeline.current?.kill()

    const tl = gsap.timeline()
    animTimeline.current = tl

    // Nav container fade in
    tl.fromTo(
      navRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power4.inOut' },
      0,
    )

    // Character reveals
    charRefs.current.forEach((chars) => {
      const validChars = chars.filter(Boolean)
      if (validChars.length === 0) return

      gsap.set(validChars, { y: '100%' })

      validChars.forEach((char, i) => {
        tl.to(
          char,
          {
            y: '0%',
            duration: CHAR_REVEAL.duration,
            ease: CHAR_REVEAL.ease,
          },
          0.3 + i * CHAR_REVEAL.enterStagger,
        )
      })
    })

    // Footer fade in
    if (footerRef.current) {
      tl.fromTo(
        footerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        0.6,
      )
    }

    return () => {
      tl.kill()
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      ref={navRef}
      className="nav-overlay fixed left-0 right-0 bottom-0 z-55"
      style={{ opacity: 0, top: menuTop }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#ECE5DE]/95 dark:bg-ff-near-black/97 backdrop-blur-xl" />

      {/* Content — fills remaining viewport below header */}
      <div className="relative h-full flex flex-col overflow-hidden">
        {/* Nav items list - scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 md:px-8 pt-4">
          <nav className="pb-6">
            {navItemsList.map((item, idx) => {
              const isExpanded = expandedItems.has(item.id)
              const hasChildren = item.children && item.children.length > 0
              const href = item.href?.toLowerCase() || ''
              const label = item.label.toLowerCase()
              const isAbout = href === '/about' || label.includes('about')
              const isWorkshops = href === '/workshops' || href.startsWith('/workshops/')
              const isOnlineCourses =
                href === '/courses' || href.startsWith('/courses/') || label === 'online courses'
              const isDetailViewOpen = detailViewItem === item.id
              const isChevronOpen =
                isWorkshops || isOnlineCourses || isAbout ? isDetailViewOpen : isExpanded

              return (
                <div key={item.id} className="mb-2 sm:mb-3">
                  {/* Main item button */}
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        // For Workshops, About & Online Courses: open detail view modal
                        if (isWorkshops || isOnlineCourses || isAbout) {
                          openDetailView(item.id)
                        } else {
                          // Regular items: toggle dropdown
                          toggleExpanded(item.id)
                        }
                      } else if (item.href) {
                        // Only navigate if item has an href
                        handleClose(item.href)
                      }
                    }}
                    className={cn(
                      'w-full flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 rounded-lg transition-colors text-left group cursor-pointer gap-2',
                      'hover:bg-ff-near-black dark:hover:bg-white',
                    )}
                  >
                    {/* Label with character animation and optional badge */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="flex overflow-hidden group-hover:text-white dark:group-hover:text-ff-near-black transition-colors text-base sm:text-lg wrap-break-word">
                        {item.label.split('').map((char, charIdx) => (
                          <span
                            key={`${idx}-${charIdx}`}
                            ref={(el) => setCharRef(idx, charIdx, el)}
                            className="inline-block"
                            style={{ transform: 'translateY(100%)' }}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        ))}
                      </span>
                      {isOnlineCourses && (
                        <span className="text-xs font-bold text-ff-gray-text dark:text-neutral-400 group-hover:text-white dark:group-hover:text-white transition-colors">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    {/* Chevron for dropdowns */}
                    {hasChildren && (
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform duration-300 group-hover:text-white dark:group-hover:text-ff-near-black',
                          isChevronOpen && 'rotate-180',
                        )}
                      />
                    )}
                  </button>

                  {/* Dropdown items - only show for regular items (not Workshops, About, or Online Courses - those use modals) */}
                  {hasChildren && isExpanded && !isWorkshops && !isOnlineCourses && !isAbout && (
                    <div className="border-l-2 border-ff-warm-gray/30 dark:border-white/20 mt-3 ml-6 sm:ml-8 pl-4 sm:pl-5 space-y-2 sm:space-y-3 overflow-hidden">
                      {item.children?.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={(e) => {
                            e.preventDefault()
                            handleClose(child.href)
                          }}
                          className="flex flex-col p-3 sm:p-4 rounded-lg text-sm sm:text-base text-ff-gray-text dark:text-neutral-400 hover:text-ff-near-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 overflow-hidden group"
                        >
                          <div className="font-bold group-hover:translate-x-1 transition-transform duration-200">
                            {child.label}
                          </div>
                          {child.description && (
                            <div className="text-xs mt-1.5 opacity-70 group-hover:opacity-100 group-hover:text-white dark:group-hover:text-ff-near-black transition-all">
                              {child.description}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Detail View Modal - Workshops, About, Online Courses */}
        {detailViewItem && (
          <div
            ref={detailRef}
            className="fixed inset-0 flex items-center justify-center z-70 px-3 sm:px-6 pointer-events-none overflow-hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-md cursor-pointer"
              onClick={closeDetailView}
              role="button"
              tabIndex={-1}
            />

            {/* Modal Card - Constrained Width */}
            <div className="relative bg-[#f5f2ed] dark:bg-ff-near-black rounded-2xl sm:rounded-3xl shadow-2xl w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-md max-h-[80vh] sm:max-h-[85vh] pointer-events-auto overflow-hidden border border-ff-warm-gray/20 dark:border-white/10 mx-auto">
              {/* Header with Close */}
              <div className="sticky top-0 bg-[#f5f2ed]/95 dark:bg-ff-near-black/95 backdrop-blur-sm border-b border-ff-warm-gray/20 dark:border-white/10 px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between gap-3 md:hidden">
                <h2 className="text-xl sm:text-3xl font-display font-bold text-ff-near-black dark:text-white flex-1 line-clamp-2">
                  {navItemsList.find((i) => i.id === detailViewItem)?.label}
                </h2>
                <button
                  onClick={closeDetailView}
                  className="p-1.5 sm:p-2 hover:bg-ff-near-black/10 dark:hover:bg-white/15 rounded-lg transition-colors shrink-0 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-ff-near-black dark:text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-65px)] sm:max-h-[calc(85vh-80px)] px-4 sm:px-6 py-5 sm:py-8">
                {(() => {
                  const currentItem = navItemsList.find((i) => i.id === detailViewItem)
                  const children = currentItem?.children || []

                  return (
                    <div className="flex flex-col gap-1">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={(e) => {
                            e.preventDefault()
                            closeDetailView()
                            setTimeout(() => handleClose(child.href), 200)
                          }}
                          className="block p-2.5 sm:p-4 rounded-lg hover:bg-ff-near-black dark:hover:bg-white transition-colors group"
                        >
                          <div
                            className={cn(
                              'text-ff-near-black dark:text-white group-hover:text-white dark:group-hover:text-ff-near-black transition-colors',
                              child.isSmall
                                ? 'text-xs sm:text-sm font-bold'
                                : 'text-sm sm:text-base font-bold',
                            )}
                          >
                            {child.label}
                          </div>
                          {child.description && !child.isSmall && (
                            <div className="text-xs text-ff-gray-text dark:text-neutral-400 group-hover:text-white dark:group-hover:text-ff-near-black mt-1 transition-colors">
                              {child.description}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          ref={footerRef}
          className="border-t border-ff-warm-gray/30 dark:border-neutral-800 px-4 sm:px-6 md:px-8 py-4 sm:py-6 mt-auto shrink-0 overflow-hidden"
          style={{ opacity: 0 }}
        >
          {/* Auth Links - Styled as Buttons */}
          <div className="flex flex-col gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={(e) => {
                    e.preventDefault()
                    handleClose('/account')
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg bg-ff-near-black dark:bg-white text-white dark:text-ff-near-black font-bold text-sm sm:text-base transition-all hover:opacity-90 active:scale-95 text-center cursor-pointer"
                >
                  My Account
                </Link>
                <Link
                  href="/logout"
                  onClick={(e) => {
                    e.preventDefault()
                    handleClose('/logout')
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg bg-ff-warm-gray/20 dark:bg-white/10 text-ff-near-black dark:text-white font-bold text-sm sm:text-base transition-all hover:bg-ff-warm-gray/30 dark:hover:bg-white/15 active:scale-95 text-center cursor-pointer"
                >
                  Log Out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    handleClose('/login')
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg bg-ff-near-black dark:bg-white text-white dark:text-ff-near-black font-bold text-sm sm:text-base transition-all hover:opacity-90 active:scale-95 text-center cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  href="/create-account"
                  onClick={(e) => {
                    e.preventDefault()
                    handleClose('/create-account')
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg bg-ff-warm-gray/20 dark:bg-white/10 text-ff-near-black dark:text-white font-bold text-sm sm:text-base transition-all hover:bg-ff-warm-gray/30 dark:hover:bg-white/15 active:scale-95 text-center cursor-pointer"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Helper: build nav items ───────────────────────────────────── */

function buildNavItems(
  menu: Header['navItems'] | null,
  hasRealCMSItems: boolean,
): NavOverlayItem[] {
  const items: NavOverlayItem[] = []

  if (hasRealCMSItems && menu) {
    for (const item of menu) {
      const url = item.link.url || '/'
      const label = item.link.label || ''
      const cmsDropdownItems = item.dropdownItems
      const defaultKey = getDefaultDropdownKey(label, url)

      const dropdownItems = defaultKey
        ? defaultDropdowns[defaultKey]
        : cmsDropdownItems && cmsDropdownItems.length > 0
          ? cmsDropdownItems
          : null

      const parentItem: NavOverlayItem = { id: String(item.id), label, href: url }

      if (dropdownItems && dropdownItems.length > 0) {
        parentItem.children = dropdownItems.map((sub) => ({
          id: `${item.id}-${sub.href}`,
          label: sub.label,
          href: sub.href,
          description: sub.description || null,
          isSmall: sub.isSmall ?? false,
        }))
      }

      items.push(parentItem)
    }
  } else {
    for (const item of defaultNavItems) {
      const parentItem: NavOverlayItem = { id: item.url, label: item.label, href: item.url }

      if (item.dropdownItems && item.dropdownItems.length > 0) {
        parentItem.children = item.dropdownItems.map((sub) => ({
          id: `${item.url}-${sub.href}`,
          label: sub.label,
          href: sub.href,
          description: sub.description || null,
          isSmall: sub.isSmall ?? false,
        }))
      }

      items.push(parentItem)
    }
  }

  return items
}
