export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—'
  // Pinned to Europe/Vienna — without it this reads the SERVER's local time
  // (UTC on Vercel), which can shift a date shown to a Vienna-based
  // customer by a full day near midnight.
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Vienna',
  })
}

export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}
