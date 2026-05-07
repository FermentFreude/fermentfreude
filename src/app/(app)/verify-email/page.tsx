import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'E-Mail bestätigen — FermentFreude',
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams
  const payload = await getPayload({ config: configPromise })

  let success = false
  let error: string | null = null

  if (!token) {
    error = 'Kein Bestätigungs-Token in der URL.'
  } else {
    try {
      await payload.verifyEmail({ collection: 'users', token })
      success = true
    } catch (err) {
      error = err instanceof Error ? err.message : 'Bestätigung fehlgeschlagen.'
    }
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#575651] text-white">
      <div className="container py-20 max-w-xl">
        <h1 className="text-3xl font-display mb-6">E-Mail-Bestätigung</h1>
        {success ? (
          <>
            <p className="mb-6">
              Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du kannst dich jetzt anmelden.
            </p>
            <Link href="/login" className="underline">
              Zum Login
            </Link>
          </>
        ) : (
          <>
            <p className="mb-6 text-[#FFC0C0]">{error || 'Bestätigung fehlgeschlagen.'}</p>
            <Link href="/login" className="underline">
              Zum Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
