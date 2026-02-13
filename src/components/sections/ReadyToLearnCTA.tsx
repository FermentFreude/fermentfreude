import { CTABanner } from '@/components/ui/CTABanner'

/**
 * "Ready to learn?" CTA section with background image.
 * Links to workshops and online courses.
 */
export function ReadyToLearnCTA() {
  return (
    <div className="px-6 py-8 md:px-12 lg:px-20">
      <CTABanner
        backgroundImage="/assets/images/fermentation-cta.jpg"
        buttons={[
          { label: 'View workshops', href: '/workshops', variant: 'primary' },
          { label: 'Browse online courses', href: '/courses', variant: 'outline' },
        ]}
        description="Join our workshops and online courses to learn hands-on fermentation techniques, ask questions, and connect with a community of learners."
        title="Ready to learn?"
      />
    </div>
  )
}
