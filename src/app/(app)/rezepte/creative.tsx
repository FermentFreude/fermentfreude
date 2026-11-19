/* ═══════════════════════════════════════════════════════════════
 *  /rezepte — motion
 *  ff-fade (cards, ready-on date) · ff-kenburns (slow zoom on the
 *  hero photo). Both switch off with prefers-reduced-motion.
 * ═══════════════════════════════════════════════════════════════ */

/** Keyframes used on /rezepte. Render once per page. */
export function MotionStyles() {
  return (
    <style>{`
@keyframes ff-fade { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes ff-kenburns { from { transform: scale(1) } to { transform: scale(1.09) } }
.ff-fade { animation: ff-fade .45s ease-out both }
.ff-kenburns { animation: ff-kenburns 8s ease-out both }
@media (prefers-reduced-motion: reduce) { .ff-fade, .ff-kenburns { animation: none !important } }
`}</style>
  )
}
