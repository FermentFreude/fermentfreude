'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * SplashScreen — Wave reveals logo, wave closes to reveal page
 *
 * Open:  SVG clipPath morphs thin-line-at-bottom → full-rect,
 *        progressively revealing charcoal bg + ivory FF logo.
 * Hold:  2 seconds with logo fully visible.
 * Close: Second clipPath morphs full-rect → thin-line-at-top,
 *        wave sweeps upward, progressively revealing the page beneath.
 */

/* ── Open wave paths (anchored to bottom, rise upward) ── */
const WAVE_OPEN_START =
  'M469.539032,263.986786H-0.000001L0,263.557617c66.11113,0.429169,351.088104,0.429169,469.539032,0.208344V263.986786z'

/* ── Close wave start (full rect anchored to top — shrinks upward) ── */
const WAVE_CLOSE_FULL =
  'M469.539032,0H-0.000001L0,263.986786c226.11113,0,182.887283,0.414484,469.539032,0V0z'

/* ── FF submark logo SVG paths ── */
const LOGO = {
  bg: 'M6.47284 50.292C2.89799 50.292 0 47.394 0 43.8192V6.47285C0 2.89799 2.89799 0 6.47285 0H46.4868C50.0617 0 52.9597 2.89799 52.9597 6.47285V43.8192C52.9597 47.394 50.0617 50.292 46.4868 50.292H6.47284Z',
  ff: 'M11.4531 10.5547H41.5049V40.8748H11.4531V10.5547ZM15.3196 35.6962L15.1533 36.5227L16.3231 36.4234C16.9644 36.3697 18.4268 36.2517 19.5698 36.1604C20.6914 36.0746 21.2656 36.0504 21.5098 35.7553C21.762 35.4494 21.66 34.8537 21.4454 33.6007C21.4319 33.5175 21.4185 33.4316 21.4024 33.3431C21.2656 32.5435 21.0939 30.9416 21.0187 29.7878L20.8819 27.6896L25.6741 28.0652V23.3535L23.2592 23.5118C21.118 23.6487 20.8416 23.6165 20.8148 23.2167C20.796 22.9672 20.745 22.4305 20.6967 22.0254L20.6082 21.2875H27.8206V15.2503H15.435L15.5799 16.1894C15.6604 16.7046 15.8106 19.9673 15.9099 23.434C16.0763 29.2512 15.9099 32.7474 15.3196 35.6962ZM25.1374 30.1286V36.3134H37.5177L37.3031 34.0997C36.9542 30.4747 37.1072 20.6435 37.5526 17.9335C37.7726 16.6053 37.8746 15.4515 37.7833 15.3683C37.5687 15.1805 31.9367 15.4703 31.7274 15.6823C31.6388 15.7681 31.7354 17.5793 31.9367 19.7044C32.1379 21.8295 32.2586 23.6514 32.2023 23.756C32.1459 23.858 31.0754 23.8714 29.825 23.7829L27.5523 23.6219V28.2289L32.3821 27.915V30.4908L25.1374 30.1286Z',
  cutout:
    'M15.3207 35.696C15.911 32.7471 16.0773 29.2509 15.911 23.4338C15.8117 19.9671 15.6614 16.7043 15.5809 16.1891L15.436 15.25H21.6289H27.8217V18.2686V21.2872H24.2155H20.6092L20.6978 22.0251C20.7461 22.4302 20.7971 22.9669 20.8158 23.2164C20.8427 23.6162 21.119 23.6484 23.2602 23.5116L25.6751 23.3533V25.7091V28.065L23.279 27.8771L20.8829 27.6893L21.0198 29.7876C21.0949 30.9413 21.2666 32.5432 21.4035 33.3428C21.865 36.0743 21.9294 35.9777 19.5708 36.1602C18.4278 36.2514 16.9655 36.3694 16.3242 36.4231L15.1543 36.5224L15.3207 35.696ZM25.1385 33.2194V30.1283L28.7608 30.3108L32.3831 30.4906V29.2026V27.9147L29.9682 28.073L27.5534 28.2286V25.9264V23.6216L29.826 23.7826C31.0764 23.8711 32.147 23.8577 32.2033 23.7557C32.2597 23.6511 32.1389 21.8292 31.9377 19.7041C31.7365 17.579 31.6399 15.7679 31.7284 15.682C31.9377 15.47 37.5697 15.1802 37.7844 15.3681C37.8756 15.4512 37.7736 16.605 37.5536 17.9332C37.1082 20.6432 36.9553 30.4745 37.3041 34.0995L37.5187 36.3131H31.3286H25.1385V33.2194Z',
} as const

/* ViewBox dimensions */
const VB_W = 469.539032
const VB_H = 263.986786
const VB_CX = VB_W / 2
const VB_CY = VB_H / 2

/* Logo intrinsic centre & display scale */
const LOGO_CX = 52.9597 / 2
const LOGO_CY = 50.292 / 2
const LOGO_SCALE = 2

export function SplashScreen() {
  const [phase, setPhase] = useState<'idle' | 'wave' | 'filled' | 'close' | 'done'>('idle')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('ff-splash-seen')) {
      setPhase('done')
      return
    }

    // Skip splash animation for users who prefer reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem('ff-splash-seen', '1')
      setPhase('done')
      return
    }

    document.body.style.overflow = 'hidden'

    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms)
      timers.current.push(id)
      return id
    }

    // Timeline:
    // 0–0.2s : idle — plain ivory screen
    // 0.2s   : wave open (1.5s CSS morph) — reveals charcoal + logo
    // 1.7s   : filled — logo fully visible, hold 1s
    // 2.7s   : close wave (1s CSS morph) — exits upward, reveals page
    // 3.7s   : done
    t(() => setPhase('wave'), 200)
    t(() => setPhase('filled'), 1700)
    t(() => setPhase('close'), 2700)
    t(() => {
      setPhase('done')
      sessionStorage.setItem('ff-splash-seen', '1')
      document.body.style.overflow = ''
    }, 3700)

    const currentTimers = timers.current
    return () => {
      currentTimers.forEach(clearTimeout)
      document.body.style.overflow = ''
    }
  }, [])

  if (phase === 'done') return null

  const waveStarted = phase !== 'idle'
  const isClosing = phase === 'close'

  return (
    <div className="splash-overlay fixed inset-0 z-9999" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Open: thin line at bottom → full rect */}
          <clipPath id="wave-reveal">
            <path className={waveStarted ? 'splash-wave-morph' : ''} d={WAVE_OPEN_START} />
          </clipPath>

          {/* Close: full rect → thin line at top (exits upward) */}
          <clipPath id="wave-close">
            <path className={isClosing ? 'splash-wave-close' : ''} d={WAVE_CLOSE_FULL} />
          </clipPath>
        </defs>

        {/* Outer group: during close, this clip shrinks everything away */}
        <g clipPath={isClosing ? 'url(#wave-close)' : undefined}>
          {/* Ivory background */}
          <rect width={VB_W} height={VB_H} fill="var(--ff-ivory)" />

          {/* Charcoal + logo: during open, clipped by the reveal wave */}
          <g clipPath={!isClosing ? 'url(#wave-reveal)' : undefined}>
            <rect width={VB_W} height={VB_H} fill="var(--ff-charcoal-dark)" />

            {/* Logo centred & scaled */}
            <g
              transform={`translate(${VB_CX}, ${VB_CY}) scale(${LOGO_SCALE}) translate(${-LOGO_CX}, ${-LOGO_CY})`}
            >
              <path d={LOGO.bg} fill="var(--ff-ivory)" />
              <path d={LOGO.ff} fill="var(--ff-charcoal-dark)" />
              <path d={LOGO.cutout} fill="var(--ff-ivory)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
