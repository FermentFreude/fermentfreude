'use client'

import { useEffect } from 'react'

/**
 * Removes browser extension attributes from the body tag to prevent hydration warnings.
 * These attributes (like `cz-shortcut-listen`) are added by browser extensions
 * (e.g., password managers) and cause server/client HTML mismatches.
 */
export function SuppressBodyHydrationWarning() {
  useEffect(() => {
    // Remove common browser extension attributes that cause hydration warnings
    const extensionAttributes = [
      'cz-shortcut-listen',
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'data-new-gr-c-s-loaded',
    ]

    extensionAttributes.forEach((attr) => {
      if (document.body.hasAttribute(attr)) {
        document.body.removeAttribute(attr)
      }
    })
  }, [])

  return null
}
