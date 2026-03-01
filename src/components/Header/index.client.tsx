'use client'

import { Cart } from '@/components/Cart'
import { CMSLink } from '@/components/Link'
import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import type { Header } from 'src/payload-types'
import { AnnouncementBar } from './AnnouncementBar'
import { MobileMenu } from './MobileMenu'

import { cn } from '@/utilities/cn'
import { usePathname } from 'next/navigation'
import { CartIconButton } from './CartIconButton'
import { MagneticElement } from './MagneticElement'
import { NavDropdown } from './NavDropdown'
import { UserMenu } from './UserMenu'
import { defaultDropdowns, defaultNavItems, getDefaultDropdownKey } from './nav-defaults'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const cmsItems = header.navItems || []
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  // Menu active state (shared between header bar + overlay)
  const [isMenuActive, setIsMenuActive] = useState(false)

  // Hide-on-scroll-down, show-on-scroll-up + track "at top"
  const [hidden, setHidden] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)

  // Track which nav link is hovered for blur effect
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const navLinksRef = useRef<HTMLUListElement>(null)

  // Refs for Menu/Close label animation
  const menuLabelRef = useRef<HTMLParagraphElement>(null)
  const closeLabelRef = useRef<HTMLParagraphElement>(null)

  const handleScroll = useCallback(() => {
    const y = window.scrollY
    setIsAtTop(y < 10)
    // Only hide after scrolling past 80px so the header doesn't flicker at the very top
    // Don't hide when menu is active
    if (!isMenuActive && y > 80 && y > lastScrollY.current) {
      setHidden(true)
    } else {
      setHidden(false)
    }
    lastScrollY.current = y
  }, [isMenuActive])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Animate Menu/Close label crossfade
  useEffect(() => {
    if (menuLabelRef.current && closeLabelRef.current) {
      if (isMenuActive) {
        gsap.to(menuLabelRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' })
        gsap.to(closeLabelRef.current, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      } else {
        gsap.to(menuLabelRef.current, { opacity: 1, duration: 0.35, ease: 'power2.out' })
        gsap.to(closeLabelRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' })
      }
    }
  }, [isMenuActive])

  // Apply blur/focus effect to sibling nav items
  useEffect(() => {
    if (!navLinksRef.current) return
    const items = navLinksRef.current.querySelectorAll<HTMLElement>('.nav-link-item')

    if (hoveredIndex === null) {
      gsap.to(items, {
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      items.forEach((item, i) => {
        if (i === hoveredIndex) {
          gsap.to(item, {
            filter: 'blur(0px)',
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          })
        } else {
          gsap.to(item, {
            filter: 'blur(3px)',
            opacity: 0.45,
            duration: 0.3,
            ease: 'power2.out',
          })
        }
      })
    }
  }, [hoveredIndex])

  // Transparent header on home page when at top
  const isTransparent = isHomePage && isAtTop && !isMenuActive

  // Use CMS items if they exist with labels, otherwise fall back to hardcoded defaults
  const hasRealCMSItems = cmsItems.length > 0 && cmsItems.some((i) => i.link?.label)
  const renderedDropdowns = new Set<string>()

  // Build nav items array for consistent indexing
  const navItems = hasRealCMSItems
    ? cmsItems.map((item) => {
        const url = item.link.url
        const label = item.link.label
        const cmsDropdownItems = item.dropdownItems
        const defaultKey = getDefaultDropdownKey(label, url)

        const dropdownItems =
          cmsDropdownItems && cmsDropdownItems.length > 0
            ? cmsDropdownItems
            : defaultKey
              ? defaultDropdowns[defaultKey]
              : null

        return { id: item.id, label, url, link: item.link, dropdownItems, defaultKey }
      })
    : defaultNavItems.map((item) => ({
        id: item.url,
        label: item.label,
        url: item.url,
        link: null,
        dropdownItems: item.dropdownItems || null,
        defaultKey: item.dropdownKey || null,
      }))

  return (
    <>
      <header
        className={cn(
          'z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
          isHomePage ? 'fixed top-0' : 'sticky top-0',
          hidden && !isMenuActive && '-translate-y-full',
        )}
        data-transparent={isTransparent ? '' : undefined}
      >
        <AnnouncementBar
          enabled={header.announcementBar?.enabled}
          text={header.announcementBar?.text}
          link={header.announcementBar?.link}
        />
        <nav
          className={cn(
            'border-b transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
            isTransparent
              ? 'bg-transparent backdrop-blur-none border-transparent dark:bg-transparent dark:backdrop-blur-none dark:border-transparent'
              : 'nav-glass border-white/30 dark:border-white/6',
          )}
        >
          <div className="container flex items-center justify-between py-3 lg:py-4">
            {/* Logo with magnetic effect */}
            <MagneticElement strength={0.2}>
              <Link href="/" className="shrink-0 block cursor-can-hover">
                <Image
                  src="/primary-logo.svg"
                  alt="Fermentfreude"
                  width={200}
                  height={28}
                  className="h-4 md:h-5 lg:h-5 w-auto dark:invert"
                  style={{ width: 'auto' }}
                  priority
                />
              </Link>
            </MagneticElement>

            {/* Desktop Nav Links with blur effect */}
            <ul
              ref={navLinksRef}
              className="hidden lg:flex items-center gap-6 xl:gap-8"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {navItems.map((item, index) => {
                const { dropdownItems, defaultKey, label, url } = item

                if (dropdownItems && dropdownItems.length > 0) {
                  const key = defaultKey || label
                  if (renderedDropdowns.has(key)) return null
                  renderedDropdowns.add(key)

                  return (
                    <li
                      key={item.id}
                      className="nav-link-item"
                      onMouseEnter={() => setHoveredIndex(index)}
                    >
                      <NavDropdown label={label} href={url || undefined} items={dropdownItems} />
                    </li>
                  )
                }

                const linkClassName = cn(
                  'relative navLink text-ff-gray-15 dark:text-neutral-300 font-display font-bold text-sm leading-none hover:text-ff-near-black dark:hover:text-white transition-colors',
                  {
                    active:
                      url && url !== '/' ? pathname.includes(url) : pathname === '/' && url === '/',
                  },
                )

                return (
                  <li
                    key={item.id}
                    className="nav-link-item"
                    onMouseEnter={() => setHoveredIndex(index)}
                  >
                    <MagneticElement strength={0.3}>
                      {item.link ? (
                        <CMSLink {...item.link} className={linkClassName} appearance="inline" />
                      ) : (
                        <Link href={url || '/'} className={linkClassName}>
                          {label}
                        </Link>
                      )}
                    </MagneticElement>
                  </li>
                )
              })}
            </ul>

            {/* Right side */}
            <div className="flex items-center gap-1 cursor-normal-zone">
              {/* User icon with dropdown (desktop) */}
              <MagneticElement strength={0.3} className="hidden lg:block">
                <UserMenu />
              </MagneticElement>

              {/* Cart icon */}
              <MagneticElement strength={0.3}>
                <Suspense fallback={<CartIconButton />}>
                  <Cart />
                </Suspense>
              </MagneticElement>

              {/* Menu / Close toggle — portfolio style */}
              <button
                onClick={() => setIsMenuActive(!isMenuActive)}
                className="flex items-center justify-center gap-3 h-10 px-1 text-ff-gray-15 dark:text-neutral-300 transition-colors hover:text-ff-near-black dark:hover:text-white"
                aria-label={isMenuActive ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {/* Menu / Close label */}
                <div className="relative flex items-center">
                  <p
                    ref={menuLabelRef}
                    className="m-0 text-sm md:text-base font-display font-bold lowercase leading-none select-none"
                  >
                    Menu
                  </p>
                  <p
                    ref={closeLabelRef}
                    className="m-0 text-sm md:text-base font-display font-bold lowercase leading-none select-none absolute left-0 opacity-0"
                  >
                    Close
                  </p>
                </div>

                {/* Burger bars → X */}
                <div
                  className={cn(
                    'burger-icon relative w-6.5 pointer-events-none',
                    isMenuActive && 'burger-active',
                  )}
                >
                  <span className="burger-bar burger-bar-top block h-px w-full bg-current relative transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]" />
                  <span className="burger-bar burger-bar-bottom block h-px w-full bg-current relative transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]" />
                </div>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Full-page overlay menu */}
      <Suspense fallback={null}>
        <MobileMenu
          menu={hasRealCMSItems ? cmsItems : null}
          isActive={isMenuActive}
          setIsActive={setIsMenuActive}
        />
      </Suspense>
    </>
  )
}
