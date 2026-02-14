import clsx from 'clsx'
import Image from 'next/image'

interface SecondaryLogoProps {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

/**
 * Secondary Logo — Stacked version (wordmark + icon vertically)
 * Used in: Coming Soon page
 * Source: /secondary-logo.svg
 */
export function SecondaryLogo({
  className,
  width = 280,
  height = 120,
  priority = false,
}: SecondaryLogoProps) {
  return (
    <Image
      src="/secondary-logo.svg"
      alt="FermentFreude"
      width={width}
      height={height}
      className={clsx('h-auto w-auto', className)}
      priority={priority}
    />
  )
}
