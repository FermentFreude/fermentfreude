import { DeleteAddressButton } from '@/components/dashboard/DeleteAddressButton'
import { EditAddressModal } from '@/components/dashboard/EditAddressModal'
import type { Address } from '@/payload-types'
import configPromise from '@payload-config'
import { MapPin, Pencil, Plus } from 'lucide-react'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export const metadata = {
  title: 'Addresses — FermentFreude',
  description: 'Manage your shipping and billing addresses',
}

export default async function AddressesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please log in to manage your addresses.')}`)
  }

  let addresses: Address[] = []

  try {
    const result = await payload.find({
      collection: 'addresses',
      where: { customer: { equals: user.id } },
      limit: 100,
    })
    addresses = result.docs || []
  } catch (error) {
    console.error('Error fetching addresses:', error)
  }

  return (
    <div className="max-w-4xl space-y-10">
      {/* Page header */}
      <div className="pb-8 border-b border-[#e8e4d9] flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow font-bold text-ff-gold-accent mb-3">My Account</p>
          <h1 className="font-display text-[2rem] font-bold text-[#1a1a1a] tracking-tight leading-tight">
            Addresses
          </h1>
          <p className="mt-2 text-sm text-[#626160]">Manage your shipping and billing addresses.</p>
        </div>
        <Link
          href="?modal=new-address"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors shrink-0 mt-2"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </Link>
      </div>

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address: Address) => (
            <div
              key={address.id}
              className="bg-white border border-[#1a1a1a]/20 rounded-xl p-6 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-3.5 h-3.5 text-[#c4bbb3] shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c4bbb3]">
                  {address.title || 'Address'}
                </p>
              </div>

              <div className="flex-1 space-y-0.5 text-[13px] text-[#626160] mb-5">
                {(address.firstName || address.lastName) && (
                  <p className="font-semibold text-[#1a1a1a]">
                    {address.firstName} {address.lastName}
                  </p>
                )}
                {address.company && <p>{address.company}</p>}
                {address.addressLine1 && <p>{address.addressLine1}</p>}
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.postalCode} {address.city}
                </p>
                {address.state && <p>{address.state}</p>}
                {address.country && <p>{address.country}</p>}
                {address.phone && <p className="pt-2">{address.phone}</p>}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-[#f5f3f0]">
                <Link
                  href={`?modal=edit-address&id=${address.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 text-[12px] font-medium text-[#626160] hover:text-[#1a1a1a] border border-[#e8e4d9] hover:border-[#1a1a1a] rounded-lg transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </Link>
                <DeleteAddressButton id={address.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#1a1a1a]/20 rounded-xl p-16 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#f5f3f0] flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-5 h-5 text-[#c4bbb3]" />
          </div>
          <p className="text-[13px] text-[#626160] mb-6">No addresses saved yet.</p>
          <Link
            href="?modal=new-address"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Address
          </Link>
        </div>
      )}

      <EditAddressModal />
    </div>
  )
}
