/**
 * The dashboard's look (from the founders' mock-up "Fermentfreude Admin
 * Vorschau"): charcoal rail with the wordmark, warm paper content area, gold
 * only for the active state and primary actions, one hue per workshop type.
 *
 * Fonts: Neue Haas Grotesk (Typekit kit loaded by RosterClient), never Inter.
 *
 * Most existing views are styled inline with Payload's `--theme-*` variables.
 * Instead of rewriting every view, those variables are remapped to the brand
 * palette inside `.ff-roster`, so all views share the new look and still
 * follow Payload's light/dark switch (`html[data-theme]`).
 */
export const ROSTER_CSS = /* css */ `
.ff-roster {
  --ff-bg: #F5F3EE; --ff-surface: #FFFFFF; --ff-surface2: #F0EDE5; --ff-line: #E6E2D7; --ff-line2: #D9D3C4;
  --ff-fg: #2A2C28; --ff-muted: #6F726B;
  --ff-btn: #555954; --ff-btn-hover: #3A3E3A; --ff-btn-fg: #FFFFFF;
  --ff-gold: #E6BE68; --ff-gold-dark: #D4A654; --ff-gold-ink: #7A540C; --ff-gold-tint: #FBF3E1;
  --ff-rail: #3A3E3A; --ff-rail-fg: #F4EFE2;
  /* Status colours stay inside the brand: warm gray (calm / done), gold (needs a look), charcoal (problem). No green, red or orange. */
  --ff-ok-bg: #ECE5DE; --ff-ok-fg: #3A3E3A; --ff-warn-bg: #F6E7BC; --ff-warn-fg: #6B470A;
  --ff-bad-bg: #3A3E3A; --ff-bad-fg: #F9F0DC; --ff-info-bg: #F0EDE5; --ff-info-fg: #55584F;
  --ff-alert: #3A3E3A; --ff-bar-low: #E6BE68; --ff-bar-mid: #B8892F; --ff-bar-full: #3A3E3A;
  --ff-kombucha: #4B4F4A; --ff-lakto: #C9A04E; --ff-tempeh: #8C7A5E; --ff-feld: #A9A296;
  --ff-shadow: 0 1px 2px rgba(42,44,40,.05), 0 6px 20px rgba(42,44,40,.05);
  --ff-display: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);
  --ff-text: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);

  /* Payload theme variables → brand palette, inside the dashboard only */
  --theme-bg: var(--ff-bg);
  --theme-elevation-0: var(--ff-surface);
  --theme-elevation-50: var(--ff-surface2);
  --theme-elevation-100: var(--ff-line);
  --theme-elevation-150: var(--ff-line2);
  --theme-elevation-200: #CCC5B3;
  --theme-text: var(--ff-fg);

  background: var(--ff-bg);
  color: var(--ff-fg);
  font-family: var(--ff-text);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
html[data-theme='dark'] .ff-roster {
  --ff-bg: #181917; --ff-surface: #232522; --ff-surface2: #2B2D29; --ff-line: #383B35; --ff-line2: #45493F;
  --ff-fg: #F1EEE6; --ff-muted: #A5A89F;
  --ff-gold-ink: #F0D08F; --ff-gold-tint: #3A3220;
  --ff-btn: #6B6F6A; --ff-btn-hover: #7D817C; --ff-btn-fg: #FFFFFF; --ff-rail: #10110F; --ff-rail-fg: #EFEADC;
  --ff-ok-bg: #343730; --ff-ok-fg: #EAE5D6; --ff-warn-bg: #4A3C1C; --ff-warn-fg: #F0D08F;
  --ff-bad-bg: #F1EEE6; --ff-bad-fg: #1D1E1B; --ff-info-bg: #2B2D29; --ff-info-fg: #C7CABF;
  --ff-alert: #F1EEE6; --ff-bar-low: #E6BE68; --ff-bar-mid: #D4A654; --ff-bar-full: #E9E4D6;
  --ff-kombucha: #A8AC9F; --ff-lakto: #E6BE68; --ff-tempeh: #BBA583; --ff-feld: #8E897E;
  --ff-shadow: 0 1px 2px rgba(0,0,0,.3);
  --theme-elevation-200: #55594F;
}
.ff-roster *, .ff-roster *::before, .ff-roster *::after { box-sizing: border-box; }
.ff-roster button, .ff-roster input, .ff-roster select, .ff-roster textarea { font: inherit; color: inherit; }
.ff-roster h1, .ff-roster h2, .ff-roster h3, .ff-roster h4 { font-family: var(--ff-display); letter-spacing: -0.01em; text-wrap: balance; }
.ff-roster :focus-visible { outline: 2px solid var(--ff-gold); outline-offset: 2px; }

/* ── Shell ─────────────────────────────────────────────── */
.ff-app { display: grid; grid-template-columns: 240px minmax(0, 1fr); min-height: 100vh; }
.ff-rail {
  background: var(--ff-rail); color: var(--ff-rail-fg);
  padding: 26px 14px 18px; display: flex; flex-direction: column; gap: 4px;
  position: sticky; top: 0; height: 100vh; align-self: start; overflow-y: auto; overscroll-behavior: contain;
}
.ff-logo { padding: 0 10px 4px; color: var(--ff-rail-fg); display: flex; justify-content: center; }
.ff-logo svg { width: 100%; max-width: 178px; height: auto; display: block; }
.ff-sub { text-align: center; padding: 0 10px 18px; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; opacity: .5; }
.ff-prof {
  display: grid; justify-items: center; text-align: center; gap: 10px; margin: 0 0 22px; padding: 0 10px 20px; width: 100%; border: 0; border-radius: 0;
  border-bottom: 1px solid rgba(255,255,255,.14);
}
.ff-prof .ff-av { border: 3px solid rgba(255,255,255,.22); border-radius: 18px; }
.ff-prof small { display: block; opacity: .6; font-size: 10.5px; line-height: 1.2; margin-top: 3px; }
.ff-prof b { display: block; font-weight: 700; font-size: 20px; font-family: var(--ff-display); line-height: 1.3; overflow-wrap: anywhere; }
.ff-me {
  display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: rgba(255,255,255,.06); color: inherit; cursor: pointer;
  padding: 8px 10px; border-radius: 10px; font-family: var(--ff-display); font-size: 14px; font-weight: 600; text-align: left;
}
.ff-me:hover { background: rgba(255,255,255,.1); }
.ff-me span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ff-av {
  --s: 30px; width: var(--s); height: var(--s); border-radius: 22%; flex: 0 0 auto;
  display: inline-flex; align-items: center; justify-content: center; overflow: hidden;
  background: var(--ff-gold); color: #2A2C28; font-weight: 700; font-size: calc(var(--s) * .46);
  font-family: var(--ff-display);
}
.ff-av { box-shadow: inset 0 0 0 1px rgba(0,0,0,.14); }
.ff-av img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ff-gbtn {
  display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: transparent; color: inherit;
  opacity: .74; text-align: left; padding: 10px 12px; border-radius: 10px; cursor: pointer; font-weight: 500;
  font-family: var(--ff-display); font-size: 15px; transition: background .15s, opacity .15s;
}
.ff-gbtn svg { flex: 0 0 auto; opacity: .8; }
.ff-gbtn:hover { background: rgba(255,255,255,.07); opacity: 1; }
.ff-gbtn[aria-current='true'] { background: rgba(244,239,226,.13); opacity: 1; box-shadow: inset 3px 0 0 var(--ff-rail-fg); font-weight: 600; }
.ff-n {
  margin-left: auto; background: var(--ff-gold); color: #2A2C28; border-radius: 99px;
  font-size: 11px; font-weight: 700; padding: 1px 7px; font-family: var(--ff-text);
}
.ff-rfoot { margin-top: auto; display: grid; gap: 10px; padding: 10px; }
.ff-cmsbtn {
  display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,.28); background: rgba(255,255,255,.06); color: inherit;
  font-weight: 600; font-size: 13px; text-decoration: none; font-family: var(--ff-display);
}
.ff-cmsbtn:hover { border-color: var(--ff-rail-fg); background: rgba(244,239,226,.1); }
.ff-lang { display: flex; gap: 4px; }
.ff-lang button {
  flex: 1; border: 1px solid rgba(255,255,255,.22); background: transparent; color: inherit;
  border-radius: 8px; padding: 6px 0; cursor: pointer; font-weight: 600; opacity: .7;
}
.ff-lang button[aria-pressed='true'] { background: #D2DFD7; color: #2A2C28; border-color: #D2DFD7; opacity: 1; }
.ff-live { display: flex; align-items: center; gap: 6px; font-size: 11px; opacity: .5; }
.ff-live i { width: 6px; height: 6px; border-radius: 50%; background: var(--ff-gold); }

/* ── Navigation: groups with dropdown pages, mobile top bar + drawer ── */
.ff-topbar, .ff-scrim, .ff-closemenu { display: none; }
.ff-gwrap { display: grid; gap: 2px; }
.ff-grow { display: flex; align-items: stretch; gap: 2px; }
.ff-grow .ff-gbtn { flex: 1 1 auto; min-width: 0; }
.ff-gchev { flex: 0 0 38px; border: 0; background: transparent; color: inherit; opacity: .6; border-radius: 10px; cursor: pointer; display: grid; place-items: center; }
.ff-gchev:hover { background: rgba(255,255,255,.07); opacity: 1; }
.ff-gchev svg { transition: transform .18s; }
.ff-gchev.is-open svg { transform: rotate(180deg); }
.ff-sublist { display: grid; gap: 1px; margin: 2px 0 8px 22px; padding-left: 12px; border-left: 1px solid rgba(255,255,255,.16); }
.ff-subrow { display: flex; align-items: center; gap: 4px; }
.ff-subbtn {
  display: flex; align-items: center; gap: 8px; flex: 1 1 auto; min-width: 0; text-align: left; border: 0; background: transparent; color: inherit;
  opacity: .72; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-family: var(--ff-display); font-size: 14.5px; font-weight: 500;
}
.ff-subbtn:hover { background: rgba(255,255,255,.07); opacity: 1; }
.ff-subbtn[aria-current='true'] { opacity: 1; font-weight: 700; background: rgba(244,239,226,.13); box-shadow: inset 3px 0 0 var(--ff-rail-fg); }
.ff-subarr { display: inline-flex; gap: 2px; }
.ff-subarr button { border: 1px solid rgba(255,255,255,.22); background: transparent; color: inherit; border-radius: 6px; font-size: 10px; width: 26px; height: 26px; cursor: pointer; opacity: .8; }
.ff-subarr button:disabled { opacity: .25; cursor: default; }
.ff-subtools { display: flex; gap: 12px; padding: 6px 12px 2px; }
.ff-sublink { border: 0; background: none; color: inherit; opacity: .6; font-size: 12px; text-decoration: underline; cursor: pointer; padding: 0; font-family: var(--ff-text); }
.ff-sublink:hover { opacity: 1; }
.ff-gbtn:focus-visible, .ff-subbtn:focus-visible, .ff-gchev:focus-visible, .ff-burger:focus-visible { outline: 2px solid var(--ff-gold); outline-offset: 2px; }

.ff-main { min-width: 0; }
.ff-tabs {
  display: flex; align-items: center; gap: 6px; padding: 0 40px; border-bottom: 1px solid var(--ff-line);
  background: var(--ff-surface); overflow-x: auto; position: sticky; top: 0; z-index: 5;
}
.ff-tab {
  display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent;
  padding: 16px 14px 13px; border-bottom: 3px solid transparent; cursor: pointer; opacity: .55;
  white-space: nowrap; font-weight: 500; font-family: var(--ff-display); font-size: 15px; user-select: none;
}
.ff-tab:hover { opacity: .85; }
.ff-tab[aria-selected='true'] { border-color: var(--ff-gold); opacity: 1; font-weight: 700; }
.ff-tab[draggable='true'] { cursor: grab; }
.ff-tab.is-over { box-shadow: inset 3px 0 0 var(--ff-gold); opacity: 1; }
.ff-tab.is-dragging { opacity: .35; }
.ff-tab.is-arr { opacity: 1; outline: 1px dashed var(--ff-line2); outline-offset: -6px; border-radius: 8px; }
.ff-tab .ff-n { margin-left: 0; }
.ff-mainb {
  font-size: 10px; letter-spacing: .08em; text-transform: uppercase; background: var(--ff-gold);
  color: #2A2C28; border-radius: 99px; padding: 2px 7px; font-weight: 700; font-family: var(--ff-text);
}
.ff-mvb { border: 0; background: transparent; font-size: 18px; cursor: pointer; padding: 0 2px; opacity: .6; }
.ff-mvb:hover:not(:disabled) { opacity: 1; }
.ff-mvb:disabled { opacity: .2; cursor: default; }
.ff-arrsp { flex: 1; }
.ff-arrbtn {
  border: 1px solid var(--ff-line); background: transparent; border-radius: 8px; padding: 5px 10px;
  font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
}
.ff-arrbtn.is-on { background: var(--ff-btn); border-color: var(--ff-btn); color: var(--ff-btn-fg); }
.ff-page { padding: 36px 40px 72px; max-width: 1120px; }
.ff-page.is-wide { max-width: 1440px; }

/* ── Shared pieces for the views ───────────────────────── */
.ff-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 26px; }
.ff-viewtoggle { display: inline-flex; padding: 3px; gap: 2px; border: 1px solid var(--ff-line); border-radius: 12px; background: var(--ff-surface); flex: 0 0 auto; }
.ff-viewtoggle button { display: inline-flex; align-items: center; gap: 7px; border: 0; background: transparent; color: var(--ff-fg); padding: 8px 14px; border-radius: 9px; cursor: pointer; font-weight: 600; font-size: 14px; font-family: var(--ff-display); min-height: 40px; }
.ff-viewtoggle button:hover { background: var(--ff-surface2); }
.ff-viewtoggle button[aria-pressed='true'] { background: var(--ff-btn); color: var(--ff-btn-fg); cursor: default; }
.ff-viewtoggle button:focus-visible { outline: 2px solid var(--ff-gold); outline-offset: 1px; }
.ff-head h1 { font-size: 28px; margin: 0; }
.ff-head p { margin: 6px 0 0; color: var(--ff-muted); max-width: 64ch; }
.ff-eyebrow { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; font-weight: 600; color: var(--ff-gold-ink); }
.ff-panel { background: var(--ff-surface); border: 1px solid var(--ff-line); border-radius: 16px; box-shadow: var(--ff-shadow); }
.ff-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--ff-line);
  background: var(--ff-surface); padding: 8px 14px; border-radius: 10px; cursor: pointer; font-weight: 600;
  font-family: var(--ff-display); font-size: 14px; text-decoration: none; color: var(--ff-fg); white-space: nowrap;
}
.ff-btn:hover:not(:disabled) { border-color: var(--ff-btn); }
.ff-btn:disabled { opacity: .5; cursor: default; }
.ff-btn.is-gold { background: var(--ff-btn); border-color: var(--ff-btn); color: var(--ff-btn-fg); }
.ff-btn.is-gold:hover:not(:disabled) { background: var(--ff-btn-hover); border-color: var(--ff-btn-hover); }
.ff-btn.is-sm { padding: 5px 10px; font-size: 12px; border-radius: 8px; }
.ff-btn.is-tint { background: var(--ff-surface2); border-color: var(--ff-line2); color: var(--ff-fg); }
.ff-btn.is-tint:hover:not(:disabled) { background: var(--ff-btn); border-color: var(--ff-btn); color: var(--ff-btn-fg); }
.ff-btn.is-danger { color: var(--ff-fg); }
.ff-btn.is-danger:hover:not(:disabled) { border-color: var(--ff-alert); }
.ff-namebtn { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: inherit; cursor: pointer; text-align: left; }
.ff-namebtn:hover { text-decoration: underline; color: var(--ff-gold-ink); }
.ff-link { background: none; border: 0; padding: 0; font-weight: 600; text-decoration: underline; cursor: pointer; color: var(--ff-gold-ink); }
.ff-pill { display: inline-flex; align-items: center; border-radius: 99px; padding: 3px 10px; font-size: 11px; font-weight: 600; letter-spacing: .02em; line-height: 1.3; white-space: nowrap; }
.ff-pill.ok { background: var(--ff-ok-bg); color: var(--ff-ok-fg); }
.ff-pill.warn { background: var(--ff-warn-bg); color: var(--ff-warn-fg); }
.ff-pill.bad { background: var(--ff-bad-bg); color: var(--ff-bad-fg); }
.ff-pill.info { background: var(--ff-info-bg); color: var(--ff-info-fg); }
.ff-pill.ff-pillgrey { background: var(--ff-btn); color: var(--ff-btn-fg); font-weight: 700; }
.ff-pill.neu { background: var(--ff-surface2); color: var(--ff-muted); }
.ff-pill.gold { background: var(--ff-gold-tint); color: var(--ff-gold-ink); }
/* Notes / attention: severity badges = dark grey, bold white text (same as the buttons) */
.ff-nside .ff-pill, .ff-nrow .ff-pill, .ff-alert .ff-pill { background: var(--ff-btn); color: var(--ff-btn-fg); font-weight: 700; }
.ff-note { background: var(--ff-warn-bg); color: var(--ff-warn-fg); border-radius: 12px; padding: 11px 15px; margin-bottom: 16px; font-weight: 500; }
.ff-info { background: var(--ff-gold-tint); color: var(--ff-gold-ink); border-radius: 12px; padding: 13px 16px; margin-bottom: 18px; }
.ff-err { background: var(--ff-bad-bg); color: var(--ff-bad-fg); border-radius: 12px; padding: 11px 15px; font-weight: 500; }
.ff-field { display: grid; gap: 6px; }
.ff-field > span { font-size: 12px; font-weight: 600; color: var(--ff-muted); }
.ff-input, .ff-roster textarea.ff-input, .ff-roster select.ff-input {
  width: 100%; padding: 9px 12px; border: 1px solid var(--ff-line); border-radius: 10px; background: var(--ff-surface);
}
.ff-input:focus { outline: 2px solid var(--ff-gold); outline-offset: 0; border-color: var(--ff-gold); }
.ff-muted { color: var(--ff-muted); }
.ff-toast {
  position: fixed; left: 50%; transform: translateX(-50%); bottom: 24px; z-index: 60; max-width: 90vw;
  background: var(--ff-rail); color: var(--ff-rail-fg); padding: 11px 18px; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.18); font-weight: 500;
}
.ff-modal { position: fixed; inset: 0; background: rgba(20,20,18,.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50; }
.ff-dlg { background: var(--ff-surface); border: 1px solid var(--ff-line); border-radius: 16px; width: 100%; max-width: 520px; max-height: 90vh; overflow: auto; padding: 24px; }
.ff-dlg.is-wide { max-width: 720px; }
.ff-dlg h3 { margin: 0 0 10px; font-size: 20px; }
.ff-acts { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; margin-top: 18px; }

/* ── E-Mails tab ───────────────────────────────────────── */
.ff-mailgrp { margin: 28px 0 10px; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--ff-muted); font-family: var(--ff-text); font-weight: 700; }
.ff-mailrow {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 18px; align-items: center; width: 100%;
  padding: 14px 18px; text-align: left; cursor: pointer; border: 0; border-top: 1px solid var(--ff-line); background: transparent;
}
.ff-mailrow:first-child { border-top: 0; }
.ff-mailrow:hover { background: var(--ff-gold-tint); }
.ff-mailrow b { font-family: var(--ff-display); font-size: 16px; }
.ff-mailrow .when { color: var(--ff-muted); font-size: 13px; }
.ff-mailrow .subj { font-size: 13px; overflow-wrap: anywhere; }
.ff-mailrow .side { display: grid; gap: 4px; justify-items: end; font-size: 12px; color: var(--ff-muted); text-align: right; }
.ff-mailed { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: start; }
.ff-mailed .ff-preview { position: sticky; top: 76px; }
.ff-preview iframe { width: 100%; height: 76vh; border: 0; border-radius: 0 0 16px 16px; background: #fff; display: block; }
.ff-prevbar { display: flex; gap: 10px; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--ff-line); font-size: 12px; color: var(--ff-muted); }
.ff-mfield { display: grid; gap: 6px; padding: 14px 18px; border-top: 1px solid var(--ff-line); }
.ff-mfield:first-child { border-top: 0; }
.ff-mfield.is-changed { box-shadow: inset 4px 0 0 var(--ff-gold); background: color-mix(in srgb, var(--ff-gold-tint) 55%, transparent); }
.ff-mfield.is-bad { box-shadow: inset 4px 0 0 var(--ff-alert); }
.ff-mfield label { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; font-weight: 600; color: var(--ff-muted); }
.ff-mfield textarea { width: 100%; min-height: 44px; resize: vertical; padding: 9px 12px; border: 1px solid var(--ff-line); border-radius: 10px; background: var(--ff-surface); line-height: 1.5; }
.ff-mfield textarea:focus { outline: 2px solid var(--ff-gold); outline-offset: 0; border-color: var(--ff-gold); }
.ff-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.ff-chip { font-size: 11px; background: var(--ff-surface2); color: var(--ff-muted); border: 1px solid var(--ff-line); border-radius: 6px; padding: 1px 7px; }
.ff-savebar {
  position: sticky; bottom: 0; z-index: 4; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  padding: 14px 18px; margin-top: 16px; background: var(--ff-surface); border: 1px solid var(--ff-line);
  border-radius: 14px; box-shadow: 0 -6px 20px rgba(42,44,40,.08);
}
.ff-savebar .grow { flex: 1; min-width: 160px; color: var(--ff-muted); font-size: 13px; }
.ff-ver { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 11px 18px; border-top: 1px solid var(--ff-line); flex-wrap: wrap; }
.ff-ver:first-child { border-top: 0; }


/* ── Workshop day (day sheet) ──────────────────────────── */
.ff-dayhead { --hero: var(--ff-rail); --on: var(--ff-rail-fg); padding: 0; display: block; border: 0; background: var(--hero); color: var(--on); overflow: hidden; }
.ff-dayhead h1, .ff-dayhead .ff-datebox b, .ff-dayhead .ff-datebox span, .ff-dayhead .ff-lside b { color: var(--on); }
.ff-dayhead .ff-datebox small, .ff-dayhead .ff-lsub, .ff-dayhead .ff-lside .ff-muted { color: var(--on); opacity: .78; }
.ff-dayhead .ff-bar { background: color-mix(in srgb, var(--on) 22%, transparent); }
.ff-dayhead .ff-lmain .ff-bar i { background: var(--on); }
.ff-dayhead .ff-pill { background: var(--on); color: var(--hero); }
.ff-dayhead .ff-dact { border-top: 1px solid color-mix(in srgb, var(--on) 22%, transparent); }
.ff-dayhead .ff-dact .ff-btn { background: color-mix(in srgb, var(--on) 10%, transparent); border-color: color-mix(in srgb, var(--on) 30%, transparent); color: var(--on); }
.ff-dayhead .ff-dact .ff-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--on) 20%, transparent); }
.ff-dayhead .ff-dact .ff-btn.is-gold { background: var(--on); border-color: var(--on); color: var(--hero); font-weight: 700; }
.ff-dayhead .ff-dact .ff-btn:disabled { opacity: .5; }
.ff-dtop { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: 20px; align-items: center; padding: 30px 30px 28px; }
.ff-dayhead h1 { font-size: 24px; margin: 0; }
.ff-bar { height: 7px; border-radius: 99px; background: var(--ff-surface2); overflow: hidden; }
.ff-bar i { display: block; height: 100%; border-radius: 99px; background: var(--c2, var(--c, var(--ff-gold))); }
.ff-dact { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; padding: 16px 26px 18px; border-top: 1px solid var(--ff-line); }
.ff-sheet { display: grid; gap: 12px; background: none; border: 0; box-shadow: none; overflow: visible; }
.ff-srow {
  display: grid; grid-template-columns: minmax(260px, 2.4fr) minmax(150px, 1.5fr) 118px 240px; grid-template-rows: auto 1fr auto;
  gap: 14px 24px; align-items: start; padding: 20px 26px;
  background: var(--ff-surface); border: 1px solid var(--ff-line); border-left: 5px solid var(--c); border-radius: 16px; box-shadow: var(--ff-shadow);
}
.ff-shead {
  align-items: center; font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--ff-muted);
  background: none; border: 0; border-left: 5px solid transparent; box-shadow: none; padding-top: 0; padding-bottom: 0; margin-bottom: -4px;
}
.ff-srow .c-n { display: grid; gap: 10px; min-width: 0; }
.ff-ctl { display: grid; gap: 3px; margin-top: 2px; font-size: 13px; color: var(--ff-muted); }
.ff-ctl-line { min-width: 0; }
.ff-ctl-line b { color: var(--ff-fg); font-weight: 600; }
.ff-ctl-mail { overflow-wrap: anywhere; }
.ff-ctl-booked { color: var(--ff-fg); }
.ff-ctl-booked b { font-weight: 700; }
.ff-srow .c-n { grid-column: 1; grid-row: 1 / span 3; }
.ff-srow .c-p { grid-column: 2; grid-row: 1 / span 3; }
.ff-srow .c-t { grid-column: 3; grid-row: 1 / span 3; }
.ff-srow .c-s { grid-column: 4; grid-row: 1; justify-items: end; text-align: right; }
.ff-srow .c-a { grid-column: 4; grid-row: 2; align-self: end; }
.ff-srow .c-i { grid-column: 4; grid-row: 3; display: flex; gap: 16px; justify-content: flex-end; font-size: 13px; margin-top: -4px; white-space: nowrap; }
.ff-shead { grid-template-rows: auto; }
.ff-shead > :nth-child(1) { grid-column: 1; grid-row: 1; }
.ff-shead > :nth-child(3) { grid-column: 2; grid-row: 1; }
.ff-shead > :nth-child(4) { grid-column: 3; grid-row: 1; }
.ff-shead > :nth-child(2) { grid-column: 4; grid-row: 1; text-align: right; }
.ff-shead > :nth-child(5) { display: none; }
.ff-srow .c-s { display: grid; gap: 3px; justify-items: start; padding-top: 2px; }
.ff-srow .c-s b { font-family: var(--ff-display); font-size: 22px; font-weight: 600; line-height: 1; }
.ff-srow .c-s .ff-lbl { font-size: 12px; }
.ff-srow .c-s { display: flex; align-items: center; justify-content: flex-end; gap: 12px; text-align: right; }
.ff-srow .c-s .ff-seatcount { display: grid; gap: 3px; justify-items: end; }
.ff-srow .c-p, .ff-srow .c-t { display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-start; align-content: flex-start; padding-top: 3px; }
.ff-srow .c-a { display: flex; gap: 6px; flex-wrap: nowrap; justify-content: flex-end; align-items: center; }
.ff-srow .c-t .ff-pill { white-space: normal; }
.ff-manualwrap { display: inline-flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.ff-manualby { font-size: 11px; color: var(--ff-muted); line-height: 1.2; }
.ff-srow.is-click { cursor: pointer; }
.ff-srow.is-click:hover { box-shadow: 0 2px 4px rgba(0,0,0,.06), 0 8px 22px rgba(0,0,0,.08); }
.ff-seat { display: flex; gap: 10px; align-items: baseline; }
.ff-seat .ff-seatno { white-space: nowrap; font-size: 12px; color: var(--ff-muted); margin-left: 8px; }
.ff-seat .nm { font-weight: 600; font-size: 16px; text-align: left; }
.ff-seat.is-gone .nm { font-weight: 500; text-decoration: line-through; color: var(--ff-muted); }
.ff-printno { display: none; }
.ff-manualrow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ff-manual {
  display: inline-flex; align-items: center; gap: 5px; border-radius: 99px; padding: 3px 11px; font-size: 11px; font-weight: 700; letter-spacing: .04em;
  text-transform: uppercase; background: var(--ff-gold); color: #2A2C28;
}
.ff-contact { font-size: 12.5px; color: var(--ff-muted); line-height: 1.45; overflow-wrap: anywhere; }
/* A note on a seat (diet, allergy, "booked by email"): quiet text with a gold rule, not a coloured box. */
.ff-allergy { display: block; margin: 3px 0 0; font-size: 12.5px; line-height: 1.5; font-weight: 500; color: var(--ff-fg); border-left: 2px solid var(--ff-gold); padding-left: 10px; opacity: .85; }
/* "More" menu on a row: keeps the main actions in one tidy line. */
.ff-rowmenu { position: relative; }
.ff-rowmenu > summary { list-style: none; cursor: pointer; }
.ff-rowmenu > summary::-webkit-details-marker { display: none; }
.ff-menu {
  position: absolute; right: 0; top: calc(100% + 6px); min-width: 200px; z-index: 30; display: grid; gap: 2px; padding: 6px;
  background: var(--ff-surface); border: 1px solid var(--ff-line); border-radius: 12px; box-shadow: 0 12px 32px rgba(42,44,40,.16);
}
.ff-menu button { text-align: left; background: none; border: 0; padding: 9px 12px; border-radius: 8px; cursor: pointer; font: inherit; font-weight: 600; color: var(--ff-fg); }
.ff-menu button:hover:not(:disabled) { background: var(--ff-gold-tint); }
.ff-menu button:disabled { opacity: .45; cursor: default; }
.ff-rowmenu:not([open]) .ff-menu { display: none; }
.ff-menu hr { border: 0; border-top: 1px solid var(--ff-line); margin: 4px 2px; }
.ff-pick { display: grid; gap: 6px; max-height: 240px; overflow: auto; margin: 8px 0 4px; padding: 10px 12px; border: 1px solid var(--ff-line); border-radius: 12px; }
.ff-chk { display: flex; gap: 10px; align-items: center; cursor: pointer; }
.ff-pick2 { display: flex; gap: 12px; align-items: flex-start; border: 1px solid var(--ff-line); border-radius: 12px; padding: 10px 12px; cursor: pointer; }
.ff-pick2 input { margin-top: 3px; }
.ff-pick2 small { display: block; color: var(--ff-muted); font-size: 12.5px; }
.ff-pick2:has(input:checked) { border-color: var(--ff-gold); background: var(--ff-gold-tint); }
.ff-pick2[aria-disabled='true'] { opacity: .55; cursor: default; }
@media (max-width: 1280px) {
  .ff-srow .c-a { flex-wrap: wrap; }
}
@media (max-width: 1400px) {
  /* Tablet and phone (used at the door on the day): one card = name + seats on top, then status, source/payment, big buttons. */
  .ff-shead { display: none; }
  .ff-sheet { gap: 12px; }
  .ff-srow { grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: none; gap: 12px 14px; padding: 18px 18px 16px; }
  .ff-srow .c-n { grid-column: 1; grid-row: 1; min-width: 0; }
  .ff-srow .c-s { grid-column: 2; grid-row: 1; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start; gap: 8px; padding-top: 2px; text-align: right; }
  .ff-srow .c-s .ff-seatcount { display: flex; align-items: baseline; gap: 6px; justify-items: unset; }
  .ff-srow .c-s b { font-size: 24px; }
  .ff-srow .c-s .ff-lbl { font-size: 13px; }
  .ff-srow .c-t { grid-column: 1 / -1; grid-row: 2; padding-top: 0; }
  .ff-srow .c-p { grid-column: 1 / -1; grid-row: 3; padding-top: 0; }
  .ff-srow .c-t:empty, .ff-srow .c-p:empty { display: none; }
  .ff-srow .c-a { grid-column: 1 / -1; grid-row: 4; justify-content: stretch; gap: 8px; padding-top: 14px; border-top: 1px solid var(--ff-line); }
  .ff-srow .c-a > .ff-btn { flex: 1 1 0; min-height: 44px; justify-content: center; font-size: 14px; }
  .ff-srow .c-a > .ff-rowmenu { flex: 0 0 52px; }
  .ff-srow .c-a > .ff-rowmenu > summary { min-height: 44px; width: 100%; display: inline-flex; align-items: center; justify-content: center; }
  .ff-srow .c-i { grid-column: 1 / -1; grid-row: 5; justify-content: flex-start; margin-top: 0; gap: 22px; font-size: 14px; }
  .ff-srow .c-i .ff-link { padding: 6px 0; }
  .ff-srow.is-click:hover { box-shadow: var(--ff-card-shadow, 0 1px 2px rgba(0,0,0,.05)); }
  .ff-seat .nm { font-size: 17px; }
  .ff-ctl-line { font-size: 14px; }
  .ff-dact .ff-btn { min-height: 44px; }
}
@media (max-width: 520px) {
  .ff-srow { padding: 16px 14px 14px; border-radius: 14px; }
  .ff-srow .c-a { gap: 6px; }
  .ff-srow .c-a > .ff-btn { padding-left: 8px; padding-right: 8px; }
  .ff-srow .c-s .ff-manual { font-size: 10px; padding: 3px 9px; }
  .ff-srow .c-s .ff-manualwrap { margin-right: auto; align-items: flex-start; }
  /* phone: seats + manual badge get their own row on top so the name can use the full width */
  .ff-srow .c-s { grid-column: 1 / -1; grid-row: 1; flex-direction: row; align-items: center; justify-content: flex-end; }
  .ff-srow .c-n { grid-column: 1 / -1; grid-row: 2; }
  .ff-srow .c-t { grid-row: 3; }
  .ff-srow .c-p { grid-row: 4; }
  .ff-srow .c-a { grid-row: 5; }
  .ff-srow .c-i { grid-row: 6; }
}
@media (max-width: 700px) {
  .ff-dtop { grid-template-columns: 52px minmax(0, 1fr); padding: 18px 16px; }
  .ff-dtop .ff-lside { grid-column: 1 / -1; justify-items: start; text-align: left; }
  .ff-dact { padding-left: 16px; padding-right: 16px; }
}


/* ── Notes & conversations ─────────────────────────────── */
.ff-fchips { display: flex; gap: 8px; flex-wrap: wrap; padding: 20px 20px 16px; }
.ff-fchip {
  border: 1px solid var(--ff-line); background: var(--ff-surface); border-radius: 99px; padding: 6px 12px;
  cursor: pointer; font-weight: 600; font-size: 13px; display: inline-flex; gap: 8px; align-items: center;
}
.ff-fchip b { font-size: 11px; color: var(--ff-muted); }
.ff-fchip[aria-pressed='true'] { background: var(--ff-btn); border-color: var(--ff-btn); color: var(--ff-btn-fg); }
.ff-fchip[aria-pressed='true'] b { color: var(--ff-btn-fg); opacity: .85; }
.ff-nwrap { position: relative; }
.ff-nwrap > .ff-nrow { width: 100%; padding-right: 64px; }
.ff-ndel { position: absolute; top: 12px; right: 14px; display: flex; gap: 6px; align-items: center; font-size: 12px; background: var(--ff-surface); border-radius: 10px; padding: 2px; }
.ff-xbtn { min-width: 30px; padding-left: 8px; padding-right: 8px; font-weight: 700; }
.ff-alerts { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); bottom: max(16px, env(safe-area-inset-bottom, 0px)); z-index: 70; display: grid; gap: 10px; width: min(360px, calc(100vw - 32px)); }
.ff-alert { position: relative; background: var(--ff-surface); border: 1px solid var(--ff-line); border-left: 5px solid var(--ff-gold); border-radius: 16px; box-shadow: 0 12px 34px rgba(0,0,0,.2); animation: ff-alert-in .25s ease-out; }
.ff-alert-main { display: flex; gap: 12px; align-items: flex-start; width: 100%; text-align: left; background: none; border: 0; padding: 14px 40px 14px 14px; cursor: pointer; color: var(--ff-fg); font: inherit; }
.ff-alert-main > span { display: grid; gap: 2px; min-width: 0; }
.ff-alert-main small { color: var(--ff-muted); }
.ff-alert-text { overflow-wrap: anywhere; margin-top: 4px; background: var(--ff-gold-tint); border-radius: 12px; padding: 7px 11px; }
.ff-alert-x { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border: 0; border-radius: 50%; background: transparent; cursor: pointer; color: var(--ff-muted); font-size: 14px; }
.ff-alert-x:hover { background: var(--ff-line); }
@keyframes ff-alert-in { from { transform: translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .ff-alert { animation: none; } }
.ff-nrow {
  display: flex; gap: 14px; align-items: center; width: 100%; padding: 13px 20px; border: 0; border-top: 1px solid var(--ff-line);
  background: transparent; text-align: left; cursor: pointer; flex-wrap: wrap; opacity: .86;
}
.ff-nrow:hover { background: var(--ff-gold-tint); opacity: 1; }
.ff-nrow.is-unread { opacity: 1; background: var(--ff-gold-tint); box-shadow: inset 5px 0 0 var(--ff-gold); }
.ff-nrow.is-unread .ff-nmain > b { font-weight: 800; }
.ff-nrow.is-unread .ff-snip { color: var(--ff-fg); }
.ff-nrow.is-sys { cursor: default; opacity: 1; }
.ff-nrow.is-sys:hover { background: transparent; }
.ff-nrow.is-done { opacity: .65; }
.ff-avs { display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto; }
.ff-avs i { font-style: normal; color: var(--ff-muted); }
.ff-av.is-grp { background: var(--ff-gold-tint); color: var(--ff-gold-ink); }
.ff-av.is-sys { background: var(--ff-btn); color: var(--ff-btn-fg); font-weight: 800; }
.ff-nmain { flex: 1; min-width: 200px; display: grid; gap: 2px; }
.ff-nmain > b { font-size: 15px; font-family: var(--ff-display); }
.ff-snip { color: var(--ff-muted); font-size: 13px; overflow-wrap: anywhere; }
.ff-nmain small { color: var(--ff-muted); font-size: 12px; }
.ff-nside { display: grid; gap: 6px; justify-items: end; }
.ff-nbtns { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.ff-wchip { font-size: 11px; color: var(--ff-muted); border: 1px solid var(--ff-line); border-radius: 99px; padding: 2px 9px; white-space: nowrap; }
.ff-newb { font-style: normal; font-size: 11px; font-weight: 700; background: var(--ff-gold); color: #2A2C28; border-radius: 99px; padding: 1px 8px; margin-left: 8px; font-family: var(--ff-text); }
.ff-more { display: block; width: 100%; padding: 12px; border: 0; border-top: 1px solid var(--ff-line); background: transparent; cursor: pointer; font-weight: 700; color: var(--ff-gold-ink); }
.ff-dlg.is-dropping { outline: 3px dashed var(--ff-gold); outline-offset: -8px; background: var(--ff-gold-tint); }
.ff-thead { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.ff-thead h3 { margin: 0 0 6px; }
.ff-tsub { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ff-tpeople { display: flex; align-items: center; gap: 8px; margin: 12px 0; flex-wrap: wrap; font-size: 13px; }
.ff-tpeople i { font-style: normal; color: var(--ff-muted); }
.ff-msgs { display: grid; gap: 12px; max-height: 360px; overflow: auto; padding: 12px; background: var(--ff-bg); border-radius: 12px; border: 1px solid var(--ff-line); }
.ff-msg { display: flex; gap: 10px; align-items: flex-start; }
.ff-msg.is-mine { flex-direction: row-reverse; }
.ff-mb { display: grid; gap: 3px; min-width: 0; max-width: 82%; }
.ff-msg.is-mine .ff-mh { justify-content: flex-end; }
.ff-mh { display: flex; gap: 8px; align-items: baseline; font-size: 13px; }
.ff-mh small { color: var(--ff-muted); font-size: 11px; }
.ff-bub { background: var(--ff-surface); border: 1px solid var(--ff-line); border-radius: 14px; padding: 9px 12px; overflow-wrap: anywhere; white-space: pre-wrap; }
.ff-msg.is-mine .ff-bub { background: var(--ff-gold-tint); border-color: transparent; }
.ff-mimgbtn { display: block; border: 0; padding: 0; background: none; cursor: zoom-in; margin-top: 8px; }
.ff-mimg { display: block; max-width: 240px; width: 100%; border-radius: 10px; border: 1px solid var(--ff-line); }
.ff-mev { text-align: center; color: var(--ff-muted); font-size: 12px; }
.ff-comp { margin-top: 12px; display: grid; gap: 8px; }
.ff-cbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ff-chk.is-small { font-size: 12.5px; color: var(--ff-muted); }
.ff-strip { display: flex; gap: 8px; flex-wrap: wrap; }
.ff-thumb { position: relative; }
.ff-thumb img { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; border: 1px solid var(--ff-line); display: block; }
.ff-thumb.is-busy img { opacity: .45; }
.ff-thumb button { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%; border: 0; background: var(--ff-fg); color: var(--ff-bg); cursor: pointer; line-height: 1; }
.ff-tfoot { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--ff-line); }
.ff-sel { display: inline-flex; gap: 8px; align-items: center; margin-left: auto; font-size: 12.5px; color: var(--ff-muted); }
.ff-sel select { width: auto !important; padding: 5px 8px !important; }
.ff-prof { cursor: pointer; background: transparent; color: inherit; }
.ff-prof:hover { border-color: var(--ff-gold); }
@media (max-width: 640px) { .ff-nside { justify-items: start; } .ff-sel { margin-left: 0; } .ff-mb { max-width: 100%; } }


/* ── Welcome, list, calendar ───────────────────────────── */
.ff-hello { font-size: 40px !important; margin: 6px 0 0 !important; letter-spacing: -.02em !important; }
.ff-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; margin-bottom: 24px; }
.ff-kpi { padding: 18px 20px; }
.ff-kpi b { display: block; font-family: var(--ff-display); font-size: 34px; line-height: 1.1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.ff-kpi span { color: var(--ff-muted); font-size: 12.5px; }
.ff-todo { padding: 13px 20px; display: flex; gap: 12px; align-items: center; border-top: 1px solid var(--ff-line); flex-wrap: wrap; }
.ff-sec { font-size: 18px; margin: 32px 0 12px; }
.ff-acc-head { display: flex; align-items: center; gap: 10px; padding: 0 16px 0 0; }
.ff-acc-toggle {
  flex: 1 1 auto; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left;
  background: none; border: 0; color: inherit; cursor: pointer; padding: 16px 8px 16px 20px; min-height: 60px;
}
.ff-acc-toggle:hover { background: var(--ff-surface2); }
.ff-acc-text { display: grid; gap: 3px; min-width: 0; }
.ff-acc-title { display: inline-flex; align-items: center; gap: 10px; }
.ff-acc-title h2 { margin: 0; font-size: 18px; }
.ff-acc-n { font-style: normal; font-size: 12px; font-weight: 700; background: var(--ff-surface2); color: var(--ff-fg); border: 1px solid var(--ff-line2); border-radius: 99px; padding: 1px 9px; min-width: 22px; text-align: center; }
.ff-acc-new { font-style: normal; font-size: 12px; font-weight: 700; background: var(--ff-btn); color: var(--ff-btn-fg); border-radius: 99px; padding: 2px 10px; white-space: nowrap; }
.ff-acc-text small { font-size: 13px; }
.ff-acc-chev { flex: 0 0 auto; transition: transform .18s ease; opacity: .7; }
.ff-acc.is-open .ff-acc-chev { transform: rotate(180deg); }
.ff-acc-actions { flex: 0 0 auto; }
.ff-acc-body { border-top: 1px solid var(--ff-line); }
@media (max-width: 520px) { .ff-acc-text small { display: none; } }
.ff-stack { display: grid; gap: 12px; max-width: 780px; }
.ff-lcard {
  display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: 18px; align-items: center; padding: 16px 20px;
  cursor: pointer; text-align: left; width: 100%; border-left: 5px solid var(--c);
}
.ff-lcard:hover { border-color: var(--c); box-shadow: 0 2px 4px rgba(42,44,40,.06), 0 10px 26px rgba(42,44,40,.08); }
.ff-datebox { display: grid; justify-items: center; line-height: 1.1; }
.ff-datebox b { font-family: var(--ff-display); font-size: 30px; }
.ff-datebox span { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--c); }
.ff-datebox small { color: var(--ff-muted); font-size: 11px; }
.ff-lmain { display: grid; min-width: 0; }
.ff-lmain h3 { font-size: 18px; margin: 0; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ff-lsub { color: var(--ff-muted); font-size: 13px; margin-top: 2px; }
.ff-lmain .ff-bar i { background: var(--c2); }
.ff-lside { text-align: right; display: grid; gap: 4px; justify-items: end; }
.ff-lside b { font-family: var(--ff-display); font-size: 22px; font-variant-numeric: tabular-nums; }
.ff-lbl { font-size: 12px; color: var(--ff-muted); }
.ff-warnmark { color: var(--ff-warn-fg); background: var(--ff-warn-bg); border-radius: 99px; padding: 0 7px; font-weight: 800; font-size: 12px; }
.ff-calbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
.ff-calbar h2 { font-size: 24px; margin: 0 6px; text-transform: capitalize; }
.ff-sq { width: 38px; height: 38px; padding: 0; font-size: 18px; }
.ff-mbadge {
  margin-left: auto; display: grid; gap: 6px; min-width: 210px; padding: 11px 18px 10px; border-radius: 14px;
  background: var(--ff-surface); border: 1.5px solid var(--ff-gold); box-shadow: 0 4px 14px rgba(230,190,104,.22);
}
.ff-mbtop { display: flex; align-items: baseline; gap: 6px; }
.ff-mbtop b { font-family: var(--ff-display); font-size: 30px; line-height: 1; font-variant-numeric: tabular-nums; }
.ff-mbtop span { font-size: 16px; font-weight: 600; color: var(--ff-muted); }
.ff-mbtop em { font-style: normal; font-weight: 700; font-size: 13px; margin-left: 4px; }
.ff-mbadge small { color: var(--ff-muted); font-size: 12px; }
.ff-cal { overflow: hidden; }
.ff-calgrid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.ff-dow { padding: 8px 10px; font-size: 11px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: var(--ff-muted); border-bottom: 1px solid var(--ff-line); }
.ff-day { min-height: 84px; padding: 5px 6px 6px; border-right: 1px solid var(--ff-line); border-bottom: 1px solid var(--ff-line); min-width: 0; }
.ff-day:nth-child(7n) { border-right: 0; }
.ff-day.is-out { background: var(--ff-surface2); opacity: .5; }
.ff-dn { display: inline-flex; min-width: 22px; height: 22px; align-items: center; justify-content: center; border-radius: 99px; font-size: 11.5px; padding: 0 6px; color: var(--ff-muted); }
.ff-dn.is-today { background: var(--ff-gold); color: #2A2C28; font-weight: 800; }
.ff-chip2 {
  display: flex; align-items: center; gap: 6px; width: 100%; margin-top: 3px; padding: 4px 7px; border: 0; border-left: 4px solid var(--c); border-radius: 7px;
  background: color-mix(in srgb, var(--c) 14%, var(--ff-surface)); text-align: left; cursor: pointer; min-width: 0; font-size: 11px; color: var(--ff-fg);
}
.ff-chip2:hover { background: color-mix(in srgb, var(--c) 26%, var(--ff-surface)); }
.ff-chip2 .tm { color: var(--ff-muted); font-variant-numeric: tabular-nums; flex: 0 0 auto; }
.ff-chip2 .ct { flex: 1 1 auto; min-width: 0; font-weight: 700; font-size: 12px; font-family: var(--ff-display); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ff-chip2 .cn { flex: 0 0 auto; display: inline-flex; gap: 4px; align-items: center; font-variant-numeric: tabular-nums; }
.ff-chip2 .ff-warnmark { padding: 0 5px; font-size: 11px; }
/* The next three months: small month grids with a list of their dates underneath. */
.ff-next3 { margin-top: 26px; }
.ff-next3 h2 { font-size: 16px; margin: 0 0 12px; }
.ff-next3grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 14px; }
.ff-mini { padding: 14px 16px 12px; display: grid; gap: 10px; align-content: start; }
.ff-minihead { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; border: 0; background: none; padding: 0; cursor: pointer; text-align: left; color: inherit; font: inherit; }
.ff-minihead b { font-family: var(--ff-display); font-size: 16px; text-transform: capitalize; }
.ff-minihead span { font-size: 12px; color: var(--ff-muted); }
.ff-minihead:hover b { text-decoration: underline; }
.ff-minigrid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 11.5px; }
.ff-minigrid .dw { color: var(--ff-muted); font-size: 10px; font-weight: 700; text-transform: uppercase; padding-bottom: 2px; }
.ff-minigrid .dd { position: relative; height: 28px; display: grid; place-items: center; border-radius: 8px; color: var(--ff-fg); font-variant-numeric: tabular-nums; }
.ff-minigrid .dd.out { opacity: .25; }
.ff-minigrid .dd.today { background: var(--ff-gold); color: #2A2C28; font-weight: 800; }
.ff-minigrid .dd i { position: absolute; bottom: 2px; left: 0; right: 0; display: flex; justify-content: center; gap: 2px; }
.ff-minigrid .dd u { width: 5px; height: 5px; border-radius: 50%; display: block; }
.ff-minilist { list-style: none; margin: 0; padding: 8px 0 0; border-top: 1px solid var(--ff-line); display: grid; gap: 2px; }
.ff-minilist button { display: grid; grid-template-columns: 62px 1fr auto; gap: 8px; align-items: center; width: 100%; border: 0; border-left: 3px solid var(--c); background: transparent; padding: 7px 8px; border-radius: 6px; cursor: pointer; text-align: left; color: inherit; font: inherit; font-size: 13px; min-height: 36px; }
.ff-minilist button:hover { background: var(--ff-gold-tint); }
.ff-minilist .d { color: var(--ff-muted); font-variant-numeric: tabular-nums; }
.ff-minilist .n { font-weight: 600; }
.ff-minilist .s { font-size: 12px; color: var(--ff-muted); font-variant-numeric: tabular-nums; }
@media (max-width: 700px) {
  .ff-dow { padding: 6px 2px; text-align: center; font-size: 10px; letter-spacing: 0; }
  .ff-day { min-height: 58px; padding: 3px; }
  .ff-dn { min-width: 18px; height: 18px; font-size: 10.5px; padding: 0 4px; }
  .ff-chip2 { padding: 2px 3px; margin-top: 2px; gap: 0; border-left-width: 3px; justify-content: center; min-height: 22px; }
  .ff-chip2 .tm, .ff-chip2 .ct { display: none; }
  .ff-chip2 .cn { font-size: 10px; }
}
/* ── Participants: search first, then one card per person ── */
.ff-pstats { display: flex; gap: 8px 18px; flex-wrap: wrap; font-size: 13px; color: var(--ff-muted); align-items: center; padding-top: 6px; }
.ff-pstats b { color: var(--ff-fg); font-family: var(--ff-display); font-size: 16px; margin-right: 3px; }
.ff-psearch {
  display: flex; align-items: center; gap: 12px; padding: 0 18px; min-height: 64px; background: var(--ff-surface);
  border: 2px solid var(--ff-line2, var(--ff-line)); border-radius: 18px; box-shadow: var(--ff-card-shadow, 0 2px 10px rgba(42,44,40,.06));
  position: sticky; top: 8px; z-index: 6; color: var(--ff-muted);
}
.ff-psearch:focus-within { border-color: var(--ff-rail); box-shadow: 0 0 0 4px color-mix(in srgb, var(--ff-rail) 12%, transparent); color: var(--ff-fg); }
.ff-psearch input:focus, .ff-psearch input:focus-visible { outline: none; box-shadow: none; }
.ff-psearch svg { flex: 0 0 auto; }
.ff-psearch input { flex: 1 1 auto; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--ff-fg); font: inherit; font-size: 19px; padding: 16px 0; }
.ff-psearch input::placeholder { color: var(--ff-muted); opacity: .8; }
.ff-psearch input::-webkit-search-cancel-button { display: none; }
.ff-psearch button { flex: 0 0 auto; width: 36px; height: 36px; border: 0; border-radius: 50%; background: var(--ff-surface2); color: var(--ff-muted); cursor: pointer; font-size: 14px; }
.ff-psearch button:hover { background: var(--ff-line); color: var(--ff-fg); }
.ff-pmeta { display: flex; gap: 6px 16px; flex-wrap: wrap; margin: 12px 4px 14px; font-size: 13px; font-weight: 600; }
.ff-pmeta .ff-muted { font-weight: 400; }
.ff-pfilter { margin-left: auto; display: inline-flex; gap: 6px; flex-wrap: wrap; }
.ff-pfilter button { border: 1px solid var(--ff-line); background: var(--ff-surface); border-radius: 99px; padding: 6px 13px; cursor: pointer; font-weight: 600; font-size: 13px; color: inherit; min-height: 34px; }
.ff-pfilter button:hover { background: var(--ff-surface2); }
.ff-pfilter button[aria-pressed='true'] { background: var(--ff-rail); border-color: var(--ff-rail); color: var(--ff-rail-fg); }
@media (max-width: 900px) { .ff-pfilter { margin-left: 0; } .ff-pfilter button { min-height: 40px; } }
.ff-plist { display: grid; gap: 10px; }
.ff-prow {
  display: grid; grid-template-columns: 44px minmax(0, 1.6fr) minmax(0, 1fr) auto; gap: 16px; align-items: center; cursor: pointer;
  padding: 14px 18px; background: var(--ff-surface); border: 1px solid var(--ff-line); border-left: 5px solid var(--c, var(--ff-gold)); border-radius: 14px;
  box-shadow: var(--ff-card-shadow, 0 1px 2px rgba(42,44,40,.05));
}
.ff-prow:hover { background: var(--ff-surface2); }
.ff-pav { width: 44px; height: 44px; border-radius: 50%; background: var(--ff-surface2); color: var(--ff-muted); border: 1px solid var(--ff-line); display: grid; place-items: center; font-weight: 700; font-size: 14px; font-family: var(--ff-display); }
.ff-pwho { display: grid; gap: 4px; min-width: 0; }
.ff-pname { justify-self: start; border: 0; background: none; padding: 0; cursor: pointer; font-family: var(--ff-display); font-weight: 700; font-size: 17px; color: var(--ff-fg); text-align: left; overflow-wrap: anywhere; }
.ff-pbadges { display: flex; gap: 6px; flex-wrap: wrap; }
.ff-pbadges:empty { display: none; }
.ff-pcontact { display: flex; flex-wrap: wrap; gap: 2px 16px; font-size: 13.5px; color: var(--ff-muted); min-width: 0; }
.ff-pcontact a { color: var(--ff-muted); text-decoration: none; overflow-wrap: anywhere; }
.ff-pcontact a:hover { color: var(--ff-fg); text-decoration: underline; }
.ff-pws { display: grid; gap: 2px; min-width: 0; font-size: 13px; color: var(--ff-muted); }
.ff-pws b { color: var(--ff-fg); font-family: var(--ff-display); font-size: 15px; }
.ff-pacts { display: grid; gap: 6px; justify-items: stretch; }
.ff-pacts .ff-btn { white-space: nowrap; justify-content: center; background: var(--ff-surface); border: 1px solid var(--ff-line); color: var(--ff-fg); font-weight: 600; }
.ff-pacts .ff-btn:hover { background: var(--ff-surface2); border-color: var(--ff-muted); }
.ff-pacts .ff-btn.is-gold { background: var(--ff-rail); border-color: var(--ff-rail); color: var(--ff-rail-fg); }
.ff-pacts .ff-btn.is-gold:hover { background: color-mix(in srgb, var(--ff-rail) 86%, #fff); border-color: var(--ff-rail); }
.ff-pacts .ff-btn:focus-visible { outline: 2px solid var(--ff-rail); outline-offset: 2px; }
.ff-pbadges .ff-pill.gold { background: var(--ff-rail); color: var(--ff-rail-fg); }
.ff-pbadges .ff-manual { background: transparent; color: var(--ff-fg); border: 1.5px solid var(--ff-muted); padding: 1.5px 10px; }
@media (max-width: 900px) {
  .ff-prow { grid-template-columns: 44px minmax(0, 1fr); gap: 10px 14px; padding: 14px; }
  .ff-pws, .ff-pacts { grid-column: 2; }
  .ff-pacts { grid-template-columns: 1fr 1fr; }
  .ff-pacts .ff-btn { min-height: 44px; }
  .ff-psearch { min-height: 58px; top: 64px; }
  .ff-psearch input { font-size: 17px; }
}

/* ── Customer record page ── */
.ff-ico { flex: 0 0 auto; }
.ff-inl { display: inline-flex; align-items: center; gap: 6px; }
.ff-phero { background: var(--ff-rail); color: var(--ff-rail-fg); border-radius: 20px; padding: 26px 28px 22px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px 24px; align-items: start; box-shadow: var(--ff-card-shadow, 0 6px 20px rgba(42,44,40,.12)); }
.ff-phtop { grid-column: 1; grid-row: 1; display: flex; gap: 18px; align-items: center; min-width: 0; }
.ff-phav { flex: 0 0 auto; width: 68px; height: 68px; border-radius: 20px; background: var(--ff-gold); color: #2A2C28; display: grid; place-items: center; font-family: var(--ff-display); font-weight: 700; font-size: 24px; }
.ff-phid { display: grid; gap: 6px; min-width: 0; justify-items: start; }
.ff-phid h1 { margin: 0; font-size: 28px; color: var(--ff-rail-fg); overflow-wrap: anywhere; line-height: 1.15; }
.ff-phid small { opacity: .7; font-size: 12.5px; }
.ff-phacc { display: inline-flex; align-items: center; gap: 7px; padding: 4px 12px; border-radius: 99px; font-size: 12.5px; font-weight: 600; background: color-mix(in srgb, var(--ff-rail-fg) 12%, transparent); color: var(--ff-rail-fg); }
.ff-phacc.is-yes { background: var(--ff-gold); color: #2A2C28; }
.ff-phcontact { grid-column: 1 / -1; grid-row: 2; list-style: none; margin: 0; padding: 14px 0 0; border-top: 1px solid color-mix(in srgb, var(--ff-rail-fg) 20%, transparent); display: flex; flex-wrap: wrap; gap: 8px 28px; font-size: 14.5px; }
.ff-phcontact li { display: inline-flex; align-items: center; gap: 9px; min-width: 0; overflow-wrap: anywhere; }
.ff-phcontact a { color: inherit; text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--ff-rail-fg) 35%, transparent); }
.ff-phcontact a:hover { border-color: var(--ff-gold); }
.ff-phcontact .ff-ico { opacity: .7; }
.ff-phcontact .is-dim { opacity: .5; }
.ff-phcontact .is-warn { display: inline-flex; align-items: center; gap: 6px; color: var(--ff-gold); font-weight: 600; }
.ff-phsince { grid-column: 2; grid-row: 1; justify-self: end; align-self: start; display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600; white-space: nowrap; background: color-mix(in srgb, var(--ff-rail-fg) 12%, transparent); color: var(--ff-rail-fg); }
.ff-phstats { grid-column: 1 / -1; grid-row: 3; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.ff-phstats > div { background: color-mix(in srgb, var(--ff-rail-fg) 8%, transparent); border-radius: 14px; padding: 12px 16px; display: grid; gap: 2px; }
.ff-phstats b { font-family: var(--ff-display); font-size: 24px; line-height: 1.1; font-variant-numeric: tabular-nums; }
.ff-phstats span { font-size: 12px; opacity: .72; }
.ff-psec { margin-top: 30px; }
.ff-psech { display: flex; align-items: center; gap: 10px; font-size: 17px; margin: 0 0 12px; }
.ff-psecico { width: 32px; height: 32px; border-radius: 10px; background: var(--ff-gold-tint); color: var(--ff-gold-ink); display: grid; place-items: center; }
.ff-psecn { font-family: var(--ff-text); font-size: 12px; font-weight: 700; background: var(--ff-surface2); color: var(--ff-muted); border-radius: 99px; padding: 1px 9px; }
.ff-pbook { min-width: 0; max-width: 100%; padding: 18px 20px; border-left: 5px solid var(--c, var(--ff-gold)); border-radius: 16px; }
.ff-mixline { display: flex; align-items: center; gap: 8px; margin-top: 8px; padding: 7px 12px; background: var(--ff-gold-tint); color: var(--ff-gold-ink); border-radius: 10px; font-size: 13px; font-weight: 600; width: fit-content; max-width: 100%; }
.ff-mixline span { min-width: 0; overflow-wrap: anywhere; }
.ff-pbook.is-focus { box-shadow: 0 0 0 2px var(--ff-gold); }
.ff-fact { min-width: 0; background: var(--ff-surface2); border-radius: 12px; padding: 10px 14px; }
.ff-factl { font-size: 10.5px; text-transform: uppercase; letter-spacing: .07em; color: var(--ff-muted); font-weight: 700; margin-bottom: 3px; }
.ff-factv { font-size: 14px; overflow-wrap: anywhere; }
.ff-pillico { display: inline-flex; align-items: center; gap: 6px; white-space: normal; text-align: left; border-radius: 14px; max-width: 100%; }
.ff-tlfilter { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.ff-tlfilter button { display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--ff-line); background: var(--ff-surface); border-radius: 99px; padding: 6px 12px; cursor: pointer; font-weight: 600; font-size: 13px; color: inherit; min-height: 34px; }
.ff-tlfilter button b { font-size: 11px; color: var(--ff-muted); }
.ff-tlfilter button[aria-pressed='true'] { background: var(--ff-btn); border-color: var(--ff-btn); color: var(--ff-btn-fg); }
.ff-tlfilter button[aria-pressed='true'] b { color: var(--ff-btn-fg); opacity: .85; }
.ff-tl { list-style: none; margin: 0; padding: 0 0 0 6px; position: relative; }
.ff-tl::before { content: ''; position: absolute; left: 21px; top: 8px; bottom: 8px; width: 2px; background: var(--ff-line); border-radius: 2px; }
.ff-tlday { margin: 16px 0 8px 46px; font-size: 11.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--ff-muted); }
.ff-tlday:first-child { margin-top: 0; }
.ff-tli { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 14px; padding: 6px 0; position: relative; }
.ff-tlnode { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--ff-surface); border: 2px solid var(--ff-line); color: var(--ff-muted); z-index: 1; }
.ff-tli.k-email .ff-tlnode, .ff-tli.k-link .ff-tlnode { color: var(--ff-gold-ink); border-color: var(--ff-gold); background: var(--ff-gold-tint); }
.ff-tli.k-booking .ff-tlnode, .ff-tli.k-order .ff-tlnode, .ff-tli.k-voucher .ff-tlnode { color: var(--ff-fg); border-color: var(--ff-rail); }
.ff-tli.k-refund .ff-tlnode { color: var(--ff-gold-ink); border-color: var(--ff-gold); }
.ff-tlbody { min-width: 0; background: var(--ff-surface); border: 1px solid var(--ff-line); border-radius: 14px; padding: 10px 14px; }
.ff-tlhead { display: flex; justify-content: space-between; gap: 4px 12px; flex-wrap: wrap; align-items: baseline; }
.ff-tlhead b { font-size: 14px; font-family: var(--ff-display); }
.ff-tlhead span { font-size: 12px; color: var(--ff-muted); }
.ff-tlctx { display: inline-block; margin-top: 4px; font-size: 11.5px; color: var(--ff-muted); background: var(--ff-surface2); border-radius: 99px; padding: 1px 9px; }
.ff-tlsum { margin-top: 4px; font-size: 13.5px; color: var(--ff-fg); opacity: .88; overflow-wrap: anywhere; }
@media (max-width: 700px) {
  .ff-pbook { padding: 16px 14px; }
  .ff-pbook [style*="minmax(170px"] { grid-template-columns: minmax(0, 1fr) !important; }
  .ff-phero { padding: 20px 16px 16px; border-radius: 16px; }
  .ff-phav { width: 54px; height: 54px; font-size: 19px; border-radius: 16px; }
  .ff-phid h1 { font-size: 22px; }
  .ff-phero { grid-template-columns: minmax(0, 1fr); }
  .ff-phtop, .ff-phsince, .ff-phcontact, .ff-phstats { grid-column: 1; }
  .ff-phtop { grid-row: 1; } .ff-phsince { grid-row: 2; justify-self: start; } .ff-phcontact { grid-row: 3; } .ff-phstats { grid-row: 4; }
  .ff-phstats > div { padding: 10px 12px; }
  .ff-phstats b { font-size: 19px; }
  .ff-tl::before { left: 15px; }
  .ff-tli { grid-template-columns: 28px minmax(0, 1fr); gap: 10px; }
  .ff-tlnode { width: 28px; height: 28px; }
  .ff-tlday { margin-left: 38px; }
}

.ff-legend { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 16px; color: var(--ff-muted); font-size: 12px; }
.ff-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; background: var(--c); }
@media (max-width: 900px) {
  .ff-hello { font-size: 30px !important; }
  .ff-lcard { grid-template-columns: 52px minmax(0, 1fr); }
  .ff-lside { grid-column: 1 / -1; justify-items: start; text-align: left; grid-auto-flow: column; gap: 12px; align-items: center; justify-content: start; }
  .ff-mbadge { margin-left: 0; }
}


/* ── Chip editor (E-Mails) ─────────────────────────────── */
.ff-ce { display: grid; gap: 6px; }
.ff-ce-box {
  min-height: 44px; padding: 9px 12px; border: 1px solid var(--ff-line); border-radius: 10px; background: var(--ff-surface);
  line-height: 1.9; overflow-wrap: anywhere; outline: none; cursor: text;
}
.ff-ce-box:focus { border-color: var(--ff-gold); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ff-gold) 55%, transparent); }
.ff-ce.is-bad .ff-ce-box { border-color: var(--ff-alert); }
.ff-ce.is-readonly .ff-ce-box { background: var(--ff-surface2); cursor: default; }
.ff-ce-box[data-single='1'] { white-space: nowrap; overflow-x: auto; }
.ff-chipx {
  display: inline-flex; align-items: center; gap: 4px; margin: 0 2px; padding: 0 8px; border-radius: 99px; line-height: 1.55;
  font-size: 12.5px; font-weight: 600; white-space: nowrap; user-select: none; vertical-align: baseline;
  background: var(--ff-gold-tint); color: var(--ff-gold-ink); border: 1px solid color-mix(in srgb, var(--ff-gold) 70%, transparent);
}
.ff-chipx i { font-style: normal; cursor: pointer; opacity: .6; padding: 0 2px; font-size: 14px; line-height: 1; }
.ff-chipx i:hover { opacity: 1; }
.ff-chipx.is-fixed { background: var(--ff-surface2); color: var(--ff-muted); border-color: var(--ff-line2); font-weight: 500; }
.ff-chipx.is-unknown { background: var(--ff-bad-bg); color: var(--ff-bad-fg); border-color: transparent; }
.ff-chipx.is-btn { cursor: pointer; font-family: inherit; }
.ff-chipx.is-btn:hover { background: var(--ff-gold); color: #2A2C28; }
.ff-ce-insert { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; font-size: 12px; color: var(--ff-muted); }
.ff-variants { display: grid; gap: 8px; }
.ff-variant { display: grid; gap: 4px; padding-left: 10px; border-left: 3px solid var(--ff-line2); }
.ff-variant-label { font-size: 11.5px; font-weight: 700; letter-spacing: .04em; color: var(--ff-gold-ink); }
.ff-mlabel { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; font-weight: 600; color: var(--ff-muted); }
.ff-mfield.is-flash { animation: ff-flash 1.6s ease-out; }
@keyframes ff-flash { 0%, 40% { background: color-mix(in srgb, var(--ff-gold) 35%, transparent); } 100% { background: transparent; } }

/* ── Mobile ────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .ff-mailed { grid-template-columns: minmax(0, 1fr); }
  .ff-mailed .ff-preview { position: static; }
  .ff-preview iframe { height: 70vh; }
}
@media (max-width: 900px) {
  .ff-app { grid-template-columns: minmax(0, 1fr); }
  /* Phone / tablet: top bar with a menu button; the rail becomes a slide-in drawer. */
  .ff-topbar {
    display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 12px; position: sticky; top: 0; z-index: 40; min-height: 56px;
    padding: 8px max(12px, env(safe-area-inset-right, 0px)) 8px max(12px, env(safe-area-inset-left, 0px));
    background: var(--ff-rail); color: var(--ff-rail-fg);
  }
  .ff-toplogo { grid-column: 2; display: grid; place-items: center; }
  .ff-toplogo .ff-toplogo-svg { width: 40px; height: auto; display: block; }
  .ff-burger { grid-column: 3; justify-self: end; position: relative; width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.22); border-radius: 12px; background: rgba(255,255,255,.06); color: inherit; cursor: pointer; flex: 0 0 auto; }
  .ff-burger-dot { position: absolute; top: 7px; right: 7px; width: 9px; height: 9px; border-radius: 50%; background: var(--ff-gold); border: 2px solid var(--ff-rail); }
  .ff-toptitle { flex: 1 1 auto; min-width: 0; display: grid; line-height: 1.2; }
  .ff-toptitle b { font-family: var(--ff-display); font-size: 17px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ff-toptitle span { font-size: 12.5px; opacity: .7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ff-topavatar { border: 0; background: none; padding: 0; cursor: pointer; border-radius: 10px; flex: 0 0 auto; }
  .ff-scrim { display: block; position: fixed; inset: 0; z-index: 90; background: rgba(16,17,15,.55); }
  .ff-rail {
    position: fixed; top: 0; right: 0; bottom: 0; height: 100dvh; width: min(320px, 86vw); z-index: 100; overflow-y: auto; overscroll-behavior: contain;
    padding: max(20px, env(safe-area-inset-top, 0px)) max(14px, env(safe-area-inset-right, 0px)) max(18px, env(safe-area-inset-bottom, 0px)) 14px;
    transform: translateX(102%); transition: transform .22s ease; box-shadow: none; visibility: hidden;
  }
  .ff-rail.is-open { transform: none; visibility: visible; box-shadow: -8px 0 32px rgba(0,0,0,.35); }
  .ff-closemenu { display: grid; place-items: center; position: absolute; top: 10px; left: 10px; width: 40px; height: 40px; border: 0; border-radius: 10px; background: rgba(255,255,255,.08); color: inherit; font-size: 16px; cursor: pointer; z-index: 2; }
  .ff-prof .ff-av { --s: 72px !important; }
  .ff-gbtn { padding: 13px 12px; font-size: 16px; }
  .ff-subbtn { padding: 12px 12px; font-size: 15.5px; }
  .ff-gchev { flex-basis: 46px; }
  .ff-cmsbtn { white-space: nowrap; padding: 12px; }
  .ff-lang button { padding: 10px 0; }
  .ff-rfoot { padding: 14px 4px 4px; }
  .ff-tabs { padding: 0 16px; }
  .ff-page { padding: 24px 16px 56px; }
  .ff-mailrow { grid-template-columns: minmax(0, 1fr); }
  .ff-mailrow .side { justify-items: start; text-align: left; }

  /* existing inline-styled views */
  .ff-roster table { display: block; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .ff-roster [style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
  .ff-roster [style*="min-width: 700"], .ff-roster [style*="min-width: 560"] { min-width: 0 !important; }
}
@media (prefers-reduced-motion: reduce) { .ff-roster *, .ff-rail { transition: none !important; } }

/* ── Print (day sheet) ─────────────────────────────────── */
@media print {
  .ff-rail, .ff-topbar, .ff-scrim, .ff-tabs, .ff-noprint, .ff-toast, .ff-alerts, .ff-modal { display: none !important; }
  .ff-app { display: block; }
  .ff-page { padding: 0; max-width: none; }
  .ff-roster { background: #fff; color: #000; }
  .ff-panel { box-shadow: none; border-color: #ccc; }
  .ff-printonly { display: block !important; }
  .ff-dayhead { border: 0; border-left: 0; padding: 0 0 8px; }
  /* The printed day sheet carries everything: name, contact, seats, notes, source, payment, status. Only buttons are hidden. */
  .ff-sheet { display: block; gap: 0; border: 1px solid #888; border-radius: 0; box-shadow: none; overflow: visible; }
  .ff-dayhead { background: none !important; color: #000 !important; --on: #000; --hero: #fff; }
  .ff-dtop { padding: 0; grid-template-columns: 64px minmax(0, 1fr) auto !important; }
  .ff-dtop .ff-lside { grid-column: auto !important; justify-items: end !important; text-align: right !important; }
  .ff-srow, .ff-shead { border-left: 0 !important; border-right: 0; border-bottom: 0; border-radius: 0; box-shadow: none; background: none; }
  .ff-shead { background: #eee; }
  /* Columns on paper: name | source and payment | status | seats | check boxes (far right edge, one per person). */
  .ff-shead { display: grid !important; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr) minmax(0, .9fr) 52px 44px; background: #eee; color: #000; border-radius: 0; font-size: 8.5pt; padding: 6px 8px; gap: 10px; }
  .ff-shead > * { grid-row: 1; }
  .ff-shead > :nth-child(1) { grid-column: 1; }
  .ff-shead > :nth-child(3) { grid-column: 2; }
  .ff-shead > :nth-child(4) { grid-column: 3; }
  .ff-shead > :nth-child(2) { grid-column: 4; text-align: center; }
  .ff-shead::after { content: '\\2713'; grid-column: 5; grid-row: 1; text-align: center; font-size: 11pt; line-height: 1; }
  .ff-srow { position: relative; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr) minmax(0, .9fr) 52px 44px; gap: 10px; padding: 8px 8px; border-top: 1px solid #aaa; break-inside: avoid; align-items: start; font-size: 10.5pt; }
  .ff-srow .c-n { grid-column: 1; grid-row: 1; }
  .ff-srow .c-p { grid-column: 2; grid-row: 1; padding-top: 1px; }
  .ff-srow .c-t { grid-column: 3; grid-row: 1; padding-top: 1px; }
  .ff-srow .c-t .ff-pill { white-space: normal; }
  .ff-srow .c-s { grid-column: 4; grid-row: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .ff-srow .c-s .ff-seatcount { display: grid; justify-items: center; gap: 2px; }
  .ff-srow .c-s .ff-manualwrap { display: none; }
  .ff-srow .c-s .ff-lbl { font-size: 8pt; color: #000; }
  .ff-srow .c-a { grid-column: auto; }
  .ff-srow .c-s b { font-size: 14pt; }
  .ff-printno { display: inline-block; min-width: 22px; font-weight: 700; }
  /* one box per person, pinned to the right edge of the page; it keeps the line height of its person (static top) */
  .ff-tick { display: block !important; position: absolute; right: 14px; width: 18px; height: 18px; border: 1.5px solid #222; border-radius: 3px; margin: 0; }
  .ff-contact { display: block !important; color: #000; font-size: 9pt; }
  .ff-seat .nm { font-size: 11pt; }
  .ff-allergy { color: #000; opacity: 1; border-left: 2px solid #000; font-size: 9.5pt; }
  .ff-pill { border: 1px solid #777; background: none !important; color: #000 !important; font-size: 8pt; padding: 1px 7px; }
  .ff-manual { background: none; color: #000; border: 1.5px solid #000; font-size: 8pt; padding: 1px 8px; }
  .ff-teamnotes { margin: 0 0 10px; padding: 8px 10px; border: 1px solid #888; font-size: 9.5pt; line-height: 1.5; }
  .ff-teamnotes strong { display: block; margin-bottom: 2px; font-size: 9pt; text-transform: uppercase; letter-spacing: .05em; }
}
.ff-printonly { display: none; }
`
