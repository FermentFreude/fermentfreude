'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { WorkshopTermin } from '@/utilities/getWorkshopTermine'

function getTerminCardBg(workshopSlug: string): string {
  switch (workshopSlug) {
    case 'lakto-gemuese':
      return 'bg-[#E8E4D9]'
    case 'kombucha':
      return 'bg-[#F9F0DC]'
    case 'tempeh':
      return 'bg-[#F5F1E8]'
    default:
      return 'bg-[#E8E4D9]'
  }
}

function formatTime24to12(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return m > 0 ? `${h12}:${String(m).padStart(2, '0')} ${period}` : `${h12} ${period}`
}

type Props = {
  termins: WorkshopTermin[]
  heading: string
  subtitle: string
  bookLabel: string
  slotsFreeLabel: string
  filterAllLabel: string
}

export function WorkshopTermineSection({
  termins,
  heading,
  subtitle,
  bookLabel,
  slotsFreeLabel,
  filterAllLabel,
}: Props) {
  const [filter, setFilter] = useState<string>('all')

  const workshopTypes = useMemo(() => {
    const seen = new Set<string>()
    const types: { slug: string; title: string }[] = []
    for (const t of termins) {
      if (!seen.has(t.workshopSlug)) {
        seen.add(t.workshopSlug)
        types.push({ slug: t.workshopSlug, title: t.workshopTitle })
      }
    }
    return types.sort((a, b) => a.title.localeCompare(b.title))
  }, [termins])

  const filtered = useMemo(() => {
    if (filter === 'all') return termins
    return termins.filter((t) => t.workshopSlug === filter)
  }, [termins, filter])

  if (termins.length === 0) return null

  return (
    <section className="section-padding-md container-padding bg-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-[#1a1a1a] md:text-4xl">{heading}</h2>
            <p className="mt-3 max-w-xl text-body-lg text-[#333]">{subtitle}</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px] rounded-2xl border-2 border-[#555954]/30 bg-white font-sans text-sm text-[#1a1a1a] hover:bg-[#FAFAF9]">
              <SelectValue placeholder={filterAllLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filterAllLabel}</SelectItem>
              {workshopTypes.map((w) => (
                <SelectItem key={w.slug} value={w.slug}>
                  {w.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map((t) => {
            const cardBg = getTerminCardBg(t.workshopSlug)
            return (
            <div
              key={t.id}
              className={`flex flex-col gap-4 rounded-2xl p-6 md:flex-row md:items-center md:justify-between ${cardBg}`}
            >
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex w-fit rounded-full bg-white px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                    {t.workshopTitle}
                  </span>
                  <div className="flex flex-col">
                    <p className="font-display text-lg font-bold text-[#1a1a1a]">{t.date}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#333]">
                      <span className="flex items-center gap-2">
                        <svg
                          className="size-5 shrink-0 text-[#555954]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatTime24to12(t.timeStart)} – {formatTime24to12(t.timeEnd)}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="size-1.5 shrink-0 rounded-full bg-[#1a1a1a]" />
                        {t.slotsFree} {slotsFreeLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#555954] px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#333]"
              >
                {bookLabel}
              </Link>
            </div>
          )
          })}
        </div>
      </div>
    </section>
  )
}
