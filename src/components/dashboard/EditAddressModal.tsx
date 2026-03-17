'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const inputClass =
  'w-full px-3.5 py-2.5 bg-white border border-[#e8e4d9] rounded-lg text-sm text-[#1a1a1a] placeholder:text-[#c4bbb3] focus:outline-none focus:border-[#1a1a1a] transition-colors'
const labelClass = 'block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e9189] mb-1.5'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )
}

export function EditAddressModal() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const modal = searchParams.get('modal')
  const addressId = searchParams.get('id')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    state: '',
    country: 'DE',
    phone: '',
  })

  useEffect(() => {
    setIsOpen(modal === 'new-address' || modal === 'edit-address')
  }, [modal])

  useEffect(() => {
    if (modal !== 'edit-address' || !addressId) return
    setIsFetching(true)
    fetch(`/api/addresses/${addressId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            company: data.company || '',
            addressLine1: data.addressLine1 || '',
            addressLine2: data.addressLine2 || '',
            city: data.city || '',
            postalCode: data.postalCode || '',
            state: data.state || '',
            country: data.country || 'DE',
            phone: data.phone || '',
          })
        }
      })
      .catch(console.error)
      .finally(() => setIsFetching(false))
  }, [modal, addressId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () =>
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      state: '',
      country: 'DE',
      phone: '',
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(addressId ? `/api/addresses/${addressId}` : '/api/addresses', {
        method: addressId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast.success(addressId ? 'Address updated' : 'Address added')
        router.back()
        resetForm()
      } else {
        toast.error('Failed to save address')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      router.back()
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-[#e8e4d9] rounded-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-[#f5f3f0]">
          <DialogTitle className="font-display text-lg font-bold text-[#1a1a1a]">
            {addressId ? 'Edit Address' : 'New Address'}
          </DialogTitle>
          <DialogDescription className="text-[12px] text-[#9e9189] mt-1">
            {addressId ? 'Update your address details.' : 'Enter your shipping or billing address.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {isFetching ? (
            <div className="py-8 text-center text-[13px] text-[#9e9189]">Loading…</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name">
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Company (optional)">
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Street Address">
                <input
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Apartment, suite, etc.">
                <input
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Postal Code">
                  <input
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="State / Province">
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
                <Field label="Country">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="DE">Germany</option>
                    <option value="AT">Austria</option>
                    <option value="CH">Switzerland</option>
                    <option value="FR">France</option>
                    <option value="NL">Netherlands</option>
                    <option value="BE">Belgium</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="PL">Poland</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                </Field>
              </div>

              <Field label="Phone (optional)">
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#1a1a1a] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving…' : addressId ? 'Update Address' : 'Add Address'}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="px-5 py-2.5 border border-[#e8e4d9] text-[#4b4b4b] hover:bg-[#f5f3f0] text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

