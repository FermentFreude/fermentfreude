'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  analyzeTemplate,
  applyFieldEdits,
  buildEditablePreview,
  editorToSubject,
  renderPreview,
  SAMPLE_PARAMS,
  subjectToEditor,
  TemplateEditError,
  type FieldKind,
  type TemplateField,
} from '@/lib/emailTemplateText'

import { ParagraphEditor } from './ChipEditor'

import {
  createEmailTestCopy,
  deleteEmailTestCopy,
  getEmailTemplate,
  listEmailTemplates,
  restoreEmailTemplateVersion,
  saveEmailTemplate,
  sendEmailTemplateTest,
  type TemplateDetail,
  type TemplateSummary,
} from './emailTemplateActions'
import { EMAIL_GROUPS, EMAIL_TEMPLATES, TEST_COPY_PREFIX, type EmailTemplateMeta } from './emailTemplateMeta'
import { LOCALE, type Lang } from './rosterI18n'
import { useToast } from './RosterToast'

const T = {
  de: {
    eyebrow: 'E-Mails',
    title: 'E-Mail-Texte',
    intro:
      'Hier ändert ihr, was in den automatischen E-Mails steht. Links, Platzhalter und Adressen sind geschützt. Vor jedem Speichern wird die alte Fassung aufbewahrt, ihr könnt also alles rückgängig machen.',
    testEnv:
      'Testumgebung: Die echten E-Mails gehen an echte Kundschaft und lassen sich nur auf der Live-Seite ändern. Zum Ausprobieren legt ihr eine Testkopie an. Test-E-Mails gehen nur an freigegebene Team-Adressen.',
    search: 'E-Mail suchen …',
    sent: 'Wird verschickt',
    notSent: 'Noch nicht verschickt',
    open: 'Offener Punkt',
    edited: (by: string, at: string) => `Geändert von ${by} · ${at}`,
    brevoChanged: (at: string) => `Zuletzt geändert ${at}`,
    copies: 'Testkopien',
    copy: 'Testkopie',
    loading: 'Lädt …',
    retry: 'Erneut versuchen',
    none: 'Nichts gefunden.',
    back: '← Alle E-Mails',
    when: 'Wird verschickt, wenn',
    subject: 'Betreff',
    body: 'Text der E-Mail',
    images: (n: number) => `Bildbeschreibungen (${n})`,
    imagesHint: 'Erscheinen, wenn Bilder blockiert sind, und werden von Screenreadern vorgelesen.',
    lockedHelp: 'Farbige Bausteine füllt das System aus (z. B. den Vornamen). Ihr könnt sie verschieben (ausschneiden und einfügen), mit × löschen oder über „Einfügen“ neu setzen. Graue Bausteine (Links, Adressen, Fett) müssen stehen bleiben.',
    howTo: 'So geht es: Klickt in der Vorschau rechts direkt auf einen Satz und tippt, oder ändert ihn links. Beides ist dasselbe. Gespeichert wird erst mit „Speichern“.',
    kinds: {
      preheader: 'Vorschauzeile (im Postfach neben dem Betreff)',
      heading: 'Überschrift',
      text: 'Text',
      link: 'Button- oder Link-Text',
      alt: 'Bildbeschreibung',
      title: 'Hinweis beim Darüberfahren',
    } as Record<FieldKind, string>,
    preview: 'Vorschau mit Beispielwerten',
    changes: (n: number) => (n === 0 ? 'Keine Änderungen' : n === 1 ? '1 Änderung, noch nicht gespeichert' : `${n} Änderungen, noch nicht gespeichert`),
    discard: 'Verwerfen',
    test: 'Test an mich senden',
    testNo: 'Deine Adresse ist in der Testumgebung nicht als Test-Postfach freigegeben.',
    save: 'Speichern',
    saving: 'Speichert …',
    sending: 'Sendet …',
    saveLiveT: 'Änderung speichern?',
    saveLive: 'Ab sofort bekommen alle Kundinnen und Kunden diesen Text. Die alte Fassung wird vorher aufbewahrt und lässt sich jederzeit wiederherstellen.',
    saveCopy: 'Das ist eine Testkopie. Sie wird nie an Kundschaft verschickt.',
    cancel: 'Abbrechen',
    yesSave: 'Ja, speichern',
    saved: 'Gespeichert. Ab jetzt verschickt Brevo diesen Text.',
    savedCopy: 'In der Testkopie gespeichert.',
    testSent: (to: string) => `Test-E-Mail an ${to} gesendet.`,
    makeCopy: 'Testkopie anlegen und dort üben',
    copyMade: 'Testkopie angelegt.',
    delCopy: 'Testkopie löschen',
    delCopyQ: 'Diese Testkopie in Brevo löschen?',
    copyDeleted: 'Testkopie gelöscht.',
    history: 'Frühere Fassungen',
    historyHint: 'Vor jeder Änderung wird die E-Mail hier aufbewahrt.',
    historyNone: 'Noch keine Änderungen über das Dashboard.',
    beforeEdit: (by: string) => `Fassung vor der Änderung von ${by}`,
    beforeRestore: (by: string) => `Fassung, bevor ${by} eine ältere wiederhergestellt hat`,
    restore: 'Wiederherstellen',
    restoreQ: 'Diese Fassung wiederherstellen? Die jetzige Fassung wird vorher aufbewahrt.',
    restored: 'Wiederhergestellt.',
    leaveQ: 'Deine Änderungen sind noch nicht gespeichert. Trotzdem zurück?',
    copyOf: (n: string) => `Kopie von „${n}“`,
  },
  en: {
    eyebrow: 'Emails',
    title: 'Email texts',
    intro:
      'Change what the automatic emails say. Links, placeholders and addresses are protected. The previous version is kept before every save, so everything can be undone.',
    testEnv:
      'Test environment: the real emails go to real customers and can only be changed on the live site. Create a test copy to practise. Test emails only go to approved team addresses.',
    search: 'Search emails…',
    sent: 'Sent',
    notSent: 'Not sent yet',
    open: 'Open point',
    edited: (by: string, at: string) => `Changed by ${by} · ${at}`,
    brevoChanged: (at: string) => `Last changed ${at}`,
    copies: 'Test copies',
    copy: 'Test copy',
    loading: 'Loading…',
    retry: 'Try again',
    none: 'Nothing found.',
    back: '← All emails',
    when: 'Sent when',
    subject: 'Subject',
    body: 'Email text',
    images: (n: number) => `Image descriptions (${n})`,
    imagesHint: 'Shown when images are blocked, and read out by screen readers.',
    lockedHelp: 'Coloured blocks are filled in by the system (e.g. the first name). You can move them (cut and paste), delete them with ×, or add them again with "Insert". Grey blocks (links, addresses, bold) must stay.',
    howTo: 'How it works: click a sentence in the preview on the right and type, or change it on the left. Both are the same. Nothing is saved until you press "Save".',
    kinds: {
      preheader: 'Preview line (next to the subject in the inbox)',
      heading: 'Heading',
      text: 'Text',
      link: 'Button or link text',
      alt: 'Image description',
      title: 'Hover hint',
    } as Record<FieldKind, string>,
    preview: 'Preview with example values',
    changes: (n: number) => (n === 0 ? 'No changes' : n === 1 ? '1 unsaved change' : `${n} unsaved changes`),
    discard: 'Discard',
    test: 'Send test to me',
    testNo: 'Your address is not approved as a test inbox in this test environment.',
    save: 'Save',
    saving: 'Saving…',
    sending: 'Sending…',
    saveLiveT: 'Save this change?',
    saveLive: 'From now on every customer receives this text. The previous version is kept and can be restored at any time.',
    saveCopy: 'This is a test copy. It is never sent to customers.',
    cancel: 'Cancel',
    yesSave: 'Yes, save',
    saved: 'Saved. Brevo sends this text from now on.',
    savedCopy: 'Saved in the test copy.',
    testSent: (to: string) => `Test email sent to ${to}.`,
    makeCopy: 'Create a test copy to practise',
    copyMade: 'Test copy created.',
    delCopy: 'Delete test copy',
    delCopyQ: 'Delete this test copy in Brevo?',
    copyDeleted: 'Test copy deleted.',
    history: 'Earlier versions',
    historyHint: 'Before every change the email is kept here.',
    historyNone: 'No changes made through the dashboard yet.',
    beforeEdit: (by: string) => `Version before ${by}'s change`,
    beforeRestore: (by: string) => `Version before ${by} restored an older one`,
    restore: 'Restore',
    restoreQ: 'Restore this version? The current version is kept first.',
    restored: 'Restored.',
    leaveQ: 'Your changes are not saved yet. Go back anyway?',
    copyOf: (n: string) => `Copy of "${n}"`,
  },
}

const META = new Map(EMAIL_TEMPLATES.map((m) => [m.id, m]))

function fmtDateTime(iso: string, lang: Lang) {
  return new Date(iso).toLocaleString(LOCALE[lang], {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna',
  })
}

export function EmailTemplatesView({ lang }: { lang: Lang }) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [list, setList] = useState<{ live: boolean; templates: TemplateSummary[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const r = await listEmailTemplates()
    if (r.ok) setList(r.data)
    else setError(r.error)
  }, [])
  useEffect(() => {
    load()
  }, [load])

  if (openId !== null) {
    const summary = list?.templates.find((x) => x.id === openId)
    return (
      <TemplateEditor
        key={openId}
        id={openId}
        lang={lang}
        summary={summary}
        onBack={() => {
          setOpenId(null)
          load()
        }}
        onOpen={(id) => setOpenId(id)}
      />
    )
  }
  return <TemplateList lang={lang} list={list} error={error} onRetry={load} onOpen={setOpenId} />
}

/* ── List ─────────────────────────────────────────────── */

function TemplateList({
  lang,
  list,
  error,
  onRetry,
  onOpen,
}: {
  lang: Lang
  list: { live: boolean; templates: TemplateSummary[] } | null
  error: string | null
  onRetry: () => void
  onOpen: (id: number) => void
}) {
  const t = T[lang]
  const [q, setQ] = useState('')
  const byId = useMemo(() => new Map((list?.templates ?? []).map((x) => [x.id, x])), [list])
  const needle = q.trim().toLowerCase()
  const match = (m: EmailTemplateMeta) => {
    if (!needle) return true
    const s = byId.get(m.id)
    return [m.title.de, m.title.en, m.when.de, m.when.en, s?.subject ?? '', String(m.id)].join(' ').toLowerCase().includes(needle)
  }
  const copies = (list?.templates ?? []).filter((x) => x.isTestCopy)

  const row = (m: EmailTemplateMeta | null, s: TemplateSummary | undefined, isCopy = false) => {
    const id = m?.id ?? s?.id ?? 0
    const title = m ? m.title[lang] : (s?.name ?? '').replace(TEST_COPY_PREFIX, '')
    return (
      <button key={id} type="button" className="ff-mailrow" onClick={() => onOpen(id)}>
        <span style={{ display: 'grid', gap: 3, minWidth: 0 }}>
          <b>{title}</b>
          {m && <span className="when">{m.when[lang]}</span>}
          <span className="subj">
            <span className="ff-muted">{t.subject}: </span>
            {s ? subjectToEditor(s.subject).value : '…'}
          </span>
        </span>
        <span className="side">
          {isCopy ? (
            <span className="ff-pill info">{t.copy}</span>
          ) : m?.sent ? (
            <span className="ff-pill ok">{t.sent}</span>
          ) : (
            <span className="ff-pill neu">{t.notSent}</span>
          )}
          {m?.open && (
            <span className="ff-pill warn" title={m.open}>
              {t.open}
            </span>
          )}
          {s?.lastEdit ? (
            <span>{t.edited(s.lastEdit.by, fmtDateTime(s.lastEdit.at, lang))}</span>
          ) : s?.modifiedAt ? (
            <span>{t.brevoChanged(fmtDateTime(s.modifiedAt, lang))}</span>
          ) : null}
        </span>
      </button>
    )
  }

  return (
    <div className="ff-page">
      <div className="ff-head">
        <div>
          <div className="ff-eyebrow">{t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
        <input
          className="ff-input"
          type="search"
          placeholder={t.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 300 }}
          aria-label={t.search}
        />
      </div>
      {list && !list.live && <div className="ff-info">{t.testEnv}</div>}
      {error && (
        <div className="ff-err" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button type="button" className="ff-btn is-sm" onClick={onRetry}>
            {t.retry}
          </button>
        </div>
      )}
      {!list && !error && <p className="ff-muted">{t.loading}</p>}
      {list && (
        <>
          {copies.length > 0 && !needle && (
            <section>
              <h2 className="ff-mailgrp">{t.copies}</h2>
              <div className="ff-panel" style={{ overflow: 'hidden' }}>
                {copies.map((c) => row(c.copyOf ? (META.get(c.copyOf) ?? null) : null, c, true))}
              </div>
            </section>
          )}
          {EMAIL_GROUPS.map((g) => {
            const items = EMAIL_TEMPLATES.filter((m) => m.group === g.id && match(m))
            if (items.length === 0) return null
            return (
              <section key={g.id}>
                <h2 className="ff-mailgrp">{g[lang]}</h2>
                <div className="ff-panel" style={{ overflow: 'hidden' }}>
                  {items.map((m) => row(m, byId.get(m.id)))}
                </div>
              </section>
            )
          })}
          {EMAIL_TEMPLATES.every((m) => !match(m)) && <p className="ff-muted">{t.none}</p>}
        </>
      )}
    </div>
  )
}

/* ── Editor ───────────────────────────────────────────── */

function TemplateEditor({
  id,
  lang,
  summary,
  onBack,
  onOpen,
}: {
  id: number
  lang: Lang
  summary?: TemplateSummary
  onBack: () => void
  onOpen: (id: number) => void
}) {
  const t = T[lang]
  const toast = useToast()
  const [detail, setDetail] = useState<TemplateDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [subject, setSubject] = useState('')
  const [busy, setBusy] = useState<null | 'save' | 'test' | 'copy' | 'restore' | 'delete'>(null)
  const [serverError, setServerError] = useState<{ msg: string; fieldId?: string } | null>(null)
  const [confirm, setConfirm] = useState<null | { kind: 'save' } | { kind: 'restore'; versionId: string } | { kind: 'delete' }>(null)
  const [showImages, setShowImages] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const sent = useRef<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoadError(null)
    const r = await getEmailTemplate(id)
    if (!r.ok) return setLoadError(r.error)
    setDetail(r.data)
    setEdits({})
    setSubject(analyzeTemplate(r.data.htmlContent, r.data.subject).subject.value)
    setServerError(null)
  }, [id])
  useEffect(() => {
    load()
  }, [load])

  const analysis = useMemo(() => (detail ? analyzeTemplate(detail.htmlContent, detail.subject) : null), [detail])
  const fields = useMemo(() => analysis?.fields ?? [], [analysis])
  const chips = useMemo(() => analysis?.chips ?? {}, [analysis])
  const palette = useMemo(() => analysis?.palette ?? [], [analysis])
  const original = useMemo(() => new Map(fields.map((f) => [f.id, f.value])), [fields])
  const subjectOriginal = analysis?.subject.value ?? ''

  const changedIds = Object.keys(edits).filter((k) => edits[k] !== original.get(k))
  const subjectChanged = detail ? subject !== subjectOriginal : false
  const changeCount = changedIds.length + (subjectChanged ? 1 : 0)

  // Live validation, per field, with exactly the rules the server applies.
  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {}
    if (!detail) return errs
    for (const k of changedIds) {
      try {
        applyFieldEdits(detail.htmlContent, { [k]: edits[k] }, detail.subject)
      } catch (e) {
        errs[k] = e instanceof TemplateEditError ? e.message : String(e)
      }
    }
    if (subjectChanged) {
      try {
        editorToSubject(detail.subject, subject, detail.htmlContent)
      } catch (e) {
        errs.subject = e instanceof TemplateEditError ? e.message : String(e)
      }
    }
    return errs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, edits, subject])
  const hasErrors = Object.keys(fieldErrors).length > 0

  // The email with all valid edits applied — what the preview shows.
  const built = useMemo(() => {
    if (!detail) return null
    let html = detail.htmlContent
    try {
      const valid = Object.fromEntries(changedIds.filter((k) => !fieldErrors[k]).map((k) => [k, edits[k]]))
      html = applyFieldEdits(detail.htmlContent, valid, detail.subject)
    } catch {
      /* fall back to the saved version */
    }
    return buildEditablePreview(html, SAMPLE_PARAMS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, edits, fieldErrors])

  // The iframe document is built once per loaded version; later edits are pushed into it
  // paragraph by paragraph so nothing flickers and the cursor stays where it is.
  const frameDoc = useMemo(() => {
    if (!detail) return ''
    const first = buildEditablePreview(detail.htmlContent, SAMPLE_PARAMS)
    sent.current = Object.fromEntries(Object.entries(first.segs).map(([k, v]) => [k, v.html]))
    return first.doc
  }, [detail])

  useEffect(() => {
    if (!built) return
    for (const [segId, s] of Object.entries(built.segs)) {
      if (sent.current[segId] === s.html) continue
      sent.current[segId] = s.html
      frameRef.current?.contentWindow?.postMessage({ t: 'set', id: segId, html: s.html }, '*')
    }
  }, [built])

  // Messages from the preview: typing in a paragraph, or a click on one.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return
      const d = e.data as { ff?: number; t?: string; id?: string; value?: string; edit?: boolean } | null
      if (!d || d.ff !== 1 || !d.id) return
      if (d.t === 'edit' && typeof d.value === 'string') {
        const v = d.value
        setEdits((prev) => ({ ...prev, [d.id!]: v }))
      } else if (d.t === 'focus') {
        const box = document.getElementById(`fld-${d.id}`)
        box?.scrollIntoView({ block: 'center', behavior: 'smooth' })
        if (!d.edit) box?.querySelector<HTMLElement>('[contenteditable="true"]')?.focus({ preventScroll: true })
        setFlash(d.id)
        window.setTimeout(() => setFlash((f) => (f === d.id ? null : f)), 1600)
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const previewSubject = useMemo(() => {
    if (!detail) return ''
    let s = detail.subject
    try {
      s = editorToSubject(detail.subject, subject, detail.htmlContent)
    } catch {
      /* keep saved subject */
    }
    return renderPreview(s, SAMPLE_PARAMS).replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  }, [detail, subject])

  const meta = META.get(summary?.copyOf ?? id) ?? META.get(id)
  const isCopy = Boolean(summary?.isTestCopy || detail?.name.startsWith(TEST_COPY_PREFIX))
  const payloadEdits = () => Object.fromEntries(changedIds.map((k) => [k, edits[k]]))

  const goBack = () => {
    if (changeCount > 0 && !window.confirm(t.leaveQ)) return
    onBack()
  }

  const doSave = async () => {
    if (!detail) return
    setBusy('save')
    setServerError(null)
    const r = await saveEmailTemplate({ id, hash: detail.hash, edits: payloadEdits(), subject })
    setBusy(null)
    setConfirm(null)
    if (!r.ok) return setServerError({ msg: r.error, fieldId: r.fieldId })
    toast(isCopy ? t.savedCopy : t.saved)
    await load()
  }
  const doTest = async () => {
    if (!detail) return
    setBusy('test')
    setServerError(null)
    const r = await sendEmailTemplateTest({ id, hash: detail.hash, edits: payloadEdits(), subject })
    setBusy(null)
    if (!r.ok) return setServerError({ msg: r.error, fieldId: r.fieldId })
    toast(t.testSent(r.data.to))
  }
  const doCopy = async () => {
    setBusy('copy')
    const r = await createEmailTestCopy(id)
    setBusy(null)
    if (!r.ok) return setServerError({ msg: r.error })
    toast(t.copyMade)
    onOpen(r.data.id)
  }
  const doRestore = async (versionId: string) => {
    setBusy('restore')
    const r = await restoreEmailTemplateVersion({ id, versionId })
    setBusy(null)
    setConfirm(null)
    if (!r.ok) return setServerError({ msg: r.error })
    toast(t.restored)
    await load()
  }
  const doDelete = async () => {
    setBusy('delete')
    const r = await deleteEmailTestCopy(id)
    setBusy(null)
    setConfirm(null)
    if (!r.ok) return setServerError({ msg: r.error })
    toast(t.copyDeleted)
    onBack()
  }

  const title = meta ? meta.title[lang] : (detail?.name ?? '')

  if (loadError) {
    return (
      <div className="ff-page">
        <button type="button" className="ff-link" onClick={onBack} style={{ marginBottom: 14 }}>
          {t.back}
        </button>
        <div className="ff-err">{loadError}</div>
      </div>
    )
  }
  if (!detail || !analysis) {
    return (
      <div className="ff-page">
        <p className="ff-muted">{t.loading}</p>
      </div>
    )
  }

  const bodyFields = fields.filter((f) => f.kind !== 'alt' && f.kind !== 'title')
  const imageFields = fields.filter((f) => f.kind === 'alt' || f.kind === 'title')

  const fieldBox = (f: TemplateField) => {
    const value = edits[f.id] ?? f.value
    const changed = value !== f.value
    const err = fieldErrors[f.id] ?? (serverError?.fieldId === f.id ? serverError.msg : null)
    return (
      <div key={f.id} id={`fld-${f.id}`} className={`ff-mfield${changed ? ' is-changed' : ''}${err ? ' is-bad' : ''}${flash === f.id ? ' is-flash' : ''}`}>
        <div className="ff-mlabel">
          <span>{t.kinds[f.kind]}</span>
          {changed && (
            <button type="button" className="ff-link" style={{ fontSize: 12 }} onClick={() => setEdits((e) => ({ ...e, [f.id]: f.value }))}>
              {t.discard}
            </button>
          )}
        </div>
        <ParagraphEditor
          id={`ed-${f.id}`}
          value={value}
          liquid={f.liquid}
          onChange={(v) => setEdits((prev) => ({ ...prev, [f.id]: v }))}
          chips={chips}
          palette={palette}
          readOnly={!detail.canSave}
          invalid={Boolean(err)}
          label={t.kinds[f.kind]}
        />
        {err && <div style={{ color: 'var(--ff-bad-fg)', fontSize: 12, fontWeight: 600 }}>{err}</div>}
      </div>
    )
  }

  return (
    <div className="ff-page is-wide">
      <button type="button" className="ff-link ff-noprint" onClick={goBack} style={{ marginBottom: 14 }}>
        {t.back}
      </button>
      <div className="ff-head">
        <div>
          <div className="ff-eyebrow">
            {isCopy ? t.copy : meta?.sent ? t.sent : t.notSent} · #{detail.id}
          </div>
          <h1>{isCopy && meta ? t.copyOf(meta.title[lang]) : title}</h1>
          {meta && (
            <p>
              <strong>{t.when}:</strong> {meta.when[lang]}
            </p>
          )}
        </div>
        {isCopy && (
          <button type="button" className="ff-btn is-danger" onClick={() => setConfirm({ kind: 'delete' })} disabled={busy !== null}>
            {t.delCopy}
          </button>
        )}
      </div>

      {meta?.open && !isCopy && <div className="ff-note">{meta.open}</div>}
      {!detail.canSave && detail.saveNote && (
        <div className="ff-info" style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: 240 }}>{detail.saveNote}</span>
          {!detail.live && !isCopy && (
            <button type="button" className="ff-btn is-gold" onClick={doCopy} disabled={busy !== null}>
              {t.makeCopy}
            </button>
          )}
        </div>
      )}
      {detail.canSave && <div className="ff-info">{t.howTo}</div>}
      {serverError && !serverError.fieldId && (
        <div className="ff-err" style={{ marginBottom: 16 }}>
          {serverError.msg}
        </div>
      )}

      <div className="ff-mailed">
        <div>
          <div className="ff-panel" style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div className={`ff-mfield${subjectChanged ? ' is-changed' : ''}${fieldErrors.subject ? ' is-bad' : ''}`}>
              <div className="ff-mlabel">
                <span>{t.subject}</span>
                {subjectChanged && (
                  <button type="button" className="ff-link" style={{ fontSize: 12 }} onClick={() => setSubject(subjectOriginal)}>
                    {t.discard}
                  </button>
                )}
              </div>
              <ParagraphEditor
                id="ed-subject"
                value={subject}
                liquid={analysis.subject.liquid}
                onChange={setSubject}
                chips={chips}
                palette={palette}
                readOnly={!detail.canSave}
                single
                invalid={Boolean(fieldErrors.subject)}
                label={t.subject}
              />
              {fieldErrors.subject && <div style={{ color: 'var(--ff-bad-fg)', fontSize: 12, fontWeight: 600 }}>{fieldErrors.subject}</div>}
            </div>
          </div>

          <h2 style={{ fontSize: 16, margin: '0 0 6px' }}>{t.body}</h2>
          <p className="ff-muted" style={{ margin: '0 0 12px', fontSize: 13 }}>
            {t.lockedHelp}
          </p>
          <div className="ff-panel" style={{ overflow: 'hidden', marginBottom: 16 }}>
            {bodyFields.map(fieldBox)}
          </div>

          {imageFields.length > 0 && (
            <div className="ff-panel" style={{ overflow: 'hidden', marginBottom: 16 }}>
              <button
                type="button"
                className="ff-mailrow"
                aria-expanded={showImages}
                onClick={() => setShowImages((v) => !v)}
                style={{ gridTemplateColumns: '1fr auto' }}
              >
                <span style={{ display: 'grid', gap: 2 }}>
                  <b style={{ fontSize: 15 }}>{t.images(imageFields.length)}</b>
                  <span className="when">{t.imagesHint}</span>
                </span>
                <span aria-hidden>{showImages ? '−' : '+'}</span>
              </button>
              {showImages && imageFields.map(fieldBox)}
            </div>
          )}

          <h2 style={{ fontSize: 16, margin: '24px 0 6px' }}>{t.history}</h2>
          <p className="ff-muted" style={{ margin: '0 0 12px', fontSize: 13 }}>
            {t.historyHint}
          </p>
          <div className="ff-panel" style={{ overflow: 'hidden' }}>
            {detail.versions.length === 0 ? (
              <p className="ff-muted" style={{ margin: 0, padding: '14px 18px' }}>
                {t.historyNone}
              </p>
            ) : (
              detail.versions.map((v) => (
                <div key={v.id} className="ff-ver">
                  <span style={{ display: 'grid', gap: 2, minWidth: 0 }}>
                    <b style={{ fontSize: 14 }}>{v.reason === 'before-restore' ? t.beforeRestore(v.savedByName) : t.beforeEdit(v.savedByName)}</b>
                    <span className="ff-muted" style={{ fontSize: 12 }}>
                      {fmtDateTime(v.createdAt, lang)} · {t.subject}: {subjectToEditor(v.subject).value}
                    </span>
                  </span>
                  {detail.canSave && (
                    <button type="button" className="ff-btn is-sm" disabled={busy !== null} onClick={() => setConfirm({ kind: 'restore', versionId: v.id })}>
                      {t.restore}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="ff-preview ff-panel" style={{ overflow: 'hidden' }} aria-label={t.preview}>
          <div className="ff-prevbar">
            <span>{t.preview}</span>
          </div>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--ff-line)', fontSize: 13 }}>
            <span className="ff-muted">{t.subject}: </span>
            <strong>{previewSubject}</strong>
          </div>
          <iframe ref={frameRef} title={t.preview} srcDoc={frameDoc} sandbox="allow-scripts" />
        </aside>
      </div>

      <div className="ff-savebar ff-noprint">
        <span className="grow" aria-live="polite">
          {t.changes(changeCount)}
        </span>
        <button
          type="button"
          className="ff-btn"
          disabled={changeCount === 0 || busy !== null}
          onClick={() => {
            setEdits({})
            setSubject(subjectOriginal)
            setServerError(null)
            // paragraphs edited inside the preview are reset from the saved version
            for (const [segId, s] of Object.entries(buildEditablePreview(detail.htmlContent, SAMPLE_PARAMS).segs)) {
              sent.current[segId] = s.html
              frameRef.current?.contentWindow?.postMessage({ t: 'set', id: segId, html: s.html }, '*')
            }
          }}
        >
          {t.discard}
        </button>
        <button
          type="button"
          className="ff-btn"
          disabled={!detail.canReceiveTest || hasErrors || busy !== null}
          title={detail.canReceiveTest ? detail.myEmail : t.testNo}
          onClick={doTest}
        >
          {busy === 'test' ? t.sending : t.test}
        </button>
        <button
          type="button"
          className="ff-btn is-gold"
          disabled={!detail.canSave || changeCount === 0 || hasErrors || busy !== null}
          onClick={() => setConfirm({ kind: 'save' })}
        >
          {busy === 'save' ? t.saving : t.save}
        </button>
      </div>

      {confirm && (
        <div className="ff-modal" role="presentation" onClick={(e) => e.target === e.currentTarget && busy === null && setConfirm(null)}>
          <div className="ff-dlg" role="dialog" aria-modal="true" aria-labelledby="mail-confirm-title">
            <h3 id="mail-confirm-title">
              {confirm.kind === 'save' ? t.saveLiveT : confirm.kind === 'restore' ? t.restore : t.delCopy}
            </h3>
            <p style={{ margin: 0 }}>
              {confirm.kind === 'save' ? (isCopy ? t.saveCopy : t.saveLive) : confirm.kind === 'restore' ? t.restoreQ : t.delCopyQ}
            </p>
            <div className="ff-acts">
              <button type="button" className="ff-btn" onClick={() => setConfirm(null)} disabled={busy !== null}>
                {t.cancel}
              </button>
              <button
                type="button"
                className={`ff-btn ${confirm.kind === 'delete' ? 'is-danger' : 'is-gold'}`}
                disabled={busy !== null}
                onClick={() =>
                  confirm.kind === 'save' ? doSave() : confirm.kind === 'restore' ? doRestore(confirm.versionId) : doDelete()
                }
              >
                {confirm.kind === 'save' ? t.yesSave : confirm.kind === 'restore' ? t.restore : t.delCopy}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
