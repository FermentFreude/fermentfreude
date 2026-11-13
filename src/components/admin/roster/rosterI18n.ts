export type Lang = 'en' | 'de'

const STORAGE_KEY = 'ff-roster-lang'

export function readLang(): Lang {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'de') return v
  } catch {
    /* storage can be unavailable */
  }
  return 'en'
}

export function saveLang(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* ignore */
  }
}

export const LOCALE: Record<Lang, string> = { en: 'en-GB', de: 'de-AT' }

/** Part of the day in Vienna time, whatever timezone the browser is in. */
export function partOfDay(now: Date): 'morning' | 'afternoon' | 'evening' {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Europe/Vienna' }).format(now),
  )
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}

type Dict = {
  greeting: Record<'morning' | 'afternoon' | 'evening', string>
  tagline: string
  kpiUpcoming: string
  kpiSeats: string
  kpiFull: string
  kpiAttention: string
  upcomingTitle: string
  fullTitle: string
  fullNone: string
  attentionTitle: string
  attentionSub: string
  addNote: string
  empty: string
  system: string
  by: (name: string) => string
  due: (d: string) => string
  open: string
  edit: string
  done: string
  reopen: string
  acknowledge: string
  acknowledgeHint: string
  showDone: (n: number) => string
  hideDone: string
  doneBy: (name: string) => string
  formNew: string
  formEdit: string
  fTitle: string
  fNote: string
  fSeverity: string
  fWorkshop: string
  fNoWorkshop: string
  fDue: string
  save: string
  cancel: string
  saving: string
  titleRequired: string
  sev: Record<'info' | 'attention' | 'urgent', string>
  rule: {
    seatMismatch: (p: { workshop: string; date: string; shown: number; expected: number }) => { title: string; detail: string }
    noReceipt: (p: { name: string; workshop: string; date: string }) => { title: string; detail: string }
    refundOpen: (p: { name: string; days: number }) => { title: string; detail: string }
  }
  lang: string
}

export const WELCOME: Record<Lang, Dict> = {
  en: {
    greeting: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
    tagline: 'This is what matters today.',
    kpiUpcoming: 'Upcoming workshops',
    kpiSeats: 'Seats booked',
    kpiFull: 'Fully booked',
    kpiAttention: 'Needs a look',
    upcomingTitle: 'Next workshops',
    fullTitle: 'Fully booked',
    fullNone: 'No upcoming workshop is fully booked yet.',
    attentionTitle: 'Needs a look',
    attentionSub: 'Found by the system or written by you. Everyone with admin access sees the same list.',
    addNote: 'Add note',
    empty: 'Nothing needs a look right now.',
    system: 'System',
    by: (n) => `Note by ${n}`,
    due: (d) => `due ${d}`,
    open: 'Open workshop',
    edit: 'Edit',
    done: 'Mark done',
    reopen: 'Reopen',
    acknowledge: 'Known, ignore',
    acknowledgeHint: 'Hides this item. It comes back only if the numbers change.',
    showDone: (n) => `Show done (${n})`,
    hideDone: 'Hide done',
    doneBy: (n) => `done by ${n}`,
    formNew: 'New note',
    formEdit: 'Edit note',
    fTitle: 'Title',
    fNote: 'Details (optional)',
    fSeverity: 'Importance',
    fWorkshop: 'Workshop date (optional)',
    fNoWorkshop: 'No link',
    fDue: 'Due date (optional)',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving…',
    titleRequired: 'Please add a title.',
    sev: { info: 'Info', attention: 'Attention', urgent: 'Urgent' },
    rule: {
      seatMismatch: (p) => ({
        title: `Seat count differs: ${p.workshop}, ${p.date}`,
        detail: `The booking page shows ${p.shown} free seats; according to the bookings it should be ${p.expected}.`,
      }),
      noReceipt: (p) => ({
        title: `Seat without receipt: ${p.name}`,
        detail: `${p.workshop}, ${p.date}. No order or import note found. Add how it was paid.`,
      }),
      refundOpen: (p) => ({
        title: `Refund request from ${p.name}`,
        detail: p.days <= 0 ? 'Requested today.' : `Waiting for ${p.days} day${p.days === 1 ? '' : 's'}.`,
      }),
    },
    lang: 'Language',
  },
  de: {
    greeting: { morning: 'Guten Morgen', afternoon: 'Guten Tag', evening: 'Guten Abend' },
    tagline: 'Das ist heute wichtig.',
    kpiUpcoming: 'Kommende Workshops',
    kpiSeats: 'Gebuchte Plätze',
    kpiFull: 'Ausgebucht',
    kpiAttention: 'Braucht einen Blick',
    upcomingTitle: 'Nächste Workshops',
    fullTitle: 'Ausgebucht',
    fullNone: 'Noch kein kommender Workshop ist ausgebucht.',
    attentionTitle: 'Braucht einen Blick',
    attentionSub: 'Vom System gefunden oder von euch notiert. Alle mit Admin-Zugang sehen dieselbe Liste.',
    addNote: 'Notiz hinzufügen',
    empty: 'Im Moment braucht nichts einen Blick.',
    system: 'System',
    by: (n) => `Notiz von ${n}`,
    due: (d) => `fällig ${d}`,
    open: 'Workshop öffnen',
    edit: 'Bearbeiten',
    done: 'Erledigt',
    reopen: 'Wieder öffnen',
    acknowledge: 'Bekannt, ausblenden',
    acknowledgeHint: 'Blendet den Eintrag aus. Er kommt nur zurück, wenn sich die Zahlen ändern.',
    showDone: (n) => `Erledigte anzeigen (${n})`,
    hideDone: 'Erledigte ausblenden',
    doneBy: (n) => `erledigt von ${n}`,
    formNew: 'Neue Notiz',
    formEdit: 'Notiz bearbeiten',
    fTitle: 'Titel',
    fNote: 'Details (optional)',
    fSeverity: 'Wichtigkeit',
    fWorkshop: 'Workshop-Termin (optional)',
    fNoWorkshop: 'Keine Verknüpfung',
    fDue: 'Fällig am (optional)',
    save: 'Speichern',
    cancel: 'Abbrechen',
    saving: 'Speichert …',
    titleRequired: 'Bitte einen Titel eintragen.',
    sev: { info: 'Info', attention: 'Achtung', urgent: 'Dringend' },
    rule: {
      seatMismatch: (p) => ({
        title: `Platzzahl weicht ab: ${p.workshop}, ${p.date}`,
        detail: `Die Buchungsseite zeigt ${p.shown} freie Plätze, laut Buchungen sollten es ${p.expected} sein.`,
      }),
      noReceipt: (p) => ({
        title: `Platz ohne Beleg: ${p.name}`,
        detail: `${p.workshop}, ${p.date}. Keine Bestellung oder Import-Notiz gefunden. Bitte die Zahlungsart ergänzen.`,
      }),
      refundOpen: (p) => ({
        title: `Rückerstattung von ${p.name}`,
        detail: p.days <= 0 ? 'Heute angefragt.' : `Wartet seit ${p.days} ${p.days === 1 ? 'Tag' : 'Tagen'}.`,
      }),
    },
    lang: 'Sprache',
  },
}
