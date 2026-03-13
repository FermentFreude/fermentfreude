import { TestimonialsBlock as TestimonialsBlockComponent } from '@/blocks/Testimonials/Component'
import { getLocale } from '@/utilities/getLocale'
import { getTestimonialsGlobal } from '@/utilities/getTestimonialsGlobal'

interface TestimonialsGlobalWrapperProps {
  id?: string
}

/**
 * Server component that fetches global testimonials data and renders it.
 * Used across Home, Courses, and Workshops pages.
 */
export async function TestimonialsGlobalWrapper({ id }: TestimonialsGlobalWrapperProps) {
  const locale = await getLocale()
  const testimonials = await getTestimonialsGlobal(locale)

  return (
    <TestimonialsBlockComponent
      id={id}
      eyebrow={testimonials.eyebrow ?? 'Testimonials'}
      heading={testimonials.heading ?? 'What Our Community Says'}
      testimonials={testimonials.testimonials ?? []}
    />
  )
}
