import type { AdminViewServerProps } from 'payload'
import Link from 'next/link'
import React from 'react'

import { isAdminUser } from './roster/requireAdmin'
import { RecipeImportClient } from './recipe-import/RecipeImportClient'

/* /admin/rezepte-import — custom admin views are not protected by
 * Payload automatically, so check for an admin here as well (the
 * server actions check again on every call). */
export const RecipeImportView: React.FC<AdminViewServerProps> = ({ initPageResult }) => {
  const user = initPageResult?.req?.user
  if (!isAdminUser(user)) {
    return (
      <div style={{ padding: 40 }}>
        <p>
          Nur für Admins. <Link href="/admin/login?redirect=%2Fadmin%2Frezepte-import">Anmelden</Link>
        </p>
      </div>
    )
  }
  return <RecipeImportClient />
}
