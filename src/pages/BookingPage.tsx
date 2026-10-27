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
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [calendarFor, setCalendarFor] = useState<'start' | 'end' | null>(null);
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [specialNotes, setSpecialNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!startDate) {
      setError('Please choose a travel date to help us quote.');
      return;
    }
    if (!contact.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!contact.phone.trim() || contact.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid Phone / WhatsApp number (minimum 10 digits).');
      return;
    }
    setSubmitting(true);
    setError(null);

    const formattedMessage = `Custom journey enquiry — Reserve: ${destinationName || 'Flexible'} · Dates: ${dateRange || 'Flexible'} · Safaris: ${safaris} · Guests: ${guestsLabel}${
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
        safaris,
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
                  <Calendar className="w-3.5 h-3.5 text-gold" /> Travel Dates
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCalendarFor(calendarFor === 'start' ? null : 'start')}
                    className={`text-left bg-sand border rounded-xl px-4 py-3 transition-colors ${
                      calendarFor === 'start' ? 'border-gold' : 'border-forest/20'
                    }`}
                  >
                    <span className="text-[10px] text-forest/50 block">Start</span>
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
                    <span className="text-[10px] text-forest/50 block">End</span>
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
                {nights > 0 && (
                  <p className="text-xs text-forest/60 mt-2">
                    {nights} night{nights === 1 ? '' : 's'} / {nights + 1} days
                  </p>
                )}
              </div>

              {/* No. of Safaris (Interactive Slider Selector) */}
              <div className="bg-sand/40 border border-forest/15 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={fieldLabel}>
                    <Compass className="w-3.5 h-3.5 text-gold" /> No. of Safaris
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest text-gold text-xs font-bold tracking-wide shadow-xs">
                    {safaris} {safaris === 1 ? 'Safari Drive' : 'Safari Drives'}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={safaris}
                    onChange={(e) => setSafaris(Number(e.target.value))}
                    className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-forest focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #2E3A23 0%, #2E3A23 ${((safaris - 1) / 4) * 100}%, #E2DED0 ${((safaris - 1) / 4) * 100}%, #E2DED0 100%)`
                    }}
                    aria-label="No. of Safaris"
                  />

                  {/* Interactive Step Buttons */}
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = safaris === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSafaris(num)}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border ${
                            isSelected
                              ? 'bg-forest text-sand border-forest shadow-md font-bold scale-[1.03]'
                              : 'bg-white/80 hover:bg-white text-forest/70 border-forest/10 hover:border-forest/30'
                          }`}
                        >
                          <span className={`text-sm ${isSelected ? 'text-gold font-extrabold' : 'font-semibold'}`}>
                            {num}
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-sand/80' : 'text-forest/50'}`}>
                            {num === 1 ? 'Safari' : 'Safaris'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[11px] text-forest/70 pt-2 border-t border-forest/10 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold shrink-0"></span>
                  <span>
                    {safaris === 1 && '1 safari drive — ideal for a quick reserve preview or short transit itinerary.'}
                    {safaris === 2 && '2 safari drives — classic 1 night stay with 1 morning & 1 afternoon drive.'}
                    {safaris === 3 && '3 safari drives — recommended for optimal tiger & predator tracking probabilities.'}
                    {safaris === 4 && '4 safari drives — deep multi-zone core exploration across morning & afternoon shifts.'}
                    {safaris === 5 && '5 safari drives — immersive master safari with maximum track-and-photography coverage.'}
                  </span>
                </p>
              </div>

              <div className="block">
                <span className={fieldLabel}>
                  <Users className="w-3.5 h-3.5 text-gold" /> Travellers
                </span>
                <div className="space-y-2.5">
                  <Counter label="Adults" value={adults} onChange={setAdults} />
                  <Counter label="Children" value={children} onChange={setChildren} />
                  <Counter label="Infants" value={infants} onChange={setInfants} />
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <span className={fieldLabel}>Special Requirements / Safari Notes (Optional)</span>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Preferred gates (Moharli/Turia), dietary requests, target photography species..."
                  className="w-full bg-sand border border-forest/20 rounded-xl px-4 py-2.5 text-xs text-forest focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-3">
                <span className={fieldLabel}>Your Contact Details</span>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Full name *"
                  className="w-full bg-sand border border-forest/20 rounded-xl px-4 py-3.5 text-sm text-forest focus:outline-none focus:border-gold"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    placeholder="Email address *"
                    className="w-full bg-sand border border-forest/20 rounded-xl px-4 py-3.5 text-sm text-forest focus:outline-none focus:border-gold"
                  />
                  <input
                    type="tel"
                    required
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="Phone / WhatsApp Number *"
                    className="w-full bg-sand border border-forest/20 rounded-xl px-4 py-3.5 text-sm text-forest focus:outline-none focus:border-gold"
                  />
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
                    <span className="font-semibold text-right text-gold">
                      {safaris} {safaris === 1 ? 'Safari Drive' : 'Safari Drives'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sand/60">Travellers</span>
                    <span className="font-semibold text-right">{guestsLabel}</span>
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
