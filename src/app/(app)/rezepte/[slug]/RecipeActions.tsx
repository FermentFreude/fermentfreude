'use client'

import { cn } from '@/utilities/cn'
import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  Recipe actions: one row of three equal buttons, icon above a short
 *  word: Drucken · Teilen · Pinnen (Pinterest), in one shared frame.
 *  "Teilen": phones open the native share sheet; desktops get a small
 *  menu with WhatsApp and "Link kopieren".
 * ═══════════════════════════════════════════════════════════════ */

type Labels = { print: string; share: string; pin: string; copyLink: string; copied: string }

// one calm toolbar instead of three heavy boxes: shared frame, thin dividers, equal round icons
const tile =
  'group flex flex-col items-center justify-center gap-2 px-1 py-3.5 font-display text-[0.8rem] font-bold text-[#2D2F2C] transition-colors hover:bg-[#FAF2E0]/70 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#E6BE68] first:rounded-l-2xl last:rounded-r-2xl'
// same size circle for all three: Sage (print), Mustard (share), Pinterest red (pin)
const chip =
  'grid size-10 place-items-center rounded-full shadow-[0_6px_14px_-8px_rgb(29_29_29/45%)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105'
const item =
  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-display text-[0.86rem] font-bold text-[#2D2F2C] transition-colors hover:bg-[#FAF2E0]'

export function RecipeActions({ url, title, image, labels }: { url: string; title: string; image?: string; labels: Labels }) {
  const [native, setNative] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => setNative(typeof navigator !== 'undefined' && typeof navigator.share === 'function'), [])

  // close the menu on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pinterest = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}${
    image ? `&media=${encodeURIComponent(image)}` : ''
  }`
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`

  const share = () => {
    if (native) navigator.share({ title, url }).catch(() => {})
    else setOpen((o) => !o)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setOpen(false)
      }, 1400)
    } catch {
      // clipboard blocked: nothing to do
    }
  }

  return (
    <div ref={box} className="relative print:hidden">
      <div className="grid grid-cols-3 divide-x divide-[#2D2F2C]/10 rounded-2xl bg-[#FFFEF9] ring-1 ring-[#2D2F2C]/10">
      <button type="button" className={tile} onClick={() => window.print()}>
        <span className={cn(chip, 'bg-[#B0C7B8] text-[#2D2F2C]')}>
          <PrintIcon />
        </span>
        {labels.print}
      </button>
      <button type="button" className={tile} onClick={share} aria-expanded={native ? undefined : open} aria-haspopup={native ? undefined : 'menu'}>
        <span className={cn(chip, 'bg-[#E6BE68] text-[#2D2F2C]')}>
          <ShareIcon />
        </span>
        {labels.share}
      </button>
      <a href={pinterest} target="_blank" rel="noopener noreferrer" className={tile}>
        {/* Pinterest's own red, so the logo is recognised at a glance */}
        <span className={cn(chip, 'bg-[#E60023] text-[#FFFEF9]')}>
          <PinIcon />
        </span>
        {labels.pin}
      </a>
      </div>

      {open && (
        <div
          role="menu"
          className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl border border-[#2D2F2C]/10 bg-[#FFFEF9] p-1.5 shadow-[0_18px_40px_-18px_rgb(29_29_29/35%)]"
        >
          <a role="menuitem" href={whatsapp} target="_blank" rel="noopener noreferrer" className={item} onClick={() => setOpen(false)}>
            <WhatsAppIcon />
            WhatsApp
          </a>
          <button role="menuitem" type="button" className={item} onClick={copy} aria-live="polite">
            <LinkIcon />
            {copied ? labels.copied : labels.copyLink}
          </button>
        </div>
      )}
    </div>
  )
}

const svg = { viewBox: '0 0 24 24', className: 'size-5', 'aria-hidden': true } as const

function PrintIcon() {
  return (
    <svg {...svg} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" />
      <path d="M6 14h12v7H6z" />
    </svg>
  )
}
function ShareIcon() {
  return (
    <svg {...svg} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
      <path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" />
    </svg>
  )
}
function LinkIcon() {
  return (
    <svg {...svg} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
    </svg>
  )
}
function WhatsAppIcon() {
  return (
    <svg {...svg} fill="currentColor">
      <path d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z" />
    </svg>
  )
}
function PinIcon() {
  // Pinterest "P" (white on the red circle)
  return (
    <svg {...svg} fill="currentColor">
      <path d="M12.3 3C7.4 3 4.9 6.5 4.9 9.4c0 1.8.7 3.4 2.1 4 .2.1.4 0 .5-.3l.2-.8c.1-.3 0-.4-.2-.6a3.6 3.6 0 0 1-.8-2.4c0-3.1 2.3-5.9 6-5.9 3.3 0 5.1 2 5.1 4.7 0 3.5-1.6 6.5-3.9 6.5-1.3 0-2.2-1-1.9-2.3.4-1.5 1-3.2 1-4.3 0-1-.5-1.8-1.6-1.8-1.3 0-2.3 1.3-2.3 3.1 0 1.1.4 1.9.4 1.9l-1.5 6.5c-.4 1.9-.1 4.3 0 4.5 0 .1.2.2.3 0 .1-.1 1.4-1.8 1.9-3.4l.7-2.9c.4.7 1.5 1.4 2.7 1.4 3.6 0 6-3.3 6-7.6C19.4 6.2 16.6 3 12.3 3Z" />
    </svg>
  )
}
