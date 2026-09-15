'use client'

import { useAuth } from '@/providers/Auth'
import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/cn'
import {
  ChevronRight,
  CircleHelp,
  LogOut,
  MapPin,
  Package,
  User,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const COPY = {
  de: {
    accountMenu: 'Konto-Menü',
    signIn: 'Anmelden',
    register: 'Registrieren',
    inASnap: '— ganz schnell',
    signedInAs: 'Angemeldet als',
    accountSection: 'Konto',
    supportSection: 'Hilfe',
    yourAccount: 'Mein Konto',
    orders: 'Bestellungen',
    addresses: 'Adressen',
    helpFaq: 'Hilfe & FAQ',
    signOut: 'Abmelden',
  },
  en: {
    accountMenu: 'Account menu',
    signIn: 'Sign in',
    register: 'Register',
    inASnap: '— in a snap',
    signedInAs: 'Signed in as',
    accountSection: 'Account',
    supportSection: 'Support',
    yourAccount: 'Your account',
    orders: 'Orders',
    addresses: 'Addresses',
    helpFaq: 'Help & FAQ',
    signOut: 'Sign out',
  },
}

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return email?.charAt(0).toUpperCase() || 'U'
}

export function UserMenu() {
  const { user } = useAuth()
  const { locale } = useLocale()
  const pathname = usePathname()
  const t = COPY[locale === 'de' ? 'de' : 'en']
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const close = () => setIsOpen(false)
  const initials = getInitials(user?.name, user?.email)

  return (
    <div
      ref={menuRef}
      className="relative hidden lg:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          'relative flex items-center justify-center size-10 transition-colors',
          user
            ? 'rounded-full'
            : 'text-ff-charcoal dark:text-neutral-300 hover:text-ff-near-black dark:hover:text-white',
        )}
        aria-label={t.accountMenu}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {user ? (
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-full bg-ff-near-black dark:bg-white text-white dark:text-ff-near-black text-[11px] font-display font-bold tracking-wide ring-2 ring-transparent transition-shadow',
              isOpen && 'ring-[#d4cbc2] dark:ring-neutral-600',
            )}
          >
            {initials}
          </span>
        ) : (
          <User className="w-[18px] h-[18px]" strokeWidth={1.75} />
        )}
      </button>

      <div
        role="menu"
        className={cn(
          'absolute right-0 top-full mt-2.5 w-[300px] overflow-hidden rounded-xl dropdown-glass transition-all duration-200 z-50',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-1.5 pointer-events-none',
        )}
      >
        {!user ? (
          <div className="p-4">
            <Link
              href="/login"
              onClick={close}
              className="block w-full text-center rounded-sm bg-ff-near-black dark:bg-white px-4 py-2.5 font-display text-sm font-bold text-white dark:text-ff-near-black transition-colors hover:bg-ff-charcoal dark:hover:bg-neutral-200"
            >
              {t.signIn}
            </Link>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Link
                href="/create-account"
                onClick={close}
                className="font-bold text-ff-near-black dark:text-white underline underline-offset-2 hover:no-underline"
              >
                {t.register}
              </Link>
              <span className="text-ff-charcoal dark:text-neutral-400">{t.inASnap}</span>
            </div>
            <div className="my-3 h-px bg-[#e8e4d9] dark:bg-neutral-700" />
            <MenuLink
              href="/help"
              label={t.helpFaq}
              icon={CircleHelp}
              onClick={close}
              active={pathname.startsWith('/help')}
            />
          </div>
        ) : (
          <>
            {/* Identity */}
            <div className="relative overflow-hidden border-b border-[#e8e4d9] dark:border-neutral-700 bg-[#f7f4ef] dark:bg-neutral-900/60 px-4 py-4">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4cbc2] to-transparent dark:via-neutral-600"
                aria-hidden
              />
              <p className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] dark:text-neutral-500">
                {t.signedInAs}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ff-near-black dark:bg-white text-white dark:text-ff-near-black text-xs font-display font-bold tracking-wider shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-display font-bold text-ff-near-black dark:text-white leading-tight">
                    {user.name || user.email}
                  </p>
                  {user.name && user.email && (
                    <p className="truncate text-[11px] text-ff-gray-text dark:text-neutral-400 mt-0.5 leading-tight">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account links */}
            <div className="px-2 pt-3 pb-1.5">
              <p className="px-2.5 mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] dark:text-neutral-500">
                {t.accountSection}
              </p>
              <ul>
                <MenuLink
                  href="/account"
                  label={t.yourAccount}
                  icon={User}
                  onClick={close}
                  active={pathname === '/account'}
                />
                <MenuLink
                  href="/account/orders"
                  label={t.orders}
                  icon={Package}
                  onClick={close}
                  active={pathname.startsWith('/account/orders')}
                />
                <MenuLink
                  href="/account/addresses"
                  label={t.addresses}
                  icon={MapPin}
                  onClick={close}
                  active={pathname.startsWith('/account/addresses')}
                />
              </ul>
            </div>

            {/* Support */}
            <div className="px-2 pb-1.5">
              <p className="px-2.5 mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] dark:text-neutral-500">
                {t.supportSection}
              </p>
              <ul>
                <MenuLink
                  href="/help"
                  label={t.helpFaq}
                  icon={CircleHelp}
                  onClick={close}
                  active={pathname.startsWith('/help')}
                />
              </ul>
            </div>

            {/* Sign out */}
            <div className="border-t border-[#e8e4d9] dark:border-neutral-700 bg-[#faf8f5] dark:bg-neutral-900/40 p-2">
              <Link
                href="/logout"
                role="menuitem"
                onClick={close}
                className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#626160] dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut
                  className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100"
                  strokeWidth={1.75}
                />
                <span className="flex-1">{t.signOut}</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MenuLink({
  href,
  label,
  icon: Icon,
  onClick,
  active,
}: {
  href: string
  label: string
  icon: LucideIcon
  onClick: () => void
  active?: boolean
}) {
  return (
    <li>
      <Link
        href={href}
        role="menuitem"
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-colors',
          active
            ? 'bg-ff-gold/25 text-ff-near-black dark:bg-ff-gold/20 dark:text-white'
            : 'text-ff-charcoal dark:text-neutral-300 hover:bg-[#ece5de] dark:hover:bg-neutral-800 hover:text-ff-near-black dark:hover:text-white',
        )}
      >
        <Icon
          className={cn(
            'w-3.5 h-3.5 shrink-0 transition-colors',
            active
              ? 'text-ff-gold-accent-dark dark:text-ff-gold'
              : 'text-[#9e9189] dark:text-neutral-500',
          )}
          strokeWidth={1.75}
        />
        <span className="flex-1">{label}</span>
        <ChevronRight
          className={cn(
            'w-3.5 h-3.5 shrink-0 transition-all',
            active
              ? 'text-ff-gold-accent-dark/70 dark:text-ff-gold/70 opacity-100'
              : 'text-[#c4bbb3] dark:text-neutral-600 opacity-0 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-x-0',
          )}
          strokeWidth={1.75}
        />
      </Link>
    </li>
  )
}
