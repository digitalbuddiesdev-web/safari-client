// Shared pipeline + payment maths for the two admin pages. The advance and
// completeness rules deliberately mirror server/src/utils/leadPipeline.js so the
// button state agrees with what the API will accept — the server stays the
// authority and this copy is only for gating and display.

import { CrmPackage, LeadStatus, PaymentRecord } from '../types';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new_enquiry: 'New Enquiry',
  contacted: 'Contacted',
  package_drafted: 'Package Drafted',
  awaiting_advance_payment: 'Awaiting Advance Payment',
  advance_paid: 'Advance Paid',
  booking_confirmed: 'Booking Confirmed',
  awaiting_final_payment: 'Awaiting Final Payment',
  fully_paid: 'Fully Paid',
  completed: 'Completed',
  cancelled: 'Cancelled'
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

// Same completeness gate as the server: the Advance Payment button stays
// disabled until every mandatory package field exists.
export const missingPackageFields = (pkg?: CrmPackage | null): string[] => {
  if (!pkg) return ['package'];
  const missing: string[] = [];
  if (!String(pkg.name || '').trim()) missing.push('package name');
  if (!String(pkg.destinationName || '').trim()) missing.push('destination');
  if (!String(pkg.travelStartDate || '').trim()) missing.push('travel start date');
  if (!Number(pkg.guests?.adults)) missing.push('guest count');
  if (!String(pkg.itinerary || '').trim()) missing.push('itinerary');
  if (!String(pkg.accommodation || '').trim()) missing.push('accommodation');
  if (!String(pkg.safariDetails || '').trim()) missing.push('safari details');
  if (!pkg.inclusions?.filter(Boolean).length) missing.push('inclusions');
  if (!pkg.exclusions?.filter(Boolean).length) missing.push('exclusions');
  if (!String(pkg.terms || '').trim()) missing.push('terms and conditions');
  if (!(Number(pkg.totalPrice) > 0)) missing.push('total price');
  return missing;
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
