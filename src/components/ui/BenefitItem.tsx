import { cn } from '@/utilities/cn'

interface BenefitItemProps {
  title: string
  description: string
  className?: string
}

/**
 * Individual benefit item used in benefit lists/grids.
 * Shows a bullet dot, title, and description text.
 */
export function BenefitItem({ title, description, className }: BenefitItemProps) {
  return (
    <div className={cn('flex gap-4', className)}>
      <div className="mt-2 size-2.5 shrink-0 rounded-full bg-ff-charcoal" />
      <div>
        <h3 className="text-base font-bold text-ff-near-black md:text-lg">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ff-gray-text md:text-base">{description}</p>
      </div>
    </div>
  )
}
