import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { bookingService } from '../services/api';
import { validateEmail, validatePhone, validateRequired } from '../lib/validation';
import { FormFieldError } from '../components/common/FormFieldError';
import { Booking } from '../types';

const STATUS: Record<Booking['bookingStatus'], { label: string; cls: string; note: string }> = {
  pending: { label: 'Under review', cls: 'bg-amber-100 text-amber-800 border-amber-300', note: 'Our team is checking availability and will call you within 24 hours.' },
  under_review: { label: 'Under review', cls: 'bg-amber-100 text-amber-800 border-amber-300', note: 'Our team is checking availability and will call you within 24 hours.' },
  payment_pending: { label: 'Payment pending', cls: 'bg-amber-100 text-amber-800 border-amber-300', note: 'Your date is held. Our team will share payment details.' },
  paid: { label: 'Confirmed & paid', cls: 'bg-green-100 text-green-800 border-green-300', note: 'Your safari is confirmed. Permits will be shared shortly.' },
  confirmed: { label: 'Confirmed', cls: 'bg-green-100 text-green-800 border-green-300', note: 'Your safari is confirmed. Permits will be shared shortly.' },
  alternative_suggested: { label: 'Alternative offered', cls: 'bg-blue-100 text-blue-800 border-blue-300', note: 'Your requested slot was unavailable. An alternative has been suggested — we will call you.' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-100 text-rose-800 border-rose-300', note: 'This booking was cancelled. Contact us for any deduction questions.' },
  rejected: { label: 'Not available', cls: 'bg-rose-100 text-rose-800 border-rose-300', note: 'We could not confirm this request. Our team will suggest alternatives.' },
  completed: { label: 'Completed', cls: 'bg-forest/10 text-forest border-forest/30', note: 'Thank you for travelling with us.' }
};

const TrackBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ref, setRef] = useState(searchParams.get('ref') || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: null } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string | null> = {};

    const refErr = validateRequired(ref, 'Booking reference', 4);
    if (refErr) errors.ref = refErr;

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail && !trimmedPhone) {
      errors.contact = 'Please provide either your booking email or phone number.';
    } else {
      if (trimmedEmail) {
        const eErr = validateEmail(trimmedEmail);
        if (eErr) errors.email = eErr;
      }
      if (trimmedPhone) {
        const pErr = validatePhone(trimmedPhone);
        if (pErr) errors.phone = pErr;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please review the highlighted fields before submitting.');
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});
    setBooking(null);
    try {
      setBooking(await bookingService.track({ ref: ref.trim().toUpperCase(), email: trimmedEmail || undefined, phone: trimmedPhone || undefined }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'No booking matches that reference and contact.');
    } finally {
      setLoading(false);
    }
  };

  const status = booking ? STATUS[booking.bookingStatus] : null;

  return (
    <div className="bg-sand min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-forest/15 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-[11px] font-semibold uppercase tracking-widest mb-1">
              <ShieldCheck className="w-3 h-3 text-gold" />
              <span>Booking Status</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-forest">Track Your Safari</h1>
            <p className="text-forest/60 text-xs">Enter your reference and the email or phone you booked with.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="track-ref" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                Booking Reference *
              </label>
              <input
                id="track-ref"
                value={ref}
                onChange={(e) => {
                  setRef(e.target.value.toUpperCase());
                  clearFieldError('ref');
                }}
                onBlur={() => {
                  const err = validateRequired(ref, 'Booking reference', 4);
                  if (err) setFieldErrors(prev => ({ ...prev, ref: err }));
                }}
                placeholder="SNS-2026-1234"
                aria-invalid={!!fieldErrors.ref}
                aria-describedby={fieldErrors.ref ? 'track-ref-error' : undefined}
                className={`w-full px-4 py-2.5 bg-sand/30 border rounded-xl text-xs text-forest focus:outline-none transition-colors ${
                  fieldErrors.ref ? 'border-red-500 ring-1 ring-red-400/20' : 'border-forest/15 focus:ring-2 focus:ring-forest/30'
                }`}
              />
              <FormFieldError id="track-ref-error" error={fieldErrors.ref} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="track-email" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                  Email (Either Email or Phone)
                </label>
                <input
                  id="track-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                    clearFieldError('contact');
                  }}
                  onBlur={() => {
                    if (email.trim()) {
                      const err = validateEmail(email);
                      if (err) setFieldErrors(prev => ({ ...prev, email: err }));
                    }
                  }}
                  placeholder="name@example.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'track-email-error' : undefined}
                  className={`w-full px-4 py-2.5 bg-sand/30 border rounded-xl text-xs text-forest focus:outline-none transition-colors ${
                    fieldErrors.email ? 'border-red-500 ring-1 ring-red-400/20' : 'border-forest/15 focus:ring-2 focus:ring-forest/30'
                  }`}
                />
                <FormFieldError id="track-email-error" error={fieldErrors.email} />
              </div>
              <div>
                <label htmlFor="track-phone" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                  Or Phone
                </label>
                <input
                  id="track-phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError('phone');
                    clearFieldError('contact');
                  }}
                  onBlur={() => {
                    if (phone.trim()) {
                      const err = validatePhone(phone);
                      if (err) setFieldErrors(prev => ({ ...prev, phone: err }));
                    }
                  }}
                  placeholder="+91 98765 43210"
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? 'track-phone-error' : undefined}
                  className={`w-full px-4 py-2.5 bg-sand/30 border rounded-xl text-xs text-forest focus:outline-none transition-colors ${
                    fieldErrors.phone ? 'border-red-500 ring-1 ring-red-400/20' : 'border-forest/15 focus:ring-2 focus:ring-forest/30'
                  }`}
                />
                <FormFieldError id="track-phone-error" error={fieldErrors.phone} />
              </div>
            </div>
            {fieldErrors.contact && (
              <FormFieldError error={fieldErrors.contact} />
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!email.trim() && !phone.trim())}
              className="w-full py-3.5 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-forest/90 transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-sand border-t-transparent rounded-full animate-spin" /> : (<><Search className="w-4 h-4 text-gold" /><span>Find My Booking</span></>)}
            </button>
          </form>

          {booking && status && (
            <div className="rounded-2xl border border-forest/15 overflow-hidden animate-fadeIn">
              <div className={`px-5 py-3 border-b flex items-center justify-between ${status.cls}`}>
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {status.label}
                </span>
                <span className="text-xs font-bold">{booking.bookingRef}</span>
              </div>
              <div className="p-5 space-y-2.5 text-xs text-forest bg-sand-light">
                <p className="text-forest/70">{status.note}</p>
                <div className="flex justify-between gap-2"><span className="text-forest/60 font-semibold">Reserve</span><span className="font-bold text-right">{booking.destinationName}</span></div>
                <div className="flex justify-between gap-2"><span className="text-forest/60 font-semibold">Safari</span><span className="font-bold text-right">{booking.safariName}</span></div>
                <div className="flex justify-between gap-2"><span className="text-forest/60 font-semibold">Date</span><span className="font-bold text-right">{new Date(booking.safariDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                <div className="flex justify-between gap-2"><span className="text-forest/60 font-semibold">Travelers</span><span className="font-bold text-right">{booking.guests?.adults ?? 1} adult(s){booking.guests?.children ? `, ${booking.guests.children} child(ren)` : ''}</span></div>
                {booking.suggestion?.message && <p className="text-forest/70 border-t border-forest/15 pt-2.5">Our suggestion: {booking.suggestion.message}</p>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TrackBookingPage;
