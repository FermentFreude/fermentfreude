import { OrderStatus as StatusOptions } from '@/payload-types'
import { cn } from '@/utilities/cn'

type Props = {
  status: StatusOptions
  className?: string
  /** Optional override for the displayed label (e.g. "Confirmed" for digital/workshop orders). */
  label?: string
}

export const OrderStatus: React.FC<Props> = ({ status, className, label }) => {
  return (
    <div
      className={cn(
        'text-xs tracking-widest font-mono uppercase py-0 px-2 rounded w-fit',
        className,
        {
          'bg-primary/10': status === 'processing',
          'bg-success': status === 'completed',
          'bg-destructive/10': status === 'cancelled' || status === 'refunded',
        },
      )}
    >
      {label ?? status}
    </div>
  )
}
