import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { destinationService, cmsService } from '../services/api';
import { Destination } from '../types';

export const BookingPage: React.FC = () => {
  const [params] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    destinationService.getAll({ limit: 100 }).then(setDestinations).catch(() => {});
  }, []);

  // Reserve links point here with ?destination=<slug>; the rest is the rep's job.
  const destinationName = destinations.find(d => d.slug === params.get('destination'))?.name || '';

  const fieldLabel = 'text-[11px] uppercase tracking-wider text-forest/60 font-bold flex items-center gap-1.5 mb-2';
  const inputClass = 'w-full bg-sand border border-forest/20 rounded-xl px-4 py-3.5 text-sm text-forest focus:outline-none focus:border-gold';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await cmsService.submitInquiry({
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        message: contact.message.trim(),
        destination: destinationName,
      });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-sand min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] tracking-widest-safari uppercase text-earth font-bold block">
            Tailor-Made Safaris
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-2">Customize Your Journey</h1>
          <p className="text-forest/70 text-sm leading-relaxed mt-3">
            Tell us where and when you'd like to travel. We'll design the itinerary, arrange the permits and send a
            personalised quote — no fixed packages, no obligation.
          </p>
          {destinationName && (
            <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              {destinationName}
            </span>
          )}
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl border border-forest/10 shadow-xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-forest text-gold flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-forest mt-5">Enquiry Received</h2>
            <p className="text-forest/80 text-sm max-w-md mx-auto leading-relaxed mt-3">
              Thank you{contact.name ? `, ${contact.name.trim().split(' ')[0]}` : ''}. Your request is on its way
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
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-forest/10 shadow-xl p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <label className="block">
              <span className={fieldLabel}>Your Full Name *</span>
              <input
                type="text"
                required
                value={contact.name}
                onChange={e => setContact({ ...contact, name: e.target.value })}
                placeholder="Dr. Anand Deshmukh"
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={fieldLabel}>Email *</span>
                <input
                  type="email"
                  required
                  value={contact.email}
                  onChange={e => setContact({ ...contact, email: e.target.value })}
                  placeholder="anand@example.com"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={fieldLabel}>Phone *</span>
                <input
                  type="tel"
                  required
                  value={contact.phone}
                  onChange={e => setContact({ ...contact, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <span className={fieldLabel}>What Do You Have In Mind? *</span>
              <textarea
                required
                rows={5}
                value={contact.message}
                onChange={e => setContact({ ...contact, message: e.target.value })}
                placeholder="Reserve, dates, number of guests, or any special requests — write as much or as little as you like."
                className={`${inputClass} resize-none leading-relaxed`}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-forest/90 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-sand border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 text-gold" />
                  <span>Send Enquiry</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-forest/50">
              No payment now. A specialist replies within 4 business hours.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
