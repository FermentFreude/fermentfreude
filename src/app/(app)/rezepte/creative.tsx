/* ═══════════════════════════════════════════════════════════════
 *  /rezepte — motion
 *  ff-fade (cards, ready-on date) · ff-kenburns (slow zoom on the
 *  hero photo) · ferment timeline (line draws, stops pop in, bubbles
 *  rise, icons wiggle on hover; triggered by <InView>). All switch off
 *  with prefers-reduced-motion.
 * ═══════════════════════════════════════════════════════════════ */

/** Keyframes used on /rezepte. Render once per page. */
export function MotionStyles() {
  return (
    <style>{`
@keyframes ff-fade { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes ff-kenburns { from { transform: scale(1) } to { transform: scale(1.09) } }
.ff-fade { animation: ff-fade .45s ease-out both }
.ff-kenburns { animation: ff-kenburns 8s ease-out both }
@keyframes ff-grow-x { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes ff-pop { 0% { opacity: 0; transform: scale(.55) } 70% { opacity: 1; transform: scale(1.08) } 100% { opacity: 1; transform: scale(1) } }
@keyframes ff-dot-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes ff-rise { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-2.2px) } }
@keyframes ff-wiggle { 0%, 100% { transform: rotate(0) } 30% { transform: rotate(-9deg) } 65% { transform: rotate(7deg) } }
/* timeline (recipe page): line draws, stops pop in one after another, bubbles rise */
[data-anim=pending] .ff-tl-line { transform: scaleX(0) }
[data-anim=pending] .ff-tl-stop, [data-anim=pending] .ff-tl-dot { opacity: 0 }
[data-anim=in] .ff-tl-line { transform-origin: left; animation: ff-grow-x 1.3s cubic-bezier(.2,.7,.2,1) both }
[data-anim=in] .ff-tl-stop { animation: ff-pop .6s cubic-bezier(.2,.7,.2,1) both; animation-delay: var(--d, 0s) }
[data-anim=in] .ff-tl-dot { animation: ff-dot-in .4s ease-out both; animation-delay: var(--d, .6s) }
.ff-bubbles circle { animation: ff-rise 2.4s ease-in-out infinite }
.ff-bubbles circle:nth-child(2) { animation-delay: .5s }
.ff-bubbles circle:nth-child(3) { animation-delay: 1s }
.ff-bubbles circle:nth-child(4) { animation-delay: 1.5s }
.ff-tl-icon:hover svg { animation: ff-wiggle .5s ease-in-out }
@media (prefers-reduced-motion: reduce) {
  .ff-fade, .ff-kenburns, .ff-bubbles circle, .ff-tl-icon:hover svg { animation: none !important }
  [data-anim] .ff-tl-line, [data-anim] .ff-tl-stop, [data-anim] .ff-tl-dot { animation: none !important; transform: none !important; opacity: 1 !important }
}
`}</style>
  )
}
