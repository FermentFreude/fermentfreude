'use client'

import { useEffect, useState } from 'react'

/**
 * "Heute angesetzt? Fertig am Samstag, 7. Dezember." — today + fermentation
 * days, in the visitor's own time zone. Rendered after mount so the server
 * date never mismatches the browser. `template` comes from the CMS and must
 * contain {datum}, which is replaced by the date.
 */
export function ReadyOn({ days, template, locale }: { days: number; template: string; locale: 'de' | 'en' }) {
  const [date, setDate] = useState<string | null>(null)

  useEffect(() => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setDate(
      new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-AT', { weekday: 'long', day: 'numeric', month: 'long' }).format(d),
    )
  }, [days, locale])

  if (!date) return <p aria-hidden className="mt-6 h-11" />

  const [before, after = ''] = template.split('{datum}')
  return (
    <p className="ff-fade mt-6 inline-flex items-center gap-2.5 rounded-full bg-[#FAF2E0] px-4 py-2.5 font-display text-[0.95rem] text-[#2D2F2C]">
      <svg aria-hidden viewBox="0 0 24 24" className="size-[1.1rem] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
        <path d="m9 15 2 2 4-4" />
      </svg>
      <span>
        {before}
        <b>{date}</b>
        {after}
      </span>
    </p>
  )
}
