import { cn } from '@/utilities/cn'
import Image from 'next/image'

interface CTABannerProps {
  title: string
  description: string
  backgroundImage?: string
  buttons: Array<{
    label: string
    href: string
    variant?: 'primary' | 'outline'
  }>
  className?: string
}

/**
 * Full-width call-to-action banner with background image overlay.
 * Used for "Ready to learn?" style sections.
 */
export function CTABanner({
  title,
  description,
  backgroundImage,
  buttons,
  className,
}: CTABannerProps) {
  return (
    <section className={cn('relative overflow-hidden rounded-[44px]', className)}>
      {/* Background image */}
      {backgroundImage && (
        <Image
          alt=""
          className="absolute inset-0 size-full object-cover"
          fill
          src={backgroundImage}
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 rounded-[44px] bg-black/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 py-24 text-center md:gap-10 md:px-16 md:py-32">
        <h2 className="text-3xl font-bold text-white md:text-5xl lg:text-[59px] lg:leading-tight">
          {title}
        </h2>
        <p className="max-w-3xl text-lg leading-relaxed text-white md:text-xl lg:text-2xl">
          {description}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          {buttons.map((button) => (
            <a
              className={cn(
                'inline-flex items-center justify-center rounded-2xl px-10 py-5 text-lg font-medium transition-colors md:text-xl',
                {
                  'bg-ff-charcoal text-white hover:bg-ff-near-black':
                    button.variant === 'primary' || !button.variant,
                  'border-[3px] border-ff-charcoal bg-white text-ff-charcoal hover:bg-ff-cream':
                    button.variant === 'outline',
                },
              )}
              href={button.href}
              key={button.label}
            >
              {button.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
