'use client'

import React from 'react'

/** One avatar style for everyone: brand cream square, charcoal letter (10:1 contrast, works in light and dark). */
const AVATAR = { bg: '#FBF5E8', fg: '#3A3E3A' }

/** The first letter of the name (an email address works too). */
export function initialsOf(name: string) {
  return (name.trim().match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase()
}

type AvatarUser = { name?: string | null; email?: string | null; avatar?: unknown } | null | undefined

export function avatarUrl(avatar: unknown): string | null {
  if (avatar && typeof avatar === 'object' && 'url' in avatar) {
    const a = avatar as { url?: string | null; sizes?: Record<string, { url?: string | null } | undefined> }
    return a.sizes?.thumbnail?.url || a.url || null
  }
  return null
}

/** Profile photo, or the first letter on the brand cream square. */
export function UserAvatar({
  user,
  name,
  url,
  size = 32,
}: {
  user?: AvatarUser
  name?: string
  url?: string | null
  size?: number
}) {
  const label = name ?? user?.name ?? user?.email ?? '?'
  const src = url ?? avatarUrl(user?.avatar)
  return (
    <span
      className="ff-av"
      style={{ ['--s' as string]: `${size}px`, background: src ? undefined : AVATAR.bg, color: src ? undefined : AVATAR.fg }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny avatar from our own media store */}
      {src ? <img src={src} alt="" /> : initialsOf(label)}
    </span>
  )
}
