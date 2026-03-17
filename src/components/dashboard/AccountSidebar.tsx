'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/Auth'
import {
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Truck,
  RotateCcw,
  FileText,
  Star,
  Download,
  LogOut,
} from 'lucide-react'

interface MenuItem {
  label: string
  href: string
  icon: React.ReactNode
  disabled?: boolean
}

export default function AccountSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      href: '/account',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      label: 'Orders',
      href: '/account/orders',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      label: 'Downloads',
      href: '/account/downloads',
      icon: <Download className="w-5 h-5" />,
    },
    {
      label: 'Addresses',
      href: '/account/addresses',
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      label: 'Account Details',
      href: '/account/profile',
      icon: <User className="w-5 h-5" />,
    },
    {
      label: 'Payment Methods',
      href: '/account/payment-methods',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      label: 'Shipping Methods',
      href: '/account/shipping-methods',
      icon: <Truck className="w-5 h-5" />,
    },
    {
      label: 'Reviews',
      href: '/account/reviews',
      icon: <Star className="w-5 h-5" />,
    },
    {
      label: 'Return Requests',
      href: '/account/return-requests',
      icon: <RotateCcw className="w-5 h-5" />,
    },
    {
      label: 'Cancellations',
      href: '/account/cancellations',
      icon: <FileText className="w-5 h-5" />,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/account') {
      return pathname === '/account'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
            'hover:bg-[#f0ede6] text-[#4b4b4b]',
            isActive(item.href) &&
              'bg-[#e6be68] text-white font-semibold shadow-md'
          )}
        >
          <span className={cn('flex-shrink-0', isActive(item.href) && 'text-white')}>
            {item.icon}
          </span>
          <span className="text-sm font-medium">{item.label}</span>
        </Link>
      ))}

      {/* Divider */}
      <div className="h-px bg-[#e6be68] my-4" />

      {/* Logout button */}
      <button
        onClick={async () => {
          await logout()
        }}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
          'hover:bg-red-50 text-[#4b4b4b] hover:text-red-600'
        )}
      >
        <LogOut className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </nav>
  )
}
