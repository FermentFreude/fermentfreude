import { getAllSeatBundles, resolveMagicLink } from '@/lib/manageBooking'

import { ManageBookingClient } from './ManageBookingClient'

export const metadata = {
  title: 'Buchung verwalten — FermentFreude',
}

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const resolved = await resolveMagicLink(token)

  if (!resolved.ok) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-[#e8e4d9] rounded-2xl p-10 text-center">
          <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-3">
            {resolved.reason === 'expired' ? 'Link abgelaufen' : 'Link nicht gefunden'}
          </h1>
          <p className="text-[14px] text-[#626160]">
            {resolved.reason === 'expired'
              ? 'Dieser Link ist nicht mehr gültig. Dein Recht auf Stornierung/Umbuchung bleibt davon unberührt — melde dich bei uns unter kontakt@fermentfreude.at, wir schicken dir einen neuen Link.'
              : 'Dieser Link ist ungültig. Bitte prüfe, ob du den vollständigen Link aus deiner E-Mail verwendet hast, oder melde dich bei uns unter kontakt@fermentfreude.at.'}
          </p>
        </div>
      </div>
    )
  }

  const { booking, appointment, magicLink } = resolved
  const seats = getAllSeatBundles(booking, appointment, new Date())

  return (
    <ManageBookingClient
      token={token}
      scope={magicLink.scope}
      booking={{
        id: String(booking.id),
        workshopTitle: booking.workshopTitle,
        date: booking.date,
        time: booking.time,
        guestCount: booking.guestCount,
        pricePerPerson: booking.pricePerPerson,
      }}
      seats={seats}
    />
  )
}
