import clsx from 'clsx'
import Image from 'next/image'

interface IconLogoProps {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

/**
 * Icon Logo — FF monogram / submark (square)
 * Used in: Navbar center
 * Source: /icon-logo.svg
 */
export function IconLogo({ className, width = 53, height = 50, priority = false }: IconLogoProps) {
  return (
    <Image
      src="/icon-logo.svg"
      alt="FermentFreude"
      width={width}
      height={height}
      className={clsx('h-9 md:h-10 lg:h-11 w-auto', className)}
      priority={priority}
    />
  )
}
