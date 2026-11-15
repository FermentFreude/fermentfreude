import Link from 'next/link'
import React from 'react'

/**
 * Shortcuts at the top of the CMS dashboard (/admin): the four things the founders use most.
 * All cards are the same size; the collections list stays below.
 */

type Lang = 'de' | 'en'
const T: Record<Lang, Record<string, string>> = {
  de: {
    shortcuts: 'Schnellzugriff',
    newDate: '+ Neuer Termin',
    newDateSub: 'Workshop-Termin anlegen',
    management: 'Management',
    managementSub: 'Buchungen, Teilnehmer, Gutscheine, E-Mails',
    workshops: 'Workshops',
    workshopsSub: 'Die nächsten Workshops im Management ansehen',
    participants: 'Teilnehmende',
    participantsSub: 'Personen suchen, Kundenakte und Buchungen',
    vouchers: 'Gutscheine',
    vouchersSub: 'Gutscheine ansehen, einlösen und verwalten',
    pages: 'Seiten bearbeiten',
    pagesSub: 'Seiten öffnen und Inhalte bearbeiten',
  },
  en: {
    shortcuts: 'Shortcuts',
    newDate: '+ New date',
    newDateSub: 'Create a workshop date',
    management: 'Management',
    managementSub: 'Bookings, participants, vouchers, emails',
    workshops: 'Workshops',
    workshopsSub: 'See the next workshops in Management',
    participants: 'Participants',
    participantsSub: 'Search people, customer records and bookings',
    vouchers: 'Vouchers',
    vouchersSub: 'View, redeem and manage vouchers',
    pages: 'Edit pages',
    pagesSub: 'Open pages and edit their content',
  },
}

const card: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 6,
  padding: '20px 22px',
  borderRadius: 14,
  border: '1px solid var(--theme-elevation-150)',
  background: 'var(--theme-elevation-50)',
  color: 'var(--theme-text)',
  textDecoration: 'none',
  height: 132,
  boxSizing: 'border-box',
}
const heading: React.CSSProperties = { margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.6 }

// Content locale (de/en switcher in the admin) wins; the admin UI language is the fallback.
type Props = { locale?: { code?: string } | string; i18n?: { language?: string } }

export const DashboardShortcuts: React.FC<Props> = (props) => {
  const code = typeof props.locale === 'string' ? props.locale : props.locale?.code
  const lang: Lang = (code ?? props.i18n?.language) === 'en' ? 'en' : 'de'
  const t = T[lang]

  const items = [
    { href: '/admin/collections/workshop-appointments/create', title: t.newDate, sub: t.newDateSub, style: card },
    { href: '/admin/workshop-roster', title: t.management, sub: t.managementSub, style: card },
    { href: '/admin/workshop-roster?section=workshops', title: t.workshops, sub: t.workshopsSub, style: card },
    { href: '/admin/workshop-roster?section=participants', title: t.participants, sub: t.participantsSub, style: card },
    { href: '/admin/workshop-roster?section=vouchers', title: t.vouchers, sub: t.vouchersSub, style: card },
    { href: '/admin/collections/pages', title: t.pages, sub: t.pagesSub, style: card },
  ]

  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={heading}>{t.shortcuts}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {items.map((i) => (
          <Link key={i.href} href={i.href} style={i.style} className="ff-sc">
            <strong style={{ fontSize: 18 }}>{i.title}</strong>
            <span style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.4 }}>{i.sub}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
