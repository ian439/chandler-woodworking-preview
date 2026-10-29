// All site content lives here. Adding a piece = adding an entry to `pieces`.
// `rid` values are hooks the review layer uses to attach notes; they carry no content.

export const site = {
  name: 'Chandler Woodworking',
  email: 'chandlerww@gmail.com',
  location: 'Santa Cruz',
  phone: '', // shown under "Or reach out directly" once Casey wants it public
  // 'type' = CW set in the heading font; 'drawn' = Casey's original drawn mark (CW.svg).
  mark: 'type',
};

// Home landing photo: full-bleed behind the centred mark. Wants a wide, dark-ish shot (landscape for desktop).
export const home = {
  hero: { rid: 'hero-photo', src: '/img/vanity-baskets.jpg', alt: '', pos: '50% 58%' },
  // Casey's words, from his site drawing (chandlerww.dwg).
  mission: {
    title: 'Fine Furniture and Custom Cabinetry',
    line: 'Carefully designed and built in the Seabright neighborhood of Santa Cruz.',
  },
  // Casey: "Philosophy Statement to be written." Placeholder until he does (flagged in review builds).
  philosophyDraft: true,
  philosophy: [
    'Solid wood, drawn for one room and one client, joined by hand where it counts and finished to be used every day.',
  ],
  // The "set of pre-determined pictures, arranged handsomely" under the mission, 2 by 2. Crops of the two real
  // photos until the shop shots come in.
  photoSet: [
    { rid: 'home-set1', src: '/img/vanity-arch.jpg', alt: '', pos: '50% 66%' },
    { rid: 'home-set2', src: '/img/vanity-baskets.jpg', alt: '', pos: '62% 72%', zoom: 1.6 },
    { rid: 'home-set3', src: '/img/vanity-arch.jpg', alt: '', pos: '26% 67%', zoom: 2.6 },
    { rid: 'home-set4', src: '/img/vanity-baskets.jpg', alt: '', pos: '30% 55%' },
  ],
  // Full-width band between the philosophy and what's possible.
  breaks: [
    { rid: 'home-break1', src: '/img/vanity-baskets.jpg', alt: '', pos: '50% 62%', zoom: 1.4 },
  ],
  // From the meeting: three categories, Casey to rename them. Placeholder words (flagged in review builds).
  capabilitiesDraft: true,
  // No stairs or chairs yet: not enough work to show for them.
  capabilities: [
    { name: 'Furniture', line: 'Tables, consoles, beds and benches.' },
    { name: 'Cabinetry', line: 'Kitchens, vanities and built-ins, fitted on site.' },
    { name: 'Storage and display', line: 'Shelving, cases and cabinets for the things you keep.' },
  ],
};

// Photo entries: { src, alt, pos (object-position), zoom? } or { missing: true }.
export const pieces = [
  {
    slug: 'bath-vanity',
    no: '01',
    title: 'Bath vanity',
    year: '2025',
    wood: 'Sapele',
    finish: 'Hardwax oil',
    dims: { w: 72, d: 22, h: 34 },
    story: 'Double vanity with open bays for baskets.',
    photos: [
      { rid: 'p1-ph1', src: '/img/vanity-arch.jpg', alt: 'Wood bath vanity with raised-panel doors beside an arched shower opening', pos: '50% 66%' },
      { rid: 'p1-ph2', src: '/img/vanity-baskets.jpg', alt: 'The vanity from the other end, showing an open bay holding a woven basket', pos: '50% 62%' },
      { rid: 'p1-ph3', src: '/img/vanity-arch.jpg', alt: 'Brass bail pull on a raised-panel door', pos: '26% 67%', zoom: 2.6 },
      { rid: 'p1-ph4', src: '/img/vanity-baskets.jpg', alt: 'Open bay holding a woven basket', pos: '62% 72%', zoom: 1.6 },
      { rid: 'p1-ph5', src: '/img/vanity-arch.jpg', alt: 'Stone top and brass taps', pos: '18% 40%', zoom: 2.2 },
      { rid: 'p1-ph6', src: '/img/vanity-arch.jpg', alt: 'Placeholder photo', pos: '30% 8%', zoom: 2 },
    ],
  },
  {
    slug: 'low-console',
    no: '02',
    title: 'Low console',
    year: '2025',
    wood: 'White oak',
    finish: 'Oil and wax',
    dims: { w: 60, d: 16, h: 30 },
    story: 'Entry console with one drawer.',
    photos: [
      { rid: 'p2-ph1', src: '/img/vanity-baskets.jpg', alt: 'Placeholder photo', pos: '30% 55%' },
      { rid: 'p2-ph2', src: '/img/vanity-arch.jpg', alt: 'Placeholder photo', pos: '38% 62%', zoom: 2.2 },
      { rid: 'p2-ph3', src: '/img/vanity-baskets.jpg', alt: 'Placeholder photo', pos: '22% 62%', zoom: 1.9 },
      { rid: 'p2-ph4', src: '/img/vanity-baskets.jpg', alt: 'Placeholder photo', pos: '55% 40%', zoom: 2.4 },
      { rid: 'p2-ph5', src: '/img/vanity-baskets.jpg', alt: 'Placeholder photo', pos: '35% 12%', zoom: 2 },
    ],
  },
];

export const commissions = {
  // Casey's words, from his site drawing. San Francisco added per the Oct 28 meeting; chairs left off the list
  // for now (not enough work to show).
  statement: 'I design and build pieces for clients in Santa Cruz, San Francisco, Oakland, Berkeley and San Jose.',
  sub: 'Dressers, nightstands, beds, vanities, handrails, tables, stools, kitchen cabinets, built-ins…',
  note: 'For a new commission, please fill out the inquiry form below, or reach out directly. The more information provided, the more thoughtful can be my response. Thank you.',
  // People are hiring Casey, so the contact page leads with him. Empty frame until there's a portrait.
  photo: { rid: 'casey-photo', missing: true, alt: 'Casey', note: 'Photo of Casey' },
};

// About: Casey's story beside two photos. His words to come; placeholder until then (flagged in review builds).
export const about = {
  draft: true,
  text: [
    'I build furniture and cabinetry in a small shop in the Seabright neighborhood of Santa Cruz.',
    'Every piece starts as a drawing for one client and one room, and I build it by hand from solid wood.',
  ],
  photos: [
    { rid: 'about1', src: '/img/vanity-arch.jpg', alt: 'Placeholder photo', pos: '40% 49%', zoom: 2.2 },
    { rid: 'about2', src: '/img/vanity-baskets.jpg', alt: 'Placeholder photo', pos: '62% 70%', zoom: 1.8 },
  ],
};
