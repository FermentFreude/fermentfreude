import Link from 'next/link'
import React from 'react'

import { BrandLockup } from './BrandLockup'

/** CMS sidebar brand — identical to the Management dashboard rail. */
export const NavLogo: React.FC = () => (
  <div className="ff-navlogo">
    <Link href="/admin" aria-label="Fermentfreude">
      <BrandLockup />
    </Link>
  </div>
)
