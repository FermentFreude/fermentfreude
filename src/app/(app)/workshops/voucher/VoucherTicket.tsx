import type { CSSProperties } from 'react'

import { cn } from '@/utilities/cn'

import { FfWordmark } from './FfWordmark'

/* ═══════════════════════════════════════════════════════════════
 *  VOUCHER TICKET + GREETING CARD — Rafaela's voucher design
 *  (canvas "Gutschein Fermentfreude"), rebuilt as real markup so it
 *  stays sharp at any size.
 *
 *  Every measure comes from the 1000 px wide original and is written
 *  in container units: 1 px of the design = 0.1cqw. The ticket simply
 *  takes the width of its parent and scales as one piece.
 *
 *  variant  'workshop' = the €99 workshop voucher (olive + gold stub)
 *           'value'    = the €50 / €30 / €20 value vouchers
 * ═══════════════════════════════════════════════════════════════ */

const OLIVE = '#4B4F4A'
const GOLD = '#E6BE68'
const GOLD_LIGHT = '#EDD195'
const CREAM = '#FAF2E0'
const INK = '#1D1D1D'
const CHARCOAL = '#4B4B4B'

/** design px → container units */
const u = (px: number) => `${px / 10}cqw`

// Notches: half-circles at the perforation (top + bottom) and in the middle of both short sides
const STUB_X = 740
const notchMask = [
  `radial-gradient(circle at ${u(STUB_X)} 0, #0000 ${u(15)}, #000 ${u(16)})`,
  `radial-gradient(circle at ${u(STUB_X)} 100%, #0000 ${u(15)}, #000 ${u(16)})`,
  `radial-gradient(circle at 0 50%, #0000 ${u(12)}, #000 ${u(13)})`,
  `radial-gradient(circle at 100% 50%, #0000 ${u(12)}, #000 ${u(13)})`,
].join(',')

const maskStyle: CSSProperties = {
  WebkitMaskImage: notchMask,
  maskImage: notchMask,
  WebkitMaskComposite: 'source-in',
  maskComposite: 'intersect',
}

const caps: CSSProperties = {
  fontSize: u(11),
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  fontWeight: 700,
  lineHeight: 1,
}

export function GiftIcon({ size, strokeWidth = 1.5 }: { size: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <rect x="3" y="11" width="18" height="10" rx="1.5" />
      <rect x="2" y="7.5" width="20" height="3.5" rx="1.2" />
      <path d="M12 7.5V21" />
      <path d="M12 7.5C9.5 7.5 7 6.6 7 4.8S9.6 2.6 12 7.5C14.4 2.6 17 3 17 4.8S14.5 7.5 12 7.5z" />
    </svg>
  )
}

function Rings({ stroke, opacity }: { stroke: string; opacity: number[] }) {
  return (
    <svg
      viewBox="0 0 740 473"
      className="absolute left-0 top-0 h-full"
      style={{ width: '74%' }}
      fill="none"
      stroke={stroke}
      strokeWidth="1"
      aria-hidden="true"
      preserveAspectRatio="xMinYMin slice"
    >
      {[110, 160, 210, 260].map((r, i) => (
        <circle key={r} cx="255" cy="262" r={r} strokeOpacity={opacity[i]} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}

export type TicketText = {
  label: string
  title: string
  text: string
  footer: string
  stub: string
}

type TicketProps = {
  amount: number
  variant: 'workshop' | 'value'
  text: TicketText
  className?: string
  /** Accessible description of the whole picture */
  alt?: string
}

export function VoucherTicket({ amount, variant, text, className, alt }: TicketProps) {
  const isWorkshop = variant === 'workshop'
  return (
    <div
      className={cn('@container w-full', className)}
      role="img"
      aria-label={alt ?? `${text.label} €${amount}`}
    >
      <div
        className="relative w-full overflow-hidden font-display"
        style={{ aspectRatio: '1000 / 473', background: OLIVE, color: CREAM, ...maskStyle }}
      >
        <Rings stroke={GOLD} opacity={[0.3, 0.22, 0.15, 0.1]} />

        {/* double frame */}
        <div
          className="absolute"
          style={{
            left: u(22),
            top: u(22),
            width: u(716),
            height: u(429),
            border: '1px solid rgba(230,190,104,.5)',
            borderRadius: u(14),
          }}
        />
        <div
          className="absolute"
          style={{
            left: u(28),
            top: u(28),
            width: u(704),
            height: u(417),
            border: '1px solid rgba(230,190,104,.22)',
            borderRadius: u(10),
          }}
        />

        <div className="absolute" style={{ ...caps, left: u(56), top: u(58), color: GOLD }}>
          {text.label}
        </div>
        <div
          className="absolute"
          style={{ left: u(56), width: u(644), top: u(88), height: 1, background: 'rgba(230,190,104,.45)' }}
        />

        {/* € + value */}
        <div
          className="absolute font-bold"
          style={{ left: u(54), top: u(142), fontSize: u(58), lineHeight: 1, color: GOLD, letterSpacing: '-0.02em' }}
        >
          €
        </div>
        <div
          className="absolute font-bold tabular-nums"
          style={{
            left: u(isWorkshop ? 104 : 99),
            top: u(isWorkshop ? 112 : 108),
            fontSize: u(268),
            lineHeight: 1,
            color: GOLD,
            letterSpacing: '-0.06em',
          }}
        >
          {amount}
        </div>

        <div
          className="absolute whitespace-pre-line font-bold"
          style={{ left: u(420), top: u(158), width: u(240), fontSize: u(24), lineHeight: 1.12, letterSpacing: '-0.02em' }}
        >
          {text.title}
        </div>
        <div
          className="absolute font-sans"
          style={{
            left: u(420),
            top: u(isWorkshop ? 262 : 232),
            width: u(isWorkshop ? 278 : 240),
            fontSize: u(13),
            lineHeight: 1.55,
            color: GOLD_LIGHT,
          }}
        >
          {text.text}
        </div>

        <div
          className="absolute"
          style={{ left: u(56), width: u(644), top: u(400), height: 1, background: 'rgba(230,190,104,.45)' }}
        />
        <div className="absolute" style={{ ...caps, left: u(56), top: u(418), color: 'rgba(250,242,224,.55)' }}>
          {text.footer}
        </div>

        {/* gold stub */}
        <div className="absolute top-0 h-full" style={{ left: u(727), right: 0, background: GOLD, color: INK }}>
          <div
            className="absolute"
            style={{ left: u(12), top: u(30), bottom: u(30), borderLeft: `${u(2)} dashed rgba(29,29,29,.55)` }}
          />
          <div
            className="absolute top-0 flex h-full flex-col items-center justify-center"
            style={{ left: u(12), right: 0 }}
          >
            <div style={{ width: u(150) }}>
              <FfWordmark className="block h-auto w-full" />
            </div>
            <div style={{ width: u(34), height: 1, background: 'rgba(29,29,29,.5)', margin: `${u(56)} 0 ${u(34)}` }} />
            <GiftIcon size={u(30)} />
            <div style={{ ...caps, marginTop: u(20), letterSpacing: '0.26em' }}>{text.stub}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Greeting card (A5 landscape, 1000 × 709) ─────────────── */

export type CardText = {
  frontEyebrow: string
  frontWords: string
  backEyebrow: string
  backFor: string
  backFrom: string
}

const eyebrow: CSSProperties = {
  fontSize: u(12),
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: u(10),
}

export function GreetingCard({
  side,
  text,
  className,
  alt,
}: {
  side: 'front' | 'back'
  text: CardText
  className?: string
  alt?: string
}) {
  const front = side === 'front'
  return (
    <div className={cn('@container w-full', className)} role="img" aria-label={alt}>
      <div
        className="relative w-full overflow-hidden font-display"
        style={{
          aspectRatio: '1000 / 709',
          background: front ? GOLD : CREAM,
          color: INK,
          borderRadius: u(4),
        }}
      >
        <div
          className="absolute"
          style={{
            inset: u(20),
            border: `1px solid ${front ? 'rgba(29,29,29,.35)' : 'rgba(29,29,29,.18)'}`,
            borderRadius: u(22),
          }}
        />
        <div
          className="absolute font-sans"
          style={{ ...eyebrow, left: u(64), top: u(60), color: front ? INK : CHARCOAL }}
        >
          <GiftIcon size={u(20)} strokeWidth={1.6} />
          <span>{front ? text.frontEyebrow : text.backEyebrow}</span>
        </div>

        {front ? (
          <>
            <div
              className="absolute whitespace-pre-line font-bold"
              style={{ left: u(60), top: u(250), fontSize: u(150), lineHeight: 0.95, letterSpacing: '-0.045em' }}
            >
              {text.frontWords}
            </div>
            <div className="absolute" style={{ right: u(64), bottom: u(56), width: u(150) }}>
              <FfWordmark className="block h-auto w-full" />
            </div>
          </>
        ) : (
          <>
            <Line label={text.backFor} top={104} />
            <div className="absolute" style={{ left: u(64), right: u(64), top: u(190) }}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} style={{ height: u(56), borderBottom: '1px solid rgba(29,29,29,.28)' }} />
              ))}
            </div>
            <Line label={text.backFrom} bottom={66} />
            <div className="absolute" style={{ right: u(64), bottom: u(56), width: u(90) }}>
              <FfWordmark className="block h-auto w-full" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Line({ label, top, bottom }: { label: string; top?: number; bottom?: number }) {
  return (
    <div
      className="absolute flex items-end font-sans"
      style={{
        left: u(64),
        width: u(420),
        gap: u(14),
        ...(top !== undefined ? { top: u(top) } : { bottom: u(bottom ?? 0) }),
      }}
    >
      <span
        style={{ fontSize: u(11), letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: CHARCOAL }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: u(34), borderBottom: `1.5px solid ${INK}` }} />
    </div>
  )
}
