'use client'

import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import { useCallback, useEffect, useSyncExternalStore } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  "Gespeichert" — the ♥ list.
 *
 *  Guests:      saved in this browser (localStorage, list of slugs,
 *               newest first). Survives closing the tab or browser.
 *  Logged in:   saved in the customer account (/api/recipes/saved),
 *               so it shows on every device. Right after login, the
 *               hearts saved in this browser move into the account
 *               and the browser list is emptied (nothing left behind
 *               on shared devices after logout).
 *  All hearts and the "Gespeichert" tab share one store and stay in sync.
 *  If storage or the network fails, nothing breaks.
 * ═══════════════════════════════════════════════════════════════ */

const KEY = 'ff-saved-recipes'
const EVENT = 'ff-saved-change'
const EMPTY: string[] = []

/* ── this browser ── */
let cache: { raw: string | null; list: string[] } = { raw: null, list: EMPTY }

function readLocal(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw === cache.raw) return cache.list
    const parsed: unknown = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string').slice(0, 200) : EMPTY
    cache = { raw, list }
    return list
  } catch {
    return EMPTY
  }
}

function writeLocal(list: string[]) {
  try {
    if (list.length) window.localStorage.setItem(KEY, JSON.stringify(list))
    else window.localStorage.removeItem(KEY)
  } catch {
    // storage blocked: keep going without saving
  }
  emit()
}

/* ── the customer account ── */
let account: { userId: string; list: string[] } | null = null
let connecting: string | null = null

const emit = () => window.dispatchEvent(new Event(EVENT))

async function callApi(body?: { add?: string[]; remove?: string[] }): Promise<string[] | null> {
  try {
    const res = await fetch('/api/recipes/saved', {
      method: body ? 'POST' : 'GET',
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { slugs?: unknown }
    return Array.isArray(data.slugs) ? data.slugs.filter((s): s is string => typeof s === 'string') : null
  } catch {
    return null
  }
}

/** After login: load the account list and move this browser's hearts into it (once per user). */
async function connect(userId: string) {
  if (account?.userId === userId || connecting === userId) return
  connecting = userId
  const local = readLocal()
  const slugs = await callApi(local.length ? { add: local } : undefined)
  connecting = null
  if (!slugs) return // stays on the browser list; tries again on the next page
  account = { userId, list: slugs }
  if (local.length) writeLocal([])
  else emit()
}

function disconnect() {
  if (!account) return
  account = null
  emit()
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange()
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

const snapshot = () => (account ? account.list : readLocal())

/**
 * Saved recipe slugs (empty on the server and before hydration).
 * `loggedIn`: true / false once the login state is known, undefined before.
 */
export function useSavedRecipes() {
  const { user } = useAuth()
  const userId = user ? String(user.id) : user === null ? null : undefined

  useEffect(() => {
    if (userId) connect(userId)
    else if (userId === null) disconnect()
  }, [userId])

  const saved = useSyncExternalStore(subscribe, snapshot, () => EMPTY)

  const toggle = useCallback((slug: string) => {
    if (account) {
      const acc = account
      const before = acc.list
      const on = before.includes(slug)
      acc.list = on ? before.filter((s) => s !== slug) : [slug, ...before]
      emit()
      callApi(on ? { remove: [slug] } : { add: [slug] }).then((slugs) => {
        if (account !== acc) return
        acc.list = slugs ?? before // server answer wins; on error undo
        emit()
      })
      return
    }
    const list = readLocal()
    writeLocal(list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list])
  }, [])

  return { saved, toggle, loggedIn: userId === undefined ? undefined : Boolean(userId) }
}

type SaveLabels = { save: string; saved: string; saveAria: string; unsaveAria: string }

/**
 * Heart button.
 * - "pill": next to "Zum Rezept" in the title card (heart + word)
 * - "card": small round button on a recipe photo (heart only)
 */
export function SaveButton({
  slug,
  title,
  labels,
  variant,
  className,
}: {
  slug: string
  title: string
  labels: SaveLabels
  variant: 'pill' | 'card'
  className?: string
}) {
  const { saved, toggle } = useSavedRecipes()
  const on = saved.includes(slug)
  const aria = `${on ? labels.unsaveAria : labels.saveAria}: ${title}`

  if (variant === 'card') {
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={aria}
        title={on ? labels.saved : labels.save}
        onClick={() => toggle(slug)}
        className={cn(
          'grid size-9 place-items-center rounded-full shadow-[0_4px_14px_-6px_rgb(29_29_29/45%)] backdrop-blur-[2px] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6BE68] print:hidden',
          on ? 'bg-[#FFFEF9] text-[#D93A3A]' : 'bg-[#FFFEF9]/92 text-[#2D2F2C]',
          className,
        )}
      >
        <Heart on={on} className="size-[1.15rem]" />
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={aria}
      onClick={() => toggle(slug)}
      className={cn(
        'group inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-display text-[0.92rem] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6BE68] print:hidden',
        on ? 'border-[#D93A3A] bg-[#FFFEF9] text-[#2D2F2C] [&>svg]:text-[#D93A3A]' : 'border-[#2D2F2C]/20 bg-[#FFFEF9] text-[#2D2F2C] hover:border-[#2D2F2C]',
        className,
      )}
    >
      <Heart on={on} className="size-[1.1rem]" />
      {on ? labels.saved : labels.save}
    </button>
  )
}

function Heart({ on, className }: { on: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn(className, on && 'animate-[ff-pop_.35s_ease-out] motion-reduce:animate-none')}
      fill={on ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinejoin="round"
    >
      <path d="M12 20.3s-7.8-4.6-7.8-10.4A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.8 2.7c0 5.8-7.8 10.4-7.8 10.4Z" />
    </svg>
  )
}

/** Small heart for the "Gespeichert" filter tab. */
export function HeartIcon({ className }: { className?: string }) {
  return <Heart on className={className} />
}
