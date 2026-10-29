import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown,
  Compass
} from 'lucide-react';
import { SafariCalendar } from '../components/SafariCalendar';
import { destinationService, cmsService } from '../services/api';
import { Destination } from '../types';
import { 
  validateName, 
  validateEmail, 
  validatePhone, 
  validateSafaris, 
  validateGuests, 
  validateTravelDate 
} from '../lib/validation';
import { FormFieldError } from '../components/common/FormFieldError';

const fmtDate = (iso: string) =>
  iso
    ? new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

const Counter = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => (
  <div className="flex items-center justify-between bg-sand border border-forest/20 rounded-xl px-4 py-2.5">
    <span className="text-sm font-medium text-forest">{label}</span>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        className="w-7 h-7 rounded-full border border-forest/25 text-forest font-bold leading-none hover:bg-forest hover:text-sand transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-forest"
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-bold text-forest">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-full border border-forest/25 text-forest font-bold leading-none hover:bg-forest hover:text-sand transition"
      >
        +
      </button>
    </div>
  </div>
);

export const BookingPage: React.FC = () => {
  const [params] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destination, setDestination] = useState(params.get('destination') || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [safaris, setSafaris] = useState(3);
  const [safarisInput, setSafarisInput] = useState('3');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [calendarFor, setCalendarFor] = useState<'start' | 'end' | null>(null);
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [specialNotes, setSpecialNotes] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: null } : prev));
  };

  const handleSafarisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setSafarisInput(raw);
    clearFieldError('safaris');
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      setSafaris(val);
    }
  };

  const handleSafarisBlur = () => {
    if (safarisInput.trim() === '') {
      setSafaris(3);
      setSafarisInput('3');
      clearFieldError('safaris');
      return;
    }
    const val = parseInt(safarisInput, 10);
    if (isNaN(val) || val < 1) {
      setSafaris(1);
      setSafarisInput('1');
    } else {
      setSafaris(val);
      setSafarisInput(String(val));
    }
  };

  const stepSafaris = (delta: number) => {
    const current = parseInt(safarisInput, 10) || safaris || 1;
    const next = Math.max(1, current + delta);
    setSafaris(next);
    setSafarisInput(String(next));
    clearFieldError('safaris');
  };

  useEffect(() => {
    destinationService.getAll({ limit: 100 }).then(setDestinations).catch(() => {});
  }, []);

  const destinationName = destinations.find((d) => d.slug === destination)?.name || '';
  const nights =
    startDate && endDate
      ? Math.max(0, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
      : 0;
  const dateRange = [fmtDate(startDate), fmtDate(endDate)].filter(Boolean).join(' – ');
  const guestCount = adults + children + infants;
  const guestsLabel = `${adults} Adult${adults === 1 ? '' : 's'} + ${children} ${children === 1 ? 'Child' : 'Children'} + ${infants} Infant${infants === 1 ? '' : 's'}`;

  const pickStart = (iso: string) => {
    setStartDate(iso);
    clearFieldError('startDate');
    setEndDate((prev) => (prev && prev < iso ? '' : prev));
    setCalendarFor(null);
  };
  const pickEnd = (iso: string) => {
    if (startDate && iso < startDate) {
      setEndDate(startDate);
      setStartDate(iso);
    } else {
      setEndDate(iso);
    }
    setCalendarFor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive field validation
    const errors: Record<string, string | null> = {};
    const dateErr = validateTravelDate(startDate, 'Travel date');
    if (dateErr) errors.startDate = dateErr;

    const safarisErr = validateSafaris(safarisInput);
    if (safarisErr) errors.safaris = safarisErr;

    const guestsErr = validateGuests(guestCount);
    if (guestsErr) errors.guests = guestsErr;

    const nameErr = validateName(contact.name, 'Full name');
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(contact.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(contact.phone);
    if (phoneErr) errors.phone = phoneErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please review the highlighted fields before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const finalSafaris = parseInt(safarisInput, 10);
    const formattedMessage = `Custom journey enquiry — Reserve: ${destinationName || 'Flexible'} · Dates: ${dateRange || 'Flexible'} · Safaris: ${finalSafaris} · Guests: ${guestsLabel}${
      specialNotes.trim() ? `\n\n[Special Notes]: ${specialNotes.trim()}` : ''
    }`;

    try {
      await cmsService.submitInquiry({
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        destination: destinationName,
        preferredDates: dateRange,
        guests: guestCount,
        safaris: finalSafaris,
        message: formattedMessage,
      });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldLabel = 'text-[11px] uppercase tracking-wider text-forest/60 font-bold flex items-center gap-1.5 mb-2';

  return (
    <div className="bg-sand min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] tracking-widest-safari uppercase text-earth font-bold block">
            Tailor-Made Safaris
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-2">Customize Your Journey</h1>
          <p className="text-forest/70 text-sm leading-relaxed mt-3">
            Tell us where and when you'd like to travel. We'll design the itinerary, arrange the permits and send a
            personalised quote — no fixed packages, no obligation.
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl border border-forest/10 shadow-xl p-8 sm:p-12 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-forest text-gold flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-forest mt-5">Enquiry Received</h2>
            <p className="text-forest/80 text-sm max-w-md mx-auto leading-relaxed mt-3">
              Thank you{contact.name ? `, ${contact.name.trim().split(' ')[0]}` : ''}. Your custom journey request is on its way
              &mdash; our team will reach out shortly with a personalised itinerary and quote.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link to="/destinations" className="px-6 py-3 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest-light transition-colors">
                Explore Reserves
              </Link>
              <Link to="/" className="px-6 py-3 border border-forest/20 text-forest rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest/5 transition-colors">
                Back Home
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-forest/10 shadow-xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <label className="block">
                <span className={fieldLabel}>
                  <MapPin className="w-3.5 h-3.5 text-gold" /> Preferred Reserve
                </span>
                <div className="relative">
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full appearance-none bg-sand border border-forest/20 rounded-xl px-4 py-3.5 text-sm font-medium text-forest focus:outline-none focus:border-gold"
                  >
                    <option value="">Flexible &mdash; recommend a reserve for me</option>
                    {destinations.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}, {d.state}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-forest/50 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </label>

              <div>
                <span className={fieldLabel}>
                  <Calendar className="w-3.5 h-3.5 text-gold" /> Travel Dates *
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCalendarFor(calendarFor === 'start' ? null : 'start')}
                    aria-invalid={!!fieldErrors.startDate}
                    aria-describedby={fieldErrors.startDate ? 'startdate-error' : undefined}
                    className={`text-left bg-sand border rounded-xl px-4 py-3 transition-colors ${
                      fieldErrors.startDate
                        ? 'border-red-500 ring-1 ring-red-400/20'
                        : calendarFor === 'start'
                        ? 'border-gold'
                        : 'border-forest/20'
                    }`}
                  >
                    <span className="text-[10px] text-forest/50 block">Start *</span>
                    <span className={`text-sm font-medium ${startDate ? 'text-forest' : 'text-forest/40'}`}>
                      {startDate ? fmtDate(startDate) : 'Select date'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFor(calendarFor === 'end' ? null : 'end')}
                    className={`text-left bg-sand border rounded-xl px-4 py-3 transition-colors ${
                      calendarFor === 'end' ? 'border-gold' : 'border-forest/20'
                    }`}
                  >
                    <span className="text-[10px] text-forest/50 block">End (Optional)</span>
                    <span className={`text-sm font-medium ${endDate ? 'text-forest' : 'text-forest/40'}`}>
                      {endDate ? fmtDate(endDate) : 'Select date'}
                    </span>
                  </button>
                </div>
                {calendarFor && (
                  <div className="mt-3">
                    <SafariCalendar
                      value={calendarFor === 'start' ? startDate : endDate || startDate}
                      nights={calendarFor === 'start' ? nights : 0}
                      onSelect={calendarFor === 'start' ? pickStart : pickEnd}
                    />
                  </div>
                )}
                {fieldErrors.startDate && (
                  <FormFieldError id="startdate-error" error={fieldErrors.startDate} />
                )}
                {nights > 0 && (
                  <p className="text-xs text-forest/60 mt-2">
                    {nights} night{nights === 1 ? '' : 's'} / {nights + 1} days
                  </p>
                )}
              </div>

              {/* No. of Safaris (Number Input) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="safaris-input" className={fieldLabel.replace(' mb-2', '')}>
                    <Compass className="w-3.5 h-3.5 text-gold" /> No. of Safaris *
                  </label>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    Number(safarisInput) > 15 ? 'bg-amber-600 text-white' : 'bg-forest text-gold'
                  }`}>
                    {safaris} {safaris === 1 ? 'Safari Drive' : 'Safari Drives'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="safaris-input"
                    type="number"
                    min={1}
                    max={15}
                    value={safarisInput}
                    onChange={handleSafarisChange}
                    onBlur={handleSafarisBlur}
                    placeholder="Enter number of safaris (1-15)"
                    aria-invalid={!!fieldErrors.safaris || Number(safarisInput) > 15}
                    aria-describedby={Number(safarisInput) > 15 ? 'safaris-limit-msg' : fieldErrors.safaris ? 'safaris-error' : undefined}
                    className={`w-full bg-sand border rounded-xl px-4 py-3 text-sm text-forest placeholder:text-forest/40 focus:outline-none font-medium pr-24 transition-colors ${
                      Number(safarisInput) > 15
                        ? 'border-amber-500 focus:border-amber-600 ring-1 ring-amber-500/20'
                        : fieldErrors.safaris
                        ? 'border-red-500 focus:border-red-600 ring-1 ring-red-400/20'
                        : 'border-forest/20 focus:border-gold'
                    }`}
                  />
                  <div className="absolute right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepSafaris(-1)}
                      disabled={safaris <= 1}
                      className="w-8 h-8 rounded-lg bg-white/90 border border-forest/20 text-forest font-bold hover:bg-forest hover:text-sand transition disabled:opacity-30 flex items-center justify-center text-sm shadow-xs"
                      aria-label="Decrease safaris"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => stepSafaris(1)}
                      className="w-8 h-8 rounded-lg bg-white/90 border border-forest/20 text-forest font-bold hover:bg-forest hover:text-sand transition flex items-center justify-center text-sm shadow-xs"
                      aria-label="Increase safaris"
                    >
                      +
                    </button>
                  </div>
                </div>
                {Number(safarisInput) > 15 && (
                  <div id="safaris-limit-msg" className="p-3 bg-amber-50 border border-amber-300/80 text-amber-900 text-xs rounded-xl flex items-start gap-2.5 mt-2.5 shadow-xs animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      For bookings of more than 15 Safaris, please mention your requirements in the <strong>Special Requirements / Safari Notes (Optional)</strong> section. Our team will assist you with your booking.
                    </span>
                  </div>
                )}
                {fieldErrors.safaris && Number(safarisInput) <= 15 && (
                  <FormFieldError id="safaris-error" error={fieldErrors.safaris} />
                )}
              </div>

              <div className="block">
                <div className="flex items-center justify-between mb-2">
                  <span className={fieldLabel.replace(' mb-2', '')}>
                    <Users className="w-3.5 h-3.5 text-gold" /> Travellers *
                  </span>
                  {guestCount > 0 && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      guestCount > 15 ? 'bg-amber-600 text-white' : 'bg-forest/10 text-forest'
                    }`}>
                      {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                    </span>
                  )}
                </div>
                <div className="space-y-2.5">
                  <Counter
                    label="Adults"
                    value={adults}
                    onChange={(n) => {
                      setAdults(n);
                      clearFieldError('guests');
                    }}
                  />
                  <Counter
                    label="Children"
                    value={children}
                    onChange={(n) => {
                      setChildren(n);
                      clearFieldError('guests');
                    }}
                  />
                  <Counter
                    label="Infants"
                    value={infants}
                    onChange={(n) => {
                      setInfants(n);
                      clearFieldError('guests');
                    }}
                  />
                </div>
                {guestCount > 15 && (
                  <div id="guests-limit-msg" className="p-3 bg-amber-50 border border-amber-300/80 text-amber-900 text-xs rounded-xl flex items-start gap-2.5 mt-2.5 shadow-xs animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      For bookings of more than 15 guests, please mention your group size and requirements in the <strong>Special Requirements / Safari Notes (Optional)</strong> section. Our team will assist you with your booking.
                    </span>
                  </div>
                )}
                {fieldErrors.guests && guestCount <= 15 && (
                  <FormFieldError id="guests-error" error={fieldErrors.guests} />
                )}
              </div>

              {/* Special Notes */}
              <div>
                <span className={fieldLabel}>Special Requirements / Safari Notes (Optional)</span>
                <textarea
                  rows={3}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Additional booking details, requirements for >15 safaris or >15 guests, preferred gates (Moharli/Turia), dietary requests, target photography species..."
                  className="w-full bg-sand border border-forest/20 rounded-xl px-4 py-2.5 text-xs text-forest focus:outline-none focus:border-gold"
                />
                <p className="text-[11px] text-forest/60 mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold shrink-0"></span>
                  <span>Enter any additional booking details, custom itinerary requests, or requirements exceeding 15 safaris/guests here.</span>
                </p>
              </div>

              <div className="space-y-3">
                <span className={fieldLabel}>Your Contact Details *</span>
                <div>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => {
                      setContact((c) => ({ ...c, name: e.target.value }));
                      clearFieldError('name');
                    }}
                    onBlur={() => {
                      const err = validateName(contact.name, 'Full name');
                      if (err) setFieldErrors(prev => ({ ...prev, name: err }));
                    }}
                    placeholder="Full name *"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    className={`w-full bg-sand border rounded-xl px-4 py-3.5 text-sm text-forest placeholder:text-forest/40 focus:outline-none transition-colors ${
                      fieldErrors.name
                        ? 'border-red-500 focus:border-red-600 ring-1 ring-red-400/20'
                        : 'border-forest/20 focus:border-gold'
                    }`}
                  />
                  <FormFieldError id="name-error" error={fieldErrors.name} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => {
                        setContact((c) => ({ ...c, email: e.target.value }));
                        clearFieldError('email');
                      }}
                      onBlur={() => {
                        const err = validateEmail(contact.email);
                        if (err) setFieldErrors(prev => ({ ...prev, email: err }));
                      }}
                      placeholder="Email address *"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      className={`w-full bg-sand border rounded-xl px-4 py-3.5 text-sm text-forest placeholder:text-forest/40 focus:outline-none transition-colors ${
                        fieldErrors.email
                          ? 'border-red-500 focus:border-red-600 ring-1 ring-red-400/20'
                          : 'border-forest/20 focus:border-gold'
                      }`}
                    />
                    <FormFieldError id="email-error" error={fieldErrors.email} />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => {
                        setContact((c) => ({ ...c, phone: e.target.value }));
                        clearFieldError('phone');
                      }}
                      onBlur={() => {
                        const err = validatePhone(contact.phone);
                        if (err) setFieldErrors(prev => ({ ...prev, phone: err }));
                      }}
                      placeholder="Phone / WhatsApp Number *"
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                      className={`w-full bg-sand border rounded-xl px-4 py-3.5 text-sm text-forest placeholder:text-forest/40 focus:outline-none transition-colors ${
                        fieldErrors.phone
                          ? 'border-red-500 focus:border-red-600 ring-1 ring-red-400/20'
                          : 'border-forest/20 focus:border-gold'
                      }`}
                    />
                    <FormFieldError id="phone-error" error={fieldErrors.phone} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <aside className="lg:col-span-2">
              <div className="bg-forest text-sand rounded-2xl p-6 shadow-lg space-y-4 lg:sticky lg:top-24">
                <h3 className="font-serif text-lg font-bold">Your Journey Summary</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-sand/60">Reserve</span>
                    <span className="font-semibold text-right">{destinationName || 'Flexible'}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sand/60">Dates</span>
                    <span className="font-semibold text-right">{dateRange || 'Flexible'}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sand/60">Duration</span>
                    <span className="font-semibold text-right">
                      {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'} / ${nights + 1} days` : 'Flexible'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sand/60">No. of Safaris</span>
                    <span className={`font-semibold text-right ${safaris > 15 ? 'text-amber-400' : 'text-gold'}`}>
                      {safaris} {safaris === 1 ? 'Safari Drive' : 'Safari Drives'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sand/60">Travellers</span>
                    <span className={`font-semibold text-right ${guestCount > 15 ? 'text-amber-400' : ''}`}>
                      {guestsLabel}
                    </span>
                  </div>
                </div>
                <div className="border-t border-sand/20 pt-4">
                  <p className="text-[11px] text-sand/70 leading-relaxed">
                    Every journey is bespoke &mdash; permits, exclusive safari vehicle, naturalist guide and forest dues included.
                    We'll prepare a custom itinerary and transparent quote.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gold text-forest rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-gold-light transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request A Quote</span>
                    </>
                  )}
                </button>
              </div>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
