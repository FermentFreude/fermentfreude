'use client'

import { Cart } from '@/components/Cart'
import { CMSLink } from '@/components/Link'
import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import type { Header } from 'src/payload-types'
import { AnnouncementBar } from './AnnouncementBar'
import { MobileMenu } from './MobileMenu'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import { usePathname } from 'next/navigation'
import { CartIconButton } from './CartIconButton'
import { LanguageToggle } from './LanguageToggle'
import { NavDropdown } from './NavDropdown'
import { UserMenu } from './UserMenu'
import type { NavWorkshopItem } from '@/utilities/mergeWorkshopNavDropdown'
import { withDynamicWorkshopLinks } from '@/utilities/mergeWorkshopNavDropdown'
import { getDefaultDropdownKey, getDefaultDropdowns, getDefaultNavItems } from './nav-defaults'

type Props = {
  header: Header
  locale: 'de' | 'en'
  navWorkshops?: NavWorkshopItem[]
}

export function HeaderClient({ header, locale, navWorkshops = [] }: Props) {
  const cmsItems = header.navItems || []
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const { headerTheme } = useHeaderTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Menu active state (shared between header bar + overlay)
  const [isMenuActive, setIsMenuActive] = useState(false)

  // Track whether the cart drawer is open (CartModal sets body[data-cart-open])
  const [isCartOpen, setIsCartOpen] = useState(false)
  useEffect(() => {
    if (typeof document === 'undefined') return
    const update = () => setIsCartOpen(document.body.dataset.cartOpen === 'true')
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-cart-open'] })
    return () => observer.disconnect()
  }, [])

  // Hide-on-scroll-down, show-on-scroll-up + track "at top"
  const [hidden, setHidden] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)

  // Header ref for measuring height
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Track which nav link is hovered for blur effect
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const navLinksRef = useRef<HTMLUListElement>(null)

  // Measure header height
  useLayoutEffect(() => {
    if (!headerRef.current) return
    const measure = () => {
      const h = headerRef.current?.offsetHeight ?? 0
      setHeaderHeight(h)
      document.documentElement.style.setProperty('--header-height', `${h}px`)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(headerRef.current)
    measure()
    return () => observer.disconnect()
  }, [])

  const handleScroll = useCallback(() => {
    const y = window.scrollY
    setIsAtTop(y < 10)
    // Only hide after scrolling past 80px so the header doesn't flicker at the very top
    // Don't hide when menu or cart is active
    if (!isMenuActive && !isCartOpen && y > 80 && y > lastScrollY.current) {
      setHidden(true)
    } else {
      setHidden(false)
    }
    lastScrollY.current = y
  }, [isMenuActive, isCartOpen])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // If the cart opens while the navbar is tucked away, force it back into view.
  useEffect(() => {
    if (isCartOpen) setHidden(false)
  }, [isCartOpen])

  // Soften sibling nav hover — opacity only, no blur (calmer)
  useEffect(() => {
    if (!navLinksRef.current) return
    const items = navLinksRef.current.querySelectorAll<HTMLElement>('.nav-link-item')

    if (hoveredIndex === null) {
      gsap.to(items, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: true,
      })
    } else {
      items.forEach((item, i) => {
        gsap.to(item, {
          opacity: i === hoveredIndex ? 1 : 0.45,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: true,
        })
      })
    }
  }, [hoveredIndex])

  // Transparent header on home page when at top
  const isTransparent = isHomePage && isAtTop && !isMenuActive

  // Use CMS items if they exist with labels, otherwise fall back to hardcoded defaults
  const hasRealCMSItems = cmsItems.length > 0 && cmsItems.some((i) => i.link?.label)
  const renderedDropdowns = new Set<string>()

  const normalizeHeaderUrl = (url?: string | null): string => {
    if (!url) return '/'
    return url === '/voucher' ? '/workshops/voucher' : url
  }

  const normalizeDropdownHref = (href?: string | null): string => {
    if (!href) return '/'
    return href === '/voucher' ? '/workshops/voucher' : href
  }

  const defaultDropdowns = getDefaultDropdowns(locale)
  const defaultNavItems = getDefaultNavItems(locale)

  // Build nav items array for consistent indexing
  const navItems = hasRealCMSItems
    ? cmsItems.map((item) => {
        const url = normalizeHeaderUrl(item.link.url)
        const label = item.link.label
        const cmsDropdownItems = item.dropdownItems
        const defaultKey = getDefaultDropdownKey(label, url)

        const dropdownItems = withDynamicWorkshopLinks(
          cmsDropdownItems && cmsDropdownItems.length > 0
            ? cmsDropdownItems.map((dropdownItem) => ({
                ...dropdownItem,
                href: normalizeDropdownHref(dropdownItem.href),
              }))
            : defaultKey
              ? defaultDropdowns[defaultKey]
              : null,
          navWorkshops,
          defaultKey,
        )

        return { id: item.id, label, url, link: item.link, dropdownItems, defaultKey }
      })
    : defaultNavItems.map((item) => ({
        id: item.url,
        label: item.label,
        url: item.url,
        link: null,
        dropdownItems: withDynamicWorkshopLinks(
          item.dropdownItems || null,
          navWorkshops,
          item.dropdownKey || null,
        ),
        defaultKey: item.dropdownKey || null,
      }))

  return (
    <>
      <header
        ref={headerRef}
        className={cn('z-60 w-full', isHomePage ? 'fixed top-0' : 'sticky top-0')}
        data-transparent={isTransparent ? '' : undefined}
        data-header-theme={mounted && isTransparent && headerTheme === 'dark' ? 'dark' : undefined}
      >
        {/* Announcement bar — always visible, sits above nav so the nav can
            tuck under it on scroll-down without any visual overlap. */}
        <div className="relative z-10">
          <AnnouncementBar
            enabled={header.announcementBar?.enabled}
            text={header.announcementBar?.text}
            link={header.announcementBar?.link}
          />
        </div>
        {/* Navbar — slides up out of view on scroll-down, drops back in on scroll-up. */}
        <nav
          className={cn(
            'relative border-b transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
            hidden && !isMenuActive && !isCartOpen && '-translate-y-full',
            isTransparent && !isCartOpen
              ? 'bg-transparent backdrop-blur-none border-transparent dark:bg-transparent dark:backdrop-blur-none dark:border-transparent'
              : 'nav-glass border-black/6 dark:border-white/8',
          )}
        >
          <div className="container container-padding grid grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr_auto] items-center gap-4 h-14 md:h-[3.75rem]">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 flex items-center h-full justify-self-start"
              aria-label="FermentFreude Home"
            >
              <Image
                src="/primary-logo.svg"
                alt="Fermentfreude"
                width={200}
                height={28}
                className="h-[15px] md:h-[17px] w-auto dark:invert"
                style={{ width: 'auto' }}
                priority
              />
            </Link>

            {/* Desktop Nav — centered */}
            <ul
              ref={navLinksRef}
              className="hidden lg:flex items-center justify-center gap-8 xl:gap-10"
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
                      className="nav-link-item flex items-center"
                      onMouseEnter={() => setHoveredIndex(index)}
                    >
                      <NavDropdown label={label} href={url || undefined} items={dropdownItems} />
                    </li>
                  )
                }

                const linkClassName = cn(
                  'relative navLink font-display font-bold text-[12px] xl:text-[13px] leading-none uppercase',
                  {
                    active:
                      url && url !== '/' ? pathname.includes(url) : pathname === '/' && url === '/',
                  },
                )

                return (
                  <li
                    key={item.id}
                    className="nav-link-item flex items-center"
                    onMouseEnter={() => setHoveredIndex(index)}
                  >
                    {item.link ? (
                      <CMSLink {...item.link} className={linkClassName} appearance="inline" />
                    ) : (
                      <Link href={url || '/'} className={linkClassName}>
                        {label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* Actions — right aligned, equal touch targets */}
            <div className="flex items-center justify-end gap-0.5 sm:gap-1 cursor-normal-zone h-full justify-self-end">
              <div className="hidden lg:flex items-center">
                <UserMenu />
              </div>

              <Suspense fallback={<CartIconButton />}>
                <Cart />
              </Suspense>

              <div className="pl-1 pr-0.5">
                <LanguageToggle />
              </div>

              <button
                onClick={() => setIsMenuActive(!isMenuActive)}
                className="lg:hidden flex items-center justify-center size-10 text-ff-charcoal dark:text-neutral-300 transition-colors hover:text-ff-near-black dark:hover:text-white"
                aria-label={
                  isMenuActive
                    ? locale === 'de'
                      ? 'Navigation schließen'
                      : 'Close navigation menu'
                    : locale === 'de'
                      ? 'Navigation öffnen'
                      : 'Open navigation menu'
                }
              >
                <div
                  className={cn(
                    'burger-icon relative w-5 pointer-events-none',
                    isMenuActive && 'burger-active',
                  )}
                >
                  <span className="burger-bar burger-bar-top block h-px w-full bg-current relative transition-all duration-500 ease-out" />
                  <span className="burger-bar burger-bar-bottom block h-px w-full bg-current relative transition-all duration-500 ease-out" />
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
          headerHeight={headerHeight}
          locale={locale}
          navWorkshops={navWorkshops}
        />
      </Suspense>
    </>
  )
}
