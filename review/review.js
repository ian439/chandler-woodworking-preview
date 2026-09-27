// Review layer: chalk-red note dots (filler photos, stand-in text, example values) and the notes button.
// Only copied into the build when REVIEW_MODE is on (see build.mjs).

const NOTES_KEY = 'cw-review-notes-hidden';
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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
    </div>`;
  document.body.appendChild(wrap);
  const btn = $('.rv-notes-btn', wrap);
  const menu = $('.rv-menu', wrap);
  const setOpen = (o) => { menu.hidden = !o; btn.setAttribute('aria-expanded', String(o)); };
  btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menu.hidden); });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setOpen(false); });
  $('[data-rv="toggle"]', wrap).addEventListener('click', () => { setNotesHidden(!html.classList.contains('rv-off')); setOpen(false); });
  let hidden = false;
  try { hidden = localStorage.getItem(NOTES_KEY) === '1'; } catch {}
  setNotesHidden(hidden);
}

/* ================= Boot ================= */

function init() {
  decorateAll();
  new MutationObserver((muts) => {
    muts.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && decorateAll(n)));
  }).observe(document.body, { childList: true, subtree: true });
  mountNotesButton();
}

document.addEventListener('DOMContentLoaded', init);
