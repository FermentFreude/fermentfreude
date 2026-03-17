'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/Auth'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  MapPin,
  Truck,
  LogOut,
  Menu,
} from 'lucide-react'

const dashboardItems = [
  { label: 'Dashboard', href: '/account', exact: true, icon: LayoutDashboard },
  { label: 'Orders', href: '/account/orders', icon: ShoppingBag },
]

const settingsItems = [
  { label: 'Account Details', href: '/account/profile', icon: User },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Shipping Methods', href: '/account/shipping-methods', icon: Truck },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
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

  const NavLink = ({
    href,
    exact,
    icon: Icon,
    label,
  }: {
    href: string
    exact?: boolean
    icon: React.ElementType
    label: string
  }) => {
    const active = isActive(href, exact)
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 transition-all duration-200 text-sm',
          'hover:bg-[#f0ede6] text-[#4b4b4b]',
          active && 'bg-[#e6be68] text-white font-semibold shadow-sm',
        )}
      >
        <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-white' : 'text-[#4b4f4a]')} />
        {label}
      </Link>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Profile head */}
      <div className="px-4 py-5 border-b border-[#e8e4d9]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#e6be68] flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#4b4b4b] text-sm truncate">{user?.name || 'Customer'}</p>
            <p className="text-xs text-[#4b4f4a] truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 py-4 space-y-5 overflow-y-auto">
        <div>
          <p className="px-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-[#4b4f4a]/50">
            Dashboard
          </p>
          {dashboardItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
        <div>
          <p className="px-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-[#4b4f4a]/50">
            Account Settings
          </p>
          {settingsItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-[#e8e4d9]">
        <button
          onClick={async () => {
            await logout()
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-50 text-[#4b4b4b] hover:text-red-600 text-sm"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default function AccountSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile: hamburger + Sheet drawer */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-[#e8e4d9] text-[#4b4b4b] hover:bg-[#f0ede6]"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: fixed sidebar */}
      <div className="hidden md:flex flex-col bg-white rounded-xl border border-[#e8e4d9] shadow-sm w-64 min-h-96">
        <NavContent />
      </div>
    </>
  )
}
