const DEFAULT_HEADER_HEIGHT = 80
const SCROLL_BUFFER = 20

export function getHeaderScrollOffset(extra = SCROLL_BUFFER): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height')
  const headerHeight = parseFloat(raw)
  return (Number.isFinite(headerHeight) && headerHeight > 0 ? headerHeight : DEFAULT_HEADER_HEIGHT) + extra
}

export function scrollToSection(id: string, extraOffset = SCROLL_BUFFER): void {
  const el = document.getElementById(id)
  if (!el) return

  const top = el.getBoundingClientRect().top + window.scrollY - getHeaderScrollOffset(extraOffset)
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  window.history.replaceState(null, '', `#${id}`)
}
