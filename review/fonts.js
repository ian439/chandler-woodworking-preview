// Font switcher (review only): lets Casey try heading, logo and body fonts on the live draft.
// The choice is kept in this browser; once he settles, the winner goes into site.css as the default.

const KEY = 'cw-review-fonts-v1';
const HINT_KEY = 'cw-review-fonts-hint-v1';
const html = document.documentElement;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Mermaid and Chapaza are commercial faces with no free web version, so the closest free matches stand in.
const DISPLAY = [
  { id: 'crimson', name: 'Crimson Pro', note: 'From your list', family: "'Crimson Pro', Georgia, serif", css: 'Crimson+Pro:wght@400..700', weight: 500, scale: 1.14, track: '.16em' },
  { id: 'young', name: 'Young Serif', note: 'Closest free match to Mermaid', family: "'Young Serif', Georgia, serif", css: 'Young+Serif', weight: 400, scale: 1, track: '.12em' },
  { id: 'gloock', name: 'Gloock', note: 'Closest free match to Chapaza', family: "'Gloock', Georgia, serif", css: 'Gloock', weight: 400, scale: 1.02, track: '.12em' },
  { id: 'fraunces', name: 'Fraunces Soft', note: 'Relaxed, a little 70s', family: "'Fraunces', Georgia, serif", css: 'Fraunces:opsz,wght,SOFT,WONK@9..144,300..700,0..100,0..1', weight: 400, fvs: "'SOFT' 100, 'WONK' 1", scale: 1.04, track: '.12em' },
  { id: 'instrument', name: 'Instrument Serif', note: 'Relaxed, narrow', family: "'Instrument Serif', Georgia, serif", css: 'Instrument+Serif', weight: 400, scale: 1.22, track: '.14em' },
  { id: 'alata', name: 'Alata', note: 'The first draft', family: "'Alata', system-ui, sans-serif", css: 'Alata', weight: 400, scale: 1, track: '.2em' },
];
const BODY = [
  { id: 'archivo', name: 'Archivo', note: 'Clean sans (current)', family: "'Archivo', system-ui, sans-serif", css: null },
  { id: 'instrument-sans', name: 'Instrument Sans', note: 'Softer sans', family: "'Instrument Sans', system-ui, sans-serif", css: 'Instrument+Sans:wght@400..600' },
  { id: 'crimson-body', name: 'Crimson Pro', note: 'Serif throughout', family: "'Crimson Pro', Georgia, serif", css: 'Crimson+Pro:wght@400..700', body: '19px', label: '16px' },
];
const MARKS = [
  { id: 'type', name: 'CW in the heading font' },
  { id: 'drawn', name: 'Original drawn CW' },
];

const loaded = new Set();
function loadFont(css) {
  if (!css || loaded.has(css)) return;
  loaded.add(css);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${css}&display=swap`;
  document.head.appendChild(link);
}

function read() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s) return s;
  } catch {}
  return { display: 'crimson', body: 'archivo', mark: 'type' };
}
let pick = read();
let wrap = null; // the panel, mounted on DOMContentLoaded
const find = (list, id) => list.find((x) => x.id === id) || list[0];

function apply() {
  const d = find(DISPLAY, pick.display);
  const b = find(BODY, pick.body);
  loadFont(d.css);
  loadFont(b.css);
  const st = html.style;
  st.setProperty('--display', d.family);
  st.setProperty('--display-weight', d.weight);
  st.setProperty('--display-fvs', d.fvs || 'normal');
  st.setProperty('--display-scale', d.scale);
  st.setProperty('--display-caps-track', d.track);
  st.setProperty('--sans', b.family);
  if (b.body) { st.setProperty('--fs-body', b.body); st.setProperty('--fs-label', b.label); }
  else { st.removeProperty('--fs-body'); st.removeProperty('--fs-label'); }
  html.dataset.mark = pick.mark;
  try { localStorage.setItem(KEY, JSON.stringify(pick)); } catch {}
  renderPanel();
}

// Applied before site.js renders (this module loads first), so the first paint and logo reveal use the pick.
apply();

/* ---------- Panel ---------- */


function option(group, o, sample, style) {
  const on = pick[group] === o.id;
  return `<button type="button" class="ff-opt" data-group="${group}" data-id="${o.id}" aria-pressed="${on}">
    <span class="ff-sample" style="${style}">${esc(sample)}</span>
    <span class="ff-name">${esc(o.name)}${o.note ? ` <span class="ff-note">· ${esc(o.note)}</span>` : ''}</span>
  </button>`;
}

function renderPanel() {
  if (!wrap) return;
  const d = find(DISPLAY, pick.display);
  const b = find(BODY, pick.body);
  const m = find(MARKS, pick.mark);
  wrap.querySelector('.ff-body').innerHTML = `
    <p class="ff-group">Headings and wordmark</p>
    ${DISPLAY.map((o) => option('display', o, 'Chandler Woodworking', `font-family:${o.family};font-weight:${o.weight};font-variation-settings:${o.fvs || 'normal'};font-size:${Math.round(20 * o.scale)}px;white-space:nowrap`)).join('')}
    <p class="ff-group">Logo</p>
    ${MARKS.map((o) => `<button type="button" class="ff-opt ff-small" data-group="mark" data-id="${o.id}" aria-pressed="${pick.mark === o.id}"><span class="ff-name">${esc(o.name)}</span></button>`).join('')}
    <p class="ff-group">Body text</p>
    ${BODY.map((o) => option('body', o, 'Furniture made to commission.', `font-family:${o.family};font-size:${o.body ? 19 : 17}px`)).join('')}
    <p class="ff-pick">Current pick: ${esc(d.name)} headings, ${esc(m.name.charAt(0).toLowerCase() + m.name.slice(1))}, ${esc(b.name)} body.</p>`;
}

// The hint beside the tab shows until the panel is opened or the hint is dismissed, then never again.
function hintSeen() {
  try { return localStorage.getItem(HINT_KEY) === '1'; } catch { return false; }
}

function mount() {
  wrap = document.createElement('div');
  wrap.className = 'ff';
  wrap.innerHTML = `
    <div class="ff-dock">
      <button class="ff-tab tap" type="button" aria-expanded="false" aria-controls="ff-panel"><span class="ff-aa" aria-hidden="true">Aa</span><span class="ff-lab"><i class="rv-dot" aria-hidden="true"></i>Fonts</span></button>
      ${hintSeen() ? '' : '<div class="ff-hint" role="note"><span>Try other fonts</span><button type="button" class="ff-hint-x" aria-label="Dismiss hint">×</button></div>'}
    </div>
    <div class="ff-panel" id="ff-panel" role="dialog" aria-label="Try fonts" hidden>
      <div class="ff-head"><span>Try fonts</span><button type="button" class="ff-close" aria-label="Close">×</button></div>
      <div class="ff-body"></div>
    </div>`;
  document.body.appendChild(wrap);
  const tab = wrap.querySelector('.ff-tab');
  const panel = wrap.querySelector('.ff-panel');
  const hideHint = () => {
    wrap.querySelector('.ff-hint')?.remove();
    try { localStorage.setItem(HINT_KEY, '1'); } catch {}
  };
  wrap.querySelector('.ff-hint-x')?.addEventListener('click', () => { hideHint(); tab.focus({ preventScroll: true }); });
  const setOpen = (open) => {
    if (open) {
      hideHint();
      DISPLAY.concat(BODY).forEach((o) => loadFont(o.css)); // so every preview renders in its own face
      panel.hidden = false;
      requestAnimationFrame(() => wrap.classList.add('open'));
      panel.querySelector('.ff-close').focus({ preventScroll: true });
    } else {
      wrap.classList.remove('open');
      setTimeout(() => { if (!wrap.classList.contains('open')) panel.hidden = true; }, 250);
    }
    tab.setAttribute('aria-expanded', String(open));
  };
  tab.addEventListener('click', () => setOpen(!wrap.classList.contains('open')));
  wrap.querySelector('.ff-close').addEventListener('click', () => { setOpen(false); tab.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && wrap.classList.contains('open')) setOpen(false); });
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('.ff-opt');
    if (!b) return;
    const markChanged = b.dataset.group === 'mark' && pick.mark !== b.dataset.id;
    pick = { ...pick, [b.dataset.group]: b.dataset.id };
    apply();
    if (markChanged) window.CW?.setMarkMode(pick.mark);
    // Re-measure the cut once the new face is in (fonts already loaded don't fire 'loadingdone').
    const d = find(DISPLAY, pick.display);
    document.fonts.load(`${d.weight} 100px ${d.family}`).finally(() => window.CW?.fitMarks());
  });
  renderPanel();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();
