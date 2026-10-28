export interface ClientStory {
  id: string;
  name: string;
  location: string;
  reserve: string;
  safariType: string;
  quote: string;
  rating: number; // 1 to 5
  mediaType: 'video' | 'reel' | 'image';
  videoUrl?: string; // Optional direct mp4 / webm or embed
  instagramUrl: string; // Instagram Reel or Post URL
  imageUrl: string; // Poster / cover image
  duration?: string; // e.g. "0:48"
  isFeatured?: boolean; // Highlighted in homepage spotlight
  tag?: string; // e.g. "Tiger Encounter", "Masterclass", "Family Safari"
  date?: string;
}

export interface ClientStoriesData {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  featuredReel?: ClientStory;
  stories: ClientStory[];
}

export const DEFAULT_CLIENT_STORIES: ClientStory[] = [
  {
    id: 'story-israel-guests-tadoba',
    name: 'Guests from Israel',
    location: 'Tel Aviv, Israel',
    reserve: 'Tadoba-Andhari Tiger Reserve',
    safariType: 'International Wildlife & Tiger Safari',
    quote: 'From Israel to the heart of Tadoba — hear it from our guests themselves! Their genuine experience, their words and memories made in the wild with Shutter & Stripes.',
    rating: 5,
    mediaType: 'reel',
    videoUrl: '/assets/video/tadoba-guests-reel.mp4',
    instagramUrl: 'https://www.instagram.com/shutterandstripes/reel/De1yY0hzcIc/',
    imageUrl: '/assets/img/instagram/reel-De1yY0hzcIc.jpg',
    duration: '1:53',
    isFeatured: true,
    tag: 'Guest Story & Tiger Encounter',
    date: 'Recent Expedition'
  }
];

export const DEFAULT_CLIENT_STORIES_DATA: ClientStoriesData = {
  eyebrow: 'Field Encounters & Traveler Stories',
  heading: 'In Their Own Words',
  subheading: 'Authentic moments, raw tiger encounters, and live reels captured in the field by our travelers and naturalists.',
  featuredReel: DEFAULT_CLIENT_STORIES[0],
  stories: DEFAULT_CLIENT_STORIES
};

export function normalizeClientStoriesData(raw: any): ClientStoriesData {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_CLIENT_STORIES_DATA;
  }

  const rawStories: any[] = Array.isArray(raw.stories) && raw.stories.length > 0 
    ? raw.stories 
    : DEFAULT_CLIENT_STORIES;

  const stories: ClientStory[] = rawStories.map((s, idx) => ({
    id: s.id || `story-${idx}-${Date.now()}`,
    name: s.name || 'Safari Guest',
    location: s.location || 'India',
    reserve: s.reserve || 'Central India Tiger Reserve',
    safariType: s.safariType || 'Private Naturalist Safari',
    quote: s.quote || 'An unforgettable wildlife encounter with Shutter & Stripes.',
    rating: typeof s.rating === 'number' ? s.rating : 5,
    mediaType: s.mediaType || 'reel',
    videoUrl: s.videoUrl || '',
    instagramUrl: s.instagramUrl || 'https://www.instagram.com/shutterandstripes',
    imageUrl: s.imageUrl || '/assets/img/instagram/Tadoba-Andheri.png',
    duration: s.duration || '0:45',
    isFeatured: typeof s.isFeatured === 'boolean' ? s.isFeatured : idx < 3,
    tag: s.tag || 'Tiger Encounter',
    date: s.date || 'Recent Expedition'
  }));

  const featured = raw.featuredReel && raw.featuredReel.imageUrl
    ? {
        ...raw.featuredReel,
        id: raw.featuredReel.id || 'featured-reel',
        instagramUrl: raw.featuredReel.instagramUrl || 'https://www.instagram.com/shutterandstripes',
        rating: raw.featuredReel.rating || 5
      }
    : stories.find(s => s.isFeatured) || stories[0];

  return {
    eyebrow: raw.eyebrow || DEFAULT_CLIENT_STORIES_DATA.eyebrow,
    heading: raw.heading || DEFAULT_CLIENT_STORIES_DATA.heading,
    subheading: raw.subheading || DEFAULT_CLIENT_STORIES_DATA.subheading,
    featuredReel: featured,
    stories
  };
}

export function getInstagramEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.instagram.com/reel/${match[1]}/embed/`;
  }
  return null;
}

