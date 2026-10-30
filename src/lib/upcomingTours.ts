export interface UpcomingTourDate {
  label: string;
  note?: string;
}

export interface WhyChooseUsItem {
  title: string;
  desc: string;
}

export interface FounderNote {
  name: string;
  subtitle: string;
  experience: string;
  quote: string;
}

export interface ParkReference {
  name: string;
  slug: string;
}

export interface UpcomingTour {
  slug: string;
  dest: string;
  title: string;
  tagline: string;
  subtitle?: string;
  description?: string;
  bookingStatus?: string;
  travelPeriod?: string;
  availability?: string;
  highlights: string[];
  dates: UpcomingTourDate[];
  poster: string;
  instagram: string;
  isFeatured?: boolean;
  premiumParks?: ParkReference[];
  alsoExploreParks?: ParkReference[];
  whyChooseUs?: WhyChooseUsItem[];
  founderNote?: FounderNote;
}

// ponytail: hand-maintained list; move to the DB/admin if tours become editable
export const UPCOMING_TOURS: UpcomingTour[] = [
  {
    slug: 'maharashtra-wildlife-safaris',
    dest: 'tadoba-andhari',
    title: 'Maharashtra Wildlife Safaris',
    tagline: 'Discover Maharashtra’s Wild Side',
    subtitle: 'Advance Safari Bookings Open! · Travel Period: February – April 2027',
    description: 'Explore Maharashtra’s renowned wildlife destinations with expert-guided safaris, local forest knowledge, and personalized safari experiences.',
    bookingStatus: 'Advance Safari Bookings Open!',
    travelPeriod: 'February – April 2027',
    availability: 'Limited Slots Only!',
    highlights: [
      'Expert-Guided Safaris',
      'AC Stay with Meals',
      'Nagpur Transfers',
      'Complete Safari Assistance',
      'Customized Safari Packages',
    ],
    dates: [
      { label: 'February – April 2027', note: 'Advance Safari Bookings Open · Limited Slots Only' },
    ],
    poster: '/assets/img/instagram/Maharashtra.webp',
    instagram: 'https://www.instagram.com/shutterandstripes/',
    isFeatured: true,
    premiumParks: [
      { name: 'Tadoba', slug: 'tadoba-andhari' },
      { name: 'Pench', slug: 'pench-mh' },
      { name: 'Umred Karhandla', slug: 'umred-karhandla' },
      { name: 'Tipeshwar', slug: 'tipeshwar' },
    ],
    alsoExploreParks: [
      { name: 'Bor', slug: 'bor' },
      { name: 'Navegaon-Nagzira', slug: 'navegaon-nagzira' },
      { name: 'Melghat', slug: 'melghat' },
    ],
    whyChooseUs: [
      {
        title: 'On-Ground Insights',
        desc: 'Current wildlife movement and local forest knowledge.',
      },
      {
        title: 'Smarter Safari Gate Choices',
        desc: 'Better-informed safari zone selection based on local expertise.',
      },
      {
        title: 'Strong Local Network',
        desc: 'Experienced local guides and drivers.',
      },
      {
        title: 'Experienced Safari Hosts',
        desc: 'Welcoming guests from India and abroad.',
      },
    ],
  },
  {
    slug: 'tadoba-tiger-safari-experience',
    dest: 'tadoba-andhari',
    title: 'Tadoba Tiger Safari Experience',
    tagline: '18+ Years of Local Tadoba Expertise',
    subtitle: 'Smarter zone choices. Deeper forest insights.',
    description: 'Discover Tadoba with experienced local naturalists and knowledgeable safari hosts who understand the forest beyond the usual tourist routes.',
    bookingStatus: 'Advance Safari Bookings Open!',
    travelPeriod: 'February – April 2027',
    availability: 'Limited Slots Only!',
    highlights: [
      'Expert-Guided Safaris',
      'AC Stay with Meals',
      'Nagpur Transfers',
      'Complete Safari Assistance',
      'Customized Safari Packages',
    ],
    dates: [
      { label: 'February – April 2027', note: 'Advance Safari Bookings Open · Limited Slots Only' },
    ],
    poster: '/assets/img/instagram/Tadoba.webp',
    instagram: 'https://www.instagram.com/shutterandstripes/',
    isFeatured: true,
    whyChooseUs: [
      {
        title: 'On-Ground Insights',
        desc: 'Current wildlife movement and forest knowledge.',
      },
      {
        title: 'Smarter Zone Choices',
        desc: 'Local forest knowledge for informed safari planning.',
      },
      {
        title: 'Strong Local Network',
        desc: 'Expert guides and drivers.',
      },
      {
        title: 'Experienced Safari Hosts',
        desc: 'Hosting guests from India and abroad.',
      },
    ],
    founderNote: {
      name: 'Sachin Neware',
      subtitle: 'Born and brought up in Moharli, Tadoba.',
      experience: '18+ Years of Naturalist Experience',
      quote: '“Not just a destination, my home.”',
    },
  },
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
    instagram: 'https://www.instagram.com/stories/highlights/18118800712963632/',
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
    instagram: 'https://www.instagram.com/stories/highlights/18118800712963632/',
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
    instagram: 'https://www.instagram.com/stories/highlights/18118800712963632/',
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
    instagram: 'https://www.instagram.com/stories/highlights/18118800712963632/',
  },
];

export const getUpcomingTour = (slug?: string): UpcomingTour | undefined =>
  UPCOMING_TOURS.find(t => t.slug === slug);
