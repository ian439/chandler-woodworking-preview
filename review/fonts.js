// Font switcher (review only): lets Casey try heading, logo and body fonts on the live draft.
// The choice is kept in this browser; once he settles, the winner goes into site.css as the default.

const KEY = 'cw-review-fonts-v1';
const HINT_KEY = 'cw-review-fonts-hint-v1';
const html = document.documentElement;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Faces in Casey's screenshot that are commercial (Recoleta, Mermaid, Chapaza, Saonara, Vogue, Bambi) have no
// free web version, so the closest free faces stand in for them. Weights are the face's real range; nothing is
// ever synthesised. `track` is the wordmark's default letter-spacing in em, `scale` evens out optical size.
const DISPLAY = [
  { id: 'crimson', group: 'From your list', name: 'Crimson Pro', family: "'Crimson Pro', Georgia, serif", css: 'Crimson+Pro:ital,wght@0,200..900;1,200..900', wmin: 200, wmax: 900, weight: 500, italic: true, scale: 1.14, track: .16 },
  { id: 'playfair', group: 'From your list', name: 'Playfair Display', family: "'Playfair Display', Georgia, serif", css: 'Playfair+Display:ital,wght@0,400..900;1,400..900', wmin: 400, wmax: 900, weight: 400, italic: true, scale: 1, track: .14 },
  { id: 'ptserif', group: 'From your list', name: 'PT Serif', family: "'PT Serif', Georgia, serif", css: 'PT+Serif:ital,wght@0,400;0,700;1,400;1,700', weights: [400, 700], weight: 400, italic: true, scale: 1, track: .14 },
  { id: 'fraunces', group: 'Free matches for your list', name: 'Fraunces Soft', note: 'like Recoleta', family: "'Fraunces', Georgia, serif", css: 'Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1', wmin: 100, wmax: 900, weight: 400, italic: true, fvs: "'SOFT' 100, 'WONK' 1", scale: 1.04, track: .12 },
  { id: 'young', group: 'Free matches for your list', name: 'Young Serif', note: 'like Mermaid', family: "'Young Serif', Georgia, serif", css: 'Young+Serif', weights: [400], weight: 400, italic: false, scale: 1, track: .12 },
  { id: 'gloock', group: 'Free matches for your list', name: 'Gloock', note: 'like Chapaza', family: "'Gloock', Georgia, serif", css: 'Gloock', weights: [400], weight: 400, italic: false, scale: 1.02, track: .12 },
  { id: 'cormorant', group: 'Free matches for your list', name: 'Cormorant Garamond', note: 'like Saonara', family: "'Cormorant Garamond', Georgia, serif", css: 'Cormorant+Garamond:ital,wght@0,300..700;1,300..700', wmin: 300, wmax: 700, weight: 500, italic: true, scale: 1.2, track: .16 },
  { id: 'bodoni', group: 'Free matches for your list', name: 'Bodoni Moda', note: 'like Vogue', family: "'Bodoni Moda', Georgia, serif", css: 'Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900', wmin: 400, wmax: 900, weight: 400, italic: true, scale: 1, track: .14 },
  { id: 'dmserif', group: 'Free matches for your list', name: 'DM Serif Display', note: 'like Bambi', family: "'DM Serif Display', Georgia, serif", css: 'DM+Serif+Display:ital@0;1', weights: [400], weight: 400, italic: true, scale: 1, track: .1 },
  { id: 'newsreader', group: 'More relaxed modern serifs', name: 'Newsreader', family: "'Newsreader', Georgia, serif", css: 'Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800', wmin: 200, wmax: 800, weight: 400, italic: true, scale: 1.08, track: .14 },
  { id: 'lora', group: 'More relaxed modern serifs', name: 'Lora', family: "'Lora', Georgia, serif", css: 'Lora:ital,wght@0,400..700;1,400..700', wmin: 400, wmax: 700, weight: 400, italic: true, scale: 1, track: .14 },
  { id: 'petrona', group: 'More relaxed modern serifs', name: 'Petrona', family: "'Petrona', Georgia, serif", css: 'Petrona:ital,wght@0,100..900;1,100..900', wmin: 100, wmax: 900, weight: 400, italic: true, scale: 1.04, track: .14 },
  { id: 'instrument', group: 'More relaxed modern serifs', name: 'Instrument Serif', note: 'narrow', family: "'Instrument Serif', Georgia, serif", css: 'Instrument+Serif:ital@0;1', weights: [400], weight: 400, italic: true, scale: 1.22, track: .14 },
  { id: 'alata', group: 'First draft', name: 'Alata', note: 'the original sans', family: "'Alata', system-ui, sans-serif", css: 'Alata', weights: [400], weight: 400, italic: false, scale: 1, track: .2 },
];
const BODY = [
  { id: 'archivo', name: 'Archivo', note: 'Clean sans (current)', family: "'Archivo', system-ui, sans-serif", css: null },
  { id: 'instrument-sans', name: 'Instrument Sans', note: 'Softer sans', family: "'Instrument Sans', system-ui, sans-serif", css: 'Instrument+Sans:wght@400..600' },
  { id: 'crimson-body', name: 'Crimson Pro', note: 'Serif throughout', family: "'Crimson Pro', Georgia, serif", css: 'Crimson+Pro:ital,wght@0,200..900;1,200..900', body: '19px', label: '16px' },
];
const MARKS = [
  { id: 'type', name: 'CW in the heading font' },
  { id: 'drawn', name: 'Original drawn CW' },
];

const WEIGHT_NAMES = { 100: 'Thin', 200: 'Extra light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extra bold', 900: 'Black' };
const SPACING = [
  { id: 'tight', name: 'Tight', mult: .5 },
  { id: 'normal', name: 'Normal', mult: 1 },
  { id: 'wide', name: 'Wide', mult: 1.7 },
  { id: 'wider', name: 'Extra wide', mult: 2.4 },
];
const SIZE = { min: 80, max: 140, step: 5 };
// Quick looks set several style controls at once. Weights snap to the nearest one the face actually has.
const LOOKS = [
  { id: 'default', name: 'Default', set: { weight: 'default', italic: false, size: 100, spacing: 'normal' } },
  { id: 'bold', name: 'Bold', set: { weight: 700, italic: false, size: 110, spacing: 'normal' } },
  { id: 'minimal', name: 'Minimal', set: { weight: 300, italic: false, size: 90, spacing: 'wide' } },
  { id: 'thin', name: 'Thin', set: { weight: 100, italic: false, size: 105, spacing: 'wide' } },
];
const DEFAULTS = { display: 'crimson', body: 'archivo', mark: 'type', ...LOOKS[0].set };

const weightsOf = (d) => d.weights || Object.keys(WEIGHT_NAMES).map(Number).filter((w) => w >= d.wmin && w <= d.wmax);
// The weight actually used: the wanted one, snapped to the nearest weight this face has.
function weightFor(d, want = pick.weight) {
  const target = want === 'default' ? d.weight : want;
  return weightsOf(d).reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
}
const italicFor = (d) => d.italic && pick.italic;
const spacingFor = (d) => `${(d.track * (SPACING.find((x) => x.id === pick.spacing) || SPACING[1]).mult).toFixed(3)}em`;

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
    if (s) return { ...DEFAULTS, ...s, size: Math.min(SIZE.max, Math.max(SIZE.min, Number(s.size) || DEFAULTS.size)) };
  } catch {}
  return { ...DEFAULTS };
}
let pick = read();
let wrap = null; // the panel, mounted on DOMContentLoaded
const find = (list, id) => list.find((x) => x.id === id) || list[0];

function apply(render = true) {
  const d = find(DISPLAY, pick.display);
  const b = find(BODY, pick.body);
  loadFont(d.css);
  loadFont(b.css);
  const st = html.style;
  st.setProperty('--display', d.family);
  st.setProperty('--display-weight', weightFor(d));
  st.setProperty('--display-style', italicFor(d) ? 'italic' : 'normal');
  st.setProperty('--display-fvs', d.fvs || 'normal');
  st.setProperty('--display-scale', (d.scale * pick.size / 100).toFixed(3));
  st.setProperty('--display-caps-track', spacingFor(d));
  st.setProperty('--sans', b.family);
  if (b.body) { st.setProperty('--fs-body', b.body); st.setProperty('--fs-label', b.label); }
  else { st.removeProperty('--fs-body'); st.removeProperty('--fs-label'); }
  html.dataset.mark = pick.mark;
  try { localStorage.setItem(KEY, JSON.stringify(pick)); } catch {}
  if (render) renderPanel();
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

const chip = (attrs, label, on, disabled = false) =>
  `<button type="button" class="ff-chip" ${attrs} aria-pressed="${on}"${disabled ? ' disabled' : ''}>${esc(label)}</button>`;

const lookActive = (l) => Object.entries(l.set).every(([k, v]) => pick[k] === v);

// Each face previews with the current weight and italic (as near as that face allows).
function displaySample(o) {
  const w = weightFor(o);
  const it = o.italic && pick.italic ? 'italic' : 'normal';
  return `font-family:${o.family};font-weight:${w};font-style:${it};font-variation-settings:${o.fvs || 'normal'};font-size:${Math.round(20 * o.scale)}px`;
}

// One line Casey can screenshot or read out to Ian.
function nowText() {
  const d = find(DISPLAY, pick.display);
  const m = find(MARKS, pick.mark);
  const b = find(BODY, pick.body);
  const sp = SPACING.find((x) => x.id === pick.spacing) || SPACING[1];
  return `Now: ${d.name}, ${WEIGHT_NAMES[weightFor(d)].toLowerCase()}${italicFor(d) ? ' italic' : ''}, ${pick.size}% size, `
    + `${sp.name.toLowerCase()} spacing. Logo: ${m.name}. Body: ${b.name}.`;
}

function renderPanel() {
  if (!wrap) return;
  const d = find(DISPLAY, pick.display);
  const ws = weightsOf(d);
  const w = weightFor(d);
  const groups = [...new Set(DISPLAY.map((o) => o.group))];
  const scroll = wrap.querySelector('.ff-panel')?.scrollTop;
  wrap.querySelector('.ff-body').innerHTML = `
    <p class="ff-pick">${esc(nowText())}</p>

    <p class="ff-group">Quick looks</p>
    <div class="ff-chips">${LOOKS.map((l) => chip(`data-look="${l.id}"`, l.name, lookActive(l))).join('')}</div>

    <p class="ff-group">Weight${ws.length === 1 ? ' <span class="ff-note">· this font has one weight</span>' : ''}</p>
    <div class="ff-chips">${ws.map((x) => chip(`data-set="weight" data-val="${x}"`, WEIGHT_NAMES[x], x === w, ws.length === 1)).join('')}</div>

    <p class="ff-group">Style${d.italic ? '' : ' <span class="ff-note">· no italic in this font</span>'}</p>
    <div class="ff-chips">
      ${chip('data-set="italic" data-val="false"', 'Upright', !italicFor(d), !d.italic)}
      ${chip('data-set="italic" data-val="true"', 'Italic', italicFor(d), !d.italic)}
    </div>

    <p class="ff-group"><label for="ff-size">Heading size</label> <span class="ff-note" id="ff-size-val">· ${pick.size}%</span></p>
    <input class="ff-range" id="ff-size" type="range" min="${SIZE.min}" max="${SIZE.max}" step="${SIZE.step}" value="${pick.size}">

    <p class="ff-group">Wordmark spacing</p>
    <div class="ff-chips">${SPACING.map((x) => chip(`data-set="spacing" data-val="${x.id}"`, x.name, pick.spacing === x.id)).join('')}</div>

    ${groups.map((g) => `<p class="ff-group ff-group-head">${esc(g)}</p>
      ${DISPLAY.filter((o) => o.group === g).map((o) => option('display', o, 'Chandler Woodworking', displaySample(o))).join('')}`).join('')}

    <p class="ff-group ff-group-head">Logo</p>
    ${MARKS.map((o) => `<button type="button" class="ff-opt ff-small" data-group="mark" data-id="${o.id}" aria-pressed="${pick.mark === o.id}"><span class="ff-name">${esc(o.name)}</span></button>`).join('')}

    <p class="ff-group ff-group-head">Body text</p>
    ${BODY.map((o) => option('body', o, 'Furniture made to commission.', `font-family:${o.family};font-size:${o.body ? 19 : 17}px`)).join('')}`;
  if (scroll) wrap.querySelector('.ff-panel').scrollTop = scroll;
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
  // Every change re-applies, then re-measures the logo cut once the face/weight/style is loaded
  // (fonts already loaded don't fire 'loadingdone').
  const commit = (next, render = true) => {
    const markChanged = next.mark && next.mark !== pick.mark;
    pick = { ...pick, ...next };
    apply(render);
    if (markChanged) window.CW?.setMarkMode(pick.mark);
    const d = find(DISPLAY, pick.display);
    document.fonts.load(`${italicFor(d) ? 'italic ' : ''}${weightFor(d)} 100px ${d.family}`).finally(() => window.CW?.fitMarks());
  };
  panel.addEventListener('click', (e) => {
    const opt = e.target.closest('.ff-opt');
    if (opt) return commit({ [opt.dataset.group]: opt.dataset.id });
    const c = e.target.closest('.ff-chip');
    if (!c || c.disabled) return;
    if (c.dataset.look) return commit(LOOKS.find((l) => l.id === c.dataset.look).set);
    const { set, val } = c.dataset;
    commit({ [set]: set === 'weight' ? Number(val) : set === 'italic' ? val === 'true' : val });
  });
  panel.addEventListener('input', (e) => {
    if (e.target.id !== 'ff-size') return;
    // Don't re-render while dragging (it would replace the slider); just update the readouts.
    commit({ size: Number(e.target.value) }, false);
    panel.querySelector('#ff-size-val').textContent = `· ${pick.size}%`;
    panel.querySelector('.ff-pick').textContent = nowText();
    panel.querySelectorAll('[data-look]').forEach((c) => c.setAttribute('aria-pressed', String(lookActive(LOOKS.find((l) => l.id === c.dataset.look)))));
  });
  renderPanel();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();
