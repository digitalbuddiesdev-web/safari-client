import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  Calendar,
  Compass,
  AlertCircle,
  CheckCircle2,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Award,
} from 'lucide-react';
import { cmsService } from '../services/api';
import { validateName, validateEmail, validatePhone, validateRequired } from '../lib/validation';
import { FormFieldError } from '../components/common/FormFieldError';
import { UPCOMING_TOURS, getUpcomingTour, UpcomingTour } from '../lib/upcomingTours';
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
        preferredDates: form.preferredDates || 'February – April 2027',
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
    'w-full px-4 py-3 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none focus:ring-2 focus:ring-forest/30';

  // ----------------------------------------------------
  // 1. HUB VIEW: /upcoming-tours
  // ----------------------------------------------------
  if (isHubView) {
    const featuredMh = getUpcomingTour('maharashtra-wildlife-safaris');
    const featuredTadoba = getUpcomingTour('tadoba-tiger-safari-experience');

    return (
      <div className="bg-sand min-h-screen pt-24 pb-20">
        {/* Banner Section */}
        <section className="bg-forest text-sand py-16 md:py-24 border-b border-gold/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Advance Safari Bookings Open · February – April 2027</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-sand">
              Maharashtra Wildlife Safaris
            </h1>
            <p className="text-sand/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Explore Maharashtra’s renowned wildlife destinations with expert-guided safaris, local forest knowledge, and personalized safari experiences.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#upcoming-calendar"
                className="px-6 py-3 bg-gold text-forest rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gold-light transition shadow-lg"
              >
                View Safari Calendar
              </a>
              <a
                href="#enquiry-form"
                className="px-6 py-3 border border-sand/30 text-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-sand/10 transition"
              >
                Book / Enquire Now
              </a>
            </div>
          </div>
        </section>

        {/* Featured Tours Spotlight */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Spotlight 1: Maharashtra */}
            {featuredMh && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/15 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-forest text-gold text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {featuredMh.bookingStatus || 'Advance Bookings Open'}
                    </span>
                    <span className="text-xs text-earth font-bold">{featuredMh.availability}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-forest mb-2">
                    {featuredMh.title}
                  </h2>
                  <p className="text-gold font-semibold text-xs mb-3 italic">{featuredMh.tagline}</p>
                  <p className="text-forest/70 text-xs leading-relaxed mb-6">
                    {featuredMh.description}
                  </p>
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-forest/60 block">
                      What We Offer
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {featuredMh.highlights.map(h => (
                        <div key={h} className="flex items-center gap-2 text-xs text-forest/80">
                          <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-forest/10 flex items-center gap-3">
                  <Link
                    to={`/upcoming-tours/${featuredMh.slug}`}
                    className="flex-1 text-center py-3 bg-forest text-sand font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-forest-light transition flex items-center justify-center gap-2"
                  >
                    <span>View Tour Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold" />
                  </Link>
                  <a
                    href={`https://wa.me/${PHONE_CLEAN}?text=${encodeURIComponent(`Hi, I would like to book Maharashtra Wildlife Safaris (Feb–Apr 2027)`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Spotlight 2: Tadoba Experience */}
            {featuredTadoba && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/15 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-forest text-gold text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Featured Tour
                    </span>
                    <span className="text-xs text-earth font-bold">{featuredTadoba.availability}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-forest mb-2">
                    {featuredTadoba.title}
                  </h2>
                  <p className="text-gold font-semibold text-xs mb-3 italic">{featuredTadoba.tagline}</p>
                  <p className="text-forest/70 text-xs leading-relaxed mb-6">
                    {featuredTadoba.description}
                  </p>
                  {featuredTadoba.founderNote && (
                    <div className="bg-sand-warm p-4 rounded-2xl border border-forest/10 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-forest mb-1">
                        <Award className="w-4 h-4 text-gold" />
                        <span>{featuredTadoba.founderNote.name}</span>
                        <span className="text-forest/50 font-normal">· {featuredTadoba.founderNote.experience}</span>
                      </div>
                      <p className="text-xs italic text-forest/70">
                        {featuredTadoba.founderNote.quote}
                      </p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-forest/10 flex items-center gap-3">
                  <Link
                    to={`/upcoming-tours/${featuredTadoba.slug}`}
                    className="flex-1 text-center py-3 bg-forest text-sand font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-forest-light transition flex items-center justify-center gap-2"
                  >
                    <span>View Tour Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold" />
                  </Link>
                  <a
                    href={`https://wa.me/${PHONE_CLEAN}?text=${encodeURIComponent(`Hi, I would like to book Tadoba Tiger Safari Experience (Feb–Apr 2027)`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Explore Destinations Strip */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-forest text-sand rounded-3xl p-8 sm:p-10 border border-sand/15 shadow-xl">
            <div className="max-w-3xl mb-6">
              <span className="text-[11px] tracking-widest uppercase text-gold font-bold block mb-1">
                Explore Destinations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sand">
                Maharashtra’s Premier Tiger Reserves & Corridors
              </h2>
              <p className="text-sand/70 text-xs mt-2">
                Customized expeditions across central India's most biodiverse forest belts.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-gold font-bold uppercase tracking-wider block mb-2">
                  Our Premium Parks
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { name: 'Tadoba-Andhari', slug: 'tadoba-andhari' },
                    { name: 'Pench (Maharashtra)', slug: 'pench-mh' },
                    { name: 'Umred Karhandla', slug: 'umred-karhandla' },
                    { name: 'Tipeshwar', slug: 'tipeshwar' },
                  ].map(p => (
                    <Link
                      key={p.slug}
                      to={`/destinations/${p.slug}`}
                      className="px-4 py-2 rounded-xl bg-sand/10 hover:bg-gold hover:text-forest border border-sand/20 text-xs font-semibold transition"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-sand/60 font-bold uppercase tracking-wider block mb-2">
                  Also Explore
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { name: 'Bor Tiger Reserve', slug: 'bor' },
                    { name: 'Navegaon-Nagzira', slug: 'navegaon-nagzira' },
                    { name: 'Melghat Tiger Reserve', slug: 'melghat' },
                  ].map(p => (
                    <Link
                      key={p.slug}
                      to={`/destinations/${p.slug}`}
                      className="px-3.5 py-1.5 rounded-xl bg-sand/5 hover:bg-sand/15 border border-sand/10 text-xs text-sand/80 transition"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Safari With Us? */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[11px] tracking-widest uppercase text-earth font-bold block">
              The Shutter & Stripes Advantage
            </span>
            <h2 className="font-serif text-3xl font-bold text-forest">
              Why Safari With Us?
            </h2>
            <p className="text-xs text-forest/70">
              Native field photographers and local naturalists who call these forests home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'On-Ground Insights',
                desc: 'Current wildlife movement, fresh pugmark tracking, and deep forest territory knowledge.',
              },
              {
                num: '02',
                title: 'Smarter Zone Choices',
                desc: 'Better-informed safari gate and zone selection based on live field intelligence rather than guesswork.',
              },
              {
                num: '03',
                title: 'Strong Local Network',
                desc: 'Experienced local forest drivers and tribal naturalists with generational tracking acumen.',
              },
              {
                num: '04',
                title: 'Experienced Safari Hosts',
                desc: 'Hosting passionate photographers and wildlife travelers from India and across the globe.',
              },
            ].map(item => (
              <div
                key={item.num}
                className="bg-white p-6 rounded-2xl border border-forest/15 shadow-sm space-y-3"
              >
                <span className="text-2xl font-serif font-bold text-gold">{item.num}</span>
                <h3 className="font-serif text-lg font-bold text-forest">{item.title}</h3>
                <p className="text-xs text-forest/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* All Upcoming Tours Grid */}
        <section id="upcoming-calendar" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-28">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] tracking-widest uppercase text-earth font-bold block">
              The Safari Calendar
            </span>
            <h2 className="font-serif text-3xl font-bold text-forest">
              All Upcoming Departures
            </h2>
            <p className="text-xs text-forest/70 mt-1">
              Select an expedition to review itineraries, inclusions, and reserve your seat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {UPCOMING_TOURS.map(t => (
              <article
                key={t.slug}
                className="bg-forest rounded-2xl overflow-hidden border border-sand/15 shadow-lg flex flex-col hover:border-gold/50 transition-colors"
              >
                <div className="relative aspect-[3/4] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-forest-muted to-forest-deep" />
                  <img
                    src={t.poster}
                    alt={`${t.title} poster`}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 bg-gold text-forest text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
                    {t.travelPeriod || 'Upcoming Tour'}
                  </span>
                  <a
                    href={t.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-sand p-1.5 rounded-full border border-white/20 hover:text-gold transition"
                    aria-label="View on Instagram"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-sand mb-1">{t.title}</h3>
                    <p className="text-gold text-xs italic font-medium">{t.tagline}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t.dates.slice(0, 2).map(d => (
                        <span key={d.label} className="text-[11px] bg-sand/10 text-sand/80 px-2.5 py-1 rounded-md">
                          {d.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sand/10 flex items-center gap-2">
                    <Link
                      to={`/upcoming-tours/${t.slug}`}
                      className="flex-1 text-center py-2.5 px-3 bg-gold text-forest font-bold rounded text-xs hover:bg-gold-light transition flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Booking and Contact Section */}
        <section id="enquiry-form" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 scroll-mt-28">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-forest/15 shadow-xl grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <span className="text-[11px] tracking-widest uppercase text-earth font-bold block mb-1">
                  Direct Inquiries
                </span>
                <h2 className="font-serif text-3xl font-bold text-forest">
                  Book Your Upcoming Safari
                </h2>
                <p className="text-forest/70 text-xs mt-2 leading-relaxed">
                  Have questions about dates, permits, or custom circuits? Connect directly with our team for priority assistance.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <a
                  href={`tel:${PHONE_CLEAN}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-sand/30 border border-forest/10 hover:border-gold/50 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-forest text-gold flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 block">Call / WhatsApp</span>
                    <span className="text-xs font-bold text-forest group-hover:text-gold transition">{PHONE_NUMBER}</span>
                  </div>
                </a>

                <a
                  href={`mailto:${EMAIL_ADDRESS}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-sand/30 border border-forest/10 hover:border-gold/50 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-forest text-gold flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 block">Email Bookings</span>
                    <span className="text-xs font-bold text-forest group-hover:text-gold transition truncate">{EMAIL_ADDRESS}</span>
                  </div>
                </a>
              </div>

              <div className="p-4 bg-sand-warm rounded-2xl border border-forest/10 space-y-1 text-xs text-forest/80">
                <span className="font-bold text-forest block">Notice on Advance Bookings:</span>
                <p className="text-[11px] text-forest/70 leading-relaxed">
                  The posters specify the booking window as February–April 2027. Zone allotment and gypsy bookings are customized per guest upon confirmation.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-forest text-gold flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-forest">Enquiry Received</h3>
                  <p className="text-forest/70 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you for your interest! A naturalist will respond via WhatsApp or email within 4 business hours with availability and custom package options.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', preferredDates: '', message: '' });
                    }}
                    className="px-6 py-2.5 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={e => handleSubmit(e, 'General Upcoming Safari Enquiry')} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hub-name" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        id="hub-name"
                        type="text"
                        value={form.name}
                        onChange={e => {
                          setForm({ ...form, name: e.target.value });
                          clearFieldError('name');
                        }}
                        placeholder="Dr. Anand Deshmukh"
                        className={`${inputClass} ${fieldErrors.name ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="hub-name-error" error={fieldErrors.name} />
                    </div>

                    <div>
                      <label htmlFor="hub-email" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                        Email Address *
                      </label>
                      <input
                        id="hub-email"
                        type="email"
                        value={form.email}
                        onChange={e => {
                          setForm({ ...form, email: e.target.value });
                          clearFieldError('email');
                        }}
                        placeholder="anand@example.com"
                        className={`${inputClass} ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="hub-email-error" error={fieldErrors.email} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hub-phone" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        id="hub-phone"
                        type="tel"
                        value={form.phone}
                        onChange={e => {
                          setForm({ ...form, phone: e.target.value });
                          clearFieldError('phone');
                        }}
                        placeholder="+91 98765 43210"
                        className={`${inputClass} ${fieldErrors.phone ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="hub-phone-error" error={fieldErrors.phone} />
                    </div>

                    <div>
                      <label htmlFor="hub-dates" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                        Preferred Travel Period
                      </label>
                      <select
                        id="hub-dates"
                        value={form.preferredDates}
                        onChange={e => setForm({ ...form, preferredDates: e.target.value })}
                        className={inputClass}
                      >
                        <option value="February – April 2027">February – April 2027 (Advance Booking)</option>
                        <option value="February 2027">February 2027</option>
                        <option value="March 2027">March 2027</option>
                        <option value="April 2027">April 2027</option>
                        <option value="Flexible / Other">Flexible / Custom dates</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="hub-message" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Destinations & Special Requirements *
                    </label>
                    <textarea
                      id="hub-message"
                      rows={4}
                      value={form.message}
                      onChange={e => {
                        setForm({ ...form, message: e.target.value });
                        clearFieldError('message');
                      }}
                      placeholder="e.g., Interested in 3 safaris at Tadoba and Pench, 4 adults, need AC transfers from Nagpur."
                      className={`${inputClass} ${fieldErrors.message ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                    />
                    <FormFieldError id="hub-message-error" error={fieldErrors.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-forest text-sand font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-forest-light transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                  >
                    {loading ? (
                      <span>Sending Booking Enquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-gold" />
                        <span>Book Now · Submit Safari Enquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. TOUR NOT FOUND
  // ----------------------------------------------------
  if (!tour) {
    return (
      <div className="bg-sand min-h-screen pt-36 pb-20 container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-forest/10 shadow-sm">
          <AlertCircle className="w-12 h-12 text-earth mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-forest mb-2">Tour Not Found</h2>
          <p className="text-forest/70 text-sm mb-6">
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

  // ----------------------------------------------------
  // 3. INDIVIDUAL TOUR VIEW: /upcoming-tours/:slug
  // ----------------------------------------------------
  return (
    <div className="bg-sand min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-forest/60 mb-6">
          <Link to="/" className="hover:text-gold transition">Home</Link>
          <span>/</span>
          <Link to="/upcoming-tours" className="hover:text-gold transition text-forest">Upcoming Tours</Link>
          <span>/</span>
          <span className="text-gold truncate">{tour.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: poster + direct contact */}
          <div className="lg:col-span-2 space-y-5">
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-forest/15 shadow-xl bg-forest">
                <div className="relative aspect-[3/4]">
                  <div className="absolute inset-0 bg-gradient-to-br from-forest-muted to-forest-deep" />
                  <img
                    src={tour.poster}
                    alt={`${tour.title} poster`}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                    className="relative w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <span className="bg-gold text-forest text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow">
                    {tour.bookingStatus || 'Upcoming Tour'}
                  </span>
                  {tour.availability && (
                    <span className="bg-forest/90 backdrop-blur-sm text-sand text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-white/20">
                      {tour.availability}
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Booking Actions */}
              <div className="bg-white p-4 rounded-2xl border border-forest/15 shadow-sm space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 block text-center">
                  Direct Safari Desk
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${PHONE_CLEAN}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-forest text-sand rounded-xl text-xs font-bold hover:bg-forest-light transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span>Call Desk</span>
                  </a>
                  <a
                    href={`https://wa.me/${PHONE_CLEAN}?text=${encodeURIComponent(`Hi, I would like to enquire about ${tour.title}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <a
                  href={`mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(`Enquiry: ${tour.title}`)}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-forest/20 text-forest rounded-xl text-xs font-medium hover:bg-sand/40 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-gold" />
                  <span className="truncate">{EMAIL_ADDRESS}</span>
                </a>
                <a
                  href={tour.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 text-forest/70 hover:text-gold text-xs transition"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>View Tour on Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: info + destination details + enquiry form */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              {tour.travelPeriod && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/5 border border-forest/15 text-earth text-xs font-bold uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  <span>Travel Period: {tour.travelPeriod}</span>
                </div>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest tracking-tight">
                {tour.title}
              </h1>
              <p className="text-gold font-semibold text-sm italic mt-1">{tour.tagline}</p>
              {tour.subtitle && (
                <p className="text-forest/60 text-xs font-medium mt-1">{tour.subtitle}</p>
              )}
              {tour.description && (
                <p className="text-forest/80 text-xs sm:text-sm mt-3 leading-relaxed">
                  {tour.description}
                </p>
              )}
            </div>

            {/* What We Offer / Highlights */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-forest mb-3 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-gold" />
                  <span>What We Offer</span>
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tour.highlights.map(h => (
                    <li key={h} className="flex items-start gap-2.5 text-xs text-forest/80 leading-snug">
                      <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span className="font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Departure Dates / Window */}
              <div className="pt-4 border-t border-forest/10">
                <h2 className="font-serif text-xl font-bold text-forest mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold" />
                  <span>Booking & Travel Period</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tour.dates.map(d => (
                    <span
                      key={d.label}
                      title={d.note}
                      className="text-xs font-medium rounded-lg px-3.5 py-2 border bg-gold/15 border-gold/40 text-forest"
                    >
                      {d.label}{d.note ? ' ★' : ''}
                    </span>
                  ))}
                </div>
                {tour.dates.some(d => d.note) && (
                  <p className="text-[11px] text-forest/60 mt-2 italic">
                    ★ {tour.dates.find(d => d.note)?.note}
                  </p>
                )}
                <p className="text-[11px] text-forest/60 mt-1.5">
                  Flexible group and private safari slots are customized within the booking window.
                </p>
              </div>

              {/* Premium Parks & Also Explore (if available) */}
              {(tour.premiumParks || tour.alsoExploreParks) && (
                <div className="pt-4 border-t border-forest/10 space-y-3">
                  <h3 className="font-serif text-lg font-bold text-forest flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold" />
                    <span>Parks & Wildlife Corridors</span>
                  </h3>
                  {tour.premiumParks && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest/60 block mb-1.5">
                        Our Premium Parks
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tour.premiumParks.map(p => (
                          <Link
                            key={p.slug}
                            to={`/destinations/${p.slug}`}
                            className="px-3 py-1.5 bg-sand/60 hover:bg-gold hover:text-forest border border-forest/10 rounded-lg text-xs font-semibold text-forest transition"
                          >
                            {p.name} &rarr;
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {tour.alsoExploreParks && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest/50 block mb-1.5">
                        Also Explore
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tour.alsoExploreParks.map(p => (
                          <Link
                            key={p.slug}
                            to={`/destinations/${p.slug}`}
                            className="px-3 py-1 bg-sand/30 hover:bg-sand/80 border border-forest/10 rounded-lg text-xs text-forest/70 transition"
                          >
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Why Safari With Us (Customized items) */}
            {tour.whyChooseUs && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-forest/15 shadow-sm space-y-4">
                <h2 className="font-serif text-xl font-bold text-forest flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold" />
                  <span>Why Safari With Us?</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tour.whyChooseUs.map((item, idx) => (
                    <div key={item.title} className="p-4 rounded-2xl bg-sand/30 border border-forest/10 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gold font-serif">0{idx + 1}.</span>
                        <h3 className="text-xs font-bold text-forest">{item.title}</h3>
                      </div>
                      <p className="text-[11px] text-forest/70 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meet Our Founder (if available) */}
            {tour.founderNote && (
              <div className="bg-forest text-sand p-6 sm:p-8 rounded-3xl border border-sand/15 shadow-xl space-y-3">
                <div className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider">
                  <UserCheck className="w-4 h-4" />
                  <span>Meet Our Founder</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-sand">
                  {tour.founderNote.name}
                </h3>
                <p className="text-xs text-sand/70 font-medium">
                  {tour.founderNote.subtitle} · {tour.founderNote.experience}
                </p>
                <blockquote className="pt-2 text-sm italic font-serif text-gold border-l-2 border-gold/40 pl-3">
                  {tour.founderNote.quote}
                  <span className="block text-[11px] not-italic text-sand/60 mt-1 font-sans">— {tour.founderNote.name}</span>
                </blockquote>
              </div>
            )}

            {/* General enquiry form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-forest/15 shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-forest text-gold flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-forest">Enquiry Received</h3>
                  <p className="text-forest/70 text-sm max-w-md mx-auto leading-relaxed">
                    Thanks for your interest in <strong>{tour.title}</strong>. A naturalist will respond
                    via email or WhatsApp within 4 business hours with availability and customized pricing.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', preferredDates: '', message: '' });
                    }}
                    className="px-6 py-2.5 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={e => handleSubmit(e, tour.title)} className="space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-forest mb-1">
                      Book Now · Safari Enquiry
                    </h2>
                    <p className="text-forest/60 text-xs">
                      Reserve your slots for <strong>{tour.title}</strong> ({tour.travelPeriod || '2027'}).
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tour-name" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        id="tour-name"
                        type="text"
                        value={form.name}
                        onChange={e => {
                          setForm({ ...form, name: e.target.value });
                          clearFieldError('name');
                        }}
                        onBlur={() => {
                          const err = validateName(form.name, 'Your name');
                          if (err) setFieldErrors(prev => ({ ...prev, name: err }));
                        }}
                        placeholder="Dr. Anand Deshmukh"
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? 'tour-name-error' : undefined}
                        className={`${inputClass} ${fieldErrors.name ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="tour-name-error" error={fieldErrors.name} />
                    </div>
                    <div>
                      <label htmlFor="tour-email" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="tour-email"
                        type="email"
                        value={form.email}
                        onChange={e => {
                          setForm({ ...form, email: e.target.value });
                          clearFieldError('email');
                        }}
                        onBlur={() => {
                          const err = validateEmail(form.email);
                          if (err) setFieldErrors(prev => ({ ...prev, email: err }));
                        }}
                        placeholder="anand@example.com"
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? 'tour-email-error' : undefined}
                        className={`${inputClass} ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="tour-email-error" error={fieldErrors.email} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tour-phone" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        id="tour-phone"
                        type="tel"
                        value={form.phone}
                        onChange={e => {
                          setForm({ ...form, phone: e.target.value });
                          clearFieldError('phone');
                        }}
                        onBlur={() => {
                          const err = validatePhone(form.phone);
                          if (err) setFieldErrors(prev => ({ ...prev, phone: err }));
                        }}
                        placeholder="+91 98765 43210"
                        aria-invalid={!!fieldErrors.phone}
                        aria-describedby={fieldErrors.phone ? 'tour-phone-error' : undefined}
                        className={`${inputClass} ${fieldErrors.phone ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="tour-phone-error" error={fieldErrors.phone} />
                    </div>
                    <div>
                      <label htmlFor="tour-dates" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                        Preferred Departure Date (Optional)
                      </label>
                      <select
                        id="tour-dates"
                        value={form.preferredDates}
                        onChange={e => setForm({ ...form, preferredDates: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Flexible / Not sure yet</option>
                        {tour.dates.map(d => (
                          <option key={d.label} value={d.label}>
                            {d.label}{d.note ? ' ★' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tour-message" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Special Requirements / Safari Notes *
                    </label>
                    <textarea
                      id="tour-message"
                      rows={4}
                      value={form.message}
                      onChange={e => {
                        setForm({ ...form, message: e.target.value });
                        clearFieldError('message');
                      }}
                      onBlur={() => {
                        const err = validateRequired(form.message, 'Your Question / Requirements', 5);
                        if (err) setFieldErrors(prev => ({ ...prev, message: err }));
                      }}
                      placeholder="Mention your party size, preferred safari zones, camera gear, or any special requirements."
                      aria-invalid={!!fieldErrors.message}
                      aria-describedby={fieldErrors.message ? 'tour-message-error' : undefined}
                      className={`${inputClass} ${fieldErrors.message ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                    />
                    <FormFieldError id="tour-message-error" error={fieldErrors.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gold text-forest font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gold-light transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                  >
                    {loading ? (
                      <span>Submitting Safari Booking...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Book Now · Confirm Safari Details</span>
                      </>
                    )}
                  </button>
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
