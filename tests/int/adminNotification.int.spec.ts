import { afterEach, describe, expect, it } from 'vitest'

import { getAdminRecipients } from '@/lib/adminNotification'

const ORIGINAL_ENV = process.env.ADMIN_NOTIFICATION_EMAIL

describe('getAdminRecipients', () => {
  afterEach(() => {
    if (ORIGINAL_ENV === undefined) delete process.env.ADMIN_NOTIFICATION_EMAIL
    else process.env.ADMIN_NOTIFICATION_EMAIL = ORIGINAL_ENV
  })

  it('defaults to kontakt@fermentfreude.at when unset', () => {
    delete process.env.ADMIN_NOTIFICATION_EMAIL
    expect(getAdminRecipients()).toEqual([{ email: 'kontakt@fermentfreude.at' }])
  })

  it('splits a comma-separated list into multiple recipients (plan §9 confirmed decision)', () => {
    process.env.ADMIN_NOTIFICATION_EMAIL = 'kontakt@fermentfreude.at, connectwithrafaela@gmail.com'
    expect(getAdminRecipients()).toEqual([
      { email: 'kontakt@fermentfreude.at' },
      { email: 'connectwithrafaela@gmail.com' },
    ])
  })

  it('tolerates a trailing comma and extra whitespace', () => {
    process.env.ADMIN_NOTIFICATION_EMAIL = ' kontakt@fermentfreude.at ,connectwithrafaela@gmail.com, '
    expect(getAdminRecipients()).toEqual([
      { email: 'kontakt@fermentfreude.at' },
      { email: 'connectwithrafaela@gmail.com' },
    ])
  })

  it('falls back to the default for an empty string (not an empty recipient list)', () => {
    process.env.ADMIN_NOTIFICATION_EMAIL = ''
    expect(getAdminRecipients()).toEqual([{ email: 'kontakt@fermentfreude.at' }])
  })

  it('single address (no comma) still returns exactly one recipient', () => {
    process.env.ADMIN_NOTIFICATION_EMAIL = 'someone-else@fermentfreude.at'
    expect(getAdminRecipients()).toEqual([{ email: 'someone-else@fermentfreude.at' }])
  })
})
