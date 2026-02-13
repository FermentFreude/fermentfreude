'use client'

import { Cart } from '@/components/Cart'
import { CMSLink } from '@/components/Link'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import type { Header } from 'src/payload-types'
import { MobileMenu } from './MobileMenu'

import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import { usePathname } from 'next/navigation'
import { CartIconButton } from './CartIconButton'
import { LanguageToggle } from './LanguageToggle'
import { NavDropdown } from './NavDropdown'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  header: Header
}

// Default dropdown items — used when no CMS sub-items are configured
const defaultDropdowns: Record<string, { label: string; href: string; description?: string }[]> = {
  about: [
    { label: 'Über uns', href: '/about', description: 'Unser Team & Mission' },
    { label: 'Fermentation', href: '/fermentation', description: 'Was ist Fermentation?' },
  ],
  workshops: [
    {
      label: 'Lakto Gemüse',
      href: '/workshops/lakto-gemuese',
      description: 'Fermentierte Gemüse-Workshops',
    },
    { label: 'Tempeh', href: '/workshops/tempeh', description: 'Tempeh selber machen' },
    { label: 'Kombucha', href: '/workshops/kombucha', description: 'Kombucha brauen lernen' },
    {
      label: 'Gutschein',
      href: '/workshops/voucher',
      description: 'Workshop-Gutschein verschenken',
    },
  ],
}

/** Match a nav item to its default dropdown key */
function getDefaultDropdownKey(label?: string | null, url?: string | null): string | null {
  const l = label?.toLowerCase()
  if (l === 'workshops' || url === '/workshops') return 'workshops'
  if (
    l === 'about us' ||
    l === 'about' ||
    l === 'fermentation' ||
    url === '/about' ||
    url === '/fermentation'
  )
    return 'about'
  return null
}

export function HeaderClient({ header }: Props) {
  const menu = header.navItems || []
  const pathname = usePathname()
  const { user } = useAuth()

  // Track which default dropdowns have been rendered (to avoid duplicates like About + Fermentation)
  const renderedDropdowns = new Set<string>()

  return (
    <nav className="bg-white dark:bg-ff-near-black border-b border-ff-white-95 dark:border-neutral-800 transition-colors">
      <div className="container flex items-center justify-between py-2.5">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.svg"
            alt="Fermentfreude"
            width={140}
            height={16}
            className="h-4 w-auto dark:invert"
            priority
          />
        </Link>

        {/* Desktop Nav Links */}
        {menu.length ? (
          <ul className="hidden lg:flex items-center gap-5 xl:gap-7">
            {menu.map((item) => {
              const url = item.link.url
              const cmsDropdownItems = item.dropdownItems
              const defaultKey = getDefaultDropdownKey(item.link.label, url)

              // Resolve dropdown items: CMS overrides defaults
              const dropdownItems =
                cmsDropdownItems && cmsDropdownItems.length > 0
                  ? cmsDropdownItems
                  : defaultKey
                    ? defaultDropdowns[defaultKey]
                    : null

              // Render as dropdown
              if (dropdownItems && dropdownItems.length > 0) {
                // Skip duplicate (e.g. Fermentation is inside the About dropdown)
                const key = defaultKey || item.link.label
                if (renderedDropdowns.has(key)) return null
                renderedDropdowns.add(key)

                return (
                  <li key={item.id}>
                    <NavDropdown
                      label={defaultKey === 'about' ? 'About' : item.link.label}
                      href={defaultKey === 'about' ? undefined : url || undefined}
                      items={dropdownItems}
                    />
                  </li>
                )
              }

              // Regular link
              return (
                <li key={item.id}>
                  <CMSLink
                    {...item.link}
                    className={cn(
                      'relative navLink text-ff-gray-15 dark:text-neutral-300 font-semibold text-sm hover:text-ff-charcoal dark:hover:text-white transition-colors',
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
            })}
          </ul>
        ) : null}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Toggles */}
          <div className="hidden lg:flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-4 text-sm font-semibold">
            {!user ? (
              <>
                <Link
                  href="/create-account"
                  className="text-ff-gray-15 dark:text-neutral-300 hover:text-ff-charcoal dark:hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="text-ff-gray-15 dark:text-neutral-300 hover:text-ff-charcoal dark:hover:text-white transition-colors"
                >
                  Log in
                </Link>
              </>
            ) : (
              <Link
                href="/account"
                className="text-ff-gray-15 dark:text-neutral-300 hover:text-ff-charcoal dark:hover:text-white transition-colors"
              >
                Account
              </Link>
            )}
          </div>

          {/* Cart icon */}
          <Suspense fallback={<CartIconButton />}>
            <Cart />
          </Suspense>

          {/* Mobile hamburger */}
          <div className="block lg:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={menu} />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  )
}
