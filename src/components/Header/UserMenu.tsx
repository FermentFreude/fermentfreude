'use client'

import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import { User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function UserMenu() {
  const { user } = useAuth()
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

  // Close on click outside (for touch devices)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div
      ref={menuRef}
      className="relative hidden lg:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative p-1.5 text-white/90 hover:text-white transition-colors hover:cursor-pointer"
        aria-label="Account menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User className="w-5 h-5" />
      </button>

      <div
        className={cn(
          'absolute right-0 top-full mt-2 w-64 rounded-xl bg-white dark:bg-ff-gray-15 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-150 z-50',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-1 pointer-events-none',
        )}
      >
        <div className="p-4">
          {!user ? (
            <>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center rounded-sm bg-ff-near-black dark:bg-white px-4 py-2.5 font-display text-sm font-bold text-white dark:text-ff-near-black transition-colors hover:bg-ff-charcoal dark:hover:bg-neutral-200"
              >
                Sign in
              </Link>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Link
                  href="/create-account"
                  onClick={() => setIsOpen(false)}
                  className="font-bold text-ff-near-black dark:text-white underline underline-offset-2 hover:no-underline"
                >
                  Register
                </Link>
                <span className="text-ff-charcoal dark:text-neutral-400">— in a snap</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 pb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ff-near-black dark:bg-white text-white dark:text-ff-near-black text-xs font-bold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ff-near-black dark:text-white">
                  {user.name || user.email}
                </p>
              </div>
            </div>
          )}
        </div>

        <hr className="border-neutral-100 dark:border-neutral-700" />

        <ul className="py-2">
          <MenuLink href="/account" label="Your account" onClick={() => setIsOpen(false)} />
          <MenuLink href="/orders" label="Orders" onClick={() => setIsOpen(false)} />
          <MenuLink href="/account/addresses" label="Addresses" onClick={() => setIsOpen(false)} />
          <MenuLink href="/help" label="Help & FAQ" onClick={() => setIsOpen(false)} />
        </ul>

        {user && (
          <>
            <hr className="border-neutral-100 dark:border-neutral-700" />
            <div className="p-2">
              <Link
                href="/logout"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Sign out
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MenuLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="block px-4 py-2.5 text-sm text-ff-gray-15 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        {label}
      </Link>
    </li>
  )
}
