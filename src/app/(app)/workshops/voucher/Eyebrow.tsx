import type { ReactNode } from 'react'

/** Small caps label with the gold hairline used across the page */
export function Eyebrow({ children, tone = 'dark' }: { children: ReactNode; tone?: 'dark' | 'light' }) {
  return (
    <p
      className={`mb-0 flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-[0.22em] ${
        tone === 'dark' ? 'text-[#4B4F4A]' : 'text-[#E6BE68]'
      }`}
    >
      <span className="h-px w-6 bg-[#E6BE68]" aria-hidden="true" />
      {children}
    </p>
  )
}
