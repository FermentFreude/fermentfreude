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
        'hidden sm:flex absolute top-1/2 -translate-y-1/2 z-40',
        'items-center justify-center',
        'w-10 md:w-12 h-24 md:h-32 lg:h-40',
        'group/arrow cursor-pointer',
        isLeft ? 'left-0' : 'right-0',
      )}
    >
      {/* Filled circle — positioned to hang off the edge, always half-cut */}
      <span
        className={cn(
          'absolute rounded-full transition-all duration-300 ease-out',
          'w-24 md:w-32 h-24 md:h-32 group-hover/arrow:w-44 md:group-hover/arrow:w-52 group-hover/arrow:h-44 md:group-hover/arrow:h-52',
          isLeft
            ? '-left-12 md:-left-16 group-hover/arrow:-left-22 md:group-hover/arrow:-left-26'
            : '-right-12 md:-right-16 group-hover/arrow:-right-22 md:group-hover/arrow:-right-26',
        )}
        style={{ backgroundColor: panelColor }}
        aria-hidden="true"
      />
      {/* Chevron — always on screen, nudges inward on hover */}
      <svg
        className={cn(
          'relative w-5 md:w-6 h-5 md:h-6 transition-transform duration-300',
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
