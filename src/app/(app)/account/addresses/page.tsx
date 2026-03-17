import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { EditAddressModal } from '@/components/dashboard/EditAddressModal'
import { MapPin, Plus, Edit2 } from 'lucide-react'
import { DeleteAddressButton } from '@/components/dashboard/DeleteAddressButton'
import type { Address } from '@/payload-types'

export const metadata = {
  title: 'Addresses - FermentFreude',
  description: 'Manage your addresses',
}

export default async function AddressesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to manage addresses.')}`)
  }

  let addresses: Address[] = []

  try {
    const addressesData = await payload.find({
      collection: 'addresses',
      where: {
        customer: {
          equals: user.id,
        },
      },
      limit: 100,
      overrideAccess: false,
      user,
    })
    addresses = addressesData.docs || []
  } catch (error) {
    console.error('Error fetching addresses:', error)
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">Addresses</h1>
          <p className="text-[#4b4f4a]">Manage your shipping and billing addresses</p>
        </div>
        <Link
          href="?modal=new-address"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Address
        </Link>
      </div>

      {/* Address Grid */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address: any) => (
            <Card key={address.id} className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#e6be68]" />
                  <h3 className="font-semibold text-[#4b4b4b]">
                    {address.title || 'Address'}
                  </h3>
                </div>
              </div>

              <div className="text-sm text-[#4b4f4a] space-y-1 mb-4">
                {(address.firstName || address.lastName) && (
                  <p className="font-medium text-[#4b4b4b]">
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

              <div className="flex gap-2 pt-4 border-t border-[#f0ede6]">
                <Link
                  href={`?modal=edit-address&id=${address.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-[#e6be68] hover:bg-[#f9f0dc] rounded transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Link>
                <DeleteAddressButton id={address.id} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-0 shadow-sm">
          <MapPin className="w-12 h-12 text-[#e6be68] mx-auto mb-4 opacity-50" />
          <p className="text-[#4b4f4a] mb-4">No addresses added yet</p>
          <Link
            href="?modal=new-address"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Your First Address
          </Link>
        </Card>
      )}

      {/* Edit Address Modal */}
      <EditAddressModal />
    </div>
  )
}
