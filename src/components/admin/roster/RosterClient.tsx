'use client'

import { useAuth } from '@payloadcms/ui'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ActivityView } from './ActivityView'
import { ProfileDialog, useUnreadNoteCount } from './AttentionPanel'
import { ArchiveView } from './ArchiveView'
import { CalendarView } from './CalendarView'
import { CustomerProfilePage } from './CustomerProfile'
import { EmailTemplatesView } from './EmailTemplatesView'
import { OrdersView } from './OrdersView'
import { ParticipantsView } from './ParticipantsView'
import { PickupsView } from './PickupsView'
import { QuotesView } from './QuotesView'
import { RefundsView } from './RefundsView'
import { readLang, saveLang, type Lang } from './rosterI18n'
import { ROSTER_CSS } from './rosterStyles'
import { ToastProvider, useToast } from './RosterToast'
import type { RosterData } from './types'
import { UserAvatar } from './UserAvatar'
import { VouchersView } from './VouchersView'
import { WelcomeView } from './WelcomeView'
import { Wordmark } from './Wordmark'
import { WorkshopDetailView } from './WorkshopDetailView'
import { WorkshopsView } from './WorkshopsView'

type Section =
  | 'dashboard'
  | 'workshops'
  | 'calendar'
  | 'archive'
  | 'detail'
  | 'participants'
  | 'pickups'
  | 'vouchers'
  | 'orders'
  | 'quotes'
  | 'refunds'
  | 'activity'
  | 'emails'

type GroupId = 'today' | 'workshops' | 'vouchers' | 'shop' | 'requests' | 'emails'
type WsTab = 'calendar' | 'workshops' | 'participants' | 'archive'

const WS_DEFAULT: WsTab[] = ['calendar', 'workshops', 'participants', 'archive']

const NAV_T: Record<
  Lang,
  {
    sub: string
    signed: string
    profile: string
    cms: string
    cmsHint: string
    live: string
    groups: Record<GroupId, string>
    tabs: Record<Exclude<Section, 'detail'>, string>
    arr: string
    arrDone: string
    arrReset: string
    arrMain: string
    arrSaved: (n: string) => string
    arrHint: string
    left: string
    right: string
  }
> = {
  de: {
    sub: 'Admin',
    signed: 'Angemeldet als',
    profile: 'Mein Profil: Foto und E-Mail-Hinweise',
    cms: 'CMS-Dashboard',
    cmsHint: 'Webseiten-Texte, Bilder, Produkte und Workshop-Termine bearbeiten.',
    live: 'Live',
    groups: { today: 'Dashboard', workshops: 'Workshops', vouchers: 'Gutscheine', shop: 'Shop', requests: 'Anfragen', emails: 'E-Mails' },
    tabs: {
      dashboard: 'Übersicht', calendar: 'Kalender', workshops: 'Liste', participants: 'Teilnehmer', archive: 'Archiv',
      vouchers: 'Gutscheine', orders: 'Bestellungen', pickups: 'Abholung', quotes: 'Angebote', refunds: 'Rückerstattungen',
      activity: 'Aktivität', emails: 'E-Mail-Texte',
    },
    arr: 'Tabs anordnen',
    arrDone: 'Fertig',
    arrReset: 'Zurücksetzen',
    arrMain: 'Start',
    arrSaved: (n) => `Gespeichert. „${n}“ öffnet sich jetzt zuerst.`,
    arrHint: 'Zieh die Tabs oder nutze die Pfeile. Der erste Tab öffnet sich, wenn du auf Workshops klickst. Die Reihenfolge gilt nur für dich.',
    left: 'Nach links',
    right: 'Nach rechts',
  },
  en: {
    sub: 'Admin',
    signed: 'Signed in as',
    profile: 'My profile: photo and email alerts',
    cms: 'CMS dashboard',
    cmsHint: 'Edit website texts, images, products and workshop dates.',
    live: 'Live',
    groups: { today: 'Dashboard', workshops: 'Workshops', vouchers: 'Vouchers', shop: 'Shop', requests: 'Requests', emails: 'Emails' },
    tabs: {
      dashboard: 'Overview', calendar: 'Calendar', workshops: 'List', participants: 'Participants', archive: 'Archive',
      vouchers: 'Vouchers', orders: 'Orders', pickups: 'Pickup', quotes: 'Quotes', refunds: 'Refunds', activity: 'Activity',
      emails: 'Email texts',
    },
    arr: 'Arrange tabs',
    arrDone: 'Done',
    arrReset: 'Reset',
    arrMain: 'Start',
    arrSaved: (n) => `Saved. "${n}" now opens first.`,
    arrHint: 'Drag the tabs or use the arrows. The first tab opens when you click Workshops. The order is saved only for you.',
    left: 'Move left',
    right: 'Move right',
  },
}

const ico = (d: React.ReactNode) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
)

const ICONS: Record<GroupId, React.ReactNode> = {
  today: ico(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>),
  workshops: ico(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  vouchers: ico(<><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" /><path d="M22 7H2v5h20V7zM12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></>),
  shop: ico(<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></>),
  requests: ico(<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>),
  emails: ico(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>),
}

const STATIC_TABS: Record<Exclude<GroupId, 'workshops'>, Section[]> = {
  today: ['dashboard'],
  vouchers: ['vouchers'],
  shop: ['orders', 'pickups', 'quotes'],
  requests: ['refunds', 'activity'],
  emails: ['emails'],
}
const GROUP_ORDER: GroupId[] = ['today', 'workshops', 'vouchers', 'shop', 'requests', 'emails']

function tabOrderKey(userId: string | number | undefined) {
  return `ff-roster-taborder:${userId ?? 'anon'}`
}

function readTabOrder(userId: string | number | undefined): WsTab[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(tabOrderKey(userId)) ?? 'null')
    if (Array.isArray(v) && v.length === WS_DEFAULT.length && WS_DEFAULT.every((k) => v.includes(k))) return v
  } catch {
    /* storage unavailable */
  }
  return WS_DEFAULT
}

export function RosterClient({ initialData }: { initialData: RosterData }) {
  return (
    <ToastProvider>
      <RosterShell initialData={initialData} />
    </ToastProvider>
  )
}

function RosterShell({ initialData }: { initialData: RosterData }) {
  const { user } = useAuth()
  const toast = useToast()
  const [data, setData] = useState<RosterData>(initialData)
  const [section, setSection] = useState<Section>('dashboard')
  const [lang, setLang] = useState<Lang>('de')
  const [wsOrder, setWsOrder] = useState<WsTab[]>(WS_DEFAULT)
  const [arrange, setArrange] = useState(false)
  const [dragKey, setDragKey] = useState<WsTab | null>(null)
  const [overKey, setOverKey] = useState<WsTab | null>(null)
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null)
  /** Person whose full profile is open inside Teilnehmer (null = the list). */
  const [profileEmail, setProfileEmail] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const refreshingRef = useRef(false)
  const t = NAV_T[lang]

  useEffect(() => setLang(readLang()), [])
  useEffect(() => setWsOrder(readTabOrder(user?.id)), [user?.id])

  const chooseLang = (l: Lang) => {
    setLang(l)
    saveLang(l)
  }

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true
    try {
      const res = await fetch('/api/admin/roster', { cache: 'no-store' })
      if (res.ok) {
        setData(await res.json())
        setLastRefresh(new Date())
      }
    } catch {
      // Non-fatal — stale data is fine for a short interval
    } finally {
      refreshingRef.current = false
    }
  }, [])

  // The server-rendered data has no user context (unread badges) — refresh once on mount.
  useEffect(() => {
    refresh()
  }, [refresh])
  useEffect(() => {
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [refresh])
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  const groupTabs = useCallback(
    (g: GroupId): Section[] => (g === 'workshops' ? wsOrder : STATIC_TABS[g]),
    [wsOrder],
  )
  const groupOf = useCallback(
    (s: Section): GroupId =>
      s === 'detail' ? 'workshops' : (GROUP_ORDER.find((g) => groupTabs(g).includes(s)) ?? 'today'),
    [groupTabs],
  )

  const [lastTab, setLastTab] = useState<Partial<Record<GroupId, Section>>>({})

  const navigate = (sec: Section) => {
    setSection(sec)
    setProfileEmail(null)
    if (sec !== 'detail') {
      setSelectedApptId(null)
      setLastTab((prev) => ({ ...prev, [groupOf(sec)]: sec }))
    }
    window.scrollTo({ top: 0 })
  }
  const openGroup = (g: GroupId) => {
    // Workshops always opens the tab the person put first.
    navigate(g === 'workshops' ? wsOrder[0] : (lastTab[g] ?? groupTabs(g)[0]))
  }

  const activeGroup = groupOf(section)
  const tabs = groupTabs(activeGroup)

  const tabBadge = (id: Section): number => {
    if (id === 'refunds') return data.refundRequests.filter((r) => r.status === 'requested').length
    if (id === 'activity') return data.activityUnreadCount
    if (id === 'pickups') return data.stats.openPickups
    return 0
  }
  const unreadNotes = useUnreadNoteCount(data)
  const groupBadge = (g: GroupId) => (g === 'today' ? unreadNotes : 0) + groupTabs(g).reduce((sum, s) => sum + tabBadge(s), 0)

  const saveOrder = (next: WsTab[]) => {
    setWsOrder(next)
    try {
      window.localStorage.setItem(tabOrderKey(user?.id), JSON.stringify(next))
    } catch {
      /* ignore */
    }
    toast(t.arrSaved(t.tabs[next[0]]))
  }
  const moveTab = (k: WsTab, dir: -1 | 1) => {
    const i = wsOrder.indexOf(k)
    const j = i + dir
    if (j < 0 || j >= wsOrder.length) return
    const next = wsOrder.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    saveOrder(next)
  }
  const dropOn = (target: WsTab) => {
    if (!dragKey || dragKey === target) return
    const next = wsOrder.filter((k) => k !== dragKey)
    next.splice(wsOrder.indexOf(target), 0, dragKey)
    saveOrder(next)
  }

  const openProfile = (email: string) => {
    setProfileEmail(email)
    setSection('participants')
    setLastTab((prev) => ({ ...prev, [groupOf('participants')]: 'participants' }))
    window.scrollTo({ top: 0 })
  }
  const openDetail = (apptId: string) => {
    if (!data.appointments.some((a) => a.id === apptId)) {
      toast(lang === 'de' ? 'Dieser Termin ist nicht mehr in der Liste (zu alt). Er steht im Archiv.' : 'This date is no longer in the list (too old). It is in the Archive.')
      return
    }
    setSelectedApptId(apptId)
    setSection('detail')
    window.scrollTo({ top: 0 })
  }

  const timeStr = lastRefresh?.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }) ?? ''
  const userName = useMemo(() => {
    const u = user as { name?: string; email?: string } | null
    return u?.name?.trim() || u?.email || ''
  }, [user])
  const myAvatar = data.team.find((m) => m.id === data.me)?.avatarUrl ?? null
  const [profileOpen, setProfileOpen] = useState(false)
  const isWs = activeGroup === 'workshops'
  const showTabs = section !== 'detail' && (tabs.length > 1 || isWs)

  return (
    <div className="ff-roster" lang={lang}>
      {/* Brand font (Neue Haas Grotesk) — the admin itself does not load the Typekit kit. */}
      <link rel="stylesheet" href="https://use.typekit.net/dtk7kir.css" precedence="default" />
      <style>{ROSTER_CSS}</style>
      <div className="ff-app">
        <nav className="ff-rail" aria-label={lang === 'de' ? 'Bereiche' : 'Sections'}>
          {userName && (
            <button type="button" className="ff-prof" onClick={() => setProfileOpen(true)} title={t.profile}>
              <UserAvatar name={userName} url={myAvatar} size={104} />
              <span>
                <b>{userName}</b>
                <small>{t.signed}</small>
              </span>
            </button>
          )}
          <div className="ff-logo">
            <Wordmark />
          </div>
          <div className="ff-sub">{t.sub}</div>
          {GROUP_ORDER.map((g) => {
            const badge = groupBadge(g)
            return (
              <button key={g} type="button" className="ff-gbtn" aria-current={activeGroup === g} onClick={() => openGroup(g)}>
                {ICONS[g]}
                {t.groups[g]}
                {badge > 0 && <span className="ff-n">{badge > 99 ? '99+' : badge}</span>}
              </button>
            )
          })}
          <div className="ff-rfoot">
            <a className="ff-cmsbtn" href="/admin" target="_blank" rel="noopener" title={t.cmsHint}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
              {t.cms}
            </a>
            <div className="ff-lang" role="group" aria-label="Sprache / Language">
              {(['de', 'en'] as const).map((l) => (
                <button key={l} type="button" aria-pressed={lang === l} onClick={() => chooseLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {timeStr && (
              <div className="ff-live">
                <i aria-hidden /> {t.live} · {timeStr}
              </div>
            )}
          </div>
        </nav>

        <main className="ff-main">
          {showTabs && (
            <div className="ff-tabs" role="tablist">
              {tabs.map((k, i) => {
                const wsk = k as WsTab
                const badge = tabBadge(k)
                const label = t.tabs[k as Exclude<Section, 'detail'>]
                return (
                  <React.Fragment key={k}>
                    {isWs && arrange && (
                      <button type="button" className="ff-mvb" disabled={i === 0} aria-label={`${label}: ${t.left}`} onClick={() => moveTab(wsk, -1)}>
                        ‹
                      </button>
                    )}
                    <button
                      type="button"
                      role="tab"
                      aria-selected={k === section}
                      className={['ff-tab', arrange && isWs ? 'is-arr' : '', overKey === k && dragKey !== k ? 'is-over' : '', dragKey === k ? 'is-dragging' : ''].join(' ')}
                      draggable={isWs}
                      onDragStart={isWs ? () => setDragKey(wsk) : undefined}
                      onDragEnd={isWs ? () => { setDragKey(null); setOverKey(null) } : undefined}
                      onDragOver={isWs ? (e) => { e.preventDefault(); setOverKey(wsk) } : undefined}
                      onDragLeave={isWs ? () => setOverKey(null) : undefined}
                      onDrop={isWs ? (e) => { e.preventDefault(); dropOn(wsk); setDragKey(null); setOverKey(null) } : undefined}
                      onClick={() => navigate(k)}
                    >
                      {label}
                      {isWs && arrange && i === 0 && <span className="ff-mainb">{t.arrMain}</span>}
                      {badge > 0 && <span className="ff-n">{badge}</span>}
                    </button>
                    {isWs && arrange && (
                      <button type="button" className="ff-mvb" disabled={i === tabs.length - 1} aria-label={`${label}: ${t.right}`} onClick={() => moveTab(wsk, 1)}>
                        ›
                      </button>
                    )}
                  </React.Fragment>
                )
              })}
              {isWs && (
                <>
                  <span className="ff-arrsp" />
                  {arrange && (
                    <button type="button" className="ff-arrbtn" onClick={() => saveOrder(WS_DEFAULT)}>
                      {t.arrReset}
                    </button>
                  )}
                  <button
                    type="button"
                    className={`ff-arrbtn${arrange ? ' is-on' : ''}`}
                    aria-pressed={arrange}
                    title={t.arrHint}
                    onClick={() => {
                      setArrange((v) => !v)
                      if (!arrange) toast(t.arrHint)
                    }}
                  >
                    {arrange ? t.arrDone : t.arr}
                  </button>
                </>
              )}
            </div>
          )}

          {section === 'dashboard' && (
            <WelcomeView data={data} lang={lang} onRefresh={refresh} onSelectWorkshop={openDetail} onNavigate={navigate} />
          )}
          {section === 'workshops' && <WorkshopsView appointments={data.appointments} lang={lang} onSelectAppointment={openDetail} />}
          {section === 'calendar' && <CalendarView appointments={data.appointments} lang={lang} onSelectAppointment={openDetail} />}
          {section === 'archive' && <ArchiveView />}
          {section === 'detail' && selectedApptId && (
            <WorkshopDetailView
              appointment={data.appointments.find((a) => a.id === selectedApptId) ?? data.appointments[0]}
              bookings={data.bookingsByAppointment[selectedApptId] ?? []}
              lang={lang}
              onBack={() => navigate(lastTab.workshops ?? wsOrder[0])}
              onRefresh={refresh}
              onOpenProfile={openProfile}
              onOpenWorkshop={openDetail}
            />
          )}
          {section === 'participants' && profileEmail && (
            <CustomerProfilePage email={profileEmail} lang={lang} onBack={() => setProfileEmail(null)} onOpenWorkshop={openDetail} />
          )}
          {section === 'participants' && !profileEmail && (
            <ParticipantsView participants={data.participants} stats={data.stats} lang={lang} onOpenProfile={openProfile} />
          )}
          {section === 'pickups' && <PickupsView orders={data.pickupOrders} onRefresh={refresh} />}
          {section === 'vouchers' && <VouchersView vouchers={data.vouchers} onRefresh={refresh} />}
          {section === 'orders' && <OrdersView orders={data.orders} onRefresh={refresh} />}
          {section === 'quotes' && <QuotesView quotes={data.quotes} onRefresh={refresh} />}
          {section === 'refunds' && <RefundsView refundRequests={data.refundRequests} onRefresh={refresh} />}
          {section === 'activity' && <ActivityView activityEvents={data.activityEvents} onRefresh={refresh} />}
          {section === 'emails' && <EmailTemplatesView lang={lang} />}
        </main>
        {profileOpen && <ProfileDialog data={data} lang={lang} onClose={() => setProfileOpen(false)} onRefresh={refresh} />}
      </div>
    </div>
  )
}
