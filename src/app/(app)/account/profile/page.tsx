'use client'

import { useAuth } from '@/providers/Auth'
import { CheckCircle2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-[#e8e4d9] rounded-lg text-sm text-[#1a1a1a] placeholder:text-[#c4bbb3] focus:outline-none focus:border-[#1a1a1a] transition-colors'
const labelClass =
  'block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e9189] mb-1.5'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  if (!user) redirect('/login')

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProfileLoading(true)
    try {
      const res = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileData.name, email: profileData.email }),
      })
      if (res.ok) toast.success('Profile updated')
      else toast.error('Failed to update profile')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setIsPasswordLoading(true)
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      if (res.ok) {
        toast.success('Password updated')
        setShowPasswordForm(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error('Failed to update password')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      {/* Page header */}
      <div className="pb-8 border-b border-[#e8e4d9]">
        <p className="text-eyebrow font-bold text-ff-gold-accent mb-3">Settings</p>
        <h1 className="font-display text-[2rem] font-bold text-[#1a1a1a] tracking-tight leading-tight">
          Account Details
        </h1>
        <p className="mt-2 text-sm text-[#626160]">
          Manage your personal information and security settings.
        </p>
      </div>

      {/* Profile */}
      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] mb-5">
          Profile
        </p>
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className={labelClass}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                className={inputClass}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData((p) => ({ ...p, email: e.target.value }))}
                className={inputClass}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isProfileLoading}
            className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProfileLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </section>

      <div className="border-t border-[#e8e4d9]" />

      {/* Security */}
      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] mb-5">
          Security
        </p>

        {!showPasswordForm ? (
          <div className="flex items-center justify-between py-4 px-5 bg-white border border-[#1a1a1a]/20 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">Password</p>
              <p className="text-[12px] text-[#c4bbb3] mt-0.5 tracking-widest">••••••••</p>
            </div>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-[12px] font-medium text-[#626160] hover:text-[#1a1a1a] transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label htmlFor="currentPassword" className={labelClass}>
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className={labelClass}>
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                className={inputClass}
              />
              <p className="mt-1.5 text-[11px] text-[#9e9189]">Minimum 8 characters</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPasswordLoading}
                className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPasswordLoading ? 'Updating…' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="px-5 py-2.5 border border-[#e8e4d9] text-[#4b4b4b] hover:bg-[#ece5de] text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <div className="border-t border-[#e8e4d9]" />

      {/* Account status */}
      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] mb-5">
          Account Status
        </p>
        <div className="flex items-center gap-3 py-4 px-5 bg-white border border-[#1a1a1a]/20 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <p className="text-sm text-[#4b4b4b]">Account is active and verified</p>
        </div>
      </section>
    </div>
  )
}
