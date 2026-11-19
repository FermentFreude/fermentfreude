'use client'

/** "Rezept drucken" — the page's print styles keep only the recipe itself. */
export function PrintButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" />
        <path d="M6 14h12v7H6z" />
      </svg>
      {label}
    </button>
  )
}
