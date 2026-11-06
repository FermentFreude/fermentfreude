import { Download } from 'lucide-react'

/** Downloads the printable greeting card (A5, front + back), made from the card design on this page. */
export function DownloadCardButton({ label, file }: { label: string; file: string }) {
  return (
    <a
      href={file}
      download
      className="inline-flex min-h-13 items-center gap-2 rounded-full bg-[#1A1A1A] px-7 py-3.5 font-display text-base font-bold text-[#FAF2E0] transition hover:bg-[#333333]"
    >
      <Download className="size-4" aria-hidden="true" />
      {label}
    </a>
  )
}
