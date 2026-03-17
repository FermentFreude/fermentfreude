import type { ReactNode } from 'react'

import { RenderParams } from '@/components/RenderParams'
import AccountSidebar from '@/components/dashboard/AccountSidebar'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?warning=' + encodeURIComponent('Please login to access your account.'))
  }

  return (
    <div>
      <div className="container">
        <RenderParams className="" />
      </div>

      <div className="container mt-16 pb-8 flex gap-8">
        {/* AccountSidebar manages its own responsive layout (desktop sidebar + mobile Sheet) */}
        <div className="shrink-0">
          <AccountSidebar />
        </div>

        <div className="flex flex-col gap-12 grow min-w-0">{children}</div>
      </div>
    </div>
  )
}
