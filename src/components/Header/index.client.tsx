'use client'

import { Cart } from '@/components/Cart'
import { CMSLink } from '@/components/Link'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import type { Header } from 'src/payload-types'
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

  // Use CMS items if they exist with labels, otherwise fall back to hardcoded defaults
  const hasRealCMSItems = cmsItems.length > 0 && cmsItems.some((i) => i.link?.label)
  const renderedDropdowns = new Set<string>()

  return (
    <nav className="bg-ff-ivory dark:bg-ff-near-black border-b border-ff-white-95 dark:border-neutral-800 transition-colors">
      <div className="container flex items-center justify-between py-3 lg:py-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.svg"
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
                        'relative navLink text-ff-gray-15 dark:text-neutral-300 font-display font-bold text-sm hover:text-ff-near-black dark:hover:text-white transition-colors',
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
                        'relative navLink text-ff-gray-15 dark:text-neutral-300 font-display font-bold text-sm hover:text-ff-near-black dark:hover:text-white transition-colors',
                        {
                          active: item.url !== '/' ? pathname.includes(item.url) : pathname === '/',
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
  )
}
