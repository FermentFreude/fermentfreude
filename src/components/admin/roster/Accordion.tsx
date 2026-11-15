'use client'

import React, { useEffect, useId, useState } from 'react'

/**
 * A dashboard card that is just a title (+ count) until you open it.
 * The open/closed choice is remembered per browser (`ff-acc-<id>`).
 */
export function Accordion({
  id,
  title,
  sub,
  count,
  badge,
  defaultOpen = false,
  actions,
  children,
}: {
  id: string
  title: string
  sub?: string
  count?: number
  /** Highlighted label next to the title, e.g. "2 new". */
  badge?: string
  defaultOpen?: boolean
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = useId()
  useEffect(() => {
    try {
      const v = localStorage.getItem(`ff-acc-${id}`)
      if (v === '1') setOpen(true)
      else if (v === '0') setOpen(false)
    } catch {
      // storage unavailable — keep default
    }
  }, [id])
  const toggle = () =>
    setOpen((o) => {
      try {
        localStorage.setItem(`ff-acc-${id}`, o ? '0' : '1')
      } catch {
        // ignore
      }
      return !o
    })

  return (
    <section className={`ff-panel ff-acc${open ? ' is-open' : ''}`} style={{ marginBottom: 14, overflow: 'hidden' }}>
      <div className="ff-acc-head">
        <button type="button" className="ff-acc-toggle" aria-expanded={open} aria-controls={bodyId} onClick={toggle}>
          <span className="ff-acc-text">
            <span className="ff-acc-title">
              <h2>{title}</h2>
              {typeof count === 'number' && <i className="ff-acc-n">{count}</i>}
              {badge && <i className="ff-acc-new">{badge}</i>}
            </span>
            {sub && <small className="ff-muted">{sub}</small>}
          </span>
          <svg className="ff-acc-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {actions && <div className="ff-acc-actions">{actions}</div>}
      </div>
      {open && (
        <div id={bodyId} className="ff-acc-body">
          {children}
        </div>
      )}
    </section>
  )
}
