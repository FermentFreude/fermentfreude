'use client'

import { Cart } from '@/components/Cart'
import { CMSLink } from '@/components/Link'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import type { Header } from 'src/payload-types'
import { AnnouncementBar } from './AnnouncementBar'
import { MobileMenu } from './MobileMenu'

import { cn } from '@/utilities/cn'
import { usePathname } from 'next/navigation'
import { CartIconButton } from './CartIconButton'
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

  // Hide-on-scroll-down, show-on-scroll-up + track "at top"
  const [hidden, setHidden] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)

  const handleScroll = useCallback(() => {
    const y = window.scrollY
    setIsAtTop(y < 10)
    // Only hide after scrolling past 80px so the header doesn't flicker at the very top
    if (y > 80 && y > lastScrollY.current) {
      setHidden(true)
    } else {
      setHidden(false)
    }
    lastScrollY.current = y
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Transparent header on home page when at top
  const isTransparent = isHomePage && isAtTop

  // Use CMS items if they exist with labels, otherwise fall back to hardcoded defaults
  const hasRealCMSItems = cmsItems.length > 0 && cmsItems.some((i) => i.link?.label)
  const renderedDropdowns = new Set<string>()

  return (
    <header
      className={cn(
        'z-50 w-full transition-all duration-300',
        isHomePage ? 'fixed top-0' : 'sticky top-0',
        hidden && '-translate-y-full',
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
          'border-b transition-all duration-300',
          isTransparent
            ? 'bg-white/60 backdrop-blur-xl border-white/30 lg:bg-transparent lg:backdrop-blur-none lg:border-transparent dark:bg-neutral-900/60 dark:backdrop-blur-xl dark:border-white/10 lg:dark:bg-transparent lg:dark:backdrop-blur-none lg:dark:border-transparent'
            : 'bg-ff-ivory dark:bg-ff-near-black border-ff-white-95 dark:border-neutral-800',
        )}
      >
        <div className="container flex items-center justify-between py-3 lg:py-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/primary-logo.svg"
              alt="Fermentfreude"
              width={200}
              height={28}
              className="h-4 md:h-5 lg:h-5 w-auto dark:invert"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-6 xl:gap-8">
            {hasRealCMSItems
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

                  if (dropdownItems && dropdownItems.length > 0) {
                    const key = defaultKey || label
                    if (renderedDropdowns.has(key)) return null
                    renderedDropdowns.add(key)

                    return (
                      <li key={item.id}>
                        <NavDropdown label={label} href={url || undefined} items={dropdownItems} />
                      </li>
                    )
                  }

                  return (
                    <li key={item.id}>
                      <CMSLink
                        {...item.link}
                        className={cn(
                          'relative navLink text-ff-gray-15 dark:text-neutral-300 font-display font-bold text-sm leading-none hover:text-ff-near-black dark:hover:text-white transition-colors',
                          {
                            active:
                              url && url !== '/'
                                ? pathname.includes(url)
                                : pathname === '/' && url === '/',
                          },
                        )}
                        appearance="inline"
                      />
                    </li>
                  )
                })
              : defaultNavItems.map((item) => (
                  <li key={item.url}>
                    {item.dropdownItems ? (
                      <NavDropdown label={item.label} href={item.url} items={item.dropdownItems} />
                    ) : (
                      <Link
                        href={item.url}
                        className={cn(
                          'relative navLink text-ff-gray-15 dark:text-neutral-300 font-display font-bold text-sm leading-none hover:text-ff-near-black dark:hover:text-white transition-colors',
                          {
                            active:
                              item.url !== '/' ? pathname.includes(item.url) : pathname === '/',
                          },
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* User icon with dropdown (desktop) */}
            <UserMenu />

            {/* Cart icon */}
            <Suspense fallback={<CartIconButton />}>
              <Cart />
            </Suspense>

            {/* Mobile hamburger */}
            <div className="block lg:hidden">
              <Suspense fallback={null}>
                <MobileMenu menu={hasRealCMSItems ? cmsItems : null} />
              </Suspense>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
