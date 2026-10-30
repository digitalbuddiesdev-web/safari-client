import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Sparkles,
  MapPin,
  ShieldCheck,
  UserCheck,
  Car,
  Utensils,
  Users,
} from 'lucide-react';
import { cmsService } from '../services/api';
import { validateName, validateEmail, validatePhone, validateRequired } from '../lib/validation';
import { FormFieldError } from '../components/common/FormFieldError';
import { UPCOMING_TOURS, getUpcomingTour } from '../lib/upcomingTours';
import { UpcomingToursSlider } from '../components/upcoming/UpcomingToursSlider';
import InstagramIcon from '../components/InstagramIcon';

const PHONE_NUMBER = '+91 90219 18758';
const PHONE_CLEAN = '919021918758';
const EMAIL_ADDRESS = 'bookings@shutterandstripessafaris.com';

export const UpcomingTourPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const tour = slug ? getUpcomingTour(slug) : undefined;
  const isHubView = !slug;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDates: '',
    message: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: null } : prev));
  };

  const handleSubmit = async (e: React.FormEvent, tourTitle?: string) => {
    e.preventDefault();

    const errors: Record<string, string | null> = {};
    const nameErr = validateName(form.name, 'Your name');
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errors.phone = phoneErr;

    const msgErr = validateRequired(form.message, 'Your Question / Requirements', 5);
    if (msgErr) errors.message = msgErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please review the highlighted fields before submitting.');
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      await cmsService.submitInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        preferredDates: form.preferredDates || tour?.travelPeriod || 'February – April 2027',
        message: form.message.trim(),
        destination: tourTitle || tour?.title || 'Maharashtra Wildlife Safaris',
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-sand/40 border border-forest/15 rounded-xl text-xs text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition';

  // =========================================================================
  // 1. COMPACT HUB VIEW: /upcoming-tours
  // =========================================================================
  if (isHubView) {
    return (
      <div className="bg-[#FAF7F2] text-forest min-h-screen pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/5 border border-forest/15 text-gold text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              <span>The Safari Calendar · 2027 Season</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest tracking-tight">
              Upcoming Wildlife Tours
            </h1>
            <p className="text-forest/70 text-xs sm:text-sm leading-relaxed">
              Fixed-date group departures and bespoke expeditions across Tadoba, Pench, and Maharashtra’s premier tiger reserves.
            </p>
          </div>

          {/* Upcoming Tours Slider */}
          <section id="upcoming-calendar" className="scroll-mt-28">
            <UpcomingToursSlider
              tours={UPCOMING_TOURS}
              theme="light"
              title="All Departures"
              subtitle="Select an expedition to view itinerary details and reserve your slots."
              eyebrow="Confirmed Permits &amp; Native Guides"
              showViewAll={false}
            />
          </section>

          {/* Quick Booking & Inquiries Desk */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/15 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold block mb-1">
                  Direct Safari Desk
                </span>
                <h2 className="font-serif text-2xl font-bold text-forest">
                  Reserve Your Safari
                </h2>
                <p className="text-forest/70 text-xs mt-1 leading-relaxed">
                  Have questions about dates, permits, or custom group circuits? Connect directly with our field naturalists.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://wa.me/${PHONE_CLEAN}?text=${encodeURIComponent('Hi Shutter & Stripes, I would like to enquire about upcoming safaris for 2027.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Desk</span>
                </a>
                <a
                  href={`tel:${PHONE_CLEAN}`}
                  className="p-3 bg-forest hover:bg-forest-light text-sand rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                >
                  <Phone className="w-4 h-4 text-gold" />
                  <span>Call Desk</span>
                </a>
              </div>

              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="w-full flex items-center justify-center gap-2 p-2.5 border border-forest/15 rounded-xl text-xs text-forest/80 hover:bg-sand/30 transition truncate"
              >
                <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="truncate">{EMAIL_ADDRESS}</span>
              </a>
            </div>

            <div className="lg:col-span-7 bg-sand/30 p-5 sm:p-6 rounded-2xl border border-forest/10">
              {submitted ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-forest text-gold flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-forest">Enquiry Received</h3>
                  <p className="text-forest/70 text-xs max-w-sm mx-auto">
                    A naturalist will respond via WhatsApp or email within 4 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', preferredDates: '', message: '' });
                    }}
                    className="px-4 py-1.5 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <form onSubmit={e => handleSubmit(e, 'General Upcoming Safari Enquiry')} className="space-y-3">
                  {error && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => {
                          setForm({ ...form, name: e.target.value });
                          clearFieldError('name');
                        }}
                        placeholder="Your Name *"
                        className={`${inputClass} ${fieldErrors.name ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="hub-name-err" error={fieldErrors.name} />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => {
                          setForm({ ...form, email: e.target.value });
                          clearFieldError('email');
                        }}
                        placeholder="Email Address *"
                        className={`${inputClass} ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="hub-email-err" error={fieldErrors.email} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => {
                          setForm({ ...form, phone: e.target.value });
                          clearFieldError('phone');
                        }}
                        placeholder="Phone / WhatsApp *"
                        className={`${inputClass} ${fieldErrors.phone ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="hub-phone-err" error={fieldErrors.phone} />
                    </div>
                    <div>
                      <select
                        value={form.preferredDates}
                        onChange={e => setForm({ ...form, preferredDates: e.target.value })}
                        className={inputClass}
                      >
                        <option value="February – April 2027">February – April 2027</option>
                        <option value="February 2027">February 2027</option>
                        <option value="March 2027">March 2027</option>
                        <option value="April 2027">April 2027</option>
                        <option value="Flexible / Other">Flexible / Custom dates</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={form.message}
                      onChange={e => {
                        setForm({ ...form, message: e.target.value });
                        clearFieldError('message');
                      }}
                      placeholder="Tour interest, group size, special requirements *"
                      className={`${inputClass} ${fieldErrors.message ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                    />
                    <FormFieldError id="hub-msg-err" error={fieldErrors.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-forest hover:bg-forest-light text-sand font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow"
                  >
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-gold" />
                        <span>Book Now · Submit Safari Enquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. TOUR NOT FOUND
  // =========================================================================
  if (!tour) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-36 pb-20 container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-forest/10 shadow-sm">
          <AlertCircle className="w-12 h-12 text-earth mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-forest mb-2">Tour Not Found</h2>
          <p className="text-forest/70 text-xs mb-6">
            This upcoming tour does not exist or may have been updated.
          </p>
          <Link
            to="/upcoming-tours"
            className="px-6 py-2.5 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider inline-block"
          >
            View All Upcoming Tours
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. COMPACT INDIVIDUAL TOUR DETAIL VIEW: /upcoming-tours/:slug
  // =========================================================================
  return (
    <div className="bg-[#FAF7F2] text-forest min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-forest/60">
          <Link to="/" className="hover:text-gold transition">Home</Link>
          <span>/</span>
          <Link to="/upcoming-tours" className="hover:text-gold transition text-forest">Upcoming Tours</Link>
          <span>/</span>
          <span className="text-gold truncate">{tour.title}</span>
        </div>

        {/* Compact 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Poster + Direct Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-forest border border-forest/15 shadow-xl group">
              <img
                src={tour.poster}
                alt={`${tour.title} poster`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <span className="bg-gold text-forest text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
                  {tour.travelPeriod || 'Upcoming Tour'}
                </span>
                {tour.availability && (
                  <span className="bg-black/70 backdrop-blur-sm text-sand text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/20 self-start">
                    {tour.availability}
                  </span>
                )}
              </div>
              <a
                href={tour.instagram}
                target="_blank"
                rel="noreferrer"
                className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-sand p-2 rounded-full border border-white/20 hover:text-gold transition"
                aria-label="View on Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Direct Quick Desk */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/${PHONE_CLEAN}?text=${encodeURIComponent(`Hi Shutter & Stripes, I would like to book ${tour.title} (${tour.travelPeriod || '2027'})`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`tel:${PHONE_CLEAN}`}
                className="py-2.5 px-3 bg-forest hover:bg-forest-light text-sand rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Phone className="w-3.5 h-3.5 text-gold" />
                <span>Call Desk</span>
              </a>
            </div>

            {/* Compact Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-xl border border-forest/10 text-xs">
              <div>
                <span className="text-[10px] text-forest/50 font-bold block uppercase">Group</span>
                <span className="font-bold text-forest">Max 6 Pax</span>
              </div>
              <div>
                <span className="text-[10px] text-forest/50 font-bold block uppercase">Transfers</span>
                <span className="font-bold text-forest">Nagpur AC</span>
              </div>
              <div>
                <span className="text-[10px] text-forest/50 font-bold block uppercase">Meals</span>
                <span className="font-bold text-forest">All Meals</span>
              </div>
            </div>
          </div>

          {/* Right Column: Tour Details + Booking Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title & Overview */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold block">
                {tour.bookingStatus || 'Advance Safari Bookings Open'}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-forest leading-tight">
                {tour.title}
              </h1>
              <p className="text-gold text-xs font-semibold italic">{tour.tagline}</p>
              {tour.description && (
                <p className="text-forest/70 text-xs sm:text-sm leading-relaxed pt-1">
                  {tour.description}
                </p>
              )}
            </div>

            {/* Highlights Grid */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-forest/10 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 block">
                What We Offer
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tour.highlights.map(h => (
                  <div key={h} className="flex items-center gap-2 text-xs text-forest/80">
                    <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Connected Parks if available */}
              {tour.premiumParks && (
                <div className="pt-3 border-t border-forest/10 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-forest/50 mr-1">Parks:</span>
                  {tour.premiumParks.map(p => (
                    <Link
                      key={p.slug}
                      to={`/destinations/${p.slug}`}
                      className="px-2.5 py-0.5 bg-sand/60 hover:bg-gold hover:text-forest border border-forest/10 rounded-md text-[11px] font-semibold transition"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Founder quote if available */}
              {tour.founderNote && (
                <div className="pt-2 border-t border-forest/10 text-xs text-forest/70 italic">
                  “{tour.founderNote.quote.replace(/[“”"]/g, '')}”
                  <span className="not-italic text-forest/50 ml-1.5 font-semibold text-[10px]">— Sachin Neware (18+ Yrs Native Naturalist)</span>
                </div>
              )}
            </div>

            {/* Compact Booking Form */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-forest/15 shadow-lg space-y-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-forest">
                  Book Your Safari / Enquiry
                </h2>
                <p className="text-forest/60 text-xs">
                  Fill in your preferred dates and group size. A naturalist will confirm available slots.
                </p>
              </div>

              {submitted ? (
                <div className="py-6 text-center space-y-2 bg-sand/30 rounded-xl p-4 border border-forest/10">
                  <CheckCircle2 className="w-8 h-8 text-gold mx-auto" />
                  <h3 className="font-serif text-base font-bold text-forest">Safari Enquiry Received</h3>
                  <p className="text-forest/70 text-xs">
                    We will get back via WhatsApp/phone within 4 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', preferredDates: '', message: '' });
                    }}
                    className="px-4 py-1.5 bg-forest text-sand rounded-lg text-xs font-bold uppercase"
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <form onSubmit={e => handleSubmit(e, tour.title)} className="space-y-3">
                  {error && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => {
                          setForm({ ...form, name: e.target.value });
                          clearFieldError('name');
                        }}
                        placeholder="Your Name *"
                        className={`${inputClass} ${fieldErrors.name ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="t-name-err" error={fieldErrors.name} />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => {
                          setForm({ ...form, email: e.target.value });
                          clearFieldError('email');
                        }}
                        placeholder="Email Address *"
                        className={`${inputClass} ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="t-email-err" error={fieldErrors.email} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => {
                          setForm({ ...form, phone: e.target.value });
                          clearFieldError('phone');
                        }}
                        placeholder="Phone / WhatsApp *"
                        className={`${inputClass} ${fieldErrors.phone ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="t-phone-err" error={fieldErrors.phone} />
                    </div>
                    <div>
                      <select
                        value={form.preferredDates}
                        onChange={e => setForm({ ...form, preferredDates: e.target.value })}
                        className={inputClass}
                      >
                        {tour.dates.map(d => (
                          <option key={d.label} value={d.label}>
                            {d.label} {d.note ? `(${d.note})` : ''}
                          </option>
                        ))}
                        <option value="Flexible / Other">Flexible / Custom dates</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={form.message}
                      onChange={e => {
                        setForm({ ...form, message: e.target.value });
                        clearFieldError('message');
                      }}
                      placeholder="Special requirements, party size, camera gear *"
                      className={`${inputClass} ${fieldErrors.message ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                    />
                    <FormFieldError id="t-msg-err" error={fieldErrors.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gold hover:bg-gold-light text-forest font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md"
                  >
                    {loading ? (
                      <span>Sending Booking Request...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Book Now · Confirm Safari Details</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-forest/60 pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-gold" />
                      <span>Forest Department Permits</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-gold" />
                      <span>Native Local Guides</span>
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingTourPage;
