'use client'

import {
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Mail,
  MapPin,
  MessageCircle,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import {
  CHAT_REPLY_JSON_TYPE,
  replyToText,
  type ChatAction,
  type ChatCard,
  type ChatReply,
} from '@/lib/chat-assistant/types'
import { cn } from '@/utilities/cn'

import type { ChatTexts } from './defaults'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  cards?: ChatCard[]
  actions?: ChatAction[]
  suggestions?: string[]
  /** Show the "ask our team" form under this answer. */
  handoff?: boolean
  handoffSent?: boolean
  feedback?: 'up' | 'down'
}

const TEASER_KEY = 'ff-chat-teaser-seen'
const TEASER_DELAY_MS = 6000

const STORAGE_KEY = 'ff-chat-assistant-v2'
const MAX_INPUT = 1500

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//')

function SmartLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string
  className?: string
  onClick?: () => void
  children: ReactNode
}) {
  if (isInternal(href)) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    )
  }
  if (/^https:\/\//.test(href) || /^mailto:/.test(href)) {
    return (
      <a href={href} className={className} onClick={onClick} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  return <span className={className}>{children}</span>
}

/** Render the tiny Markdown subset the assistant uses: [links](/path) and **bold**. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    if (match[1] && match[2]) {
      nodes.push(
        <SmartLink
          key={key++}
          href={match[2]}
          className="font-semibold underline decoration-ff-gold-accent decoration-2 underline-offset-2 hover:text-ff-charcoal"
        >
          {match[1]}
        </SmartLink>,
      )
    } else if (match[3]) {
      nodes.push(<strong key={key++}>{match[3]}</strong>)
    }
    last = pattern.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/** Paragraphs, plus real lists for lines that start with "• ", "- " or "* ". */
function MessageText({ text }: { text: string }) {
  const blocks: Array<{ type: 'p' | 'ul'; lines: string[] }> = []
  for (const line of text.split('\n')) {
    const item = /^\s*(?:[•\-*])\s+(.*)$/.exec(line)
    const type = item ? 'ul' : 'p'
    const content = item ? item[1] : line
    if (!item && !line.trim()) {
      blocks.push({ type: 'p', lines: [] })
      continue
    }
    const prev = blocks[blocks.length - 1]
    if (prev && prev.type === type && (type === 'ul' || prev.lines.length)) prev.lines.push(content)
    else blocks.push({ type, lines: [content] })
  }
  return (
    <div className="space-y-2 [&_p]:m-0 [&_ul]:m-0">
      {blocks
        .filter((b) => b.lines.length)
        .map((b, i) =>
          b.type === 'ul' ? (
            <ul key={i} className="space-y-1">
              {b.lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-ff-gold-accent" />
                  <span>{renderInline(l)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p key={i}>
              {b.lines.map((l, j) => (
                <Fragment key={j}>
                  {renderInline(l)}
                  {j < b.lines.length - 1 && <br />}
                </Fragment>
              ))}
            </p>
          ),
        )}
    </div>
  )
}

function Avatar({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-ff-gold-accent text-ff-near-black',
        size === 'lg' ? 'size-10' : 'size-7',
      )}
    >
      <Sparkles className={size === 'lg' ? 'size-5' : 'size-3.5'} />
    </span>
  )
}

/** "Sa., 14. November 2026 um 10:00" → { day: "14", month: "Nov" } */
function calendarParts(when: string): { day: string; month: string } | null {
  const m = /(\d{1,2})\.?\s+(\p{L}+)/u.exec(when)
  return m ? { day: m[1], month: m[2].slice(0, 3) } : null
}

function spotsLabel(texts: ChatTexts, spots: number): string {
  if (spots <= 0) return texts.soldOutLabel
  if (spots === 1) return texts.oneSpotLeftLabel
  return texts.spotsLeftLabel.replace('{n}', String(spots))
}

function CardView({ card, texts, onNavigate }: { card: ChatCard; texts: ChatTexts; onNavigate: () => void }) {
  const base =
    'group flex items-center gap-3 rounded-xl border border-ff-border-light bg-white p-3 text-left transition hover:border-ff-near-black/30 hover:shadow-md'

  if (card.kind === 'date') {
    const cal = calendarParts(card.when)
    const soldOut = card.spots <= 0
    return (
      <SmartLink href={card.href} onClick={onNavigate} className={cn(base, soldOut && 'opacity-70')}>
        <>
          <span className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-lg border border-ff-border-light text-center">
            <span className="w-full bg-ff-near-black py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-white">
              {cal?.month ?? <CalendarDays className="mx-auto size-3" />}
            </span>
            <span className="py-1 font-display text-lg font-bold leading-none">{cal?.day ?? '–'}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-sm font-bold">{card.title}</span>
            <span className="block text-xs leading-snug text-ff-charcoal">{card.when}</span>
            <span className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  soldOut
                    ? 'bg-ff-warm-gray text-ff-charcoal'
                    : card.spots <= 2
                      ? 'bg-ff-gold-light text-ff-near-black'
                      : 'bg-[#e3ecdf] text-[#2f4a2a]',
                )}
              >
                {spotsLabel(texts, card.spots)}
              </span>
              {card.location && (
                <span className="flex min-w-0 items-center gap-0.5 truncate text-[11px] text-ff-charcoal">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{card.location}</span>
                </span>
              )}
            </span>
          </span>
          {!soldOut && (
            <span className="shrink-0 rounded-full bg-ff-near-black px-3 py-1.5 font-display text-xs font-bold text-white transition group-hover:bg-black">
              {texts.bookLabel}
            </span>
          )}
        </>
      </SmartLink>
    )
  }

  if (card.kind === 'workshop') {
    return (
      <SmartLink href={card.href} onClick={onNavigate} className={cn(base, 'flex-col items-stretch gap-1.5')}>
        <>
          <span className="flex items-baseline justify-between gap-2">
            <span className="font-display text-sm font-bold">{card.title}</span>
            <span className="shrink-0 text-xs font-semibold">{card.price}</span>
          </span>
          {card.description && (
            <span className="line-clamp-2 text-xs leading-relaxed text-ff-charcoal">{card.description}</span>
          )}
          <span className="flex items-center justify-between gap-2 pt-0.5">
            <span className="flex min-w-0 items-center gap-1 text-[11px] text-ff-charcoal">
              {card.nextDate && (
                <>
                  <CalendarDays className="size-3 shrink-0" />
                  <span className="truncate">
                    {texts.nextDateLabel}: {card.nextDate}
                  </span>
                </>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-1 font-display text-xs font-bold">
              {texts.viewLabel}
              <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
            </span>
          </span>
        </>
      </SmartLink>
    )
  }

  return (
    <SmartLink href={card.href} onClick={onNavigate} className={base}>
      <>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-sm font-bold">{card.title}</span>
          {card.description && (
            <span className="block truncate text-xs text-ff-charcoal">{card.description}</span>
          )}
          {card.outOfStock && (
            <span className="mt-1 inline-block rounded-full bg-ff-warm-gray px-2 py-0.5 text-[11px] font-semibold text-ff-charcoal">
              {texts.outOfStockLabel}
            </span>
          )}
        </span>
        {card.price && <span className="shrink-0 text-sm font-semibold">{card.price}</span>}
        <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
      </>
    </SmartLink>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1.5" aria-label="…">
      <span className="size-1.5 animate-bounce rounded-full bg-ff-charcoal [animation-delay:-0.3s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-ff-charcoal [animation-delay:-0.15s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-ff-charcoal" />
    </span>
  )
}

function Chips({ items, onPick, disabled }: { items: string[]; onPick: (q: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => onPick(q)}
          className="rounded-full border border-ff-near-black/15 bg-white px-3 py-1.5 text-left text-xs shadow-sm transition hover:border-ff-near-black hover:bg-ff-near-black hover:text-white disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  )
}

const fieldClass =
  'w-full rounded-lg border border-ff-border-light bg-ff-cream px-3 py-2 text-base focus:border-ff-near-black/40 focus:bg-white focus:outline-none sm:text-sm'

function HandoffForm({
  texts,
  locale,
  initialMessage,
  transcript,
  onSent,
}: {
  texts: ChatTexts
  locale: string
  initialMessage: string
  transcript: { role: 'user' | 'assistant'; content: string }[]
  onSent: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(initialMessage)
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/chat/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, locale, transcript, website }),
      })
      if (!res.ok) throw new Error(String(res.status))
      onSent()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-2 rounded-xl border border-ff-border-light bg-white p-3 shadow-sm animate-in fade-in slide-in-from-bottom-1"
    >
      <p className="flex items-center gap-1.5 font-display text-sm font-bold">
        <Mail className="size-4" />
        {texts.handoffTitle}
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, 100))}
        placeholder={texts.handoffNameLabel}
        aria-label={texts.handoffNameLabel}
        autoComplete="name"
        className={fieldClass}
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value.slice(0, 254))}
        placeholder={texts.handoffEmailLabel}
        aria-label={texts.handoffEmailLabel}
        autoComplete="email"
        className={fieldClass}
      />
      <textarea
        required
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
        placeholder={texts.handoffMessageLabel}
        aria-label={texts.handoffMessageLabel}
        className={cn(fieldClass, 'resize-none')}
      />
      {/* Honeypot: hidden from people, bots fill it in. */}
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        name="website"
        className="hidden"
      />
      {status === 'error' && <p className="text-xs text-ff-shop-burgundy">{texts.handoffError}</p>}
      <button
        type="submit"
        disabled={status === 'sending' || !email.trim() || !message.trim()}
        className="w-full rounded-full bg-ff-near-black py-2 font-display text-sm font-bold text-white transition hover:bg-black disabled:opacity-40"
      >
        {status === 'sending' ? '…' : texts.handoffSend}
      </button>
      <p className="text-[11px] leading-snug text-ff-gray-text-light">
        <MessageText text={texts.handoffConsent} />
      </p>
    </form>
  )
}

function Feedback({
  texts,
  value,
  onChange,
}: {
  texts: ChatTexts
  value?: 'up' | 'down'
  onChange: (value: 'up' | 'down') => void
}) {
  if (value) {
    return <p className="text-[11px] text-ff-gray-text-light">{texts.feedbackThanks}</p>
  }
  const btn =
    'flex size-7 items-center justify-center rounded-full text-ff-charcoal transition hover:bg-white hover:text-ff-near-black hover:shadow-sm'
  return (
    <div className="flex items-center gap-1 text-[11px] text-ff-gray-text-light">
      <span className="mr-1">{texts.feedbackQuestion}</span>
      <button type="button" className={btn} onClick={() => onChange('up')} aria-label={texts.feedbackYes} title={texts.feedbackYes}>
        <ThumbsUp className="size-3.5" />
      </button>
      <button type="button" className={btn} onClick={() => onChange('down')} aria-label={texts.feedbackNo} title={texts.feedbackNo}>
        <ThumbsDown className="size-3.5" />
      </button>
    </div>
  )
}

export function ChatWidget({ locale, texts }: { locale: string; texts: ChatTexts }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Welcome bubble: once per visit, a few seconds after the page loads.
  useEffect(() => {
    if (!texts.teaser) return
    try {
      if (sessionStorage.getItem(TEASER_KEY)) return
    } catch {
      return
    }
    const timer = window.setTimeout(() => setTeaser(true), TEASER_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [texts.teaser])

  const hideTeaser = useCallback(() => {
    setTeaser(false)
    try {
      sessionStorage.setItem(TEASER_KEY, '1')
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (open) hideTeaser()
  }, [open, hideTeaser])

  // Restore the conversation for this browser tab.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as { messages?: ChatMessage[] }
        if (Array.isArray(parsed.messages)) setMessages(parsed.messages)
      }
    } catch {
      // Storage unavailable (private mode etc.) — start fresh.
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages }))
    } catch {
      // ignore
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!open) return
    // Small delay so the mobile keyboard doesn't fight the open animation.
    const focus = window.setTimeout(() => inputRef.current?.focus(), 150)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    // Full-screen on phones: stop the page behind from scrolling.
    const mobile = window.matchMedia('(max-width: 639px)').matches
    const previousOverflow = document.body.style.overflow
    if (mobile) document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(focus)
      window.removeEventListener('keydown', onKey)
      if (mobile) document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Auto-grow the message box up to ~5 lines.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }, [input, open])

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim().slice(0, MAX_INPUT)
      if (!question || busy) return
      const history: ChatMessage[] = [...messages, { role: 'user', content: question }]
      setMessages([...history, { role: 'assistant', content: '' }])
      setInput('')
      setBusy(true)

      const setReply = (reply: Omit<ChatMessage, 'role'>) =>
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', ...reply }
          return next
        })

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // The API only needs plain text; cards are flattened into the text.
          body: JSON.stringify({
            messages: history.map((m) => ({
              role: m.role,
              content: m.role === 'assistant' ? replyToText({ text: m.content, cards: m.cards }) : m.content,
            })),
            locale,
          }),
        })
        if (!res.ok || !res.body) {
          setReply({ content: res.status === 429 ? texts.rateLimitText : texts.errorText })
          return
        }

        if (res.headers.get('content-type')?.includes(CHAT_REPLY_JSON_TYPE)) {
          const reply = (await res.json()) as ChatReply
          // Short pause so the typing dots don't just flash.
          await new Promise((r) => setTimeout(r, 350))
          setReply({
            content: reply.text || texts.errorText,
            cards: reply.cards,
            actions: reply.actions,
            suggestions: reply.suggestions,
            handoff: reply.handoff,
          })
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let reply = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          reply += decoder.decode(value, { stream: true })
          setReply({ content: reply })
        }
        reply += decoder.decode()
        setReply({ content: reply.trim() || texts.errorText })
      } catch {
        setReply({ content: texts.errorText })
      } finally {
        setBusy(false)
      }
    },
    [busy, locale, messages, texts.errorText, texts.rateLimitText],
  )

  const updateMessage = (index: number, patch: Partial<ChatMessage>) =>
    setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)))

  const plainTranscript = () =>
    messages
      .filter((m) => m.content)
      .map((m) => ({
        role: m.role,
        content: m.role === 'assistant' ? replyToText({ text: m.content, cards: m.cards }) : m.content,
      }))

  const lastQuestion = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

  const reset = () => {
    if (busy) return
    setMessages([])
    inputRef.current?.focus()
  }

  // Close the full-screen sheet on phones when a card or link takes the visitor to another page.
  const closeOnMobile = () => {
    if (window.matchMedia('(max-width: 639px)').matches) setOpen(false)
  }

  // Product pages have a sticky "add to cart" bar on smaller screens.
  const liftOnMobile = pathname?.startsWith('/products/')
  const last = messages[messages.length - 1]
  const canSend = !busy && input.trim().length > 0

  return (
    <div
      className={cn(
        'fixed right-4 z-80 flex flex-col items-end gap-3 sm:right-6',
        liftOnMobile ? 'bottom-24 lg:bottom-6' : 'bottom-4 sm:bottom-6',
      )}
    >
      {open && (
        <div
          role="dialog"
          aria-label={texts.title}
          className={cn(
            'flex flex-col overflow-hidden bg-ff-cream text-ff-near-black',
            // Phones: full-screen sheet. Larger screens: floating panel above the button.
            'fixed inset-0 sm:static sm:inset-auto',
            'sm:h-[min(620px,calc(100dvh-7rem))] sm:w-[400px] sm:rounded-3xl sm:border sm:border-ff-border-light sm:shadow-[0_24px_60px_-12px_rgba(26,26,26,0.35)]',
            'animate-in fade-in slide-in-from-bottom-4 duration-200 sm:zoom-in-95 sm:origin-bottom-right',
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-ff-near-black px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white sm:py-3.5">
            <Avatar size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[15px] font-bold leading-tight">{texts.title}</p>
              <p className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7bc47f] opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#7bc47f]" />
                </span>
                {texts.subtitle}
              </p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                disabled={busy}
                aria-label={texts.resetLabel}
                title={texts.resetLabel}
                className="rounded-full p-2 transition hover:bg-white/10 disabled:opacity-50"
              >
                <RotateCcw className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={texts.closeLabel}
              title={texts.closeLabel}
              className="rounded-full p-2 transition hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Conversation */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5"
            aria-live="polite"
          >
            <div className="flex items-end gap-2">
              <Avatar />
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
                <MessageText text={texts.greeting} />
              </div>
            </div>

            {messages.length === 0 && texts.suggestedQuestions.length > 0 && (
              <div className="pl-9">
                <Chips items={texts.suggestedQuestions} onPick={send} />
              </div>
            )}

            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div
                  key={i}
                  className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ff-near-black px-3.5 py-2.5 text-sm leading-relaxed text-white animate-in fade-in slide-in-from-bottom-1"
                >
                  {m.content}
                </div>
              ) : (
                <div key={i} className="space-y-2.5 animate-in fade-in slide-in-from-bottom-1">
                  <div className="flex items-end gap-2">
                    <Avatar />
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
                      {m.content ? <MessageText text={m.content} /> : <TypingDots />}
                    </div>
                  </div>

                  {m.cards && m.cards.length > 0 && (
                    <div className="space-y-2 pl-9">
                      {m.cards.map((card, j) => (
                        <CardView key={j} card={card} texts={texts} onNavigate={closeOnMobile} />
                      ))}
                    </div>
                  )}

                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-9">
                      {m.actions.map((a) => (
                        <SmartLink
                          key={a.href + a.label}
                          href={a.href}
                          onClick={closeOnMobile}
                          className="inline-flex items-center gap-1 rounded-full bg-ff-gold-accent px-3 py-1.5 font-display text-xs font-bold text-ff-near-black transition hover:bg-ff-gold-accent-dark"
                        >
                          <>
                            {a.label}
                            <ArrowRight className="size-3" />
                          </>
                        </SmartLink>
                      ))}
                    </div>
                  )}

                  {m.handoff && !m.handoffSent && (
                    <div className="pl-9">
                      <HandoffForm
                        texts={texts}
                        locale={locale}
                        initialMessage={lastQuestion}
                        transcript={plainTranscript()}
                        onSent={() => {
                          updateMessage(i, { handoffSent: true })
                          setMessages((prev) => [...prev, { role: 'assistant', content: texts.handoffSuccess }])
                        }}
                      />
                    </div>
                  )}

                  {m === last && !busy && m.content && !m.handoff && m.content !== texts.handoffSuccess && (
                    <div className="pl-9">
                      <Feedback
                        texts={texts}
                        value={m.feedback}
                        onChange={(value) => updateMessage(i, { feedback: value, ...(value === 'down' ? { handoff: true } : {}) })}
                      />
                    </div>
                  )}

                  {m === last && !busy && !m.handoff && m.suggestions && m.suggestions.length > 0 && (
                    <div className="pl-9">
                      <Chips items={m.suggestions} onPick={send} />
                    </div>
                  )}
                </div>
              ),
            )}
          </div>

          {/* Composer */}
          <form
            className="border-t border-ff-border-light bg-white px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3"
            onSubmit={(e) => {
              e.preventDefault()
              void send(input)
            }}
          >
            <div className="flex items-end gap-2 rounded-2xl border border-ff-border-light bg-ff-cream py-1.5 pl-3.5 pr-1.5 transition focus-within:border-ff-near-black/40 focus-within:bg-white">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send(input)
                  }
                }}
                rows={1}
                placeholder={texts.inputPlaceholder}
                aria-label={texts.inputPlaceholder}
                className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-base leading-snug placeholder:text-ff-gray-text-light focus:outline-none sm:text-sm"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label={texts.sendLabel}
                title={texts.sendLabel}
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full transition',
                  canSend
                    ? 'bg-ff-gold-accent text-ff-near-black hover:bg-ff-gold-accent-dark'
                    : 'bg-ff-warm-gray text-ff-charcoal/60',
                )}
              >
                <ArrowUp className="size-4" strokeWidth={2.5} />
              </button>
            </div>
            <p className="mt-2 px-1 text-center text-[11px] leading-snug text-ff-gray-text-light">
              <MessageText text={texts.privacyNote} />
            </p>
          </form>
        </div>
      )}

      {teaser && !open && (
        <div className="relative max-w-[260px] rounded-2xl rounded-br-md bg-white py-3 pl-4 pr-8 text-sm leading-snug text-ff-near-black shadow-[0_10px_30px_-8px_rgba(26,26,26,0.45)] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button type="button" onClick={() => setOpen(true)} className="text-left">
            {texts.teaser}
          </button>
          <button
            type="button"
            onClick={hideTeaser}
            aria-label={texts.closeLabel}
            className="absolute right-1.5 top-1.5 rounded-full p-1 text-ff-charcoal transition hover:bg-ff-warm-gray"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? texts.closeLabel : texts.launcherLabel}
        className={cn(
          'group flex items-center gap-2 rounded-full bg-ff-near-black py-2 pl-2 pr-5 font-display text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(26,26,26,0.6)] transition hover:-translate-y-0.5 hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-ff-gold-accent focus-visible:ring-offset-2',
          open && 'hidden pr-2 sm:flex',
        )}
      >
        <span className="relative flex size-9 items-center justify-center rounded-full bg-ff-gold-accent text-ff-near-black">
          {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
          {!open && messages.length === 0 && (
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-ff-near-black bg-[#7bc47f]" />
          )}
        </span>
        <span className={cn(open && 'sr-only')}>{texts.launcherLabel}</span>
      </button>
    </div>
  )
}
