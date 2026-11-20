/** Google Maps search link for a workshop venue (opens the Maps app on phones). */
export function mapsUrl(name?: string | null, address?: string | null): string {
  const query = [name, address].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Short venue label for tight spaces: "Ginery, Graz" (name + city from the address). */
export function shortLocation(name?: string | null, address?: string | null): string {
  const city = (address ?? '').match(/\b\d{4,5}\s+([^,]+)/)?.[1]?.trim()
  return [name, city].filter(Boolean).join(', ')
}
