'use client'

import type { Header } from '@/payload-types'
import { gsap } from 'gsap'

import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'
import { CHAR_REVEAL } from './anim'
import { defaultDropdowns, defaultNavItems, getDefaultDropdownKey } from './nav-defaults'

interface Props {
  menu: Header['navItems'] | null
  isActive: boolean
  setIsActive: (v: boolean) => void
}

/**
 * Full-page overlay navigation menu.
 * - All pages shown as large text links
 * - Per-character text reveal animation (GSAP — replicating portfolio's framer-motion translate)
 * - Blur effect on non-hovered links
 * - Footer with settings & auth
 */
export function MobileMenu({ menu, isActive, setIsActive }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const charRefs = useRef<Map<string, HTMLSpanElement[]>>(new Map())
  const [selectedLink, setSelectedLink] = useState<number | null>(null)
  const [touchedLink, setTouchedLink] = useState<number | null>(null)
  const animTimeline = useRef<gsap.core.Timeline | null>(null)
  const mobileBlobRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const hasRealCMSItems = menu && menu.length > 0 && menu.some((i) => i.link?.label)

  // Close on route change
  useEffect(() => {
    if (isActive) setIsActive(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // Lock body scroll when open
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isActive])

  // Build flat nav items list — all pages shown (including dropdown sub-items)
  const navItemsList = buildNavItems(menu, !!hasRealCMSItems)

  // Register character refs for a given link index
  const setCharRef = useCallback((linkIdx: number, charIdx: number, el: HTMLSpanElement | null) => {
    const key = String(linkIdx)
    if (!charRefs.current.has(key)) {
      charRefs.current.set(key, [])
    }
    const arr = charRefs.current.get(key)!
    if (el) {
      arr[charIdx] = el
    }
  }, [])

  // Animate open
  useEffect(() => {
    if (!isActive) return
    if (!navRef.current) return

    // Kill any existing timeline
    animTimeline.current?.kill()

    const tl = gsap.timeline()
    animTimeline.current = tl

    // Nav container: height 0 → auto
    tl.fromTo(
      navRef.current,
      { height: 0 },
      { height: 'auto', duration: 1, ease: 'power4.inOut' },
      0,
    )

    // Per-character reveal: each char slides up from y:100%
    charRefs.current.forEach((chars, _key) => {
      const validChars = chars.filter(Boolean)
      if (validChars.length === 0) return

      // Set initial state
      gsap.set(validChars, { y: '100%' })

      // Stagger reveal with per-character delay
      validChars.forEach((char, i) => {
        tl.to(
          char,
          {
            y: '0%',
            duration: CHAR_REVEAL.duration,
            ease: CHAR_REVEAL.ease,
          },
          0.3 + i * CHAR_REVEAL.enterStagger, // offset slightly for nav height animation
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

  // Animate close — optionally navigate after animation finishes
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
              duration: 0.5,
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

  // Color switch on hovered link
  useEffect(() => {
    if (!bodyRef.current) return
    const linkEls = bodyRef.current.querySelectorAll<HTMLElement>('.nav-overlay-link')

    if (selectedLink === null) {
      gsap.to(linkEls, {
        color: '',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      linkEls.forEach((el, i) => {
        gsap.to(el, {
          opacity: i === selectedLink ? 1 : 0.25,
          duration: 0.3,
          ease: 'power2.out',
        })
      })
    }
  }, [selectedLink])

  // Mobile: animate blob behind touched link
  useEffect(() => {
    mobileBlobRefs.current.forEach((blob, idx) => {
      if (idx === touchedLink) {
        gsap.to(blob, { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.35, ease: 'power3.out' })
      } else {
        gsap.to(blob, { scaleX: 0.95, scaleY: 0.8, opacity: 0, duration: 0.25, ease: 'power2.in' })
      }
    })
  }, [touchedLink])

  if (!isActive) return null

  return (
    <div
      ref={navRef}
      className="nav-overlay fixed left-0 top-0 w-full z-40 overflow-hidden"
      style={{ height: 0 }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#f5f2ed]/97 dark:bg-ff-near-black/97 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative h-full flex flex-col pt-20 md:pt-24">
        {/* Body: large nav links */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-20"
          onMouseLeave={() => setSelectedLink(null)}
        >
          <div className="flex flex-col md:flex-row md:flex-wrap mt-10 md:mt-20 max-w-350">
            {navItemsList.map((item, linkIdx) => (
              <Link
                key={item.id}
                href={item.href}
                className="nav-overlay-link cursor-can-hover rounded-lg block text-ff-near-black dark:text-neutral-100 no-underline uppercase transition-colors relative"
                onMouseOver={() => setSelectedLink(linkIdx)}
                onMouseLeave={() => setSelectedLink(null)}
                onTouchStart={() => setTouchedLink(linkIdx)}
                onTouchEnd={() => {
                  setTimeout(() => setTouchedLink(null), 200)
                }}
                onClick={(e) => {
                  e.preventDefault()
                  handleClose(item.href)
                }}
              >
                {/* Mobile touch blob */}
                <div
                  ref={(el) => {
                    if (el) mobileBlobRefs.current.set(linkIdx, el)
                  }}
                  className="absolute -inset-x-1 -inset-y-0.5 rounded-md pointer-events-none md:hidden"
                  style={{
                    backgroundColor: 'rgba(26, 26, 26, 0.08)',
                    opacity: 0,
                    transformOrigin: 'center center',
                  }}
                />
                <p className="pointer-events-none m-0 flex overflow-hidden text-[32px] md:text-[5vw] lg:text-[6vw] pr-7.5 md:pr-[2vw] pt-2.5 font-display font-light leading-[1.1] relative z-1">
                  {item.label.split('').map((char, charIdx) => (
                    <span
                      key={`${linkIdx}-${charIdx}`}
                      ref={(el) => setCharRef(linkIdx, charIdx, el)}
                      className="inline-block pointer-events-none"
                      style={{ transform: 'translateY(100%)' }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer: settings + auth */}
        <div
          ref={footerRef}
          className="border-t border-ff-warm-gray/30 dark:border-neutral-800 px-6 md:px-12 lg:px-20 py-5"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between max-w-350">
            {/* Settings */}
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>

            {/* Auth links */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="text-xs md:text-sm font-display font-bold text-ff-gray-15 dark:text-neutral-300 hover:text-ff-near-black dark:hover:text-white transition-colors lowercase cursor-can-hover"
                    onClick={(e) => {
                      e.preventDefault()
                      handleClose('/account')
                    }}
                  >
                    Account
                  </Link>
                  <Link
                    href="/logout"
                    className="text-xs md:text-sm text-ff-gray-text dark:text-neutral-400 hover:text-ff-charcoal dark:hover:text-white transition-colors lowercase cursor-can-hover"
                    onClick={(e) => {
                      e.preventDefault()
                      handleClose('/logout')
                    }}
                  >
                    Log out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs md:text-sm font-display font-bold text-ff-gray-15 dark:text-neutral-300 hover:text-ff-near-black dark:hover:text-white transition-colors lowercase cursor-can-hover"
                    onClick={(e) => {
                      e.preventDefault()
                      handleClose('/login')
                    }}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/create-account"
                    className="text-xs md:text-sm text-ff-gray-text dark:text-neutral-400 hover:text-ff-charcoal dark:hover:text-white transition-colors lowercase cursor-can-hover"
                    onClick={(e) => {
                      e.preventDefault()
                      handleClose('/create-account')
                    }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Helper: build flat nav items for overlay ──────────────── */

interface NavOverlayItem {
  id: string
  label: string
  href: string
}

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

      // Always add the parent
      items.push({ id: String(item.id), label, href: url })

      // Add dropdown children as separate links
      if (dropdownItems) {
        for (const sub of dropdownItems) {
          // Skip if same as parent
          if (sub.href === url || sub.label === label) continue
          items.push({
            id: `${item.id}-${sub.href}`,
            label: sub.label,
            href: sub.href,
          })
        }
      }
    }
  } else {
    for (const item of defaultNavItems) {
      items.push({ id: item.url, label: item.label, href: item.url })

      if (item.dropdownItems) {
        for (const sub of item.dropdownItems) {
          if (sub.href === item.url || sub.label === item.label) continue
          items.push({
            id: `${item.url}-${sub.href}`,
            label: sub.label,
            href: sub.href,
          })
        }
      }
    }
  }

  return items
}
