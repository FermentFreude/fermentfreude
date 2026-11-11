'use client'

import { useEffect, useState } from 'react'

import { Wordmark } from './Wordmark'

/* ═══════════════════════════════════════════════════════════════
 *  MAINTENANCE SCREEN (/wartung) — "Gleich wieder da." / "Back soon."
 *  Shown to visitors while the site is switched to maintenance mode
 *  (env MAINTENANCE_MODE=true, see src/middleware.ts). Design approved by
 *  Rafaela. Texts are fixed here on purpose: the page must not depend on
 *  the database, which may be in the middle of an update.
 * ═══════════════════════════════════════════════════════════════ */

type Lang = 'de' | 'en'

const TEXT: Record<Lang, { status: string; h1a: string; h1b: string; lead: string; mail: string }> =
  {
    en: {
      status: 'Maintenance',
      h1a: 'Back ',
      h1b: 'soon.',
      lead: 'We are currently performing maintenance on our website. Please try again later or contact us.',
      mail: 'E-mail',
    },
    de: {
      status: 'Wartungsarbeiten',
      h1a: 'Gleich ',
      h1b: 'wieder da.',
      lead: 'Wir führen gerade Wartungsarbeiten an unserer Website durch. Bitte versuche es später noch einmal oder kontaktiere uns.',
      mail: 'E-Mail',
    },
  }

const EMAIL = 'kontakt@fermentfreude.at'

const CSS = `
:root{--olive:#4B4F4A;--cream:#FAF2E0;--gold:#E6BE68;--goldlight:#EDD195;--ink:#1D1D1D;
--primary:'neue-haas-grotesk-display','Neue Haas Grotesk Display Pro','Helvetica Neue',Helvetica,Arial,sans-serif;color-scheme:dark}
.wt *{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden}
body{background:var(--olive)!important;color:var(--cream);font-family:var(--primary);-webkit-font-smoothing:antialiased;overflow-x:hidden}
.wt{background:var(--olive);color:var(--cream);font-family:var(--primary);height:100vh;height:100dvh;overflow:hidden;
padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.wt-stage{position:relative;height:100%;display:flex;flex-direction:column;max-width:1120px;margin:0 auto;padding-block:clamp(14px,3.5vh,40px)}
.wt-rings{position:fixed;left:50%;top:50%;width:150vmin;height:150vmin;transform:translate(-50%,-50%);pointer-events:none;z-index:0}
.wt-rings circle{fill:none;stroke:var(--gold);stroke-width:1;transform-origin:center;animation:wt-breathe 9s ease-in-out infinite}
.wt-rings circle:nth-child(2){animation-delay:-2s}.wt-rings circle:nth-child(3){animation-delay:-4s}.wt-rings circle:nth-child(4){animation-delay:-6s}
@keyframes wt-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
.wt-bubbles{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.wt-bubbles i{position:absolute;bottom:-40px;border:1px solid var(--gold);border-radius:50%;opacity:0;animation:wt-rise linear infinite}
@keyframes wt-rise{0%{transform:translateY(0);opacity:0}15%{opacity:.35}100%{transform:translateY(-110vh);opacity:0}}
.wt header,.wt main,.wt footer{position:relative;z-index:1}
.wt header{display:flex;justify-content:space-between;align-items:center;gap:16px}
.wt-cap{font-size:11px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;line-height:1}
.wt-status{display:flex;align-items:center;gap:10px;color:var(--gold)}
.wt-dot{width:8px;height:8px;border-radius:50%;background:var(--gold);animation:wt-pulse 2s ease-in-out infinite}
@keyframes wt-pulse{0%,100%{box-shadow:0 0 0 0 rgba(230,190,104,.5)}50%{box-shadow:0 0 0 8px rgba(230,190,104,0)}}
.wt-lang{display:flex;gap:4px}
.wt-lang button{font:inherit;background:none;border:1px solid rgba(230,190,104,.35);color:rgba(250,242,224,.7);padding:8px 12px;border-radius:999px;cursor:pointer;font-size:11px;letter-spacing:.18em;font-weight:700}
.wt-lang button[aria-pressed=true]{background:var(--gold);color:var(--ink);border-color:var(--gold)}
.wt-lang button:focus-visible,.wt a:focus-visible{outline:2px solid var(--goldlight);outline-offset:3px}
.wt main{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:clamp(10px,3.4vh,40px);padding-block:clamp(6px,3vh,60px);min-height:0}
.wt-logo{width:clamp(130px,min(46vw,48vh),460px);color:var(--cream)}
.wt-logo svg{display:block;width:100%;height:auto}
.wt-rule{width:56px;height:1px;background:rgba(230,190,104,.6)}
.wt h1{font-size:clamp(26px,min(6.4vw,9.5vh),76px);line-height:1;letter-spacing:-.035em;font-weight:700;-webkit-text-stroke:.022em currentColor;max-width:14ch;text-wrap:balance}
.wt h1 em{font-style:normal;color:var(--gold)}
.wt-lead{font-size:clamp(13px,min(2vw,2.7vh),20px);line-height:1.55;color:var(--goldlight);max-width:46ch;text-wrap:pretty;font-weight:400;-webkit-text-stroke:.5px currentColor}
.wt footer{display:flex;flex-wrap:wrap;justify-content:space-between;text-align:left;gap:16px 40px;border-top:1px solid rgba(230,190,104,.35);padding-top:22px;color:rgba(250,242,224,.6);font-size:13px;line-height:1.6;-webkit-text-stroke:.3px currentColor}
.wt footer .wt-cap{color:rgba(250,242,224,.6);margin-bottom:8px}
.wt footer a{color:inherit;text-decoration:none}
@media (prefers-reduced-motion:reduce){.wt-rings circle,.wt-bubbles i,.wt-dot{animation:none}.wt-bubbles{display:none}}
@media (max-height:520px){.wt footer{padding-top:10px;font-size:12px;gap:6px 24px}.wt-rule{display:none}}
`

type Bubble = { left: number; size: number; duration: number; delay: number }

export default function WartungPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  // Language: the visitor's earlier choice, else the site's language cookie, else the browser's
  useEffect(() => {
    let next: Lang = (navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en'
    try {
      const cookie = document.cookie.match(/(?:^|; )fermentfreude-locale=(de|en)/)?.[1]
      if (cookie === 'de' || cookie === 'en') next = cookie
      const saved = localStorage.getItem('ff-lang')
      if (saved === 'de' || saved === 'en') next = saved
    } catch {
      /* storage blocked: keep the default */
    }
    setLang(next)
    // Random positions are made after mount so server and browser HTML always match
    setBubbles(
      Array.from({ length: 14 }, () => ({
        left: Math.random() * 100,
        size: 8 + Math.random() * 26,
        duration: 14 + Math.random() * 16,
        delay: -Math.random() * 20,
      })),
    )
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const choose = (l: Lang) => {
    setLang(l)
    try {
      localStorage.setItem('ff-lang', l)
    } catch {
      /* ignore */
    }
  }

  const t = TEXT[lang]

  return (
    <div className="wt">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="wt-bubbles" aria-hidden="true">
        {bubbles.map((b, i) => (
          <i
            key={i}
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>
      <svg className="wt-rings" viewBox="-300 -300 600 600" aria-hidden="true">
        <circle r="110" opacity=".3" />
        <circle r="160" opacity=".22" />
        <circle r="210" opacity=".15" />
        <circle r="260" opacity=".1" />
      </svg>

      <div className="wt-stage">
        <header>
          <div className="wt-status wt-cap">
            <span className="wt-dot" />
            <span>{t.status}</span>
          </div>
          <div className="wt-lang" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === 'de'} onClick={() => choose('de')}>
              DE
            </button>
            <button type="button" aria-pressed={lang === 'en'} onClick={() => choose('en')}>
              EN
            </button>
          </div>
        </header>

        <main>
          <div className="wt-logo" role="img" aria-label="Fermentfreude">
            <Wordmark />
          </div>
          <div className="wt-rule" />
          <h1>
            {t.h1a}
            <em>{t.h1b}</em>
          </h1>
          <p className="wt-lead">{t.lead}</p>
        </main>

        <footer>
          <div>
            <div className="wt-cap">Fermentfreude OG</div>
            Grabenstraße 15, 8010 Graz
          </div>
          <div>
            <div className="wt-cap">{t.mail}</div>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
