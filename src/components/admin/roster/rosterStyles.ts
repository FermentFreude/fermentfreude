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
  --ff-gold: #E6BE68; --ff-gold-dark: #D4A654; --ff-gold-ink: #7A540C; --ff-gold-tint: #FBF3E1;
  --ff-rail: #3A3E3A; --ff-rail-fg: #F4EFE2;
  --ff-ok-bg: #DDF3E3; --ff-ok-fg: #17622F; --ff-warn-bg: #FCEFC8; --ff-warn-fg: #86470B;
  --ff-bad-bg: #FBE0DD; --ff-bad-fg: #9A2A22; --ff-info-bg: #DEE9FB; --ff-info-fg: #23478F;
  --ff-kombucha: #1F8A8A; --ff-lakto: #5B9A3C; --ff-tempeh: #B3562B; --ff-feld: #7B4E9C;
  --ff-shadow: 0 1px 2px rgba(42,44,40,.05), 0 6px 20px rgba(42,44,40,.05);
  --ff-display: 'neue-haas-grotesk-display', 'Helvetica Neue', Arial, sans-serif;
  --ff-text: 'neue-haas-grotesk-text', 'Helvetica Neue', Arial, sans-serif;

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
  --ff-rail: #10110F; --ff-rail-fg: #EFEADC;
  --ff-ok-bg: #16351F; --ff-ok-fg: #86EFAC; --ff-warn-bg: #3D2C0C; --ff-warn-fg: #FCD34D;
  --ff-bad-bg: #401717; --ff-bad-fg: #FCA5A5; --ff-info-bg: #172A4A; --ff-info-fg: #93C5FD;
  --ff-kombucha: #4FC3C3; --ff-lakto: #8CC265; --ff-tempeh: #E58E5E; --ff-feld: #BE92DE;
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
  position: sticky; top: 0; height: 100vh; align-self: start;
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
.ff-gbtn[aria-current='true'] { background: rgba(230,190,104,.16); opacity: 1; box-shadow: inset 3px 0 0 var(--ff-gold); font-weight: 600; }
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
.ff-cmsbtn:hover { border-color: var(--ff-gold); background: rgba(230,190,104,.12); }
.ff-lang { display: flex; gap: 4px; }
.ff-lang button {
  flex: 1; border: 1px solid rgba(255,255,255,.22); background: transparent; color: inherit;
  border-radius: 8px; padding: 6px 0; cursor: pointer; font-weight: 600; opacity: .7;
}
.ff-lang button[aria-pressed='true'] { background: var(--ff-gold); color: #2A2C28; border-color: var(--ff-gold); opacity: 1; }
.ff-live { display: flex; align-items: center; gap: 6px; font-size: 11px; opacity: .5; }
.ff-live i { width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; }

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
.ff-arrbtn.is-on { background: var(--ff-gold); border-color: var(--ff-gold); color: #2A2C28; }
.ff-page { padding: 36px 40px 72px; max-width: 1120px; }
.ff-page.is-wide { max-width: 1440px; }

/* ── Shared pieces for the views ───────────────────────── */
.ff-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 26px; }
.ff-head h1 { font-size: 28px; margin: 0; }
.ff-head p { margin: 6px 0 0; color: var(--ff-muted); max-width: 64ch; }
.ff-eyebrow { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; font-weight: 600; color: var(--ff-gold-ink); }
.ff-panel { background: var(--ff-surface); border: 1px solid var(--ff-line); border-radius: 16px; box-shadow: var(--ff-shadow); }
.ff-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--ff-line);
  background: var(--ff-surface); padding: 8px 14px; border-radius: 10px; cursor: pointer; font-weight: 600;
  font-family: var(--ff-display); font-size: 14px; text-decoration: none; color: var(--ff-fg); white-space: nowrap;
}
.ff-btn:hover:not(:disabled) { border-color: var(--ff-gold); }
.ff-btn:disabled { opacity: .5; cursor: default; }
.ff-btn.is-gold { background: var(--ff-gold); border-color: var(--ff-gold); color: #2A2C28; }
.ff-btn.is-gold:hover:not(:disabled) { background: var(--ff-gold-dark); border-color: var(--ff-gold-dark); }
.ff-btn.is-sm { padding: 5px 10px; font-size: 12px; border-radius: 8px; }
.ff-btn.is-danger { color: var(--ff-bad-fg); }
.ff-namebtn { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: inherit; cursor: pointer; text-align: left; }
.ff-namebtn:hover { text-decoration: underline; color: var(--ff-gold-ink); }
.ff-link { background: none; border: 0; padding: 0; font-weight: 600; text-decoration: underline; cursor: pointer; color: var(--ff-gold-ink); }
.ff-pill { display: inline-block; border-radius: 99px; padding: 2px 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.ff-pill.ok { background: var(--ff-ok-bg); color: var(--ff-ok-fg); }
.ff-pill.warn { background: var(--ff-warn-bg); color: var(--ff-warn-fg); }
.ff-pill.bad { background: var(--ff-bad-bg); color: var(--ff-bad-fg); }
.ff-pill.info { background: var(--ff-info-bg); color: var(--ff-info-fg); }
.ff-pill.neu { background: var(--ff-surface2); color: var(--ff-muted); }
.ff-pill.gold { background: var(--ff-gold-tint); color: var(--ff-gold-ink); }
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
.ff-mfield.is-bad { box-shadow: inset 4px 0 0 var(--ff-bad-fg); }
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
.ff-dayhead {
  padding: 22px 24px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 14px 28px; align-items: center;
  border-left: 6px solid var(--c, var(--ff-gold));
}
.ff-dayhead h1 { font-size: 30px; margin: 4px 0 0; }
.ff-dstats { display: flex; gap: 28px; }
.ff-dstats div { display: grid; justify-items: start; }
.ff-dstats b { font-family: var(--ff-display); font-size: 32px; line-height: 1.05; font-variant-numeric: tabular-nums; }
.ff-dstats span { color: var(--ff-muted); font-size: 12px; }
.ff-bar { height: 7px; border-radius: 99px; background: var(--ff-surface2); overflow: hidden; }
.ff-bar i { display: block; height: 100%; border-radius: 99px; background: var(--c, var(--ff-gold)); }
.ff-bar.is-wide { grid-column: 1 / -1; }
.ff-dact { grid-column: 1 / -1; display: flex; gap: 8px; flex-wrap: wrap; }
.ff-sheet { overflow: hidden; }
.ff-srow {
  display: grid; grid-template-columns: minmax(0, 1.7fr) 56px minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 14px; align-items: center; padding: 14px 20px; border-top: 1px solid var(--ff-line);
}
.ff-srow:first-child { border-top: 0; }
.ff-shead { font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--ff-muted); background: var(--ff-surface2); padding-top: 10px; padding-bottom: 10px; }
.ff-srow .c-n { display: grid; gap: 5px; min-width: 0; }
.ff-srow .c-s b { font-family: var(--ff-display); font-size: 20px; }
.ff-srow .c-p, .ff-srow .c-t { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.ff-srow .c-a { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.ff-seat { display: flex; gap: 8px; align-items: baseline; }
.ff-seat .nm { font-weight: 700; overflow-wrap: anywhere; }
.ff-seat.is-gone .nm { font-weight: 500; text-decoration: line-through; color: var(--ff-muted); }
.ff-printno { display: none; }
.ff-allergy { display: inline-block; margin-left: 8px; font-size: 12px; background: var(--ff-warn-bg); color: var(--ff-warn-fg); border-radius: 6px; padding: 1px 7px; font-weight: 600; }
.ff-pick { display: grid; gap: 6px; max-height: 240px; overflow: auto; margin: 8px 0 4px; padding: 10px 12px; border: 1px solid var(--ff-line); border-radius: 12px; }
.ff-chk { display: flex; gap: 10px; align-items: center; cursor: pointer; }
.ff-pick2 { display: flex; gap: 12px; align-items: flex-start; border: 1px solid var(--ff-line); border-radius: 12px; padding: 10px 12px; cursor: pointer; }
.ff-pick2 input { margin-top: 3px; }
.ff-pick2 small { display: block; color: var(--ff-muted); font-size: 12.5px; }
.ff-pick2:has(input:checked) { border-color: var(--ff-gold); background: var(--ff-gold-tint); }
.ff-pick2[aria-disabled='true'] { opacity: .55; cursor: default; }
@media (max-width: 1060px) {
  .ff-shead { display: none; }
  .ff-srow { grid-template-columns: 1fr 1fr; }
  .ff-srow .c-n, .ff-srow .c-a { grid-column: 1 / -1; }
  .ff-srow .c-a { justify-content: flex-start; }
}
@media (max-width: 700px) {
  .ff-dayhead { grid-template-columns: 1fr; }
}


/* ── Notes & conversations ─────────────────────────────── */
.ff-fchips { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 20px 14px; }
.ff-fchip {
  border: 1px solid var(--ff-line); background: var(--ff-surface); border-radius: 99px; padding: 6px 12px;
  cursor: pointer; font-weight: 600; font-size: 13px; display: inline-flex; gap: 8px; align-items: center;
}
.ff-fchip b { font-size: 11px; color: var(--ff-muted); }
.ff-fchip[aria-pressed='true'] { background: var(--ff-gold); border-color: var(--ff-gold); color: #2A2C28; }
.ff-fchip[aria-pressed='true'] b { color: #2A2C28; }
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
.ff-av.is-sys { background: var(--ff-warn-bg); color: var(--ff-warn-fg); font-weight: 800; }
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
.ff-cal { overflow-x: auto; }
.ff-calgrid { min-width: 860px; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.ff-dow { padding: 11px 12px; font-size: 11px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: var(--ff-muted); border-bottom: 1px solid var(--ff-line); }
.ff-day { min-height: 128px; padding: 8px; border-right: 1px solid var(--ff-line); border-bottom: 1px solid var(--ff-line); }
.ff-day:nth-child(7n) { border-right: 0; }
.ff-day.is-out { background: var(--ff-surface2); opacity: .55; }
.ff-dn { display: inline-flex; min-width: 26px; height: 26px; align-items: center; justify-content: center; border-radius: 99px; font-size: 12px; padding: 0 7px; color: var(--ff-muted); }
.ff-dn.is-today { background: var(--ff-gold); color: #2A2C28; font-weight: 800; }
.ff-chip2 {
  display: block; width: 100%; margin-top: 5px; padding: 7px 9px; border: 0; border-left: 4px solid var(--c); border-radius: 8px;
  background: color-mix(in srgb, var(--c) 14%, var(--ff-surface)); text-align: left; cursor: pointer;
}
.ff-chip2:hover { background: color-mix(in srgb, var(--c) 26%, var(--ff-surface)); }
.ff-chip2 .ct { display: block; font-weight: 700; font-size: 12px; line-height: 1.25; overflow-wrap: anywhere; font-family: var(--ff-display); }
.ff-chip2 .cm { display: flex; gap: 8px; justify-content: space-between; font-size: 11px; color: var(--ff-muted); margin-top: 2px; font-variant-numeric: tabular-nums; }
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
.ff-ce.is-bad .ff-ce-box { border-color: var(--ff-bad-fg); }
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
  .ff-rail { position: static; height: auto; flex-direction: row; overflow-x: auto; padding: 12px; align-items: center; gap: 6px; }
  .ff-rail::-webkit-scrollbar { height: 0; }
  .ff-logo { padding: 0 8px 0 0; flex: 0 0 120px; }
  .ff-sub, .ff-live { display: none; }
  .ff-prof { margin: 0; padding: 0; border: 0; flex: 0 0 auto; }
  .ff-prof .ff-av { --s: 38px !important; border-width: 2px; border-radius: 10px; }
  .ff-prof > span:last-child { display: none; }
  .ff-gbtn { width: auto; white-space: nowrap; padding: 8px 12px; }
  .ff-gbtn[aria-current='true'] { box-shadow: inset 0 -3px 0 var(--ff-gold); }
  .ff-rfoot { margin: 0 0 0 auto; grid-auto-flow: column; align-items: center; padding: 0; }
  .ff-cmsbtn { white-space: nowrap; }
  .ff-tabs { padding: 0 16px; }
  .ff-page { padding: 24px 16px 56px; }
  .ff-mailrow { grid-template-columns: minmax(0, 1fr); }
  .ff-mailrow .side { justify-items: start; text-align: left; }

  /* existing inline-styled views */
  .ff-roster table { display: block; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .ff-roster [style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
  .ff-roster [style*="min-width: 700"], .ff-roster [style*="min-width: 560"] { min-width: 0 !important; }
}
@media (prefers-reduced-motion: reduce) { .ff-roster * { transition: none !important; } }

/* ── Print (day sheet) ─────────────────────────────────── */
@media print {
  .ff-rail, .ff-tabs, .ff-noprint, .ff-toast, .ff-modal { display: none !important; }
  .ff-app { display: block; }
  .ff-page { padding: 0; max-width: none; }
  .ff-roster { background: #fff; color: #000; }
  .ff-panel { box-shadow: none; border-color: #ccc; }
  .ff-printonly { display: block !important; }
  .ff-dayhead { border: 0; border-left: 0; padding: 0 0 8px; }
  .ff-srow { grid-template-columns: minmax(0, 3fr) 50px minmax(0, 1.4fr) minmax(0, 1fr); padding: 8px 4px; break-inside: avoid; }
  .ff-printno { display: inline-block; min-width: 22px; font-weight: 700; }
  .ff-tick { display: inline-block !important; margin-left: auto; width: 16px; height: 16px; border: 1.5px solid #555; border-radius: 3px; }
  .ff-pill { border: 1px solid #bbb; background: none !important; color: #000 !important; }
  .ff-allergy { border: 1px solid #000; background: none; color: #000; }
}
.ff-printonly { display: none; }
`
