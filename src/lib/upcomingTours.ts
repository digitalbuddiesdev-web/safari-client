export interface UpcomingTourDate {
  label: string;
  note?: string;
}

export interface UpcomingTour {
  slug: string;
  dest: string;
  title: string;
  tagline: string;
  highlights: string[];
  dates: UpcomingTourDate[];
  poster: string;
  instagram: string;
}

// ponytail: hand-maintained list; move to the DB/admin if tours become editable
export const UPCOMING_TOURS: UpcomingTour[] = [
  {
    slug: 'tadoba-andhari',
    dest: 'tadoba-andhari',
    title: 'Tadoba-Andhari Tiger Reserve',
    tagline: 'The Tigress Trails & Valentine Canopy Escape',
    highlights: [
      '2 Nights and 3 Days',
      '4 Thrilling Safaris (Core and Buffer)',
      'AC comfortable transfers to and from Nagpur',
      'Max 6 pax',
      'All Meals',
    ],
    dates: [
      { label: '12–14th February, 2027', note: 'The Valentine Canopy Escape · Luxurious stay with safaris' },
    ],
    poster: '/assets/img/instagram/Tadoba-Andhari.webp',
    instagram: 'https://www.instagram.com/',
  },
  {
    slug: 'pench-mh',
    dest: 'pench-mh',
    title: 'Pench Tiger Reserve — Maharashtra',
    tagline: 'The Kipling Corridor',
    highlights: ['2 Nights / 3 Days', '4 Safaris (Core & Buffer)', 'Transfers from Nagpur', 'Max 6 pax', 'All Meals'],
    dates: [
      { label: '13–15 Nov' },
      { label: '20–22 Nov' },
      { label: '27–29 Nov' },
    ],
    poster: '/assets/img/instagram/Pench.webp',
    instagram: 'https://www.instagram.com/',
  },
  {
    slug: 'umred-karhandla',
    dest: 'umred-karhandla',
    title: 'Umred-Karhandla Wildlife Sanctuary',
    tagline: 'The Tigress Trails · Women-Only Departure',
    highlights: ['2 Nights / 3 Days', '4 Safaris (Core & Buffer)', 'Transfers from Nagpur', 'Max 6 pax', 'All Meals'],
    dates: [
      { label: '23–25 Dec', note: 'The Tigress Trails · Women-Only' },
      { label: '2–4 Jan 2026' },
      { label: '8–10 Jan 2026' },
    ],
    poster: '/assets/img/instagram/Umred.webp',
    instagram: 'https://www.instagram.com/',
  },
  {
    slug: 'tadoba-full-day',
    dest: 'tadoba-andhari',
    title: 'Tadoba-Andhari — Full Day Safari',
    tagline: 'Dawn to dusk in the core and buffer',
    highlights: ['Full Day Safari (Core & Buffer)', 'Group of 3–4 people', 'All Meals & Transportation', 'Well-guided jungle tours', 'Accommodation'],
    dates: [
      { label: 'Jan – Mar 2027' },
    ],
    poster: '/assets/img/instagram/Tadoba-Andhari-Full-Day.webp',
    instagram: 'https://www.instagram.com/',
  },
];

export const getUpcomingTour = (slug?: string): UpcomingTour | undefined =>
  UPCOMING_TOURS.find(t => t.slug === slug);
