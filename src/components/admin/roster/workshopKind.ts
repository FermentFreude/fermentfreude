/** One hue per workshop type (mock-up palette, CSS vars defined in rosterStyles). */
export type WorkshopKind = 'kombucha' | 'lakto' | 'tempeh' | 'feld' | ''

export function workshopKind(title: string): WorkshopKind {
  const t = (title || '').toLowerCase()
  if (t.includes('kombucha')) return 'kombucha'
  if (t.includes('lakto')) return 'lakto'
  if (t.includes('tempeh')) return 'tempeh'
  if (t.includes('vom feld')) return 'feld'
  return ''
}

export function kindColor(title: string): string {
  const k = workshopKind(title)
  return k ? `var(--ff-${k})` : 'var(--ff-gold)'
}
