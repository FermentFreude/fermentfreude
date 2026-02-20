import { cn } from '@/utilities/cn'

/**
 * NavArrow — Half-circle navigation arrow for the hero slider.
 * Sits at the edge of the hero section with an expanding circle on hover.
 */
export function NavArrow({
  direction,
  onClick,
  panelColor,
}: {
  direction: 'left' | 'right'
  onClick: () => void
  panelColor: string
}) {
  const isLeft = direction === 'left'
  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? 'Previous slide' : 'Next slide'}
      className={cn(
        'hidden md:flex absolute top-1/2 -translate-y-1/2 z-40',
        'items-center justify-center',
        'w-10 h-24',
        'group/arrow cursor-pointer',
        isLeft ? 'left-0' : 'right-0',
      )}
    >
      {/* Filled circle — positioned to hang off the edge, always half-cut */}
      <span
        className={cn(
          'absolute rounded-full transition-all duration-300 ease-out',
          'w-24 h-24 group-hover/arrow:w-44 group-hover/arrow:h-44',
          isLeft ? '-left-12 group-hover/arrow:-left-22' : '-right-12 group-hover/arrow:-right-22',
        )}
        style={{ backgroundColor: panelColor }}
        aria-hidden="true"
      />
      {/* Chevron — always on screen, nudges inward on hover */}
      <svg
        className={cn(
          'relative w-5 h-5 transition-transform duration-300',
          'text-white',
          isLeft ? 'ml-1 group-hover/arrow:translate-x-1' : 'mr-1 group-hover/arrow:-translate-x-1',
        )}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={isLeft ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
      </svg>
    </button>
  )
}
