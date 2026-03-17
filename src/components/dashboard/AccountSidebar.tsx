'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/Auth'
import { LayoutDashboard, LogOut, MapPin, Menu, ShoppingBag, Truck, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_GROUPS = [
  {
    label: 'My Account',
    items: [
      { label: 'Overview', href: '/account', exact: true, icon: LayoutDashboard },
      { label: 'Orders', href: '/account/orders', icon: ShoppingBag },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Profile', href: '/account/profile', icon: User },
      { label: 'Addresses', href: '/account/addresses', icon: MapPin },
      { label: 'Shipping', href: '/account/shipping-methods', icon: Truck },
    ],
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? '?')

  return (
    <div className="flex flex-col h-full">
      {/* Identity */}
      <div className="px-5 py-5 border-b border-[#e8e4d9]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold font-display tracking-wider">
              {initials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#1a1a1a] font-display leading-tight truncate">
              {user?.name || 'Customer'}
            </p>
            <p className="text-[11px] text-[#9e9189] truncate mt-0.5 leading-tight">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 min-h-0">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3]">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-150',
                      active
                        ? 'bg-[#1a1a1a] text-white'
                        : 'text-[#4b4b4b] hover:bg-[#ece5de] hover:text-[#1a1a1a]',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        active ? 'text-white/70' : 'text-[#9e9189]',
                      )}
                    />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4 pt-3 border-t border-[#e8e4d9]">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-[#626160] hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function AccountSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile: Sheet drawer trigger */}
      <div className="md:hidden mb-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e8e4d9] bg-white text-[#4b4b4b] text-sm font-medium hover:bg-[#ece5de] transition-colors"
              aria-label="Open account navigation"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-white">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: left sidebar rail */}
      <aside className="hidden md:flex flex-col bg-white border-r border-[#e8e4d9] w-52 shrink-0 self-stretch">
        <SidebarContent />
      </aside>
    </>
  )
}
