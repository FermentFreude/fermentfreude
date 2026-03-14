'use client'

import type { Header } from '@/payload-types'
import { gsap } from 'gsap'
import { ChevronDown, X } from 'lucide-react'

import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LanguageToggle } from './LanguageToggle'
import { CHAR_REVEAL } from './anim'
import { defaultDropdowns, defaultNavItems, getDefaultDropdownKey } from './nav-defaults'

interface Props {
  menu: Header['navItems'] | null
  isActive: boolean
  setIsActive: (v: boolean) => void
}

interface NavOverlayItem {
  id: string
  label: string
  href: string
  isDivider?: boolean
  description?: string | null
  children?: NavOverlayItem[]
}

/**
 * Mobile menu overlay with accordion-style dropdowns.
 * - Clean, single-level list view
 * - Inline expandable dropdowns (no absolute positioning)
 * - Per-character reveal animations
 * - Smooth transitions
 */
export function MobileMenu({ menu, isActive, setIsActive }: Props) {
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

      // Nav collapse
      tl.to(navRef.current, { height: 0, duration: 0.8, ease: 'power4.inOut' }, 0.2)
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

    // Nav container expand
    tl.fromTo(
      navRef.current,
      { height: 0 },
      { height: 'auto', duration: 1, ease: 'power4.inOut' },
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
      className="nav-overlay fixed left-0 top-0 w-full h-screen z-50 overflow-hidden"
      style={{ height: 0 }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#f5f2ed]/97 dark:bg-ff-near-black/97 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative h-full flex flex-col pt-24 sm:pt-28 md:pt-32">
        {/* Header with Close Button and Language Toggle */}
        <div className="shrink-0 border-b border-ff-warm-gray/20 dark:border-white/10 px-5 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between">
          <span className="text-xs text-ff-gray-text dark:text-neutral-400 uppercase tracking-wide">
            Language
          </span>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={() => setIsActive(false)}
              className="p-2 hover:bg-ff-near-black/10 dark:hover:bg-white/15 rounded-lg transition-colors shrink-0 flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-ff-near-black dark:text-white" />
            </button>
          </div>
        </div>

        {/* Nav items list - scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 md:px-8">
          <nav className="mt-6 sm:mt-8 md:mt-12 pb-8">
            {navItemsList.map((item, idx) => {
              const isExpanded = expandedItems.has(item.id)
              const hasChildren = item.children && item.children.length > 0
              const isAbout = item.label.toLowerCase().includes('about') && item.href === '/about'
              const isWorkshops = item.label.toLowerCase() === 'workshops'
              const isOnlineCourses = item.label.toLowerCase() === 'online courses'

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
                      'w-full flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 rounded-lg transition-colors text-left group cursor-pointer',
                      'hover:bg-ff-near-black dark:hover:bg-white',
                    )}
                  >
                    {/* Label with character animation and optional badge */}
                    <div className="flex flex-col gap-1">
                      <span className="flex overflow-hidden group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
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
                        <span className="text-xs font-medium text-ff-near-black/70 dark:text-neutral-300 group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    {/* Chevron for dropdowns */}
                    {hasChildren && (
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform duration-300 group-hover:text-white dark:group-hover:text-ff-near-black',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    )}
                  </button>

                  {/* Dropdown items - only show for regular items (not Workshops, About, or Online Courses - those use modals) */}
                  {hasChildren && isExpanded && !isWorkshops && !isOnlineCourses && !isAbout && (
                    <div className="pl-3 sm:pl-4 border-l border-ff-warm-gray/20 dark:border-white/10 mt-2 ml-4 sm:ml-6">
                      {item.children?.map((child) => (
                        <div key={child.id}>
                          {child.isDivider && (
                            <div className="my-2 border-t border-ff-warm-gray/20 dark:border-white/10" />
                          )}
                          <Link
                            href={child.href}
                            onClick={(e) => {
                              e.preventDefault()
                              handleClose(child.href)
                            }}
                            className="block py-2 sm:py-3 px-3 sm:px-4 rounded text-sm sm:text-base text-ff-gray-text dark:text-neutral-400 hover:text-ff-near-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <div className="font-medium">{child.label}</div>
                            {child.description && (
                              <div className="text-xs mt-1 opacity-70">{child.description}</div>
                            )}
                          </Link>
                        </div>
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
            className="fixed inset-0 flex items-center justify-center z-50 px-4 sm:px-6 pointer-events-none"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-md"
              onClick={closeDetailView}
            />

            {/* Modal Card */}
            <div className="relative bg-[#f5f2ed] dark:bg-ff-near-black rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] pointer-events-auto overflow-hidden border border-ff-warm-gray/20 dark:border-white/10">
              {/* Header with Close */}
              <div className="sticky top-0 bg-[#f5f2ed]/95 dark:bg-ff-near-black/95 backdrop-blur-sm border-b border-ff-warm-gray/20 dark:border-white/10 px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-ff-near-black dark:text-white flex-1">
                  {navItemsList.find((i) => i.id === detailViewItem)?.label}
                </h2>
                <button
                  onClick={closeDetailView}
                  className="p-2 ml-4 hover:bg-ff-near-black/10 dark:hover:bg-white/15 rounded-lg transition-colors shrink-0 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-ff-near-black dark:text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-5 sm:px-6 py-6 sm:py-8">
                {(() => {
                  const currentItem = navItemsList.find((i) => i.id === detailViewItem)
                  const children = currentItem?.children || []
                  const isAboutModal = currentItem?.label.toLowerCase().includes('about')
                  const isWorkshopsModal = currentItem?.label.toLowerCase() === 'workshops'

                  if (isWorkshopsModal) {
                    const headerItem =
                      children.find(
                        (child) => child.href.toLowerCase() === '/workshops' && !child.isDivider,
                      ) || null
                    const workshopItems = children
                      .filter((child) => {
                        if (child.isDivider) return false
                        const href = child.href.toLowerCase()
                        const label = child.label.toLowerCase()
                        const isVoucher =
                          href.includes('/workshops/voucher') ||
                          label.includes('voucher') ||
                          label.includes('gutschein')
                        return href.startsWith('/workshops/') && !isVoucher
                      })
                      .slice(0, 3)
                    const additionalItems = children.filter((child) => {
                      const href = child.href.toLowerCase()
                      const label = child.label.toLowerCase()
                      const isVoucher =
                        href.includes('/workshops/voucher') ||
                        label.includes('voucher') ||
                        label.includes('gutschein')
                      const isOnlineCourses = href.startsWith('/courses')
                      return isOnlineCourses || isVoucher
                    })
                    return (
                      <div className="flex flex-col gap-1">
                        {headerItem && (
                          <Link
                            href="/workshops"
                            onClick={(e) => {
                              e.preventDefault()
                              closeDetailView()
                              setTimeout(() => handleClose('/workshops'), 200)
                            }}
                            className="block p-3 sm:p-4 rounded-lg hover:bg-ff-near-black dark:hover:bg-white transition-colors group"
                          >
                            <div className="text-base sm:text-lg font-bold text-ff-near-black dark:text-white group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
                              All Workshops
                            </div>
                          </Link>
                        )}
                        {workshopItems.length > 0 && (
                          <div className="ml-4 pl-4 border-l border-ff-warm-gray/40 dark:border-white/15 flex flex-col gap-1.5">
                            {workshopItems.map((child) => (
                              <Link
                                key={child.id}
                                href={child.href}
                                onClick={(e) => {
                                  e.preventDefault()
                                  closeDetailView()
                                  setTimeout(() => handleClose(child.href), 200)
                                }}
                                className="block p-2 sm:p-2.5 rounded-lg hover:bg-ff-near-black dark:hover:bg-white transition-colors group"
                              >
                                <div className="text-xs sm:text-sm font-bold text-ff-near-black dark:text-white group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
                                  {child.label}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {additionalItems.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {additionalItems.map((child) => {
                              const href = child.href.toLowerCase()
                              const label = child.label.toLowerCase()
                              const isVoucher =
                                href.includes('/workshops/voucher') ||
                                label.includes('voucher') ||
                                label.includes('gutschein')
                              return (
                                <div key={child.id}>
                                  {child.isDivider && (
                                    <div className="my-3 border-t border-ff-warm-gray/40 dark:border-white/15" />
                                  )}
                                  <Link
                                    href={child.href}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      closeDetailView()
                                      setTimeout(() => handleClose(child.href), 200)
                                    }}
                                    className="block p-3 sm:p-4 rounded-lg hover:bg-ff-near-black dark:hover:bg-white transition-colors group"
                                  >
                                    <div className="text-xs sm:text-sm font-bold text-ff-near-black dark:text-white group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
                                      {isVoucher ? 'Workshop Vouchers' : 'Upcoming Online Courses'}
                                    </div>
                                  </Link>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  } else if (isAboutModal) {
                    // About modal: all links same size (no parent distinction)
                    const allAboutItems = children.filter((child) => !child.isDivider)
                    return (
                      <div className="flex flex-col gap-1">
                        {allAboutItems.map((child) => (
                          <Link
                            key={child.id}
                            href={child.href}
                            onClick={(e) => {
                              e.preventDefault()
                              closeDetailView()
                              setTimeout(() => handleClose(child.href), 200)
                            }}
                            className="block p-3 sm:p-4 rounded-lg hover:bg-ff-near-black dark:hover:bg-white transition-colors group"
                          >
                            <div className="text-sm sm:text-base font-bold text-ff-near-black dark:text-white group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
                              {child.label.toLowerCase() === 'fermentation'
                                ? 'About Fermentation'
                                : child.label}
                            </div>
                          </Link>
                        ))}
                        {children.some((c) => c.isDivider) && (
                          <div className="my-3 border-t border-ff-warm-gray/40 dark:border-white/15" />
                        )}
                      </div>
                    )
                  }
                  return (
                    <div className="flex flex-col gap-1">
                      {children.map((child) => (
                        <div key={child.id}>
                          {child.isDivider && (
                            <div className="my-3 border-t border-ff-warm-gray/40 dark:border-white/15" />
                          )}
                          {!child.isDivider && (
                            <Link
                              href={child.href}
                              onClick={(e) => {
                                e.preventDefault()
                                closeDetailView()
                                setTimeout(() => handleClose(child.href), 200)
                              }}
                              className="block p-3 sm:p-4 rounded-lg hover:bg-ff-near-black dark:hover:bg-white transition-colors group"
                            >
                              <div className="text-sm font-bold text-ff-near-black dark:text-white group-hover:text-white dark:group-hover:text-ff-near-black transition-colors">
                                {child.label}
                              </div>
                            </Link>
                          )}
                        </div>
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
          className="border-t border-ff-warm-gray/30 dark:border-neutral-800 px-5 sm:px-6 md:px-8 py-4 sm:py-6"
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
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-ff-near-black dark:bg-white text-white dark:text-ff-near-black font-medium text-sm sm:text-base transition-all hover:opacity-90 active:scale-95 text-center cursor-pointer"
                >
                  My Account
                </Link>
                <Link
                  href="/logout"
                  onClick={(e) => {
                    e.preventDefault()
                    handleClose('/logout')
                  }}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-ff-warm-gray/20 dark:bg-white/10 text-ff-near-black dark:text-white font-medium text-sm sm:text-base transition-all hover:bg-ff-warm-gray/30 dark:hover:bg-white/15 active:scale-95 text-center cursor-pointer"
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
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-ff-near-black dark:bg-white text-white dark:text-ff-near-black font-medium text-sm sm:text-base transition-all hover:opacity-90 active:scale-95 text-center cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  href="/create-account"
                  onClick={(e) => {
                    e.preventDefault()
                    handleClose('/create-account')
                  }}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-ff-warm-gray/20 dark:bg-white/10 text-ff-near-black dark:text-white font-medium text-sm sm:text-base transition-all hover:bg-ff-warm-gray/30 dark:hover:bg-white/15 active:scale-95 text-center cursor-pointer"
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

      const dropdownItems =
        cmsDropdownItems && cmsDropdownItems.length > 0
          ? cmsDropdownItems
          : defaultKey
            ? defaultDropdowns[defaultKey]
            : null

      const parentItem: NavOverlayItem = { id: String(item.id), label, href: url }

      if (dropdownItems && dropdownItems.length > 0) {
        parentItem.children = []
        for (const sub of dropdownItems) {
          parentItem.children.push({
            id: `${item.id}-${sub.href}`,
            label: sub.label,
            href: sub.href,
            isDivider: (sub as any).isDivider || false,
            description: (sub as any).description || null,
          })
        }
      }

      items.push(parentItem)
    }
  } else {
    for (const item of defaultNavItems) {
      const parentItem: NavOverlayItem = { id: item.url, label: item.label, href: item.url }

      if (item.dropdownItems && item.dropdownItems.length > 0) {
        parentItem.children = []
        for (const sub of item.dropdownItems) {
          parentItem.children.push({
            id: `${item.url}-${sub.href}`,
            label: sub.label,
            href: sub.href,
            isDivider: sub.isDivider || false,
            description: sub.description || null,
          })
        }
      }

      items.push(parentItem)
    }
  }

  return items
}
