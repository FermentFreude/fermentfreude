'use client'

import React from 'react'

import type { Lang } from './rosterI18n'

export function ViewToggle({ lang, current, onSwitch }: { lang: Lang; current: 'list' | 'calendar'; onSwitch: () => void }) {
  const de = lang === 'de'
  return (
    <div className="ff-viewtoggle" role="group" aria-label={de ? 'Ansicht' : 'View'}>
      <button type="button" aria-pressed={current === 'list'} onClick={current === 'list' ? undefined : onSwitch}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        {de ? 'Liste' : 'List'}
      </button>
      <button type="button" aria-pressed={current === 'calendar'} onClick={current === 'calendar' ? undefined : onSwitch}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
        {de ? 'Kalender' : 'Calendar'}
      </button>
    </div>
  )
}

