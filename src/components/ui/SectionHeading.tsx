import { cn } from '@/utilities/cn'

interface SectionHeadingProps {
  tag?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  tagVariant?: 'default' | 'light' | 'dark'
}

/**
 * Reusable section heading with optional tag + title + description.
 * Used across landing pages and info pages.
 */
export function SectionHeading({
  tag,
  title,
  description,
  align = 'left',
  className,
  titleClassName,
  descriptionClassName,
  tagVariant = 'default',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        {
          'items-start text-left': align === 'left',
          'items-center text-center': align === 'center',
        },
        className,
      )}
    >
      {tag && (
        <span
          className={cn(
            'inline-block rounded-full border px-5 py-2 text-sm font-medium tracking-wide',
            {
              'border-ff-charcoal/30 text-ff-charcoal': tagVariant === 'default',
              'border-white/30 text-white': tagVariant === 'light',
              'border-ff-near-black/30 text-ff-near-black': tagVariant === 'dark',
            },
          )}
        >
          {tag}
        </span>
      )}
      <h2 className={cn('text-section-heading', titleClassName)}>{title}</h2>
      {description && (
        <p
          className={cn(
            'content-narrow text-body-lg leading-relaxed text-ff-gray-text',
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
