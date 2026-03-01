/**
 * GSAP animation presets for the Header / Navigation.
 *
 * Adapted from rafaela-studio portfolio header animations.
 * Uses GSAP since the project doesn't have framer-motion.
 */

/* ── Shared easing ─────────────────────────────────────────── */

/** Smooth cubic-bezier used across nav transitions (matches portfolio) */
export const NAV_CUBIC = 'cubic-bezier(0.76, 0, 0.24, 1)'
export const NAV_EASE = 'power4.inOut'
export const NAV_EASE_OUT = 'power4.out'

/* ── Desktop / shared link animations ──────────────────────── */

/** Blur applied to non-hovered links (matches portfolio: 4px blur, 0.6 opacity) */
export const LINK_BLUR = {
  blur: 4,
  opacity: 0.6,
  duration: 0.4,
  ease: 'power2.out',
}

/** Reset blur when nothing is hovered */
export const LINK_FOCUS = {
  blur: 0,
  opacity: 1,
  duration: 0.4,
  ease: 'power2.out',
}

/* ── Dropdown animations ───────────────────────────────────── */

export const DROPDOWN_ENTER = {
  height: 'auto',
  opacity: 1,
  y: 0,
  duration: 0.5,
  ease: 'power3.out',
}

export const DROPDOWN_EXIT = {
  height: 0,
  opacity: 0,
  y: -8,
  duration: 0.35,
  ease: 'power3.inOut',
}

/* ── Full-page overlay nav animations ──────────────────────── */

/** Background overlay: fades from 0 to full height, 1s duration */
export const OVERLAY_ENTER = {
  height: '100dvh',
  duration: 1,
  ease: NAV_EASE,
}

export const OVERLAY_EXIT = {
  height: 0,
  duration: 0.8,
  ease: NAV_EASE,
}

/**
 * Per-character translate animation.
 * Each character slides up from y:100% with staggered delays.
 * Matches the portfolio's `translate` variant timing:
 *   enter delay = i * 0.02
 *   exit delay = (wordLength - i) * 0.01
 */
export const CHAR_REVEAL = {
  duration: 0.8,
  ease: 'power4.out',
  /** Stagger delay between characters on enter */
  enterStagger: 0.02,
  /** Stagger delay between characters on exit */
  exitStagger: 0.01,
}

/** Menu/Close label crossfade */
export const LABEL_FADE = {
  duration: 0.35,
  ease: 'power2.out',
}

/** Hamburger bar cross-morphing */
export const BURGER_TRANSITION = {
  duration: 0.6,
  ease: 'power3.inOut',
}
