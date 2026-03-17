'use client'

import { useAuth } from '@/providers/Auth'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  if (!user) {
    redirect('/login')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('An error occurred while updating profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Password changed successfully')
        setShowPasswordForm(false)
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
      } else {
        toast.error('Failed to change password')
      }
    } catch (error) {
      toast.error('An error occurred while changing password')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">Account Details</h1>
        <p className="text-[#4b4f4a]">Manage your profile information and security settings</p>
      </div>

      {/* Profile Information */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-xl font-semibold text-[#4b4b4b] mb-6">Profile Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-[#4b4b4b] mb-2">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[#e6be68] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e6be68]"
              />
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-[#4b4b4b] mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[#e6be68] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e6be68]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#e6be68] text-white px-6 py-2 rounded-lg hover:bg-[#d4a85a] transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      {/* Password Section */}
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#4b4b4b]">Security</h2>
          {!showPasswordForm && (
            <Button
              onClick={() => setShowPasswordForm(true)}
              className="text-[#e6be68] hover:text-[#d4a85a] font-medium text-sm"
            >
              Change Password
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="block text-sm font-medium text-[#4b4b4b] mb-2">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[#e6be68] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e6be68]"
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="block text-sm font-medium text-[#4b4b4b] mb-2">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[#e6be68] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e6be68]"
              />
              <p className="text-xs text-[#4b4f4a] mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-[#4b4b4b] mb-2">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[#e6be68] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e6be68]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#e6be68] text-white px-6 py-2 rounded-lg hover:bg-[#d4a85a] transition-colors"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="border border-[#4b4b4b] text-[#4b4b4b] px-6 py-2 rounded-lg hover:bg-[#f9f0dc] transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Account Status */}
      <Card className="p-6 border-0 shadow-sm bg-[#f9f0dc]">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-[#4b4b4b] mb-1">Account Status</h3>
            <p className="text-sm text-[#4b4f4a]">Your account is active and verified</p>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Card className="p-6 border-0 shadow-sm border-t-4 border-t-red-500">
        <h2 className="text-xl font-semibold text-[#4b4b4b] mb-4">Session</h2>
        <p className="text-sm text-[#4b4f4a] mb-4">
          Log out from your account. You'll need to log in again to access your dashboard.
        </p>
        <Button
          onClick={async () => {
            await logout()
            redirect('/login')
          }}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </Button>
      </Card>
    </div>
  )
}
