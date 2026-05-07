import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrSelf } from '@/access/adminOrSelf'
import { publicAccess } from '@/access/publicAccess'
import { checkRole } from '@/access/utilities'
import { forgotPasswordEmailHTML, forgotPasswordEmailSubject } from '@/auth/brevoAuthEmails'
import { sendAccountCreationEmail } from '@/hooks/brevo/sendAccountCreationEmail'
import { sendLoginNotificationEmail } from '@/hooks/brevo/sendLoginNotificationEmail'
import { syncUserToBrevo } from '@/hooks/brevo/syncUserToBrevo'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    group: 'Nutzer',
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
  },
  auth: {
    tokenExpiration: 1209600,
    forgotPassword: {
      generateEmailHTML: forgotPasswordEmailHTML,
      generateEmailSubject: forgotPasswordEmailSubject,
    },
    // Email verification (Brevo template #69) is wired but DISABLED by default.
    // Enabling `verify` will block existing users who don't have `_verified: true`
    // from logging in. Before flipping it on:
    //   1. Run: `pnpm tsx scripts/mark-existing-users-verified.ts`
    //      against the target DB (staging first, then prod).
    //   2. Add this import:
    //        import { verifyEmailHTML, verifyEmailSubject } from '@/auth/brevoAuthEmails'
    //   3. Replace the `verify: false` line below with:
    //        verify: { generateEmailHTML: verifyEmailHTML, generateEmailSubject: verifyEmailSubject },
    //   4. `pnpm generate:types && npx tsc --noEmit`.
    verify: false,
  },
  hooks: {
    afterChange: [sendAccountCreationEmail, syncUserToBrevo],
    afterLogin: [sendLoginNotificationEmail],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'marketingConsent',
      type: 'checkbox',
      defaultValue: false,
      label: 'Marketing consent',
      admin: {
        description: 'Whether the customer opted in to marketing emails during account creation.',
      },
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ['customer'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'customer',
          value: 'customer',
        },
      ],
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'cart',
      type: 'join',
      collection: 'carts',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'addresses',
      type: 'join',
      collection: 'addresses',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id'],
      },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
}
