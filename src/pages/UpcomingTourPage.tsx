import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  Calendar,
  Compass,
  AlertCircle,
  CheckCircle2,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { cmsService } from '../services/api';
import { validateName, validateEmail, validatePhone, validateRequired } from '../lib/validation';
import { FormFieldError } from '../components/common/FormFieldError';
import { getUpcomingTour } from '../lib/upcomingTours';
import InstagramIcon from '../components/InstagramIcon';

export const UpcomingTourPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const tour = getUpcomingTour(slug);

  const [form, setForm] = useState({ name: '', email: '', phone: '', preferredDates: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: null } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        preferredDates: form.preferredDates,
        message: form.message.trim(),
        destination: tour?.title
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            to="/"
            className="px-6 py-2.5 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none focus:ring-2 focus:ring-forest/30';

  return (
    <div className="bg-sand min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-forest/60 mb-6">
          <Link to="/" className="hover:text-gold transition">Home</Link>
          <span>/</span>
          <span className="text-forest">Upcoming Tours</span>
          <span>/</span>
          <span className="text-gold truncate">{tour.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: poster */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-forest/15 shadow-xl bg-forest">
                <div className="relative aspect-[3/4]">
                  <div className="absolute inset-0 bg-gradient-to-br from-forest-muted to-forest-deep" />
                  <img
                    src={tour.poster}
                    alt={`${tour.title} poster`}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="relative w-full h-full object-cover"
                  />
                </div>
                <span className="absolute top-4 left-4 bg-gold text-forest text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow">
                  Upcoming Tour
                </span>
              </div>
              <a
                href={tour.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 border border-forest/30 text-forest rounded-xl font-semibold uppercase tracking-wider text-xs hover:bg-forest hover:text-sand transition"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>View this tour on Instagram</span>
              </a>
            </div>
          </div>

          {/* Right: info + enquiry form */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest tracking-tight">
                {tour.title}
              </h1>
              <p className="text-gold font-semibold italic mt-1">{tour.tagline}</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-forest mb-3 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-gold" />
                  <span>What's Included</span>
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tour.highlights.map(h => (
                    <li key={h} className="flex items-start gap-2 text-xs text-forest/80 leading-snug">
                      <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-forest/10">
                <h2 className="font-serif text-xl font-bold text-forest mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold" />
                  <span>Departure Dates</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tour.dates.map(d => (
                    <span
                      key={d.label}
                      title={d.note}
                      className={`text-xs font-medium rounded-lg px-3 py-1.5 border ${
                        d.note
                          ? 'bg-gold/15 border-gold/40 text-forest'
                          : 'bg-sand border-forest/15 text-forest/80'
                      }`}
                    >
                      {d.label}{d.note ? ' ★' : ''}
                    </span>
                  ))}
                </div>
                {tour.dates.some(d => d.note) && (
                  <p className="text-[11px] text-forest/50 mt-2">★ Themed / special departure — hover for details.</p>
                )}
              </div>
            </div>

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
                    via email or phone within 4 business hours.
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-forest mb-1">General Enquiry</h2>
                    <p className="text-forest/60 text-xs">
                      Have a question about this departure? Send a note and a naturalist will get back within 4 business hours.
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
                      Your Question / Requirements *
                    </label>
                    <textarea
                      id="tour-message"
                      rows={5}
                      value={form.message}
                      onChange={e => {
                        setForm({ ...form, message: e.target.value });
                        clearFieldError('message');
                      }}
                      onBlur={() => {
                        const err = validateRequired(form.message, 'Your Question / Requirements', 5);
                        if (err) setFieldErrors(prev => ({ ...prev, message: err }));
                      }}
                      placeholder={`I'm interested in the ${tour.title} departure. Please share availability, pricing and what's included...`}
                      aria-invalid={!!fieldErrors.message}
                      aria-describedby={fieldErrors.message ? 'tour-msg-error' : undefined}
                      className={`${inputClass} resize-none leading-relaxed ${fieldErrors.message ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                    />
                    <FormFieldError id="tour-msg-error" error={fieldErrors.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-forest/90 transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-sand border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-gold" />
                        <span>Send Enquiry</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-forest/50 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                    <span>Your details are handled exclusively by our naturalists.</span>
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
