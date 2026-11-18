'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { sendTransactionalEmail } from '@/lib/brevo'
import {
  createBrevoTemplate,
  deleteBrevoTemplate,
  getBrevoTemplate,
  listBrevoTemplates,
  templateHash,
  updateBrevoTemplate,
  type BrevoTemplate,
} from '@/lib/brevoTemplates'
import { isAllowedTestRecipient, isLiveEmailEnvironment } from '@/lib/emailSafety'
import {
  applyFieldEdits,
  editorToSubject,
  lockedFingerprint,
  renderPreview,
  SAMPLE_PARAMS,
  TemplateEditError,
} from '@/lib/emailTemplateText'

import { EMAIL_TEMPLATE_IDS, TEST_COPY_PREFIX } from './emailTemplateMeta'
import { adminDisplayName, requireAdminUser } from './requireAdmin'

/*
 * E-Mails tab — admin-only server actions (requireAdminUser at the top of each).
 *
 * Safety rules:
 *  - Only text changes (see src/lib/emailTemplateText.ts); links, placeholders,
 *    Liquid and addresses are locked and re-checked here on the server.
 *  - Before every write the complete template is stored in
 *    `email-template-versions`, so every change can be restored.
 *  - The Brevo account is shared with production. Outside production
 *    (localhost / staging) only "TEST – …" copies can be changed, never the
 *    28 live templates. In production only the 28 known templates.
 *  - A save is refused if the template changed in Brevo since it was opened.
 */

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string; fieldId?: string }

export type TemplateSummary = {
  id: number
  name: string
  subject: string
  modifiedAt: string
  isActive: boolean
  lastEdit: { by: string; at: string } | null
  isTestCopy: boolean
  copyOf: number | null
}

export type TemplateVersionRow = {
  id: string
  createdAt: string
  savedByName: string
  reason: string
  subject: string
}

export type TemplateDetail = {
  id: number
  name: string
  subject: string
  htmlContent: string
  hash: string
  modifiedAt: string
  canSave: boolean
  /** Why saving is not possible here (German, shown in the UI). */
  saveNote: string | null
  live: boolean
  versions: TemplateVersionRow[]
  myEmail: string
  canReceiveTest: boolean
}

function fail(e: unknown): { ok: false; error: string; fieldId?: string } {
  if (e instanceof TemplateEditError) return { ok: false, error: e.message, fieldId: e.fieldId }
  if (e instanceof Error && e.message === 'Unauthorized') return { ok: false, error: 'Keine Berechtigung.' }
  console.error('[emailTemplateActions]', e)
  return { ok: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler.' }
}

function isTestCopy(t: { id: number; name: string }) {
  return t.name.startsWith(TEST_COPY_PREFIX) && !EMAIL_TEMPLATE_IDS.has(t.id)
}

/** The one place that decides whether a template may be written from here. */
function writeRule(t: { id: number; name: string }): { canSave: boolean; note: string | null } {
  const live = isLiveEmailEnvironment()
  if (live) {
    return EMAIL_TEMPLATE_IDS.has(t.id)
      ? { canSave: true, note: null }
      : { canSave: false, note: 'Diese Vorlage gehört nicht zu den 28 Fermentfreude-E-Mails.' }
  }
  return isTestCopy(t)
    ? { canSave: true, note: null }
    : {
        canSave: false,
        note: 'Testumgebung: Die echten E-Mails gehen an echte Kundschaft und können nur auf der Live-Seite geändert werden. Lege eine Testkopie an, um das Bearbeiten hier auszuprobieren.',
      }
}

function copyOfId(name: string, all: BrevoTemplate[]): number | null {
  if (!name.startsWith(TEST_COPY_PREFIX)) return null
  const base = name.slice(TEST_COPY_PREFIX.length)
  return all.find((t) => t.name === base && EMAIL_TEMPLATE_IDS.has(t.id))?.id ?? null
}

export async function listEmailTemplates(): Promise<ActionResult<{ live: boolean; templates: TemplateSummary[] }>> {
  try {
    const payload = await getPayload({ config: configPromise })
    await requireAdminUser(payload)
    const all = await listBrevoTemplates()
    const live = isLiveEmailEnvironment()
    const wanted = all.filter((t) => EMAIL_TEMPLATE_IDS.has(t.id) || (!live && isTestCopy(t)))

    // Latest dashboard edit per template (sequential read, small collection).
    const versions = await payload.find({
      collection: 'email-template-versions',
      sort: '-createdAt',
      limit: 300,
      depth: 0,
      overrideAccess: true,
    })
    const lastEdit = new Map<number, { by: string; at: string }>()
    for (const v of versions.docs) {
      if (!lastEdit.has(v.templateId)) lastEdit.set(v.templateId, { by: v.savedByName ?? '', at: v.createdAt })
    }

    return {
      ok: true,
      data: { live, templates: wanted.map((t) => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        modifiedAt: t.modifiedAt,
        isActive: t.isActive,
        lastEdit: lastEdit.get(t.id) ?? null,
        isTestCopy: isTestCopy(t),
        copyOf: copyOfId(t.name, all),
      })) },
    }
  } catch (e) {
    return fail(e)
  }
}

export async function getEmailTemplate(id: number): Promise<ActionResult<TemplateDetail>> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const t = await getBrevoTemplate(id)
    if (!EMAIL_TEMPLATE_IDS.has(t.id) && !isTestCopy(t)) return { ok: false, error: 'Diese Vorlage gibt es hier nicht.' }
    const rule = writeRule(t)
    const versions = await payload.find({
      collection: 'email-template-versions',
      where: { templateId: { equals: id } },
      sort: '-createdAt',
      limit: 30,
      depth: 0,
      overrideAccess: true,
    })
    const myEmail = user.email ?? ''
    return {
      ok: true,
      data: {
        id: t.id,
        name: t.name,
        subject: t.subject,
        htmlContent: t.htmlContent,
        hash: templateHash(t),
        modifiedAt: t.modifiedAt,
        canSave: rule.canSave,
        saveNote: rule.note,
        live: isLiveEmailEnvironment(),
        versions: versions.docs.map((v) => ({
          id: String(v.id),
          createdAt: v.createdAt,
          savedByName: v.savedByName ?? '',
          reason: v.reason,
          subject: v.subject,
        })),
        myEmail,
        canReceiveTest: isLiveEmailEnvironment() || isAllowedTestRecipient(myEmail),
      },
    }
  } catch (e) {
    return fail(e)
  }
}

type EditInput = { id: number; hash: string; edits: Record<string, string>; subject: string }

/** Loads the template fresh from Brevo and applies the edits (validating everything). */
async function buildEdited(input: EditInput): Promise<{ current: BrevoTemplate; html: string; subject: string }> {
  const current = await getBrevoTemplate(input.id)
  if (templateHash(current) !== input.hash) {
    throw new TemplateEditError(
      'Diese E-Mail wurde inzwischen an anderer Stelle geändert. Bitte die Seite neu laden, deine Änderungen vorher kopieren.',
    )
  }
  const html = applyFieldEdits(current.htmlContent, input.edits, current.subject)
  const subject = editorToSubject(current.subject, input.subject, current.htmlContent)
  return { current, html, subject }
}

export async function saveEmailTemplate(input: EditInput): Promise<ActionResult<{ hash: string }>> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const { current, html, subject } = await buildEdited(input)
    const rule = writeRule(current)
    if (!rule.canSave) return { ok: false, error: rule.note ?? 'Speichern ist hier nicht möglich.' }
    if (html === current.htmlContent && subject === current.subject) {
      return { ok: false, error: 'Es gibt keine Änderungen zum Speichern.' }
    }

    // 1. Before-copy first — if this fails, nothing is changed in Brevo.
    await payload.create({
      collection: 'email-template-versions',
      data: {
        templateId: current.id,
        templateName: current.name,
        subject: current.subject,
        htmlContent: current.htmlContent,
        reason: 'before-edit',
        savedByName: adminDisplayName(user),
        savedByEmail: user.email ?? '',
      },
      overrideAccess: true,
    })
    // 2. Write to Brevo.
    await updateBrevoTemplate(current.id, { subject, htmlContent: html })
    return { ok: true, data: { hash: templateHash({ subject, htmlContent: html }) } }
  } catch (e) {
    return fail(e)
  }
}

export async function restoreEmailTemplateVersion(params: {
  id: number
  versionId: string
}): Promise<ActionResult> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const version = await payload.findByID({
      collection: 'email-template-versions',
      id: params.versionId,
      depth: 0,
      overrideAccess: true,
    })
    if (!version || version.templateId !== params.id) return { ok: false, error: 'Diese Fassung gibt es nicht.' }
    const current = await getBrevoTemplate(params.id)
    const rule = writeRule(current)
    if (!rule.canSave) return { ok: false, error: rule.note ?? 'Wiederherstellen ist hier nicht möglich.' }
    if (lockedFingerprint(version.htmlContent) !== lockedFingerprint(current.htmlContent)) {
      return {
        ok: false,
        error:
          'Diese ältere Fassung hat andere Links oder Platzhalter als die aktuelle E-Mail (die Technik wurde seitdem geändert). Wiederherstellen würde das rückgängig machen, deshalb geht es hier nicht. Bitte Rafaela fragen.',
      }
    }
    await payload.create({
      collection: 'email-template-versions',
      data: {
        templateId: current.id,
        templateName: current.name,
        subject: current.subject,
        htmlContent: current.htmlContent,
        reason: 'before-restore',
        savedByName: adminDisplayName(user),
        savedByEmail: user.email ?? '',
      },
      overrideAccess: true,
    })
    await updateBrevoTemplate(current.id, { subject: version.subject, htmlContent: version.htmlContent })
    return { ok: true, data: null }
  } catch (e) {
    return fail(e)
  }
}

/** Sends the CURRENT EDITOR STATE (saved or not) with example values to the logged-in admin only. */
export async function sendEmailTemplateTest(input: EditInput): Promise<ActionResult<{ to: string }>> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const to = user.email ?? ''
    if (!to) return { ok: false, error: 'Dein Konto hat keine E-Mail-Adresse.' }
    if (!isLiveEmailEnvironment() && !isAllowedTestRecipient(to)) {
      return {
        ok: false,
        error: `Testumgebung: ${to} ist nicht als Test-Postfach freigegeben (EMAIL_TEST_ALLOWLIST). Es wurde nichts gesendet.`,
      }
    }
    const { html, subject } = await buildEdited(input)
    const sample = SAMPLE_PARAMS
    // Copies of every test email (e.g. Rafaela sees what David tests): EMAIL_TEST_COPY_TO, comma-separated.
    const copies = (process.env.EMAIL_TEST_COPY_TO ?? '')
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@') && e.toLowerCase() !== to.toLowerCase())
      .map((email) => ({ email }))
    const res = await sendTransactionalEmail({
      to: [{ email: to, name: adminDisplayName(user) }, ...copies],
      subject: `[TEST] ${renderPreview(subject, sample).replace(/&amp;/g, '&')}`,
      htmlContent: renderPreview(html, sample),
    })
    if (!res.success || res.blocked) return { ok: false, error: 'Die Test-E-Mail konnte nicht gesendet werden.' }
    return { ok: true, data: { to: [to, ...copies.map((c) => c.email)].join(', ') } }
  } catch (e) {
    return fail(e)
  }
}

/** Localhost / staging only: an inactive copy named "TEST – <name>" to practise on. */
export async function createEmailTestCopy(id: number): Promise<ActionResult<{ id: number }>> {
  try {
    const payload = await getPayload({ config: configPromise })
    await requireAdminUser(payload)
    if (isLiveEmailEnvironment()) return { ok: false, error: 'Testkopien gibt es nur in der Testumgebung.' }
    if (!EMAIL_TEMPLATE_IDS.has(id)) return { ok: false, error: 'Unbekannte Vorlage.' }
    const all = await listBrevoTemplates()
    const original = all.find((t) => t.id === id)
    if (!original) return { ok: false, error: 'Vorlage nicht gefunden.' }
    const existing = all.find((t) => t.name === `${TEST_COPY_PREFIX}${original.name}`)
    if (existing) return { ok: true, data: { id: existing.id } }
    const full = await getBrevoTemplate(id)
    const newId = await createBrevoTemplate({
      templateName: `${TEST_COPY_PREFIX}${full.name}`,
      subject: full.subject,
      htmlContent: full.htmlContent,
      sender: { name: full.sender?.name, email: full.sender?.email || 'kontakt@fermentfreude.at' },
      // Brevo refuses a template without a reply-to address; some of ours have none.
      replyTo: full.replyTo || full.sender?.email || 'kontakt@fermentfreude.at',
      isActive: false, // never used for sending; inactive copies can be deleted again
    })
    return { ok: true, data: { id: newId } }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteEmailTestCopy(id: number): Promise<ActionResult> {
  try {
    const payload = await getPayload({ config: configPromise })
    await requireAdminUser(payload)
    const t = await getBrevoTemplate(id)
    if (!isTestCopy(t) || t.isActive) return { ok: false, error: 'Nur inaktive Testkopien können gelöscht werden.' }
    await deleteBrevoTemplate(id)
    return { ok: true, data: null }
  } catch (e) {
    return fail(e)
  }
}
