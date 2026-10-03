// All site content lives here. Adding a piece = adding an entry to `pieces`.
// `rid` values are hooks the review layer uses to attach notes; they carry no content.

export const site = {
  name: 'Chandler Woodworking',
  email: 'studio@chandlerwoodworking.com',
  instagram: { handle: 'casey.chandler.11', url: 'https://www.instagram.com/casey.chandler.11/' },
  location: 'Santa Cruz',
  // 'type' = CW set in the heading font; 'drawn' = Casey's original drawn mark (CW.svg).
  mark: 'type',
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

export const studio = {
  lead: { rid: 'studio-lead', src: '/img/vanity-arch.jpg', alt: 'Placeholder photo', pos: '50% 58%' },
  bio: ['Furniture made to commission in a small Santa Cruz shop.'],
  photo: { rid: 'studio-photo', src: '/img/vanity-arch.jpg', alt: 'Placeholder photo', pos: '45% 75%', zoom: 2.4 },
  process: [
    { name: 'Consult', time: '1 week' },
    { name: 'Design', time: '2–3 weeks' },
    { name: 'Build', time: '6–10 weeks' },
    { name: 'Delivery', time: '1 week' },
  ],
  shop: [
    { rid: 'shop1', src: '/img/vanity-arch.jpg', alt: 'Placeholder photo', pos: '40% 49%', zoom: 3 },
    { rid: 'shop2', src: '/img/vanity-baskets.jpg', alt: 'Placeholder photo', pos: '62% 70%', zoom: 1.8 },
    { rid: 'shop3', src: '/img/vanity-arch.jpg', alt: 'Placeholder photo', pos: '78% 58%', zoom: 2.5 },
    { rid: 'shop4', src: '/img/vanity-arch.jpg', alt: 'Placeholder photo', pos: '20% 38%', zoom: 2.4 },
    { rid: 'shop5', src: '/img/vanity-baskets.jpg', alt: 'Placeholder photo', pos: '30% 58%', zoom: 2.8 },
    { rid: 'shop6', src: '/img/vanity-baskets.jpg', alt: 'Placeholder photo', pos: '28% 58%', zoom: 2 },
  ],
};

export const commissions = {
  photo: { rid: 'form-photo', src: '/img/vanity-baskets.jpg', alt: 'Placeholder photo', pos: '40% 60%', zoom: 1.3 },
};
