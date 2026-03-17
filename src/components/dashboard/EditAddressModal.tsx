'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function EditAddressModal() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const modal = searchParams.get('modal')
  const addressId = searchParams.get('id')

  const [isFetching, setIsFetching] = useState(false)
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

  // When editing, fetch the existing address and pre-populate the form
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(addressId ? `/api/addresses/${addressId}` : '/api/addresses', {
        method: addressId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(addressId ? 'Address updated' : 'Address added')
        router.back()
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
      } else {
        toast.error('Failed to save address')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      router.back()
      // Reset form so it's blank for the next open
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
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#4b4b4b]">
            {addressId ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <DialogDescription className="text-[#4b4f4a]">
            {addressId ? 'Update your address details' : 'Add a new shipping or billing address'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-[#4b4b4b]">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-[#4b4b4b]">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company" className="text-sm font-medium text-[#4b4b4b]">
              Company (optional)
            </Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="addressLine1" className="text-sm font-medium text-[#4b4b4b]">
              Street Address
            </Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="addressLine2" className="text-sm font-medium text-[#4b4b4b]">
              Apartment, suite, etc.
            </Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-medium text-[#4b4b4b]">
                City
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="postalCode" className="text-sm font-medium text-[#4b4b4b]">
                Postal Code
              </Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state" className="text-sm font-medium text-[#4b4b4b]">
                State / Province
              </Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-sm font-medium text-[#4b4b4b]">
                Country
              </Label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#e6be68]"
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
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-[#4b4b4b]">
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || isFetching}
              className="flex-1 bg-[#e6be68] text-white hover:bg-[#d4a85a]"
            >
              {isFetching
                ? 'Loading...'
                : isLoading
                  ? 'Saving...'
                  : addressId
                    ? 'Update Address'
                    : 'Add Address'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
