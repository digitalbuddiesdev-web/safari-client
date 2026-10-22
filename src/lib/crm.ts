// Shared pipeline + payment maths for the two admin pages. The server owns the
// rules (it sends `missingFields`, and it rejects a bad advance amount); this
// copy is only for gating and display.

import { CrmPackage, LeadStatus, PaymentRecord } from '../types';

// The server keeps the retired 'new' / 'resolved' enquiry statuses valid for
// old documents, so the console has to be able to label them too.
export const LEAD_STATUS_LABELS: Record<LeadStatus | 'new' | 'resolved', string> = {
  new_enquiry: 'New Enquiry',
  contacted: 'Contacted',
  package_drafted: 'Package Drafted',
  awaiting_advance_payment: 'Awaiting Advance Payment',
  advance_paid: 'Advance Paid',
  booking_confirmed: 'Booking Confirmed',
  awaiting_final_payment: 'Awaiting Final Payment',
  fully_paid: 'Fully Paid',
  completed: 'Completed',
  cancelled: 'Cancelled',
  new: 'New Enquiry',
  resolved: 'Resolved'
};

// Order the pipeline in the order a lead travels through it.
export const LEAD_STATUS_ORDER: LeadStatus[] = [
  'new_enquiry',
  'contacted',
  'package_drafted',
  'awaiting_advance_payment',
  'advance_paid',
  'booking_confirmed',
  'awaiting_final_payment',
  'fully_paid',
  'completed',
  'cancelled'
];

export interface WebsiteWorkflowStep {
  number: number;
  id: string;
  name: string;
  subtitle: string;
  description: string;
}

export const WEBSITE_5_STEPS: WebsiteWorkflowStep[] = [
  {
    number: 1,
    id: 'step_1_enquiry',
    name: '1. Customer Enquiry',
    subtitle: 'Lead received & contact',
    description: 'Customer submits enquiry on website. Both customer and admin receive instant notifications. Representative discusses safari requirements.'
  },
  {
    number: 2,
    id: 'step_2_package',
    name: '2. Package Creation',
    subtitle: 'Draft bespoke quote',
    description: 'Representative prepares suitable package in CRM. Once all required booking information is filled in, the advance payment option is activated.'
  },
  {
    number: 3,
    id: 'step_3_advance',
    name: '3. Advance Payment',
    subtitle: 'Pop-up & 24h link',
    description: 'Package amount is set manually. Enter advance amount in pop-up. Customer receives details + 24h Razorpay link, and automated receipt upon payment.'
  },
  {
    number: 4,
    id: 'step_4_confirm',
    name: '4. Booking Confirmation',
    subtitle: 'Confirm & balance link',
    description: 'Team confirms booking. Update email is sent via CRM with confirmed details and a Razorpay payment link for the remaining amount.'
  },
  {
    number: 5,
    id: 'step_5_final',
    name: '5. Final Payment & Docs',
    subtitle: 'Receipt & safari docs',
    description: 'Customer settles remaining balance. Automated final email sent with remaining details, booking documents link, and final receipt.'
  }
];

export const getStepForStatus = (status?: string): number => {
  switch (status) {
    case 'new_enquiry':
    case 'new':
    case 'contacted':
      return 1;
    case 'package_drafted':
      return 2;
    case 'awaiting_advance_payment':
      return 3;
    case 'advance_paid':
      return 4; // Advance paid -> ready for team to confirm booking
    case 'booking_confirmed':
    case 'awaiting_final_payment':
      return 4;
    case 'fully_paid':
    case 'completed':
    case 'paid':
      return 5;
    default:
      return 1;
  }
};

export const leadStatusClass = (s?: LeadStatus | string) => {
  switch (s) {
    case 'new_enquiry':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'contacted':
      return 'bg-blue-50 text-blue-800 border-blue-300';
    case 'package_drafted':
    case 'awaiting_advance_payment':
      return 'bg-sand text-forest border-forest/30';
    case 'advance_paid':
    case 'booking_confirmed':
    case 'awaiting_final_payment':
      return 'bg-teal-50 text-teal-800 border-teal-300';
    case 'fully_paid':
    case 'completed':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'cancelled':
      return 'bg-red-50 text-red-800 border-red-300';
    default:
      return 'bg-sand text-forest/70 border-forest/20';
  }
};

export const formatINR = (n?: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const totalPaidOf = (payments: PaymentRecord[] = []) =>
  payments.filter(p => p.status === 'captured').reduce((s, p) => s + Number(p.amount || 0), 0);

export const outstanding = (total: number, payments: PaymentRecord[] = []) =>
  Math.max(0, Number(total || 0) - totalPaidOf(payments));

export const advanceError = (advance: number | string, total: number): string | null => {
  const a = Number(advance);
  const t = Number(total);
  if (!Number.isFinite(a) || a <= 0) return 'Advance amount must be greater than zero.';
  if (!Number.isFinite(t) || t <= 0) return 'Package price is not set.';
  if (a > t) return 'Advance amount cannot exceed the total package amount.';
  return null;
};

export const activeLinkOf = (links: { type: string; status: string; shortUrl?: string; expiresAt?: string; amount: number }[] = [], type: 'advance' | 'final') =>
  links.find(l => l.type === type && l.status === 'active');

export const linkExpiryLabel = (expiresAt?: string) => {
  if (!expiresAt) return '';
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const hrs = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hrs >= 1) return `expires in ~${hrs}h ${mins}m`;
  return `expires in ~${mins}m`;
};

// WhatsApp clean phone helper (India country code +91 default)
export const cleanPhoneForWhatsApp = (raw?: string): string => {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

// Generates direct WhatsApp click-to-chat URL
export const getWhatsAppUrl = (phone?: string, text: string = ''): string => {
  const cleaned = cleanPhoneForWhatsApp(phone);
  if (!cleaned) return '';
  return `https://wa.me/${cleaned}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

// Formats an inquiry initial greeting for WhatsApp
export const generateWhatsAppInquiryGreeting = (name?: string, destination?: string, senderName: string = 'Sachin from Shutter & Stripes'): string => {
  const guest = name ? name.split(' ')[0] : 'there';
  const dest = destination ? ` regarding your safari inquiry for *${destination}*` : ' regarding your safari expedition inquiry';
  return `Hello ${guest}! This is ${senderName}.${dest}.\n\nI'm delighted to assist you with crafting your wilderness itinerary. Are you looking to travel on specific dates, or would you like me to share our recommended safari schedule?`;
};

// Formats a clean, readable booking summary for WhatsApp
export const generateWhatsAppBookingSummary = (
  booking: { bookingRef: string; customerInfo?: { fullName?: string }; destinationName?: string; safariDate?: string | Date; slot?: string; totalAmount?: number },
  pkg?: CrmPackage | null,
  activeLink?: string
): string => {
  const ref = booking.bookingRef;
  const guest = booking.customerInfo?.fullName || 'Traveler';
  const dest = pkg?.destinationName || booking.destinationName || 'Wildlife Safari';
  const dates = pkg?.travelStartDate 
    ? `${pkg.travelStartDate}${pkg.travelEndDate ? ` – ${pkg.travelEndDate}` : ''}`
    : booking.safariDate ? new Date(booking.safariDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'To be confirmed';
  
  let msg = `🐾 *SHUTTER & STRIPES SAFARI SUMMARY*\n`;
  msg += `*Booking Reference:* #${ref}\n`;
  msg += `*Guest:* ${guest}\n`;
  msg += `*Reserve:* ${dest}\n`;
  msg += `*Travel Window:* ${dates}\n`;
  
  if (pkg?.name) {
    msg += `*Package:* ${pkg.name}\n`;
  }
  if (pkg?.safariDetails) {
    msg += `*Safaris:* ${pkg.safariDetails}\n`;
  }
  if (pkg?.accommodation) {
    msg += `*Stay:* ${pkg.accommodation}\n`;
  }
  
  const total = pkg?.totalPrice || booking.totalAmount || 0;
  msg += `*Total Amount:* ₹${Number(total).toLocaleString('en-IN')}\n`;
  
  if (activeLink) {
    msg += `\n💳 *Secure Payment Link:* ${activeLink}\n(Click to pay advance via UPI, NetBanking, or Card)\n`;
  }
  
  msg += `\nWe are looking forward to hosting you in the wild!\nFor any quick assistance, reply directly on this chat.`;
  return msg;
};

// Quick standard package templates to save 10+ minutes of typing per lead
export const getPackagePreset = (destinationName?: string, tier: 'Budget' | 'Mid-Range' | 'Luxury' = 'Mid-Range') => {
  const dest = destinationName?.trim() || 'Central India Tiger Reserve';
  
  const itineraries = {
    'Budget': 'Day 1: Arrival & station pickup. Check-in, lunch & evening buffer safari drive.\nDay 2: Early morning core safari drive + afternoon buffer safari.\nDay 3: Sunrise birding / nature walk, breakfast & return station transfer.',
    'Mid-Range': 'Day 1: Private transfer from nearest railhead/airport. Welcome drink, briefing & afternoon core safari drive.\nDay 2: Morning core safari drive + Afternoon core sector drive with master naturalist.\nDay 3: Dawn tracking drive in premium zone, hearty breakfast & private return transfer.',
    'Luxury': 'Day 1: Luxury private SUV transfer. VIP cottage check-in, gourmet lunch & private core game drive.\nDay 2: Dawn core safari with dedicated master naturalist + afternoon exclusive safari drive. Evening bush dining.\nDay 3: Sunrise signature track drive, lavish brunch & chauffeured luxury transfer.'
  };

  const stays = {
    'Budget': `Eco-friendly safari lodge / nature cottages near ${dest} gate with home-style buffet meals.`,
    'Mid-Range': `Premium boutique wildlife resort near ${dest} with swimming pool, air-conditioned cottages & buffet dining.`,
    'Luxury': `Ultra-luxury forest villas / heritage safari lodge at ${dest} with dedicated naturalist, private deck & fine dining.`
  };

  const safaris = {
    'Budget': `3 Shared / Standard Game Drives in open 4x4 Gypsy with registered forest guide.`,
    'Mid-Range': `4 Exclusive Game Drives (Core & Buffer tracks) in customized open 4x4 Gypsy with certified naturalist.`,
    'Luxury': `4 Exclusive Prime Core Game Drives in premium 4x4 Gypsy with dedicated Master Wildlife Naturalist.`
  };

  return {
    name: `3D/2N ${tier} Wildlife Expedition — ${dest}`,
    destinationName: dest,
    accommodation: stays[tier],
    itinerary: itineraries[tier],
    safariDetails: safaris[tier],
    inclusions: [
      `Guaranteed park entry permits for ${dest}`,
      'Exclusive 4x4 Gypsy open safari vehicles',
      'Certified naturalist and expert local tracker',
      'All meals (Breakfast, Lunch, Dinner) included',
      'Roundtrip private station / airport transfers',
      'All mandatory forest conservation dues and fees'
    ].join('\n'),
    exclusions: [
      'Personal expenses, beverages and laundry',
      'Discretionary tips for guides and drivers',
      'Camera / lens fees if mandated at gate',
      'Flights or train tickets to gateway city'
    ].join('\n'),
    terms: 'Valid government photo ID (Aadhaar / Passport) is strictly required at park entry gates. Permits are non-transferable and issued subject to Maharashtra & Madhya Pradesh Forest Department guidelines.'
  };
};
