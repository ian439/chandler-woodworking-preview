// Review layer: chalk-red notes, filler/example flags, notes button and Ian's walkthrough.
// Only copied into the build when REVIEW_MODE is on (see build.mjs).

const STORE_KEY = 'cw-review-walkthrough-v1';
const NOTES_KEY = 'cw-review-notes-hidden';
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mobile = () => matchMedia('(max-width: 767px)').matches;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= Notes on the page ================= */

const STANDIN = 'Stand-in text. Casey needs to write or confirm this.';
const EXAMPLE = 'Example — needs Casey’s input.';
const NOTES = {
  bio: { kind: 'standin' },
  'p1-meta': { kind: 'standin', note: 'Stand-in name, year, wood and size. Casey to confirm.' },
  'p1-story': { kind: 'standin' },
  'p2-meta': { kind: 'standin', note: 'Stand-in piece. Casey to confirm what the second piece is.' },
  'p2-story': { kind: 'standin' },
  'p1-ph3': { kind: 'filler', need: 'close-up of the drawer pulls and door joinery' },
  'p1-ph4': { kind: 'filler', need: 'detail of the open bay and basket fit' },
  'p1-ph5': { kind: 'filler', need: 'the top edge and backsplash, raking light' },
  'p1-ph6': { kind: 'filler', need: 'the vanity straight-on, on light seamless paper' },
  'p2-ph1': { kind: 'filler', need: 'the second piece straight-on, on light seamless paper' },
  'p2-ph2': { kind: 'filler', need: 'a joinery or hardware detail on the second piece' },
  'p2-ph3': { kind: 'filler', need: 'the drawer open, showing the joinery' },
  'p2-ph4': { kind: 'filler', need: 'the top surface and grain, close up' },
  'p2-ph5': { kind: 'filler', need: 'the second piece in the room it lives in' },
  'studio-lead': { kind: 'filler', need: 'wide shot of the shop, natural light' },
  'form-photo': { kind: 'filler', need: 'a finished piece in a client’s home' },
  'studio-photo': { kind: 'filler', need: 'any shot of the work or the shop' },
  shop1: { kind: 'filler', need: 'hands at work, chisel or plane on a piece' },
  shop2: { kind: 'filler', need: 'rough lumber stacked in the shop' },
  shop3: { kind: 'filler', need: 'a piece in progress on the bench' },
  shop4: { kind: 'filler', need: 'glue-up or clamps on a carcass' },
  shop5: { kind: 'filler', need: 'the tool wall' },
  shop6: { kind: 'filler', need: 'finish going on, close up' },
  'lead-1': { kind: 'example', inline: true },
  'lead-2': { kind: 'example', inline: true },
  'lead-3': { kind: 'example', inline: true },
  'lead-4': { kind: 'example', inline: true },
  'reply-time': { kind: 'example' },
  email: { kind: 'example', inline: true },
  instagram: { kind: 'example', inline: true },
  location: { kind: 'example', inline: true },
};

const INLINE_RIGHT = new Set(['lead-1', 'lead-2', 'lead-3', 'lead-4', 'email', 'instagram', 'location', 'reply-time']);

function noteText(n) {
  if (n.kind === 'filler') return `Filler photo. Needed: ${n.need}.`;
  if (n.kind === 'missing') return `Photo needed: ${n.need}.`;
  if (n.kind === 'example') return EXAMPLE;
  return n.note || STANDIN;
}

function decorate(el) {
  if (el.dataset.rvDone) return;
  const n = NOTES[el.dataset.rid];
  if (!n) return;
  el.dataset.rvDone = '1';
  const text = noteText(n);
  const pin = `<span class="rv-pin${INLINE_RIGHT.has(el.dataset.rid) ? ' right' : ''}" role="button" tabindex="0" aria-label="Note from Ian: ${esc(text)}"><span class="rv-bubble" role="tooltip">${esc(text)}</span></span>`;
  if (n.kind === 'filler' || n.kind === 'missing') {
    el.insertAdjacentHTML('afterend', pin); // beside the frame, inside .media, so the bubble isn't clipped
  } else {
    el.classList.add('rv-host');
    el.insertAdjacentHTML('beforeend', pin);
  }
}

// Pins open on hover (desktop) or tap (iPhone). Taps never trigger the link or piece they sit on.
function placeBubble(pin) {
  pin.classList.toggle('flip', pin.getBoundingClientRect().left > innerWidth / 2);
}
document.addEventListener('pointerover', (e) => { const p = e.target.closest?.('.rv-pin'); if (p) placeBubble(p); });
document.addEventListener('focusin', (e) => { const p = e.target.closest?.('.rv-pin'); if (p) placeBubble(p); });
document.addEventListener('click', (e) => {
  const pin = e.target.closest('.rv-pin');
  $$('.rv-pin.open').forEach((p) => p !== pin && p.classList.remove('open'));
  if (!pin) return;
  e.preventDefault();
  e.stopPropagation();
  placeBubble(pin);
  pin.classList.toggle('open');
}, true);
document.addEventListener('keydown', (e) => {
  const pin = e.target.closest?.('.rv-pin');
  if (pin && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pin.classList.toggle('open'); }
});

function decorateAll(root = document) {
  if (root.matches?.('[data-rid]')) decorate(root);
  $$('[data-rid]', root).forEach(decorate);
}

function setNotesHidden(hidden) {
  html.classList.toggle('rv-off', hidden);
  try { localStorage.setItem(NOTES_KEY, hidden ? '1' : ''); } catch {}
  const b = $('[data-rv="toggle"]');
  if (b) b.textContent = hidden ? 'Show notes' : 'Hide notes';
}

function mountNotesButton() {
  const wrap = document.createElement('div');
  wrap.className = 'rv-notes';
  wrap.innerHTML = `
    <button class="rv-notes-btn tap" type="button" aria-expanded="false" aria-haspopup="true"><i class="rv-dot" aria-hidden="true"></i>Notes</button>
    <div class="rv-menu" hidden>
      <p class="rv-hint">Red dots are notes from Ian. Tap one to read it. They won’t be on the real site.</p>
      <button type="button" data-rv="toggle">Hide notes</button>
      <button type="button" data-rv="walk">Replay walkthrough</button>
    </div>`;
  document.body.appendChild(wrap);
  const btn = $('.rv-notes-btn', wrap);
  const menu = $('.rv-menu', wrap);
  const setOpen = (o) => { menu.hidden = !o; btn.setAttribute('aria-expanded', String(o)); };
  btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menu.hidden); });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setOpen(false); });
  $('[data-rv="toggle"]', wrap).addEventListener('click', () => { setNotesHidden(!html.classList.contains('rv-off')); setOpen(false); });
  $('[data-rv="walk"]', wrap).addEventListener('click', () => { setOpen(false); startWalkthrough(0); });
  let hidden = false;
  try { hidden = localStorage.getItem(NOTES_KEY) === '1'; } catch {}
  setNotesHidden(hidden);
}

/* ================= Walkthrough ================= */

const EMAIL_DEFAULT = () => window.CW?.site?.email || '';

const STEPS = [
  {
    id: 'hello', target: null,
    text: 'Hey Casey, it’s Ian. This is the first draft of your site. I’ll show you around and ask a few quick questions along the way. Tap an answer to move on.',
    options: [{ label: 'Start', start: true }, { label: 'Skip for now', later: true }],
  },
  {
    id: 'name', label: 'Name', page: '/', target: '[data-wt="name"]',
    text: 'This is your name as it appears on the site.',
    q: 'Which name should the site use?',
    options: ['Chandler Woodworking', 'Chandler Wood Works', { label: 'Something else', input: 'text', placeholder: 'What should it say?' }],
    note: true,
  },
  {
    id: 'pieces', label: 'Pieces', page: '/', target: '.piece-link',
    text: 'Each piece gets the full width and its own link you can text to people. We have two so far.',
    q: 'Are these two right, and what should we photograph next?',
    options: ['Looks right', 'Change something'],
    note: true, noteLabel: 'Next to photograph', notePlaceholder: 'What should we photograph next?',
  },
  {
    id: 'notes', page: null, target: '.rv-notes-btn',
    text: 'The small red dots are notes from me. Tap one to read it. They won’t be on the real site. Notes marked “Example” are placeholders I made up and need your real answer. Most photos are fillers for now; we’ll swap in more real photos over time.',
    options: [{ label: 'Next', next: true }],
  },
  {
    id: 'bio', label: 'Bio', page: '/studio', target: '[data-wt="bio"]',
    text: 'This bio is a stand-in I wrote.',
    options: [{ label: 'I’ll write my own', input: 'textarea', placeholder: 'Write your bio here. A few sentences is plenty.' }, 'Draft one for me'],
  },
  {
    id: 'timeline', label: 'Typical timeline', page: '/studio', target: '[data-wt="process"]',
    text: 'These lead times are examples I filled in. I need your real ones.',
    q: 'How long does a typical piece take, start to finish?',
    options: ['Under a month', '1–2 months', '2–3 months', 'It varies a lot'],
    note: true,
  },
  {
    id: 'budget', label: 'Typical budget', page: '/commissions', target: null,
    text: 'The inquiry form is open-ended, so it doesn’t show prices. It still helps me to know your usual range.',
    q: 'Typical commission cost?',
    options: ['Under $1,500', '$1,500–4,000', '$4,000–8,000', 'Higher'],
    note: true,
  },
  {
    id: 'email', label: 'Inquiry email', page: '/commissions', target: '[data-wt="form"]',
    text: 'When someone fills this out, it gets emailed to you.',
    q: 'Send inquiries to this email?',
    email: true,
  },
  {
    id: 'adding', label: 'Adding pieces later', page: '/commissions', target: '[data-wt="form"]',
    text: 'New pieces will need adding over time.',
    q: 'Who adds new pieces after launch?',
    options: ['Ian does', 'I want to do it myself', 'Not sure yet'],
  },
  {
    id: 'instagram', label: 'Instagram', page: null, target: '[data-wt="footer-ig"]',
    text: 'The site links to your personal Instagram right now (@casey.chandler.11). A separate account just for your woodworking could work well. Down the line we could easily make posts from the work on this site.',
    options: ['Keep my personal one', 'Make a separate woodworking account', 'Not sure yet'],
    note: true, noteLabel: 'Handle idea', notePlaceholder: 'Handle idea?',
  },
  {
    id: 'location', label: 'Location', page: null, target: '[data-wt="footer-loc"]',
    text: 'We mention Santa Cruz on the site.',
    options: ['Santa Cruz', 'Santa Cruz, California', { label: 'Something else', input: 'text', placeholder: 'How should it read?' }],
  },
  {
    id: 'domain', label: 'Domain ideas', page: null, target: null,
    text: 'We still need a web address for the site.',
    q: 'Any domain name ideas?',
    textOnly: true, placeholder: 'e.g. chandlerwoodworking.com',
  },
  {
    id: 'overall', label: 'Overall', page: null, target: null,
    text: 'Last one.',
    q: 'How do you feel about the draft?',
    options: ['Love it', 'Mostly good', 'Needs changes'],
    note: true, notePlaceholder: 'Anything you’d change?',
  },
];
const QUESTION_COUNT = STEPS.length - 1;

let state = load();
let active = false;
let els = null;
let busy = false;

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && typeof s === 'object') return { step: 0, answers: {}, status: 'new', ...s };
  } catch {}
  return { step: 0, answers: {}, status: 'new' };
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} }

function optLabel(o) { return typeof o === 'string' ? o : o.label; }

function startWalkthrough(step = state.step || 0) {
  state.status = 'active';
  save();
  if (!active) mountWalkthrough();
  go(step);
}

function mountWalkthrough() {
  active = true;
  html.classList.add('wt-active', 'wt-lock');
  const blocker = document.createElement('div');
  blocker.className = 'wt-blocker';
  const spot = document.createElement('div');
  spot.className = 'wt-spot none';
  const card = document.createElement('div');
  card.className = 'wt-card enter';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Walkthrough from Ian');
  card.tabIndex = -1;
  document.body.append(blocker, spot, card);
  els = { blocker, spot, card };
  // Start the spotlight collapsed at the centre of the viewport so the first glide looks intentional.
  placeSpot(null);
  addEventListener('resize', onResize);
  document.addEventListener('keydown', onKey, true);
}

function closeWalkthrough(status = 'closed') {
  if (!active) return;
  state.status = status;
  save();
  active = false;
  html.classList.remove('wt-active', 'wt-lock');
  removeEventListener('resize', onResize);
  document.removeEventListener('keydown', onKey, true);
  Object.values(els).forEach((e) => e.remove());
  els = null;
}

function onResize() { if (active && state.step < STEPS.length) placeAll(false); }

function onKey(e) {
  if (!active) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeWalkthrough('closed'); return; }
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
  if (e.key === 'ArrowRight' && !typing) {
    e.preventDefault();
    if (state.step === 0) go(1);
    else if (state.step < STEPS.length) advance();
  }
  if (e.key === 'Tab' && els) {
    const f = $$('button, input, textarea, [href]', els.card).filter((x) => x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    else if (!els.card.contains(document.activeElement)) { e.preventDefault(); f[0].focus(); }
  }
}

function record(id, patch) {
  state.answers[id] = { ...(state.answers[id] || {}), ...patch, skipped: false };
  save();
}
function skip(id) {
  const prev = state.answers[id] || {};
  if (!prev.choice && !prev.text) state.answers[id] = { ...prev, skipped: true };
  save();
}
function advance() {
  const s = STEPS[state.step];
  if (s && s.label && !state.answers[s.id]?.choice && !state.answers[s.id]?.text) skip(s.id);
  go(state.step + 1);
}

async function go(i) {
  if (!active || busy) return;
  busy = true;
  try {
    state.step = Math.max(0, i);
    save();
    if (state.step >= STEPS.length) {
      await showEnd();
      return;
    }
    const s = STEPS[state.step];
    els.card.classList.add('enter');
    if (s.page && window.CW) {
      if (window.CW.openPiece) await window.CW.closePiece();
      if (currentPath() !== s.page) {
        els.spot.classList.add('hidden');
        await window.CW.go(s.page);
        els.spot.classList.remove('hidden');
      }
    }
    renderCard(s);
    await scrollToTarget(s);
    placeAll(true);
    els.card.classList.remove('enter');
    const first = $('[data-text]', els.card);
    (first || els.card).focus({ preventScroll: true });
  } finally {
    busy = false;
  }
}

function currentPath() {
  const p = window.CW?.page;
  return p === 'studio' ? '/studio' : p === 'commissions' ? '/commissions' : '/';
}

function targetEl(s) { return s.target ? $(s.target) : null; }

function isFixed(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (getComputedStyle(n).position === 'fixed') return true;
  }
  return false;
}

async function scrollToTarget(s) {
  const el = targetEl(s);
  if (!el || isFixed(el)) return;
  const r = el.getBoundingClientRect();
  const docTop = r.top + scrollY;
  const vh = innerHeight;
  let top;
  if (mobile()) {
    top = r.height > vh * 0.42 ? docTop - 64 : docTop + r.height / 2 - vh * 0.27;
  } else {
    top = r.height > vh - 180 ? docTop - 96 : docTop + r.height / 2 - vh / 2;
  }
  const max = document.documentElement.scrollHeight - vh;
  top = Math.max(0, Math.min(max, Math.round(top)));
  if (Math.abs(top - scrollY) < 2) return;
  if (reduced()) { scrollTo(0, top); return; }
  scrollTo({ top, behavior: 'smooth' });
  await new Promise((res) => {
    const t = setTimeout(res, 700);
    addEventListener('scrollend', () => { clearTimeout(t); res(); }, { once: true });
  });
}

function placeSpot(el) {
  const spot = els.spot;
  if (!el) {
    spot.classList.add('none');
    Object.assign(spot.style, { left: `${scrollX + innerWidth / 2}px`, top: `${scrollY + innerHeight / 2}px`, width: '0px', height: '0px' });
    return null;
  }
  const pad = 8;
  const r = el.getBoundingClientRect();
  spot.classList.remove('none');
  const box = {
    left: r.left + scrollX - pad,
    top: r.top + scrollY - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  };
  Object.assign(spot.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
  return r;
}

function placeAll(animate) {
  const s = STEPS[state.step];
  if (!s || !els) return;
  const el = targetEl(s);
  const r = placeSpot(el);
  const card = els.card;
  if (!animate) card.style.transition = 'none';
  card.classList.remove('center', 'fixed', 'pin-top', 'pin-bottom');

  if (!r) {
    card.classList.add('fixed', 'center');
  } else if (mobile()) {
    const mid = (Math.max(0, r.top) + Math.min(innerHeight, r.bottom)) / 2;
    card.classList.add(mid < innerHeight / 2 ? 'pin-bottom' : 'pin-top');
  } else {
    const cw = card.offsetWidth, ch = card.offsetHeight, gap = 24, m = 16;
    let x, y;
    if (r.right + gap + cw < innerWidth - m) { x = r.right + gap; y = r.top; }
    else if (r.left - gap - cw > m) { x = r.left - gap - cw; y = r.top; }
    else if (r.bottom + gap + ch < innerHeight - m) { x = r.left + r.width / 2 - cw / 2; y = r.bottom + gap; }
    else if (r.top - gap - ch > m) { x = r.left + r.width / 2 - cw / 2; y = r.top - gap - ch; }
    else { x = innerWidth - cw - 40; y = innerHeight - ch - 40; }
    x = Math.max(m, Math.min(innerWidth - cw - m, x));
    y = Math.max(m, Math.min(innerHeight - ch - m, y));
    card.style.left = `${x + scrollX}px`;
    card.style.top = `${y + scrollY}px`;
  }
  if (!animate) requestAnimationFrame(() => (card.style.transition = ''));
}

/* ---------- Card rendering ---------- */

const RX = '<span class="rx tl"></span><span class="rx tr"></span><span class="rx bl"></span><span class="rx br"></span>';

function renderCard(s) {
  const card = els.card;
  const a = state.answers[s.id] || {};
  const count = state.step === 0 ? '' : `${state.step} of ${QUESTION_COUNT}`;
  let body = '';

  if (s.email) {
    const val = a.text || EMAIL_DEFAULT();
    body = `<div class="wt-field"><input type="email" inputmode="email" autocapitalize="off" spellcheck="false" value="${esc(val)}" aria-label="Inquiry email" data-email></div>
      <div class="wt-opts">
        <button class="wt-opt" type="button" data-yes aria-pressed="${a.choice === 'Yes'}">Yes</button>
        <button class="wt-opt" type="button" data-diff aria-pressed="${a.choice === 'Different'}">Use a different email</button>
      </div>
      <div class="wt-field" data-diff-go hidden><button class="wt-opt primary wt-go" type="button" data-save-email>Save and continue</button></div>`;
  } else if (s.textOnly) {
    body = `<div class="wt-field"><input type="text" placeholder="${esc(s.placeholder)}" value="${esc(a.text || '')}" aria-label="${esc(s.q)}" data-text>
      <div class="wt-opts"><button class="wt-opt primary" type="button" data-text-go>Next</button></div></div>`;
  } else {
    body = `<div class="wt-opts">${s.options
      .map((o, i) => {
        const label = optLabel(o);
        const primary = (o.start || o.next) ? ' primary' : '';
        const pressed = a.choice === label ? ' aria-pressed="true"' : '';
        return `<button class="wt-opt${primary}" type="button" data-opt="${i}"${pressed}>${esc(label)}</button>`;
      })
      .join('')}</div>
      <div class="wt-field" data-input hidden></div>`;
  }

  const noteOpen = !!a.note;
  const note = s.note
    ? `<button class="wt-addnote" type="button" data-addnote ${noteOpen ? 'hidden' : ''}>${s.noteLabel ? `Add a note: ${esc(s.noteLabel.toLowerCase())}` : 'Add a note'}</button>
       <div class="wt-field" data-note ${noteOpen ? '' : 'hidden'}><textarea placeholder="${esc(s.notePlaceholder || 'Add a note (optional)')}" aria-label="Note">${esc(a.note || '')}</textarea></div>`
    : '';

  const foot = state.step === 0
    ? ''
    : `<div class="wt-foot">
        <button type="button" data-back>${state.step > 1 ? 'Back' : ''}</button>
        <span class="wt-keys">→ next · esc close</span>
        <button type="button" data-skip>Skip</button>
      </div>`;

  card.classList.remove('wt-end');
  card.innerHTML = `${RX}
    <div class="wt-head"><span>Walkthrough from Ian</span><span class="wt-count">${count}</span></div>
    <p class="wt-text">${esc(s.text)}</p>
    ${s.q ? `<p class="wt-q">${esc(s.q)}</p>` : ''}
    ${body}
    ${note}
    ${foot}`;

  const getNote = () => $('[data-note] textarea', card)?.value.trim() || '';

  $('[data-addnote]', card)?.addEventListener('click', (e) => {
    e.currentTarget.hidden = true;
    const f = $('[data-note]', card);
    f.hidden = false;
    $('textarea', f).focus();
    placeAll(true);
  });
  $('[data-note] textarea', card)?.addEventListener('input', (e) => {
    if (state.answers[s.id]) { state.answers[s.id].note = e.target.value.trim(); save(); }
  });
  $('[data-back]', card)?.addEventListener('click', () => state.step > 1 && go(state.step - 1));
  $('[data-skip]', card)?.addEventListener('click', () => { if (s.label) skip(s.id); go(state.step + 1); });

  $$('[data-opt]', card).forEach((b) =>
    b.addEventListener('click', () => {
      const o = s.options[Number(b.dataset.opt)];
      const label = optLabel(o);
      if (o.later) { closeWalkthrough('closed'); return; }
      if (o.start || o.next) { go(state.step + 1); return; }
      if (o.input) {
        $$('[data-opt]', card).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        const f = $('[data-input]', card);
        const prev = a.choice === label ? a.text || '' : '';
        f.innerHTML = `${o.input === 'textarea'
          ? `<textarea placeholder="${esc(o.placeholder)}" aria-label="${esc(label)}">${esc(prev)}</textarea>`
          : `<input type="text" placeholder="${esc(o.placeholder)}" value="${esc(prev)}" aria-label="${esc(label)}">`}
          <button class="wt-opt primary wt-go" type="button">Next</button>`;
        f.hidden = false;
        const input = $('input, textarea', f);
        input.focus();
        const submit = () => { record(s.id, { choice: label, text: input.value.trim(), note: getNote() }); go(state.step + 1); };
        $('.wt-go', f).addEventListener('click', submit);
        if (input.tagName === 'INPUT') input.addEventListener('keydown', (e) => e.key === 'Enter' && submit());
        placeAll(true);
        return;
      }
      record(s.id, { choice: label, text: '', note: getNote() });
      go(state.step + 1);
    })
  );

  if (s.email) {
    const input = $('[data-email]', card);
    const valid = () => /^\S+@\S+\.\S+$/.test(input.value.trim());
    const saveEmail = (choice) => {
      if (!valid()) { input.focus(); input.setAttribute('aria-invalid', 'true'); return; }
      record(s.id, { choice, text: input.value.trim() });
      go(state.step + 1);
    };
    $('[data-yes]', card).addEventListener('click', () => { input.value = input.value.trim() || EMAIL_DEFAULT(); saveEmail('Yes'); });
    $('[data-diff]', card).addEventListener('click', (e) => {
      e.currentTarget.setAttribute('aria-pressed', 'true');
      input.value = '';
      input.placeholder = 'Your email';
      input.focus();
      $('[data-diff-go]', card).hidden = false;
      placeAll(true);
    });
    $('[data-save-email]', card).addEventListener('click', () => saveEmail('Different'));
    input.addEventListener('keydown', (e) => e.key === 'Enter' && saveEmail(input.value.trim() === EMAIL_DEFAULT() ? 'Yes' : 'Different'));
  }

  if (s.textOnly) {
    const input = $('[data-text]', card);
    const submit = () => {
      const v = input.value.trim();
      if (v) record(s.id, { choice: '', text: v });
      else skip(s.id);
      go(state.step + 1);
    };
    $('[data-text-go]', card).addEventListener('click', submit);
    input.addEventListener('keydown', (e) => e.key === 'Enter' && submit());
  }
}

/* ---------- End screen ---------- */

function answerLine(s) {
  const a = state.answers[s.id];
  if (!a || a.skipped || (!a.choice && !a.text)) return null;
  const withNote = (base, label = 'Note') => (a.note ? `${base}. ${label}: ${a.note}` : base);
  switch (s.id) {
    case 'name':
    case 'location':
      return a.text ? `${a.text}` : withNote(a.choice);
    case 'pieces':
      return withNote(a.choice, 'Next to photograph');
    case 'bio':
      return a.text || a.choice;
    case 'email':
      return a.text;
    case 'instagram':
      return withNote(a.choice, 'Handle idea');
    case 'domain':
      return a.text;
    default:
      return withNote(a.choice);
  }
}

function buildText() {
  const lines = ["CASEY'S SITE FEEDBACK", ''];
  const skipped = [];
  STEPS.filter((s) => s.label).forEach((s) => {
    let v = answerLine(s);
    if (v && s.id === 'name' && state.answers.name?.note && state.answers.name?.text) v += `. Note: ${state.answers.name.note}`;
    if (v) lines.push(`${s.label}: ${v}`);
    else skipped.push(s.label);
  });
  lines.push(`Skipped: ${skipped.length ? skipped.join(', ') : 'none'}`);
  return lines.join('\n');
}

async function showEnd() {
  state.status = 'done';
  save();
  placeSpot(null);
  const card = els.card;
  const text = buildText();
  const canShare = mobile() && typeof navigator.share === 'function';
  card.classList.add('enter', 'wt-end');
  card.innerHTML = `${RX}
    <div class="wt-head"><span>Walkthrough from Ian</span><span class="wt-count">Done</span></div>
    <h2>Thanks, Casey. Send this to Ian.</h2>
    <pre>${esc(text)}</pre>
    <div class="wt-opts">
      ${canShare ? '<button class="wt-opt primary" type="button" data-share>Send to Ian</button>' : ''}
      <button class="wt-opt ${canShare ? '' : 'primary'}" type="button" data-copy>Copy my answers</button>
      <button class="wt-opt" type="button" data-done>Close</button>
    </div>
    <p class="wt-back">Want to change an answer? <button type="button" data-back>Go back.</button></p>`;
  placeAll(true);
  card.getBoundingClientRect();
  card.classList.remove('enter');
  card.focus({ preventScroll: true });

  const copyBtn = $('[data-copy]', card);
  copyBtn.addEventListener('click', async () => {
    if (await copyText(text)) {
      copyBtn.textContent = 'Copied. Now paste it in a text to Ian.';
    } else {
      // Clipboard blocked: show the text selected so it can be copied by hand.
      let ta = $('.wt-manual', card);
      if (!ta) {
        card.querySelector('.wt-opts').insertAdjacentHTML('afterend', '<textarea class="wt-manual" readonly aria-label="Your answers"></textarea>');
        ta = $('.wt-manual', card);
        ta.value = text;
      }
      ta.focus();
      ta.select();
      copyBtn.textContent = 'Select the text below and copy it';
    }
  });
  $('[data-share]', card)?.addEventListener('click', () => {
    navigator.share({ text }).catch(() => {});
  });
  $('[data-done]', card).addEventListener('click', () => closeWalkthrough('done'));
  $('[data-back]', card).addEventListener('click', () => { state.status = 'active'; go(STEPS.length - 1); });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/* ================= Boot ================= */

function init() {
  decorateAll();
  new MutationObserver((muts) => {
    muts.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && decorateAll(n)));
  }).observe(document.body, { childList: true, subtree: true });
  mountNotesButton();
}

let revealed = false;
function onRevealed() {
  if (revealed) return;
  revealed = true;
  const boot = () => {
    if (state.status === 'new' || state.status === 'active') startWalkthrough(state.status === 'new' ? 0 : state.step);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}
// This module runs before site.js, so listen for the reveal first.
document.addEventListener('cw:revealed', onRevealed);
document.addEventListener('DOMContentLoaded', () => {
  init();
  if (window.CW?.revealed) onRevealed();
});
