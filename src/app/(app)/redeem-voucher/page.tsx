import type { Metadata } from 'next'
import { RedeemVoucherClient } from './RedeemVoucherClient'

export const metadata: Metadata = {
  title: 'Gutschein einlösen | FermentFreude',
  description: 'Löse deinen FermentFreude Geschenkgutschein ein und buche deinen Workshop.',
}

export default function RedeemVoucherPage() {
  return <RedeemVoucherClient />
}
