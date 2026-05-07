import type { ReactNode } from 'react'

/**
 * Minimal layout wrapper for the ticket print page.
 * Injects print-specific CSS that hides the site header, footer and nav
 * so the printed output is clean.
 */
export default function TicketPrintLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        @media print {
          header,
          footer,
          nav,
          [data-no-print],
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .ticket-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
      {children}
    </>
  )
}
