'use client'

import { scaleAmount } from '@/lib/recipeAmount'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  Zutaten while cooking:
 *  - Portionen-Rechner: 1× / 2× / 3× scales every amount (and "Ergibt …")
 *  - tick-off list with the jar checkbox (plain checkboxes, no state needed)
 *  - "Bildschirm anlassen": keeps the phone screen on (Wake Lock API),
 *    only shown where the browser supports it
 *  Without JavaScript the list shows the original amounts.
 * ═══════════════════════════════════════════════════════════════ */

type Item = { id?: string | null; name: string; note?: string | null; amount?: string | null }
type Group = { id?: string | null; title?: string | null; items: Item[] }
type Labels = { scale: string; factors: [string, string, string]; makes: string; checkHint: string; cookMode: string; cookModeHint: string }

const FACTORS = [1, 2, 3] as const

/** No line break inside "350 ml", "ca. 350" or "(3 Teile)"; a long amount may only wrap before "(". */
const keepTogether = (text: string) =>
  text
    .replace(/(\d|ca\.|approx\.|je|each)\s+(?=[^\s(])/g, '$1\u00a0')
    .replace(/\(([^)]*)\)/g, (m) => m.replace(/\s/g, '\u00a0'))
const SMALL_CAPS = 'font-display text-[0.72rem] font-bold uppercase tracking-[0.2em]'

export function IngredientList({
  groups,
  yieldText,
  locale,
  labels,
  jar,
}: {
  groups: Group[]
  yieldText?: string | null
  locale: 'de' | 'en'
  labels: Labels
  jar: ReactNode
}) {
  const [factor, setFactor] = useState<number>(1)
  const scaledYield = yieldText ? scaleAmount(yieldText, factor, locale) : ''

  return (
    <>
      {/* one tidy panel: batch switch + "Ergibt", then the screen-on switch (settings-style row) */}
      <div className="mt-4 rounded-2xl bg-[#FFFEF9] px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <p id="ff-scale-label" className={`${SMALL_CAPS} text-[#2D2F2C]/55`}>
            {labels.scale}
          </p>
          <div role="radiogroup" aria-labelledby="ff-scale-label" className="inline-flex shrink-0 rounded-full bg-[#FAF2E0] p-1">
            {FACTORS.map((f, i) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={factor === f}
                onClick={() => setFactor(f)}
                className={`min-w-10 rounded-full px-2.5 py-1.5 font-display text-[0.9rem] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#E6BE68] ${
                  factor === f ? 'bg-[#2D2F2C] text-[#FAF2E0]' : 'text-[#2D2F2C]/70 hover:text-[#2D2F2C]'
                }`}
              >
                {labels.factors[i] || `${f}×`}
              </button>
            ))}
          </div>
        </div>
        {scaledYield && (
          <p aria-live="polite" className="mt-2 text-[0.88rem] leading-snug text-[#2D2F2C]/65">
            {labels.makes} <b className="font-display text-[#2D2F2C]">{keepTogether(scaledYield)}</b>
          </p>
        )}
        <CookMode label={labels.cookMode} hint={labels.cookModeHint} />
      </div>

      {/* tells people the list is tickable */}
      <p className="mt-4 flex items-center gap-2 font-display text-[0.82rem] font-bold text-[#2D2F2C]/60">
        <span aria-hidden className="size-[1.1rem] text-[#2D2F2C]/70 [&_.jar-body]:fill-[#2D2F2C]/70 [&_.jar-tick]:opacity-100">
          {jar}
        </span>
        {labels.checkHint}
      </p>

      {groups.map((group, gi) => (
        <div key={group.id ?? gi} className="mt-5">
          {group.title && <h3 className={`${SMALL_CAPS} mb-2 text-[#2D2F2C]/60`}>{group.title}</h3>}
          <ul>
            {group.items.map((item, ii) => (
              <li key={item.id ?? ii}>
                {/* tap to tick off while cooking */}
                <label className="group -mx-2.5 flex cursor-pointer items-baseline gap-3 rounded-xl px-2.5 py-2.5 text-[0.98rem] leading-snug transition-colors hover:bg-[#FFFEF9]/80">
                  <input type="checkbox" className="peer sr-only" />
                  {/* jar-shaped checkbox: empty jar → filled jar with a tick */}
                  <span
                    aria-hidden
                    className="relative -top-[0.05em] size-[1.4rem] shrink-0 self-start rounded-md text-[#2D2F2C]/45 transition-colors group-hover:text-[#2D2F2C] peer-checked:text-[#2D2F2C] peer-focus-visible:ring-2 peer-focus-visible:ring-[#E6BE68] [&_.jar-body]:fill-[#FFFEF9] peer-checked:[&_.jar-body]:fill-[#2D2F2C] peer-checked:[&_.jar-tick]:opacity-100"
                  >
                    {jar}
                  </span>
                  <span className="text-[#2D2F2C] transition-opacity peer-checked:line-through peer-checked:opacity-45">
                    {item.name}
                    {item.note && <span className="text-[#2D2F2C]/55">, {item.note}</span>}
                  </span>
                  <span aria-hidden className="min-w-4 flex-1 translate-y-[-0.2em] border-b-2 border-dotted border-[#2D2F2C]/20" />
                  <b
                    key={factor}
                    className={`max-w-[34%] shrink-0 text-right font-display text-[#2D2F2C] transition-opacity peer-checked:opacity-45 ${factor > 1 ? 'animate-[ff-pop_.35s_ease-out] motion-reduce:animate-none' : ''}`}
                  >
                    {keepTogether(scaleAmount(item.amount, factor, locale))}
                  </b>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener: (t: 'release', fn: () => void) => void }
type WakeLockNav = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }

/** "Bildschirm anlassen" switch. Hidden where the browser can't keep the screen on. */
function CookMode({ label, hint }: { label: string; hint: string }) {
  const [supported, setSupported] = useState(false)
  const [on, setOn] = useState(false)
  const lock = useRef<WakeLockSentinelLike | null>(null)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator)
  }, [])

  useEffect(() => {
    if (!on) {
      lock.current?.release().catch(() => {})
      lock.current = null
      return
    }
    const request = async () => {
      try {
        const sentinel = await (navigator as WakeLockNav).wakeLock!.request('screen')
        lock.current = sentinel
      } catch {
        setOn(false) // e.g. battery saver: just switch back off
      }
    }
    // the browser drops the lock when the tab is hidden; take it again when the page comes back
    const onVisible = () => {
      if (document.visibilityState === 'visible') request()
    }
    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      lock.current?.release().catch(() => {})
      lock.current = null
    }
  }, [on])

  if (!supported) return null
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      title={hint}
      onClick={() => setOn((v) => !v)}
      className="mt-3 flex w-full items-center justify-between gap-3 border-t border-[#2D2F2C]/10 pt-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6BE68]"
    >
      <span className="font-display text-[0.92rem] font-bold text-[#2D2F2C]">{label}</span>
      {/* switch track: grey off, mustard on */}
      <span aria-hidden className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-[#E6BE68]' : 'bg-[#2D2F2C]/20'}`}>
        <span
          className={`absolute left-0 top-0.5 size-5 rounded-full bg-[#FFFEF9] shadow-[0_1px_3px_rgb(29_29_29/30%)] transition-transform ${on ? 'translate-x-[1.375rem]' : 'translate-x-0.5'}`}
        />
      </span>
    </button>
  )
}
