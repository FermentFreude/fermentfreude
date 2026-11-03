'use client'

import { MessageCircle, RotateCcw, Send, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/utilities/cn'

import type { ChatTexts } from './defaults'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const STORAGE_KEY = 'ff-chat-assistant-v1'
const MAX_INPUT = 1500

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
      const href = match[2]
      const linkClass = 'font-semibold underline underline-offset-2 hover:text-ff-charcoal'
      if (href.startsWith('/') && !href.startsWith('//')) {
        nodes.push(
          <Link key={key++} href={href} className={linkClass}>
            {match[1]}
          </Link>,
        )
      } else if (/^https:\/\//.test(href) || /^mailto:/.test(href)) {
        nodes.push(
          <a key={key++} href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
            {match[1]}
          </a>,
        )
      } else {
        nodes.push(match[1])
      }
    } else if (match[3]) {
      nodes.push(<strong key={key++}>{match[3]}</strong>)
    }
    last = pattern.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function MessageText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {renderInline(line)}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  )
}

export function ChatWidget({ locale, texts }: { locale: string; texts: ChatTexts }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim().slice(0, MAX_INPUT)
      if (!question || busy) return
      const history: ChatMessage[] = [...messages, { role: 'user', content: question }]
      setMessages([...history, { role: 'assistant', content: '' }])
      setInput('')
      setBusy(true)

      const setReply = (content: string) =>
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content }
          return next
        })

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, locale }),
        })
        if (!res.ok || !res.body) {
          setReply(res.status === 429 ? texts.rateLimitText : texts.errorText)
          return
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let reply = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          reply += decoder.decode(value, { stream: true })
          setReply(reply)
        }
        reply += decoder.decode()
        setReply(reply.trim() || texts.errorText)
      } catch {
        setReply(texts.errorText)
      } finally {
        setBusy(false)
      }
    },
    [busy, locale, messages, texts.errorText, texts.rateLimitText],
  )

  const reset = () => {
    if (busy) return
    setMessages([])
    inputRef.current?.focus()
  }

  // Product pages have a sticky "add to cart" bar on smaller screens.
  const liftOnMobile = pathname?.startsWith('/products/')

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
          className="flex h-[min(560px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-ff-border-light bg-ff-cream text-ff-near-black shadow-2xl"
        >
          <div className="flex items-center justify-between gap-2 bg-ff-near-black px-4 py-3 text-white">
            <p className="font-display text-sm font-bold">{texts.title}</p>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  disabled={busy}
                  aria-label={texts.resetLabel}
                  title={texts.resetLabel}
                  className="rounded-full p-1.5 transition hover:bg-white/10 disabled:opacity-50"
                >
                  <RotateCcw className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={texts.closeLabel}
                className="rounded-full p-1.5 transition hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
              <MessageText text={texts.greeting} />
            </div>

            {messages.length === 0 && texts.suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {texts.suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-full border border-ff-near-black/20 bg-white px-3 py-1.5 text-left text-xs transition hover:border-ff-near-black hover:bg-ff-near-black hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div
                  key={i}
                  className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-ff-near-black px-3.5 py-2.5 text-sm leading-relaxed text-white"
                >
                  {m.content}
                </div>
              ) : (
                <div
                  key={i}
                  className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed shadow-sm"
                >
                  {m.content ? (
                    <MessageText text={m.content} />
                  ) : (
                    <span className="inline-flex gap-1 py-1" aria-label="…">
                      <span className="size-1.5 animate-bounce rounded-full bg-ff-charcoal [animation-delay:-0.3s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-ff-charcoal [animation-delay:-0.15s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-ff-charcoal" />
                    </span>
                  )}
                </div>
              ),
            )}
          </div>

          <form
            className="border-t border-ff-border-light bg-white px-3 pb-2 pt-3"
            onSubmit={(e) => {
              e.preventDefault()
              void send(input)
            }}
          >
            <div className="flex items-end gap-2">
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
                className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-ff-border-light bg-ff-cream px-3 py-2.5 text-base focus:border-ff-near-black focus:outline-none sm:text-sm"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label={texts.sendLabel}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ff-near-black text-white transition hover:bg-black disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-ff-charcoal">
              <MessageText text={texts.privacyNote} />
            </p>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? texts.closeLabel : texts.launcherLabel}
        className="flex items-center gap-2 rounded-full bg-ff-near-black px-4 py-3 font-display text-sm font-bold text-white shadow-lg transition hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-ff-gold-accent focus-visible:ring-offset-2"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span className={cn(open && 'sr-only')}>{texts.launcherLabel}</span>
      </button>
    </div>
  )
}
