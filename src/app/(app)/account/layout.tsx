import type { ReactNode } from 'react'

import { RenderParams } from '@/components/RenderParams'
import AccountSidebar from '@/components/dashboard/AccountSidebar'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?warning=' + encodeURIComponent('Please log in to access your account.'))
  }

  return (
    <div className="bg-[#575651] min-h-screen">
      <RenderParams className="sr-only" />
      <div className="flex flex-col md:flex-row min-h-screen">
        <AccountSidebar />
        <main className="flex-1 min-w-0 bg-[#f5f3f0] py-8 px-5 md:py-10 md:px-10">{children}</main>
      </div>
    </div>
  )
}
