import { Destination, Zone } from '../types';

export const MAP_LABEL = 'The Safari Landscape';
export const MAP_ROUTE = '/map';
export const YEARS_OF_EXPERIENCE = 15;
export const TOURS_COMPLETED = 1000;
export const CONTACT_EMAIL = 'enquiries@shutterandstripessafaris.com';
export const BOOKINGS_EMAIL = 'bookings@shutterandstripessafaris.com';
export const FOUNDER_NAME = 'Sachin Neware';
export const COFOUNDER_NAME = 'Urmila Suvarna';

// States we actively operate in, in priority order. Everything else renders as Pan-India expansion.
export const CORE_STATES = ['Madhya Pradesh', 'Maharashtra'];

const STATE_CODES: Record<string, string> = {
  'Andhra Pradesh': 'AP', Arunachal: 'AR', Assam: 'AS', Bihar: 'BR', Chhattisgarh: 'CG',
  Goa: 'GA', Gujarat: 'GJ', Haryana: 'HR', 'Himachal Pradesh': 'HP', Jharkhand: 'JH',
  Karnataka: 'KA', Kerala: 'KL', 'Madhya Pradesh': 'MP', Maharashtra: 'MH',
  Manipur: 'MN', Meghalaya: 'ML', Mizoram: 'MZ', Nagaland: 'NL', Odisha: 'OD',
  Punjab: 'PB', Rajasthan: 'RJ', Sikkim: 'SK', 'Tamil Nadu': 'TN', Telangana: 'TG',
  Tripura: 'TR', 'Uttar Pradesh': 'UP', Uttarakhand: 'UK', 'West Bengal': 'WB',
  'Jammu and Kashmir': 'JK', Ladakh: 'LA', 'Andaman and Nicobar': 'AN',
  Chandigarh: 'CH', Dadra: 'DN', Daman: 'DH', Lakshadweep: 'LD', Puducherry: 'PY'
};

// Leaflet popups and tooltips take raw HTML, so any admin-entered text that
// reaches them has to be escaped by hand.
export const escapeHtml = (value?: string): string =>
  String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );

export const stateCode = (state?: string): string =>
  (state && STATE_CODES[state]) || state?.slice(0, 2).toUpperCase() || '—';

export const isCoreState = (state?: string): boolean =>
  !!state && CORE_STATES.includes(state);

export const stateBadgeClass = (state?: string): string => {
  if (state === 'Madhya Pradesh') return 'bg-forest';
  if (state === 'Maharashtra') return 'bg-earth';
  return 'bg-slate-700';
};

/** Designation of a protected area, used to colour-code the map. */
export type ReserveKind = 'Tiger Reserve' | 'Wildlife Sanctuary';

// ponytail: two buckets only — sanctuaries vs everything else (tiger reserves,
// national parks and conservation reserves all count as "tiger reserve" country).
export const reserveKind = (name?: string): ReserveKind =>
  /Sanctuary/i.test(name ?? '') ? 'Wildlife Sanctuary' : 'Tiger Reserve';

/** Marker fill per designation — sanctuaries and reserves read apart. */
export const RESERVE_KIND_COLOR: Record<ReserveKind, string> = {
  'Tiger Reserve': '#D4834A',
  'Wildlife Sanctuary': '#6B7A5A',
};

/** A zone is "prime" only when explicitly curated, never inferred from other copy. */
export const isPrimeZone = (zone: Zone): boolean => zone.isPrime === true;

export type PackageTier = NonNullable<Destination['packages']>[number];

/**
 * The whole package is the only price we quote — permit, vehicle, guide and forest
 * dues are bundled into each tier, so they are never shown as a separate line.
 */
export const packagesOf = (d: Pick<Destination, 'packages'>): PackageTier[] =>
  (d.packages ?? []).filter((t) => t.min > 0);

/** Lowest advertised package price, used for sorting and "from" labels. */
export const packageFromOf = (d: Pick<Destination, 'packages' | 'startingPrice'>): number | null =>
  packagesOf(d)[0]?.min ?? d.startingPrice ?? null;

export const inr = (amount: number | null | undefined): string =>
  amount == null ? 'On request' : `₹${amount.toLocaleString('en-IN')}`;

/** "₹14,500 – ₹17,500", "₹40,000 – ₹65,000+" or "₹9,000" for single-price tiers. */
export const tierPrice = (t: PackageTier): string => {
  if (t.min === t.max) return inr(t.min);
  return `${inr(t.min)} – ${inr(t.max)}${t.openEnded ? '+' : ''}`;
};

export const enquiryMailto = (subject: string, body?: string): string =>
  `mailto:${BOOKINGS_EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;

/** A reserve's standard trip length, e.g. "3 Days / 2 Nights" -> { days: 3, nights: 2 }. */
const DURATION_RE = /(\d+)\s*Days?\s*\/\s*(\d+)\s*Nights?/i;
export const tripDuration = (packageDuration?: string): { days: number; nights: number } => {
  const m = DURATION_RE.exec(packageDuration ?? '');
  return m ? { days: Number(m[1]), nights: Number(m[2]) } : { days: 3, nights: 2 };
};

/** Clean "2 Nights / 3 Days" label for cards and summaries (drops any add-on notes). */
export const durationText = (packageDuration?: string): string => {
  const { days, nights } = tripDuration(packageDuration);
  return `${nights} Night${nights === 1 ? '' : 's'} / ${days} Day${days === 1 ? '' : 's'}`;
};

/** Inclusive last day of the trip (YYYY-MM-DD) for a reserve's standard duration. */
export const tripEndDate = (startIso: string, packageDuration?: string): string => {
  const d = new Date(`${startIso}T00:00:00`);
  d.setDate(d.getDate() + tripDuration(packageDuration).days - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};