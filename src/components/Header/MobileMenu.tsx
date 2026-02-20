'use client'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { MenuIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LanguageToggle } from './LanguageToggle'
import { NavDropdownMobile } from './NavDropdown'
import { ThemeToggle } from './ThemeToggle'
import { defaultDropdowns, defaultNavItems, getDefaultDropdownKey } from './nav-defaults'

interface Props {
  menu: Header['navItems'] | null
}

export function MobileMenu({ menu }: Props) {
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const hasRealCMSItems = menu && menu.length > 0 && menu.some((i) => i.link?.label)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  const renderedDropdowns = new Set<string>()

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="flex h-10 w-10 items-center justify-center rounded-md text-ff-gray-15 dark:text-neutral-300 transition-colors hover:text-ff-charcoal dark:hover:text-white">
        <MenuIcon className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-75 px-6 bg-ff-ivory dark:bg-ff-near-black">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle className="flex items-center">
            <Image
              src="/primary-logo.svg"
              alt="Fermentfreude"
              width={200}
              height={24}
              className="h-6 w-auto dark:invert"
            />
          </SheetTitle>
          <SheetDescription className="sr-only">Navigation menu</SheetDescription>
        </SheetHeader>

        <div className="py-6">
          <ul className="flex w-full flex-col gap-1">
            {hasRealCMSItems
              ? menu!.map((item) => {
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
                        <NavDropdownMobile
                          label={label}
                          href={url || undefined}
                          items={dropdownItems}
                        />
                      </li>
                    )
                  }

                  return (
                    <li key={item.id}>
                      <CMSLink
                        {...item.link}
                        appearance="inline"
                        className="block py-2.5 text-base font-display font-bold text-ff-gray-15 dark:text-neutral-300 hover:text-ff-near-black dark:hover:text-white transition-colors"
                      />
                    </li>
                  )
                })
              : defaultNavItems.map((item) => (
                  <li key={item.url}>
                    {item.dropdownItems ? (
                      <NavDropdownMobile
                        label={item.label}
                        href={item.url}
                        items={item.dropdownItems}
                      />
                    ) : (
                      <Link
                        href={item.url}
                        className="block py-2.5 text-base font-display font-bold text-ff-gray-15 dark:text-neutral-300 hover:text-ff-near-black dark:hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
          </ul>
        </div>

        <hr className="border-ff-white-95 dark:border-neutral-800" />

        {/* Settings: Language & Theme toggles */}
        <div className="flex items-center justify-between py-4">
          <span className="text-sm font-semibold text-ff-gray-text dark:text-neutral-400">
            Settings
          </span>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <hr className="border-ff-white-95 dark:border-neutral-800" />

        {user ? (
          <div className="py-6">
            <h3 className="text-sm font-bold text-ff-gray-text dark:text-neutral-500 uppercase tracking-wider mb-4">
              My Account
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/orders"
                  className="text-base text-ff-gray-15 dark:text-neutral-300 hover:text-ff-near-black dark:hover:text-white transition-colors"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/account/addresses"
                  className="text-base text-ff-gray-15 dark:text-neutral-300 hover:text-ff-near-black dark:hover:text-white transition-colors"
                >
                  Addresses
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-base text-ff-gray-15 dark:text-neutral-300 hover:text-ff-near-black dark:hover:text-white transition-colors"
                >
                  Manage account
                </Link>
              </li>
              <li className="mt-4">
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href="/logout">Log out</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="py-6 flex flex-col gap-3">
            <Link
              href="/create-account"
              className="w-full text-center rounded-full border border-ff-near-black dark:border-neutral-600 bg-ff-ivory dark:bg-transparent px-6 py-2.5 font-display text-base font-bold text-ff-near-black dark:text-neutral-200 transition-colors hover:bg-ff-near-black hover:text-ff-ivory dark:hover:bg-neutral-700 dark:hover:text-white"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="w-full text-center rounded-full bg-ff-near-black dark:bg-white px-6 py-2.5 font-display text-base font-bold text-ff-ivory dark:text-ff-near-black transition-colors hover:bg-ff-charcoal dark:hover:bg-neutral-200"
            >
              Log in
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
