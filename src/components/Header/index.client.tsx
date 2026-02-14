'use client'

import { Cart } from '@/components/Cart'
import { CMSLink } from '@/components/Link'
import { IconLogo } from '@/components/icons'
import Link from 'next/link'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import type { Header } from 'src/payload-types'
import { MobileMenu } from './MobileMenu'

import { cn } from '@/utilities/cn'
import { usePathname } from 'next/navigation'
import { CartIconButton } from './CartIconButton'
import { NavDropdown } from './NavDropdown'
import { UserMenu } from './UserMenu'
import {
  defaultDropdowns,
  defaultNavItems,
  getDefaultDropdownKey,
  type DefaultNavItem,
} from './nav-defaults'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const cmsItems = header.navItems || []
  const pathname = usePathname()

  const hasRealCMSItems = cmsItems.length > 0 && cmsItems.some((i) => i.link?.label)

  const renderedDropdowns = new Set<string>()

  /* ── Scroll hide/show logic ──────────────────────────────── */
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY
    // Hide when scrolling down past 80px, show when scrolling up
    if (currentY > lastScrollY.current && currentY > 80) {
      setHidden(true)
    } else {
      setHidden(false)
    }
    lastScrollY.current = currentY
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const linkClassName =
    'relative navLink text-white/90 font-display font-bold text-[11px] lg:text-xs hover:text-white transition-colors'

  function renderCmsItem(item: (typeof cmsItems)[0]) {
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
          className={cn(linkClassName, {
            active: url && url !== '/' ? pathname.includes(url) : pathname === '/' && url === '/',
          })}
          appearance="inline"
        />
      </li>
    )
  }

  function renderDefaultItem(item: DefaultNavItem) {
    return (
      <li key={item.url}>
        {item.dropdownItems ? (
          <NavDropdown label={item.label} href={item.url} items={item.dropdownItems} />
        ) : (
          <Link
            href={item.url}
            className={cn(linkClassName, {
              active: item.url !== '/' ? pathname.includes(item.url) : pathname === '/',
            })}
          >
            {item.label}
          </Link>
        )}
      </li>
    )
  }

  return (
    <nav
      className={cn(
        'px-4 sm:px-6 lg:px-8 pt-3 lg:pt-4 transition-all duration-500 ease-in-out',
        hidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100',
      )}
    >
      <div className="mx-auto max-w-5xl rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-4 lg:px-6 relative">
        <div className="flex items-center justify-between h-11 lg:h-12">
          {/* Left nav links (desktop) */}
          <ul className="hidden lg:flex items-center gap-4 xl:gap-5">
            {hasRealCMSItems ? cmsItems.map(renderCmsItem) : defaultNavItems.map(renderDefaultItem)}
          </ul>

          {/* Mobile hamburger (left) */}
          <div className="block lg:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={hasRealCMSItems ? cmsItems : null} />
            </Suspense>
          </div>

          {/* Center logo — absolutely centered on the bar */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <IconLogo className="h-7 md:h-8 lg:h-8 w-auto" priority />
          </Link>

          {/* Right icons (desktop) */}
          <div className="hidden lg:flex items-center gap-0.5">
            <UserMenu />
            <Suspense fallback={<CartIconButton />}>
              <Cart />
            </Suspense>
          </div>

          {/* Mobile icons (right) */}
          <div className="flex lg:hidden items-center gap-0.5">
            <Suspense fallback={<CartIconButton />}>
              <Cart />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  )
}
