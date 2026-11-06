import { cn } from '@/utilities/cn'

import { PointIcon } from './icons'

/* ═══════════════════════════════════════════════════════════════
 *  POINTS ROW — the one way we call out 3–4 short things anywhere on
 *  the site (Tempeh slide, chefs banner, voucher slide, "Warum
 *  Fermentation?"): a thin-line icon in a round outline, a bold title,
 *  one quiet line underneath. A hairline above the row ties it to the
 *  section. No numbers.
 *
 *  tone      'light' = ivory text + gold icons (on a dark photo)
 *            'dark'  = near-black text (on paper / ivory)
 *  phone     'grid'  = the points side by side, text only from tablet up
 *                      (or always, with `phoneText`)
 *            'list'  = one point per row with the icon on the left, text
 *                      always shown — for longer lines
 * ═══════════════════════════════════════════════════════════════ */

export type PointsRowItem = {
  icon?: string | null
  title: string
  text?: string | null
  id?: string | null
}

type Props = {
  items: PointsRowItem[]
  tone?: 'light' | 'dark'
  /** Alignment on phone/tablet (desktop is set by `alignLg`) */
  align?: 'start' | 'center'
  /** Alignment from desktop up (defaults to `align`) */
  alignLg?: 'start' | 'center'
  phone?: 'grid' | 'list'
  /** Keep the list (icon left, text right) on every screen, e.g. in a narrow side column */
  listAll?: boolean
  /** Grid on phone: show the short line too (keep the lines short) */
  phoneText?: boolean
  /** Smaller icon and title (tight places, e.g. a full-screen card on a phone) */
  size?: 'md' | 'sm'
  /** Hairline above the row */
  rule?: boolean
  /** Small heading above the points (under the hairline), e.g. "Zubereitung" */
  heading?: string | null
  className?: string
}

/** Phone list → equal columns from tablet up (Tailwind needs the classes spelled out) */
const LIST_COLS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
}

export function PointsRow({
  items,
  tone = 'dark',
  align = 'start',
  alignLg,
  phone = 'grid',
  listAll = false,
  phoneText = false,
  size = 'md',
  rule = true,
  heading,
  className,
}: Props) {
  if (!items.length) return null
  const light = tone === 'light'
  const lg = alignLg ?? align
  const list = phone === 'list' || listAll
  const sm = size === 'sm'

  const ring = light ? 'border-ff-ivory/25 text-ff-gold' : 'border-ff-near-black/25 text-ff-near-black'
  const title = light ? 'text-ff-ivory' : 'text-ff-near-black'
  const text = light ? 'text-ff-ivory/70' : 'text-ff-near-black/70'
  const hairline = light ? 'border-ff-gold/40' : 'border-ff-near-black/15'

  const row = (
    <ul
      className={cn(
        'm-0 grid list-none p-0',
        list
          ? cn('grid-cols-1 gap-y-4', listAll ? 'sm:gap-y-5' : cn('sm:gap-x-6 sm:gap-y-5', LIST_COLS[Math.min(items.length, 4)]))
          : 'gap-x-3 gap-y-5 sm:gap-x-6',
        rule && !heading && cn('border-t', sm ? 'pt-4' : 'pt-5 sm:pt-6', hairline),
        !heading && className,
      )}
      style={{
        // Phone list: one column; otherwise one equal column per point
        gridTemplateColumns: list ? undefined : `repeat(${items.length}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item, i) => (
        <li
          key={item.id ?? i}
          className={cn(
            'flex min-w-0',
            list
              ? cn('flex-row items-start gap-4 text-left', !listAll && 'sm:flex-col sm:gap-0')
              : cn('flex-col', align === 'center' ? 'items-center text-center' : 'items-start text-left'),
            list && cn(lg === 'center' ? 'lg:items-center lg:text-center' : 'lg:items-start lg:text-left'),
            !list &&
              (lg === 'center' ? 'lg:items-center lg:text-center' : 'lg:items-start lg:text-left'),
          )}
        >
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full border',
              sm ? 'size-9' : 'size-10 sm:size-11',
              ring,
            )}
          >
            <PointIcon icon={item.icon} className={sm ? 'size-4' : 'size-[18px] sm:size-5'} />
          </span>
          <span className={cn('min-w-0', list && (listAll ? 'pt-2' : 'pt-2 sm:pt-0'))}>
            <span
              className={cn(
                'block font-display font-bold leading-tight',
                sm ? 'mt-2 text-xs' : cn('text-sm sm:text-base', list ? (listAll ? '' : 'sm:mt-3') : 'mt-3'),
                title,
              )}
            >
              {item.title}
            </span>
            {item.text ? (
              <span
                className={cn(
                  'mt-1 block text-xs leading-snug sm:text-sm',
                  // Grid on phone: the line only from tablet up unless asked for; never on short screens
                  !list && !phoneText && 'hidden sm:block',
                  '[@media(max-height:700px)]:hidden',
                  text,
                )}
              >
                {item.text}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  )

  if (!heading) return row
  return (
    <div className={cn(rule && cn('border-t', sm ? 'pt-4' : 'pt-5 sm:pt-6', hairline), className)}>
      <p
        className={cn(
          'mb-4 font-display text-[11px] font-bold uppercase tracking-[0.14em]',
          light ? 'text-ff-ivory/70' : 'text-ff-near-black/60',
          align === 'center' ? 'text-center' : 'text-left',
          lg === 'center' ? 'lg:text-center' : 'lg:text-left',
        )}
      >
        {heading}
      </p>
      {row}
    </div>
  )
}
