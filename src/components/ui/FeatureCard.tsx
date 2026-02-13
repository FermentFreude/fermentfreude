import { cn } from '@/utilities/cn'
import React from 'react'

interface FeatureCardProps {
  icon?: React.ReactNode
  title: string
  description: string
  className?: string
  variant?: 'default' | 'dark' | 'gold' | 'gold-light'
}

/**
 * Reusable feature/benefit card with icon, title, and description.
 * Used for benefits bars, feature grids, etc.
 */
export function FeatureCard({
  icon,
  title,
  description,
  className,
  variant = 'default',
}: FeatureCardProps) {
  const variantStyles = {
    default: 'bg-ff-ivory-mist text-ff-charcoal-dark',
    dark: 'bg-ff-charcoal text-ff-ivory-mist',
    gold: 'bg-ff-gold text-ff-charcoal-dark border border-[#d2d2d3]',
    'gold-light': 'bg-ff-gold-light text-ff-charcoal-dark',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-3xl p-7 text-center',
        variantStyles[variant],
        className,
      )}
    >
      {icon && <div className="flex size-12 items-center justify-center">{icon}</div>}
      <h3 className="text-lg font-bold capitalize">{title}</h3>
      <p className="text-sm font-semibold leading-relaxed">{description}</p>
    </div>
  )
}
