import { getCachedGlobal } from '@/utilities/getGlobals'
import { normalizeAppLocale } from '@/utilities/payloadLocaleQuery'

import { ChatWidget } from './ChatWidget'
import { defaultChatTexts, type ChatTexts } from './defaults'

type ChatAssistantGlobalData = {
  enabled?: boolean | null
  launcherLabel?: string | null
  title?: string | null
  greeting?: string | null
  inputPlaceholder?: string | null
  privacyNote?: string | null
  suggestedQuestions?: { question?: string | null }[] | null
}

/**
 * Server wrapper for the chat bubble. Renders nothing unless the assistant is
 * switched on in Admin → Website → Chat Assistant and ANTHROPIC_API_KEY is set.
 */
export async function ChatAssistant({ locale: rawLocale }: { locale: string }) {
  if (!process.env.ANTHROPIC_API_KEY) return null

  const locale = normalizeAppLocale(rawLocale)
  let data: ChatAssistantGlobalData | null = null
  try {
    data = await getCachedGlobal<ChatAssistantGlobalData>('chat-assistant-global', 0, locale)()
  } catch (error) {
    console.error('[ChatAssistant] Failed to load global:', error)
    return null
  }
  if (!data?.enabled) return null

  const defaults = defaultChatTexts(locale)
  const suggested = (data.suggestedQuestions ?? [])
    .map((q) => q?.question?.trim())
    .filter((q): q is string => Boolean(q))

  const texts: ChatTexts = {
    ...defaults,
    launcherLabel: data.launcherLabel || defaults.launcherLabel,
    title: data.title || defaults.title,
    greeting: data.greeting || defaults.greeting,
    inputPlaceholder: data.inputPlaceholder || defaults.inputPlaceholder,
    privacyNote: data.privacyNote || defaults.privacyNote,
    suggestedQuestions: suggested.length ? suggested : defaults.suggestedQuestions,
  }

  return <ChatWidget locale={locale} texts={texts} />
}
