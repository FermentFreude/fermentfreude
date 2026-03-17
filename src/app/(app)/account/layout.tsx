import type { ReactNode } from 'react'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { RenderParams } from '@/components/RenderParams'
import AccountSidebar from '@/components/dashboard/AccountSidebar'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?warning=' + encodeURIComponent('Please log in to access your account.'))
  }

  return (
    <div className="bg-[#f5f3f0] min-h-screen">
      <RenderParams className="sr-only" />
      <div className="flex min-h-screen">
        <AccountSidebar />
        <main className="flex-1 min-w-0 py-10 px-6 md:px-10">{children}</main>
      </div>
    </div>
  )
}
