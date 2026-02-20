import { Media as MediaComponent } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/cn'

/**
 * SlideImage — Renders a CMS Media image, or a neutral placeholder when no image is set.
 */
export function SlideImage({
  media,
  className,
  priority,
  size,
}: {
  media: MediaType | null
  className?: string
  priority?: boolean
  size?: string
}) {
  if (media) {
    return (
      <MediaComponent resource={media} imgClassName={className} priority={priority} size={size} />
    )
  }
  // Placeholder
  return (
    <div className={cn('bg-[#ECE5DE] rounded-lg', className)} style={{ width: 200, height: 300 }} />
  )
}
