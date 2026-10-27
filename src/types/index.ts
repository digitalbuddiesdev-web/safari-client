export interface Zone {
  name: string;
  type: 'core' | 'buffer';
  vehicleQuotaPerDay?: number;
  description?: string;
  highlight?: string;
  isPrime?: boolean;
}

export interface Destination {
  _id: string;
  name: string;
  slug: string;
  state: string;
  tagline: string;
  shortDesc: string;
  editorialQuote?: string;
  fullDesc: string;
  heroImage: string;
  galleryImages: string[];
  areaSqKm: number;
  tigerCount: string;
  headlineSpecies?: string;
  bestTimeToVisit: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapPosition: {
    x: number;
    y: number;
  };
  startingPrice: number | null;
  packages?: Array<{
    label: 'Budget' | 'Mid-Range' | 'Luxury';
    min: number;
    max: number;
    openEnded?: boolean;
    includes: string[];
  }>;
  positioning?: string;
  bestSuitedFor?: string;
  gateway?: string;
  packageDuration?: string;
  safariPlan?: string;
  availability: 'AVAILABLE' | 'FEW PERMITS' | 'LIMITED' | 'SOLD OUT';
  zones: Zone[];
  wildlifeHighlights: string[];
  howToReach: {
    air: string;
    rail: string;
    road: string;
  };
  rulesAndGuidelines: string[];
  faqs: Array<{ question: string; answer: string }>;
  isPublished: boolean;
}

export interface Safari {
  _id: string;
  destination: string | Destination;
  destinationSlug: string;
  destinationName: string;
  state: string;
  name: string;
  slug: string;
  safariType: 'Jeep Safari' | 'Canter Safari' | 'Private Photography Safari' | 'Full-Day Safari' | 'Night Buffer Safari' | 'Walking Safari';
  slot: 'Morning' | 'Afternoon' | 'Full Day' | 'Night';
  protectedAreaType: 'Sanctuary' | 'Reserve' | 'National Park';
  duration: string;
  vehicle: string;
  capacity: number;
  zones: string[];
  basePrice: number;
  description: string;
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  availableDays: string[];
  availabilityStatus: 'AVAILABLE' | 'FAST FILLING' | 'SOLD OUT';
  isPublished: boolean;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  idType: string;
  idNumber: string;
}

export interface Booking {
  _id: string;
  bookingRef: string;
  user?: string;
  customerInfo: CustomerInfo;
  destination?: string | Destination;
  destinationName: string;
  safari?: string | Safari;
  safariName: string;
  safariDate: string;
  endDate?: string;
  slot: string;
  zone: string;
  vehicleType: string;
  guests: {
    adults: number;
    children: number;
  };
  guestDetails?: { fullName: string; idType: string; idNumber: string }[];
  specialRequests?: string;
  totalAmount: number;
  packageLabel?: 'Budget' | 'Mid-Range' | 'Luxury';
  bookingStatus: 'pending' | 'under_review' | 'confirmed' | 'alternative_suggested' | 'payment_pending' | 'paid' | 'cancelled' | 'completed' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  suggestion?: {
    destinationName?: string;
    destinationSlug?: string;
    packageLabel?: string;
    message?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ---- Enquiry-to-completed CRM pipeline ----
export type LeadStatus =
  | 'new_enquiry' | 'contacted' | 'package_drafted' | 'awaiting_advance_payment'
  | 'advance_paid' | 'booking_confirmed' | 'awaiting_final_payment' | 'fully_paid'
  | 'completed' | 'cancelled';

export interface PaymentRecord {
  _id?: string;
  paymentId: string;
  linkId?: string;
  type: 'advance' | 'final';
  amount: number;
  status: 'captured' | 'failed';
  method?: string;
  paidAt?: string;
}

export interface PaymentLinkRecord {
  _id?: string;
  linkId: string;
  shortUrl?: string;
  type: 'advance' | 'final';
  amount: number;
  status: 'active' | 'paid' | 'expired' | 'cancelled';
  expiresAt?: string;
  paidAt?: string;
}

// Booking rows returned by the CRM carry the pipeline fields the permit
// checkout flow never sets, so they are optional on the shared interface.
export type CrmBooking = Booking & {
  inquiry?: string | { _id: string; enquiryId?: string; status?: LeadStatus } | null;
  package?: string | CrmPackage | null;
  crmStatus?: LeadStatus;
  payments?: PaymentRecord[];
  paymentLinks?: PaymentLinkRecord[];
  totalPaid?: number;
  advanceAmount?: number;
  outstanding?: number;
  confirmedAt?: string;
  confirmedBy?: string;
  statusHistory?: { status?: string; by?: string; note?: string; at?: string }[];
};

export interface CrmPackage {
  _id: string;
  packageRef?: string;
  inquiry: string;
  name: string;
  destinationName: string;
  travelStartDate: string;
  travelEndDate?: string;
  guests: { adults: number; children?: number };
  itinerary: string;
  accommodation: string;
  safariDetails: string;
  inclusions: string[];
  exclusions: string[];
  terms: string;
  totalPrice: number;
  status?: 'draft' | 'sent' | 'approved';
}

export interface CrmInquiry {
  _id: string;
  enquiryId?: string;
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  travelDate?: string;
  subject?: string;
  message: string;
  status: LeadStatus;
  assignedTo?: { _id: string; name: string; email?: string } | string | null;
  booking?: string | null;
  guests?: number;
  safaris?: number;
  createdAt: string;
  notes?: { _id?: string; by?: string; note: string; createdAt?: string }[];
}

export interface CrmEmailLog {
  _id: string;
  event: string;
  to: string;
  subject?: string;
  createdAt: string;
  sentBy?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'super_admin' | 'booking_manager' | 'content_manager' | 'customer';
  phone?: string;
  country?: string;
  savedDestinations?: string[];
}

export interface GalleryItem {
  _id: string;
  title: string;
  imageUrl: string;
  animal: 'Tiger' | 'Leopard' | 'Elephant' | 'Birds' | 'Safari Life' | 'Forest Landscape';
  destinationName?: string;
  state?: string;
  photographer?: string;
  cameraGear?: string;
  isFeatured: boolean;
}

export interface JournalArticle {
  _id: string;
  title: string;
  slug: string;
  category: 'Wildlife' | 'Photography' | 'Safari Guide' | 'Destinations' | 'Responsible Tourism';
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  coverImage: string;
  coverImageCredit?: string;
  author: string;
  readTime: string;
  destinationTag?: string;
  publishedAt: string;
}

export interface FAQItem {
  _id: string;
  category: string;
  question: string;
  answer: string;
}

export interface ReviewItem {
  _id: string;
  destinationName: string;
  author: string;
  authorLocation: string;
  rating: number;
  title: string;
  comment: string;
  safariType?: string;
  date: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  emergencySupport: string;
}
