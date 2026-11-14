'use client'

import React from 'react'

import type { Lang } from './rosterI18n'
import type { AppointmentRow } from './types'
import { WorkshopCard } from './WorkshopCard'

const T = {
  de: { title: 'Workshops', sub: 'Kommende Termine der Reihe nach, der nächste zuerst.', none: 'Keine kommenden Termine.' },
  en: { title: 'Workshops', sub: 'Upcoming dates in order, next one first.', none: 'No upcoming dates.' },
}

export function WorkshopsView({
  appointments,
  lang,
  onSelectAppointment,
}: {
  appointments: AppointmentRow[]
  lang: Lang
  onSelectAppointment: (id: string) => void
}) {
  const t = T[lang]
  const upcoming = appointments.filter((a) => !a.isPast).sort((x, y) => x.dateTime.localeCompare(y.dateTime))
  return (
    <div className="ff-page">
      <div className="ff-head">
        <div>
          <h1>{t.title}</h1>
          <p>{t.sub}</p>
        </div>
      </div>
      {upcoming.length === 0 ? (
        <p className="ff-muted">{t.none}</p>
      ) : (
        <div className="ff-stack">
          {upcoming.map((a) => (
            <WorkshopCard key={a.id} a={a} lang={lang} onOpen={onSelectAppointment} />
          ))}
        </div>
      )}
    </div>
  )
}
