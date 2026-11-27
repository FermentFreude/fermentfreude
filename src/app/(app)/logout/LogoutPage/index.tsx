'use client'

import { useAuth } from '@/providers/Auth'
import React, { useEffect } from 'react'

/**
 * Logs the visitor out and sends them straight to the home page.
 * If the logout request fails (e.g. already logged out), they still go home —
 * the header then shows their real login state.
 */
export const LogoutPage: React.FC = () => {
  const { logout } = useAuth()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
      } catch (_) {
        // Already logged out or request failed — go home either way
      }
      // Full page load (not client navigation) so no logged-in state lingers on the page
      window.location.replace('/')
    }

    void performLogout()
  }, [logout])

  return null
}
