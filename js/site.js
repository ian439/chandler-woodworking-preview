import { site, pieces, studio, commissions } from './content.js';
import { MARK_PATH } from './mark-path.js';

// True only in REVIEW_MODE builds (the flag is injected by build.mjs with the review module).
const REVIEW = !!window.CW_REVIEW;
// Sub-path the site is served from ('' at a domain root), taken from <base href> set at build time.
const BASE = new URL(document.baseURI).pathname.replace(/\/$/, '');
const link = (route) => BASE + route;

const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const mqMobile = matchMedia('(max-width: 767px)');
const mqReduced = matchMedia('(prefers-reduced-motion: reduce)');
const isMobile = () => mqMobile.matches;
const reduced = () => mqReduced.matches;
const canVT = () => typeof document.startViewTransition === 'function' && !reduced();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// A skipped view transition (hidden tab, a newer one starting) rejects `ready`; there is nothing to do about it.
const settled = (t) => { t.ready.catch(() => {}); return t.finished.catch(() => {}); };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- Mark ---------------- */

const markMode = () => html.dataset.mark || site.mark || 'type';

function markHTML() {
  const typed = markMode() === 'type';
  const art = typed
    ? '<span class="mark-type">CW</span>'
    : `<svg viewBox="0 0 41 19" aria-hidden="true" focusable="false"><path d="${MARK_PATH}"/></svg>`;
  return `<span class="mark${typed ? ' is-type' : ''}" aria-hidden="true">
    ${typed ? '<span class="mark-sizer">CW</span>' : ''}
    <span class="mark-half top"><span class="mark-in">${art}</span></span>
    <span class="mark-half bot"><span class="mark-in">${art}</span></span>
    <span class="kerf"></span>
  </span>`;
}

function renderMarks() {
  $$('[data-mark="header"]').forEach((el) => (el.innerHTML = markHTML()));
  $$('[data-mark="hero"]').forEach((el) => (el.innerHTML = `${markHTML()}<span class="wordmark reveal-after" aria-hidden="true">${esc(site.name)}</span>`));
  // Re-fit whenever a typeset mark, the wordmark or the hero box changes size or first appears (the header
  // mark is display:none on Work, the hero everywhere else).
  markResize.disconnect();
  $$('.mark-sizer, .wordmark, .hero').forEach((el) => markResize.observe(el));
  fitMarks();
}

// Place the cut through a typeset CW where the drawn mark has it: 63% down the letters, measured from the
// real glyph box of whatever face is active (each font sits differently inside its line box).
const CUT_AT = 11.93 / 18.1; // centre of the drawn mark's gap, as a share of its letter height
const CUT_GAP = 2.5 / 18.1;  // gap thickness as a share of letter height, same as the drawn mark
const LOCKUP_GAP = { type: 2.05, drawn: 1.55 }; // letters-to-wordmark-caps gap in lockup ems, as set in the default face
let measureCtx = null;
function fitMarks() {
  measureCtx ||= document.createElement('canvas').getContext('2d');
  fitHero();
  $$('.mark').forEach((mark) => {
    const typed = mark.classList.contains('is-type');
    const under = typed ? fitTypeMark(mark) : 0; // spare room under the letters inside the mark's box
    if (under !== null) fitLockup(mark, LOCKUP_GAP[typed ? 'type' : 'drawn'], under);
  });
}

// Where the ink of `text`, set like `el`, starts and ends in px from the element's left edge (and its canvas
// metrics). Side bearings, italic overhang and trailing letter-spacing put the ink off the box edges.
function inkOf(el, text) {
  const cs = getComputedStyle(el);
  measureCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${cs.fontFamily}`;
  const m = measureCtx.measureText(text);
  return { m, l: -m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight + (parseFloat(cs.letterSpacing) || 0) * (text.length - 1) };
}

// Shrink the whole lockup, proportionally, when its wordmark would be wider than the hero (heading size and
// spacing at their maximum on a phone). It never grows, so wide screens keep the full range of the slider.
// Faces with an optical-size axis set wider when smaller, so the fit is re-measured until it settles.
function fitHero() {
  const lockup = $('.hero-mark');
  const word = lockup && $('.wordmark', lockup);
  const hero = word && lockup.closest('.hero');
  if (!hero?.clientWidth) return; // the hero is hidden off the Work page
  const hcs = getComputedStyle(hero);
  const room = hero.clientWidth - parseFloat(hcs.paddingLeft) - parseFloat(hcs.paddingRight);
  let fit = 1;
  for (let i = 0; i < 4; i++) {
    lockup.style.setProperty('--fit', fit);
    const ink = inkOf(word, word.textContent.toUpperCase());
    const need = Math.max(ink.r - ink.l, $('.mark', lockup).offsetWidth);
    if (need <= room && (fit === 1 || need > room * .99)) return;
    fit = Math.floor(Math.min(1, fit * room / need) * 1000) / 1000;
  }
  lockup.style.setProperty('--fit', fit);
}

// Returns the room under the letters in px, or null if the face can't be measured yet.
function fitTypeMark(mark) {
  const sizer = $('.mark-sizer', mark);
  const size = parseFloat(getComputedStyle(sizer).fontSize);
  if (!size || !sizer.offsetHeight) return null;
  const { m, l, r } = inkOf(sizer, sizer.textContent);
  if (!m.fontBoundingBoxAscent) return null;
  const ascent = m.fontBoundingBoxAscent, descent = m.fontBoundingBoxDescent;
  // The line box is .9em tall, which trims faces whose caps are taller than that (Newsreader's top edge).
  // Open it just enough to hold the ink inside, with a hair of air.
  const need = Math.max(2 * m.actualBoundingBoxAscent - ascent + descent, ascent - descent + 2 * m.actualBoundingBoxDescent);
  const lh = Math.max(.9, +(need / size + .04).toFixed(3));
  mark.style.setProperty('--lh', lh);
  const lineH = lh * size;
  const baseline = (lineH - (ascent + descent)) / 2 + ascent;
  const letterTop = baseline - m.actualBoundingBoxAscent;
  const letterH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  mark.style.setProperty('--split', ((letterTop + letterH * CUT_AT) / lineH).toFixed(4));
  mark.style.setProperty('--gap', ((letterH * CUT_GAP) / lineH).toFixed(4));
  // Centre the ink, not the advance box: trailing letter-spacing and side bearings differ per face.
  mark.style.setProperty('--ink', ((sizer.getBoundingClientRect().width - l - r) / 2 / size).toFixed(4));
  return lineH - (baseline + m.actualBoundingBoxDescent);
}

// In the hero lockup, hold the gap from the letters to the wordmark's caps constant: each sits in a line box
// whose spare room above and below the glyphs differs per face. Everything scales with the lockup, so the
// margin is set in the wordmark's own ems and stays right when the viewport resizes.
function fitLockup(mark, gap, under) {
  const word = $('.wordmark', mark.parentElement);
  if (!word) return;
  const wcs = getComputedStyle(word);
  const wsize = parseFloat(wcs.fontSize);
  const wlineH = word.offsetHeight;
  if (!wsize || !wlineH) return;
  const { m: wm, l, r } = inkOf(word, word.textContent.toUpperCase());
  if (!wm.fontBoundingBoxAscent) return;
  const wBaseline = (wlineH - (wm.fontBoundingBoxAscent + wm.fontBoundingBoxDescent)) / 2 + wm.fontBoundingBoxAscent;
  const capsAt = wBaseline - wm.actualBoundingBoxAscent; // spare room over the wordmark's caps
  const lockupEm = parseFloat(getComputedStyle(mark.parentElement).fontSize);
  word.style.marginTop = `${((gap * lockupEm - under - capsAt) / wsize).toFixed(4)}em`;
  // Centre the wordmark's ink too (its box is centred minus the trailing tracking, but "C" and the last letter
  // have different side bearings, and italic leans), so the mark sits over the middle of the letters.
  const track = parseFloat(wcs.letterSpacing) || 0;
  word.style.setProperty('--ink', ((word.getBoundingClientRect().width - track - l - r) / 2 / wsize).toFixed(4));
}
document.fonts?.addEventListener('loadingdone', fitMarks);
// Deferred a frame: fitting resizes the very elements observed, which inside the callback would raise a
// "ResizeObserver loop" error. Direct callers (fonts, page switches) have already fitted before the paint.
let fitFrame = 0;
const markResize = new ResizeObserver(() => {
  cancelAnimationFrame(fitFrame);
  fitFrame = requestAnimationFrame(fitMarks);
});

/* ---------------- Building blocks ---------------- */

const RX = '<span class="rx tl"></span><span class="rx tr"></span><span class="rx bl"></span><span class="rx br"></span>';

function dimsHTML(d) {
  const line = (cls, label) =>
    `<div class="dim ${cls}"><i class="tick a"></i><i class="bar"></i><i class="tick b"></i><span class="dim-label">${label}</span></div>`;
  return `<div class="dims" aria-hidden="true">${line('dim-w', `${d.w} in`)}${line('dim-h', `${d.h} in`)}</div>`;
}

function mediaHTML(ph, ratio, dims) {
  const img = ph.missing
    ? ''
    : `<img src="${link(ph.src)}" alt="${esc(ph.alt || '')}" loading="lazy" decoding="async" style="object-position:${ph.pos || '50% 50%'};${
        ph.zoom ? `transform:scale(${ph.zoom});transform-origin:${ph.pos || '50% 50%'}` : ''
      }">`;
  return `<div class="media reg-box">${RX}<div class="frame ${ratio}${ph.missing ? ' empty' : ''}" data-rid="${ph.rid}">${img}</div>${
    dims ? dimsHTML(dims) : ''
  }</div>`;
}

const visiblePhotos = (list) => list.filter((ph) => REVIEW || !ph.missing);
// Archivo's expanded width draws "×" as a diamond, so the sign is set at normal width.
const X = '<span class="times">×</span>';
const sizeText = (d) => `${d.w}${X}${d.d}${X}${d.h} in`;

function wireImages(root = document) {
  $$('.frame img', root).forEach((img) => {
    if (img.complete && img.naturalWidth) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
  });
}

/* ---------------- Static render ---------------- */

function renderStatic() {
  $$('a[data-link]').forEach((a) => a.setAttribute('href', link(a.getAttribute('href'))));
  renderMarks();
  $$('[data-bind]').forEach((el) => (el.textContent = site[el.dataset.bind]));

  const email = $('[data-footer-email]');
  email.href = `mailto:${site.email}`;
  email.textContent = site.email;
  const ig = $('[data-footer-ig]');
  ig.href = site.instagram.url;
  ig.textContent = 'Instagram';

  // Work sequence
  $('[data-sequence]').innerHTML = pieces
    .map((p, i) => {
      const [hero, ...rest] = visiblePhotos(p.photos).filter((ph) => !ph.missing);
      const details = rest.slice(0, 2);
      return `<li class="piece" id="${p.slug}">
        <a class="piece-link" href="${link(`/work/${p.slug}`)}" data-link data-piece="${p.slug}" aria-label="${esc(p.title)}, No. ${p.no}. Open details">
          ${mediaHTML(hero, isMobile() ? 'r-45' : 'r-32', p.dims)}
          ${details.length === 2 ? `<div class="details">${details.map((ph) => mediaHTML(ph, 'r-45')).join('')}</div>` : ''}
          <div class="caption" data-rid="p${i + 1}-meta">
            <span class="num">${p.no}</span>
            <span class="title"><span class="title-u">${esc(p.title)}</span></span>
            <span class="meta-row">
              <span class="meta">${p.year}</span>
              <span class="meta">${esc(p.wood)}</span>
              <span class="meta">${sizeText(p.dims)}</span>
            </span>
          </div>
        </a>
      </li>`;
    })
    .join('');

  // Studio
  $('[data-studio-lead]').innerHTML = mediaHTML(studio.lead, 'r-21');
  $('[data-aside-photo]').innerHTML = mediaHTML(commissions.photo, 'r-45');
  $('[data-studio-bio]').innerHTML = studio.bio.map((t) => `<p>${esc(t)}</p>`).join('');
  $('[data-studio-photo]').outerHTML = `<figure class="studio-photo">${mediaHTML(studio.photo, 'r-45')}</figure>`;
  $('[data-process]').innerHTML = studio.process
    .map(
      (s, i) => `<li class="step">
        <span class="num">0${i + 1}</span>
        <h3>${s.name}</h3>
        <span class="time" data-rid="lead-${i + 1}">${s.time}</span>
      </li>`
    )
    .join('');
  const shop = visiblePhotos(studio.shop);
  if (!shop.length) $('.shop-wrap').remove();
  else $('[data-shop]').innerHTML = shop.map((ph) => mediaHTML(ph, 'r-45')).join('');

  wireImages();
  wireHoverDims(document);
}

function wireHoverDims(root) {
  $$('.piece-link', root).forEach((a) => {
    const on = (e) => { if (!e.pointerType || e.pointerType === 'mouse') a.classList.add('is-dim'); };
    const off = () => a.classList.remove('is-dim');
    a.addEventListener('pointerenter', on);
    a.addEventListener('pointerleave', off);
    a.addEventListener('focus', () => a.matches(':focus-visible') && a.classList.add('is-dim'));
    a.addEventListener('blur', off);
  });
}

// Sequence crops switch between 3:2 (desktop) and 4:5 (iPhone) at the breakpoint.
mqMobile.addEventListener('change', () => {
  $$('.piece-link > .media > .frame').forEach((f) => {
    f.classList.toggle('r-32', !isMobile());
    f.classList.toggle('r-45', isMobile());
  });
  if (openSlug) closePiece({ animate: false }).then(() => history.replaceState({}, '', '/'));
});

/* ---------------- Nav ---------------- */

function setNav(page) {
  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  positionNav(true);
}

function positionNav(animate) {
  const ind = $('.nav-ind');
  const active = $('.nav-desktop [aria-current="page"]');
  if (!ind || !active) return;
  if (!animate) ind.style.transition = 'none';
  ind.style.width = `${active.offsetWidth}px`;
  ind.style.transform = `translateX(${active.offsetLeft}px)`;
  if (!animate) requestAnimationFrame(() => (ind.style.transition = ''));
}
// The underline follows the links, not events: any change in their size or position (viewport resize,
// breakpoint switch, a new body face swapping in) re-measures it.
const navResize = new ResizeObserver(() => positionNav(false));
navResize.observe($('.nav-desktop'));
$$('.nav-desktop a').forEach((a) => navResize.observe(a));
document.fonts?.addEventListener('loadingdone', () => positionNav(false));

/* ---------------- Routing ---------------- */

const TITLES = { work: site.name, studio: `Studio · ${site.name}`, commissions: `Commissions · ${site.name}` };
let currentPage = null;
let openSlug = null;

function parse(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/studio') return { page: 'studio' };
  if (path === '/commissions') return { page: 'commissions' };
  const m = path.match(/^\/work\/([^/]+)$/);
  if (m && pieces.some((p) => p.slug === m[1])) return { page: 'work', piece: m[1] };
  return { page: 'work' };
}

function showPage(page) {
  $$('.page').forEach((p) => (p.hidden = p.dataset.page !== page));
  currentPage = page;
  html.dataset.page = page;
  document.title = TITLES[page];
  setNav(page);
  wireImages($(`[data-page="${page}"]`));
  fitMarks(); // the hero may have been hidden while the face or size changed; fit before it paints
}

async function switchPage(page, animate) {
  if (!animate || reduced()) {
    showPage(page);
    scrollTo(0, 0);
    return;
  }
  if (canVT()) {
    const t = document.startViewTransition(() => { showPage(page); scrollTo(0, 0); });
    await settled(t);
  } else {
    const main = $('#main');
    main.style.transition = 'opacity 100ms var(--ease)';
    main.style.opacity = '0';
    await wait(100);
    showPage(page);
    scrollTo(0, 0);
    main.style.opacity = '1';
    await wait(100);
    main.style.transition = main.style.opacity = '';
  }
  $('#main').focus({ preventScroll: true });
}

let applying = Promise.resolve();
function apply(animate) {
  applying = applying.then(() => applyNow(animate)).catch((e) => console.error(e));
  return applying;
}

async function applyNow(animate) {
  const r = parse(location.pathname.slice(BASE.length) || '/');
  if (openSlug && r.piece !== openSlug) await closePiece({ animate: animate && r.page === 'work' });
  if (r.page !== currentPage) await switchPage(r.page, animate);
  if (r.page === 'commissions') prefillFromQuery();
  if (r.piece && r.piece !== openSlug) {
    if (!animate) $(`#${r.piece}`)?.scrollIntoView({ block: 'center' });
    await openPiece(r.piece, { animate });
  }
}

// `route` is an app path like '/studio' or '/work/bath-vanity', without the base.
function navigate(route, { replace = false, state = {} } = {}) {
  const url = new URL(link(route), location.origin);
  const target = url.pathname + url.search;
  if (target !== location.pathname + location.search) {
    history[replace ? 'replaceState' : 'pushState'](state, '', target);
  } else if (!openSlug) {
    scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
  }
  return apply(true);
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  const u = new URL(a.href);
  navigate(u.pathname.slice(BASE.length) + u.search || '/', { state: a.dataset.piece ? { fromSeq: true } : {} });
});
addEventListener('popstate', () => apply(true));

/* ---------------- Piece view ---------------- */

const layer = $('[data-piece-layer]');
let lastFocus = null;

function pieceViewHTML(p, idx) {
  const photos = visiblePhotos(p.photos);
  const k = `p${idx + 1}`;
  return `<div class="pv-backdrop" data-close></div>
  <div class="pv" role="dialog" aria-modal="true" aria-labelledby="pv-title" tabindex="-1">
    <div class="pv-grab" aria-hidden="true"></div>
    <button class="pv-close tap" type="button" data-close><span>Close</span><i aria-hidden="true"></i></button>
    <div class="pv-inner">
      <div>
        <div class="pv-photos" data-gallery>
          ${photos.map((ph, i) => `<div class="slide">${mediaHTML(ph, 'r-45', i === 0 ? p.dims : null)}</div>`).join('')}
        </div>
        <p class="pv-counter num" data-counter aria-live="polite">1 of ${photos.length}</p>
      </div>
      <div class="pv-info">
        <p class="num">No. ${p.no}</p>
        <h2 class="pv-title" id="pv-title">${esc(p.title)}</h2>
        <dl class="specs" data-rid="${k}-meta">
          <div><dt>Year</dt><dd>${p.year}</dd></div>
          <div><dt>Wood</dt><dd>${esc(p.wood)}</dd></div>
          <div><dt>Finish</dt><dd>${esc(p.finish)}</dd></div>
          <div><dt>Size</dt><dd>${sizeText(p.dims)}</dd></div>
        </dl>
        <p class="pv-story" data-rid="${k}-story">${esc(p.story)}</p>
        <div class="pv-actions">
          <a class="btn-primary tap" href="${link(`/commissions?like=${p.slug}`)}" data-link>Start a commission like this</a>
          <button class="pv-copy tap" type="button" data-share>${isMobile() && navigator.share ? 'Share this piece' : 'Copy link'}</button>
        </div>
      </div>
    </div>
  </div>`;
}

function lock(on) { document.body.classList.toggle('locked', on); }

async function openPiece(slug, { animate }) {
  const idx = pieces.findIndex((p) => p.slug === slug);
  if (idx < 0) return;
  const p = pieces[idx];
  openSlug = slug;
  lastFocus = document.activeElement;
  layer.innerHTML = pieceViewHTML(p, idx);
  layer.classList.remove('open');
  const pv = $('.pv', layer);
  const firstMedia = $('.slide .media', layer);
  const firstImg = $('.slide img', layer);
  if (firstImg) firstImg.loading = 'eager';
  wireImages(layer);
  wirePieceView(p);

  const seqImg = $(`[data-piece="${slug}"] img`);
  if (!isMobile() && animate && canVT() && seqImg && firstImg) {
    await Promise.race([firstImg.decode().catch(() => {}), wait(400)]);
    html.classList.add('vt-piece');
    seqImg.style.viewTransitionName = 'piece-hero';
    const t = document.startViewTransition(() => {
      seqImg.style.viewTransitionName = '';
      firstImg.style.viewTransitionName = 'piece-hero';
      firstImg.classList.add('loaded');
      layer.hidden = false;
      lock(true);
    });
    await settled(t);
    firstImg.style.viewTransitionName = '';
    html.classList.remove('vt-piece');
  } else {
    layer.hidden = false;
    lock(true);
    if (isMobile()) {
      layer.getBoundingClientRect();
      layer.classList.add('open');
      if (animate && !reduced()) await wait(450);
      else layer.classList.add('open');
    }
  }
  if (openSlug !== slug) return;
  pv.focus({ preventScroll: true });
  // Dimension lines draw in once the piece is open.
  requestAnimationFrame(() => firstMedia?.classList.add('is-dim'));
}

async function closePiece({ animate }) {
  if (!openSlug) return;
  const slug = openSlug;
  openSlug = null;
  const seqImg = $(`[data-piece="${slug}"] img`);
  const firstImg = $('.slide img', layer);
  if (animate && !reduced() && isMobile()) {
    const pv = $('.pv', layer);
    layer.classList.remove('dragging', 'open');
    pv.style.transform = '';
    $('.pv-backdrop', layer).style.opacity = '';
    await wait(450);
  } else if (animate && canVT() && seqImg && firstImg) {
    html.classList.add('vt-piece');
    firstImg.style.viewTransitionName = 'piece-hero';
    const t = document.startViewTransition(() => {
      firstImg.style.viewTransitionName = '';
      layer.hidden = true;
      lock(false);
      const r = seqImg.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) seqImg.scrollIntoView({ block: 'center' });
      seqImg.style.viewTransitionName = 'piece-hero';
    });
    await settled(t);
    seqImg.style.viewTransitionName = '';
    html.classList.remove('vt-piece');
  }
  layer.hidden = true;
  layer.classList.remove('open', 'dragging');
  layer.innerHTML = '';
  lock(false);
  const back = $(`[data-piece="${slug}"]`);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  else back?.focus({ preventScroll: true });
}

function requestClose() {
  if (!openSlug) return;
  if (history.state && history.state.fromSeq) history.back();
  else navigate('/', { replace: true });
}

function wirePieceView(p) {
  $$('[data-close]', layer).forEach((b) => b.addEventListener('click', requestClose));

  const share = $('[data-share]', layer);
  share.addEventListener('click', async () => {
    const url = `${location.origin}${link(`/work/${p.slug}`)}`;
    if (isMobile() && navigator.share) {
      navigator.share({ title: `${p.title} · ${site.name}`, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      share.textContent = 'Link copied';
    } catch {
      share.textContent = url;
    }
    setTimeout(() => (share.textContent = 'Copy link'), 2400);
  });

  const gallery = $('[data-gallery]', layer);
  const counter = $('[data-counter]', layer);
  const total = gallery.children.length;
  gallery.addEventListener('scroll', () => {
    if (!isMobile()) return;
    const i = Math.round(gallery.scrollLeft / gallery.clientWidth);
    counter.textContent = `${Math.min(total, i + 1)} of ${total}`;
  }, { passive: true });

  // iPhone: drag the sheet down to close. A fast flick closes even if it has not travelled far.
  const pv = $('.pv', layer);
  const backdrop = $('.pv-backdrop', layer);
  let startX = 0, startY = 0, lastY = 0, lastT = 0, vel = 0, decided = false, dragging = false;
  pv.addEventListener('touchstart', (e) => {
    if (!isMobile()) return;
    const t = e.touches[0];
    startX = t.clientX; startY = lastY = t.clientY; lastT = performance.now();
    vel = 0; decided = false; dragging = false;
  }, { passive: true });
  pv.addEventListener('touchmove', (e) => {
    if (!isMobile()) return;
    const t = e.touches[0];
    const dx = t.clientX - startX, dy = t.clientY - startY;
    if (!decided) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      decided = true;
      dragging = dy > 0 && Math.abs(dy) > Math.abs(dx) && pv.scrollTop <= 0;
      if (dragging) layer.classList.add('dragging');
    }
    if (!dragging) return;
    e.preventDefault();
    const now = performance.now();
    vel = (t.clientY - lastY) / Math.max(1, now - lastT);
    lastY = t.clientY; lastT = now;
    const y = Math.max(0, dy);
    pv.style.transform = `translateY(${y}px)`;
    backdrop.style.opacity = String(Math.max(0, 1 - y / pv.offsetHeight));
  }, { passive: false });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    const dy = lastY - startY;
    if (dy > 140 || vel > 0.5) {
      layer.classList.remove('dragging');
      requestClose();
    } else {
      layer.classList.remove('dragging');
      pv.style.transform = '';
      backdrop.style.opacity = '';
    }
  };
  pv.addEventListener('touchend', end);
  pv.addEventListener('touchcancel', end);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && openSlug) requestClose();
  if (e.key === 'Tab' && openSlug) {
    const f = $$('a[href], button, [tabindex="0"]', layer).filter((el) => el.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  }
});

/* ---------------- Form ---------------- */

const formEl = $('[data-form]');
const confirmEl = $('[data-confirm]');

function prefillFromQuery() {
  const like = new URLSearchParams(location.search).get('like');
  const p = pieces.find((x) => x.slug === like);
  const desc = $('#f-desc');
  if (p && !desc.value) desc.value = `Something like the ${p.title} (No. ${p.no}). `;
}

function showErr(name, msg) {
  const el = $(`[data-err="${name}"]`, formEl);
  const input = formEl.elements[name];
  if (msg) {
    if (msg !== true) el.textContent = msg;
    el.hidden = false;
    input?.setAttribute('aria-invalid', 'true');
  } else {
    el.hidden = true;
    input?.removeAttribute('aria-invalid');
  }
}

formEl.addEventListener('input', (e) => {
  if (e.target.name && e.target.getAttribute('aria-invalid')) showErr(e.target.name, false);
});

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = formEl.elements;
  const bad = [];
  if (!f.description.value.trim()) bad.push('description');
  if (!f.name.value.trim()) bad.push('name');
  if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) bad.push('email');
  ['description', 'name', 'email'].forEach((n) => showErr(n, bad.includes(n)));
  showErr('send', false);
  if (bad.length) {
    f[bad[0]].focus();
    return;
  }
  const data = Object.fromEntries(new FormData(formEl));
  const btn = $('[data-send]', formEl);
  btn.disabled = true;
  btn.textContent = 'Sending…';
  try {
    if (window.CW_NO_API) {
      // Static preview host: no mail function, so confirm without sending.
      await wait(700);
    } else {
      const res = await fetch(link('/api/inquiry'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }
    const first = data.name.trim().split(/\s+/)[0];
    $('[data-confirm-text]').textContent = `Thanks, ${first}. You’ll hear back at ${data.email.trim()}.`;
    formEl.classList.add('out');
    await wait(reduced() ? 0 : 250);
    formEl.hidden = true;
    confirmEl.classList.add('pre');
    confirmEl.hidden = false;
    confirmEl.getBoundingClientRect();
    confirmEl.classList.remove('pre');
    confirmEl.focus({ preventScroll: true });
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Send';
    showErr('send', `Not sent. Try again, or email ${site.email}.`);
  }
});

/* ---------------- Logo reveal ---------------- */

async function reveal() {
  const done = () => {
    html.classList.remove('revealing');
    window.CW.revealed = true;
    document.dispatchEvent(new Event('cw:revealed'));
  };
  if (reduced() || !html.classList.contains('revealing')) return done();
  const which = currentPage === 'work' ? '.hero-mark' : '.header-mark';
  html.dataset.reveal = currentPage === 'work' ? 'hero' : 'header';
  const mark = $(`${which} .mark`);
  // Start only once fonts are in and the page has painted, so nothing reflows or stutters mid-reveal.
  await Promise.race([document.fonts?.ready, wait(900)]);
  fitMarks();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  // A background tab can hold rAF past the 3s failsafe; if the page is already showing, don't replay.
  if (!html.classList.contains('revealing')) return done();
  mark?.classList.add('play');
  setTimeout(() => html.classList.remove('revealing'), 820);
  setTimeout(done, 1100);
  setTimeout(() => mark?.classList.remove('play'), 1300);
}

/* ---------------- Boot ---------------- */

window.CW = {
  setMarkMode(mode) {
    html.dataset.mark = mode;
    renderMarks();
  },
  fitMarks,
  REVIEW,
  site,
  pieces,
  revealed: false,
  isMobile,
  reduced,
  get page() { return currentPage; },
  get openPiece() { return openSlug; },
  go: (path) => navigate(path),
  closePiece: () => (openSlug ? navigate('/', { replace: !(history.state && history.state.fromSeq) }) : Promise.resolve()),
};

renderStatic();
if (!history.state) history.replaceState({}, '', location.pathname + location.search);
apply(false).then(() => {
  positionNav(false);
  reveal();
});
