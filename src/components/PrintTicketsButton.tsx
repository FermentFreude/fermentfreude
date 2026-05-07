'use client'

import { Printer } from 'lucide-react'

interface PrintTicketsButtonProps {
  label: string
}

export function PrintTicketsButton({ label }: PrintTicketsButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-6 py-3 bg-ff-near-black text-white rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium print:hidden"
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  )
}
