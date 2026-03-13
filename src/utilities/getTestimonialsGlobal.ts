import type { TestimonialsGlobal } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Fetch the global Testimonials data (edit once in admin, used across all pages).
 * Falls back to hardcoded defaults if fetch fails.
 */
export async function getTestimonialsGlobal(locale: string = 'de'): Promise<TestimonialsGlobal> {
  try {
    const payload = await getPayload({ config })
    const testimonials = await payload.findGlobal({
      slug: 'testimonials-global',
      locale: locale === 'en' ? 'en' : 'de',
      depth: 0,
      draft: false,
    })

    return testimonials as TestimonialsGlobal
  } catch (error) {
    console.warn('Failed to fetch testimonials global:', error)
    // Return defaults if fetch fails
    return {
      eyebrow: locale === 'en' ? 'Testimonials' : 'Testimonials',
      heading: locale === 'en' ? 'What Our Community Says' : 'Was gefällt',
      testimonials: [],
      id: 'testimonials-global',
    } as TestimonialsGlobal
  }
}
