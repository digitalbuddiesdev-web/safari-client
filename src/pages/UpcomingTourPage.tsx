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
  Users,
  Car,
  Utensils,
  Camera,
  Star,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cmsService } from '../services/api';
import { validateName, validateEmail, validatePhone, validateRequired } from '../lib/validation';
import { FormFieldError } from '../components/common/FormFieldError';
import { UPCOMING_TOURS, getUpcomingTour, UpcomingTour } from '../lib/upcomingTours';
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
    'w-full px-4 py-3.5 bg-sand/40 border border-forest/15 rounded-xl text-xs text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition';

  // =========================================================================
  // 1. HUB VIEW: /upcoming-tours (The Safari Calendar Showcase)
  // =========================================================================
  if (isHubView) {
    const featuredTours = UPCOMING_TOURS.slice(0, 2);

    return (
      <div className="bg-[#FAF7F2] text-forest min-h-screen">
        
        {/* 01. MAGAZINE-STYLE CINEMATIC HERO */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#132218] text-sand overflow-hidden border-b-2 border-gold/40">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-bold uppercase tracking-[0.2em] shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Safari Calendar · 2027 Season Departures</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-sand leading-tight">
              Maharashtra Wildlife Safaris &amp; Themed Escapes
            </h1>

            <p className="text-sand/80 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-sans">
              Handcrafted small-group expeditions across Tadoba, Pench, and Central India's tiger corridors.
              Guided exclusively by native field naturalists with confirmed forest department permits.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#upcoming-calendar"
                className="px-7 py-3.5 bg-gold text-forest rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold-light transition shadow-lg hover:shadow-gold/20 flex items-center gap-2"
              >
                <span>Browse All Departures</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${PHONE_CLEAN}?text=${encodeURIComponent('Hi Shutter & Stripes, I would like to enquire about upcoming safaris for 2027.')}`}
                target="_blank"
                rel="noreferrer"
                className="px-7 py-3.5 rounded-full border border-sand/30 text-sand rounded-full text-xs font-bold uppercase tracking-widest hover:bg-sand/10 transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Safari Desk</span>
              </a>
            </div>
          </div>
        </section>

        {/* 02. FEATURED TOURS SPOTLIGHT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredTours.map((t, idx) => (
              <div
                key={t.slug}
                className="bg-white rounded-[2rem] p-6 sm:p-8 border border-forest/15 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest text-gold text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      <span>{t.bookingStatus || 'Featured Tour'}</span>
                    </span>
                    <span className="text-xs font-bold text-earth bg-sand-warm px-3 py-1 rounded-full border border-forest/10">
                      {t.availability || 'Limited Slots'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center mb-6">
                    <div className="sm:col-span-2 rounded-2xl overflow-hidden aspect-[3/4] bg-forest relative shadow-md">
                      <img
                        src={t.poster}
                        alt={t.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-2.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gold block">
                        {t.travelPeriod}
                      </span>
                      <h2 className="font-serif text-2xl font-bold text-forest leading-snug">
                        {t.title}
                      </h2>
                      <p className="text-gold text-xs font-semibold italic">{t.tagline}</p>
                      <p className="text-forest/70 text-xs leading-relaxed line-clamp-3">
                        {t.description}
                      </p>
                    </div>
                  </div>

                  {/* Highlights pills */}
                  <div className="bg-sand/40 p-4 rounded-2xl border border-forest/10 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 block mb-2">
                      Tour Inclusions
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {t.highlights.slice(0, 4).map(h => (
                        <div key={h} className="flex items-center gap-2 text-xs text-forest/80">
                          <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-forest/10 flex items-center gap-3">
                  <Link
                    to={`/upcoming-tours/${t.slug}`}
                    className="flex-1 text-center py-3.5 bg-forest text-sand font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-forest-light transition flex items-center justify-center gap-2 shadow"
                  >
                    <span>View Tour &amp; Booking Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold" />
                  </Link>
                  <a
                    href={`https://wa.me/${PHONE_CLEAN}?text=${encodeURIComponent(`Hi, I would like to book ${t.title}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 03. UPCOMING TOURS SLIDER */}
        <section id="upcoming-calendar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-28">
          <UpcomingToursSlider
            tours={UPCOMING_TOURS}
            theme="light"
            title="All Upcoming Departures"
            subtitle="Explore our active calendar of core-and-buffer safaris, women-only departures, and private naturalist expeditions."
            eyebrow="The Safari Calendar"
            showViewAll={false}
          />
        </section>

        {/* 04. EXPLORE DESTINATIONS CORRIDORS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="bg-[#132218] text-sand rounded-[2.5rem] p-8 sm:p-12 border-2 border-gold/30 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl mb-8 space-y-2">
              <span className="text-[11px] tracking-widest uppercase text-gold font-bold block">
                Central India Wildlife Corridor
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-sand">
                Explore Maharashtra’s Premier Tiger Reserves
              </h2>
              <p className="text-sand/70 text-xs sm:text-sm leading-relaxed">
                We craft custom multi-park itineraries connecting the best contiguous habitats with verified naturalist guides.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs text-gold font-bold uppercase tracking-wider block mb-3">
                  Our Flagship Safari Parks
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'Tadoba-Andhari', slug: 'tadoba-andhari', note: 'Tiger Heartland' },
                    { name: 'Pench Maharashtra', slug: 'pench-mh', note: 'Kipling Corridor' },
                    { name: 'Umred Karhandla', slug: 'umred-karhandla', note: 'Tigress Sanctuary' },
                    { name: 'Tipeshwar', slug: 'tipeshwar', note: 'Rugged Frontier' },
                  ].map(p => (
                    <Link
                      key={p.slug}
                      to={`/destinations/${p.slug}`}
                      className="p-4 rounded-2xl bg-sand/10 hover:bg-gold hover:text-forest border border-sand/20 transition group"
                    >
                      <span className="text-[10px] text-gold group-hover:text-forest/70 font-bold uppercase tracking-wider block mb-1">
                        {p.note}
                      </span>
                      <span className="text-xs sm:text-sm font-bold block">{p.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-sand/15">
                <span className="text-xs text-sand/60 font-bold uppercase tracking-wider block mb-3">
                  Corridors &amp; Hidden Sanctuaries
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { name: 'Bor Tiger Reserve', slug: 'bor' },
                    { name: 'Navegaon-Nagzira', slug: 'navegaon-nagzira' },
                    { name: 'Melghat Tiger Reserve', slug: 'melghat' },
                    { name: 'Mogarkasa Black Leopard', slug: 'mogarkasa' },
                  ].map(p => (
                    <Link
                      key={p.slug}
                      to={`/destinations/${p.slug}`}
                      className="px-4 py-2 rounded-xl bg-sand/5 hover:bg-sand/15 border border-sand/15 text-xs text-sand/80 transition"
                    >
                      {p.name} &rarr;
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05. WHY SAFARI WITH US (THE 4 PILLARS) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] tracking-widest uppercase text-earth font-bold block">
              The Shutter &amp; Stripes Advantage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Why Safari With Us?
            </h2>
            <p className="text-xs text-forest/70">
              Not city tour agents. We are native field photographers and local naturalists who call these jungles home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'On-Ground Insights',
                desc: 'Real-time wildlife movement, fresh pugmark tracking, and deep forest territory understanding.',
                icon: Compass,
              },
              {
                num: '02',
                title: 'Smarter Zone Choices',
                desc: 'Better-informed safari gate and zone selection based on live field intelligence, not arbitrary quotas.',
                icon: MapPin,
              },
              {
                num: '03',
                title: 'Strong Local Network',
                desc: 'Top-tier tribal forest drivers and naturalists with generations of jungle instinct and tracking acumen.',
                icon: ShieldCheck,
              },
              {
                num: '04',
                title: 'Experienced Safari Hosts',
                desc: 'Hosting passionate photographers and wildlife travelers from India and across the globe with bespoke care.',
                icon: Award,
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.num}
                  className="bg-white p-6 sm:p-7 rounded-[1.75rem] border border-forest/15 shadow-sm hover:shadow-lg transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-sand-warm flex items-center justify-center text-gold border border-forest/10">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-serif font-bold text-gold block">{item.num}</span>
                  <h3 className="font-serif text-lg font-bold text-forest">{item.title}</h3>
                  <p className="text-xs text-forest/70 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 06. MEET FOUNDER SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="bg-white rounded-[2.5rem] border border-forest/15 shadow-xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 rounded-3xl overflow-hidden aspect-square bg-forest relative shadow-md">
              <img
                src="/assets/img/Founders/co-founder.webp"
                alt="Sachin Neware, Founder of Shutter & Stripes"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-xl p-2.5 text-sand border border-white/10 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">Founder &amp; Naturalist</span>
                <span className="text-xs font-serif font-bold">Sachin Neware</span>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/5 border border-forest/15 text-earth text-xs font-bold uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5 text-gold" />
                <span>Local Heritage · Moharli, Tadoba</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest leading-tight">
                “Tadoba is not just a destination. It is my home.”
              </h2>

              <p className="text-forest/80 text-xs sm:text-sm leading-relaxed">
                Born and raised in Moharli right at the gates of Tadoba, Sachin has spent over 18 years reading the signs of Central India’s forests. From animal behavior to seasonal waterhole dynamics, his deep native roots ensure our guests experience the wild authentically and ethically.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-forest/10">
                <div>
                  <span className="font-serif text-2xl font-bold text-forest block">18+</span>
                  <span className="text-[10px] uppercase font-bold text-forest/60 tracking-wider">Years Experience</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-forest block">100%</span>
                  <span className="text-[10px] uppercase font-bold text-forest/60 tracking-wider">Local Talent</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-forest block">1%</span>
                  <span className="text-[10px] uppercase font-bold text-forest/60 tracking-wider">For Conservation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 07. DIRECT BOOKING DESK */}
        <section id="enquiry-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 scroll-mt-28">
          <div className="bg-[#132218] text-sand rounded-[2.5rem] p-8 sm:p-12 border-2 border-gold/30 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[11px] tracking-widest uppercase text-gold font-bold block mb-1">
                  Direct Safari Desk
                </span>
                <h2 className="font-serif text-3xl font-bold text-sand leading-tight">
                  Reserve Your Upcoming Safari
                </h2>
                <p className="text-sand/70 text-xs mt-2 leading-relaxed">
                  Have questions about dates, zone choices, or custom circuits? Speak directly with our native safari desk.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <a
                  href={`tel:${PHONE_CLEAN}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-sand/5 border border-sand/15 hover:border-gold/50 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold text-forest flex items-center justify-center shrink-0 shadow">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sand/60 block">Direct Call</span>
                    <span className="text-xs font-bold text-sand group-hover:text-gold transition">{PHONE_NUMBER}</span>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${PHONE_CLEAN}?text=${encodeURIComponent('Hi Shutter & Stripes, I would like to book an upcoming safari tour.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">WhatsApp Desk</span>
                    <span className="text-xs font-bold text-sand group-hover:text-emerald-300 transition">Chat with our Naturalists</span>
                  </div>
                </a>

                <a
                  href={`mailto:${EMAIL_ADDRESS}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-sand/5 border border-sand/15 hover:border-gold/50 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold text-forest flex items-center justify-center shrink-0 shadow">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sand/60 block">Email Concierge</span>
                    <span className="text-xs font-bold text-sand group-hover:text-gold transition truncate">{EMAIL_ADDRESS}</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white text-forest p-6 sm:p-8 rounded-3xl shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-forest text-gold flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-forest">Safari Enquiry Received</h3>
                  <p className="text-forest/70 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you! A naturalist will respond via WhatsApp or email within 4 business hours with availability and customized package details.
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
                  <div>
                    <h3 className="font-serif text-xl font-bold text-forest mb-1">Send Booking Request</h3>
                    <p className="text-forest/60 text-xs">Fill in your requirements and our team will get back with confirmed options.</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hub-name" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                        Full Name *
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
                        Travel Window
                      </label>
                      <select
                        id="hub-dates"
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
                    <label htmlFor="hub-message" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Destinations &amp; Safari Notes *
                    </label>
                    <textarea
                      id="hub-message"
                      rows={3}
                      value={form.message}
                      onChange={e => {
                        setForm({ ...form, message: e.target.value });
                        clearFieldError('message');
                      }}
                      placeholder="e.g. 4 adults, looking for 4 safaris at Tadoba and Pench, need pickup from Nagpur Airport."
                      className={`${inputClass} ${fieldErrors.message ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                    />
                    <FormFieldError id="hub-message-error" error={fieldErrors.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-forest text-sand font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-forest-light transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending Booking Request...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-gold" />
                        <span>Book Now · Confirm Safari Details</span>
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
            className="px-6 py-3 bg-forest text-sand rounded-full text-xs font-bold uppercase tracking-wider inline-block"
          >
            View All Upcoming Tours
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. INDIVIDUAL TOUR DETAIL VIEW: /upcoming-tours/:slug
  // =========================================================================
  return (
    <div className="bg-[#FAF7F2] text-forest min-h-screen pb-24">
      
      {/* 01. EDITORIAL HEADER BANNER */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 bg-[#132218] text-sand border-b-2 border-gold/40 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-sand/60 mb-6">
            <Link to="/" className="hover:text-gold transition">Home</Link>
            <span>/</span>
            <Link to="/upcoming-tours" className="hover:text-gold transition text-sand/80">Upcoming Tours</Link>
            <span>/</span>
            <span className="text-gold truncate">{tour.title}</span>
          </div>

          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest shadow-sm">
                {tour.bookingStatus || 'Advance Bookings Open'}
              </span>
              {tour.travelPeriod && (
                <span className="px-3 py-1 rounded-full bg-sand/10 border border-sand/20 text-sand/90 text-[10px] font-bold uppercase tracking-wider">
                  Travel Period: {tour.travelPeriod}
                </span>
              )}
              {tour.availability && (
                <span className="px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  ● {tour.availability}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-sand leading-tight">
              {tour.title}
            </h1>

            <p className="text-gold font-serif text-base sm:text-xl italic font-normal">
              {tour.tagline}
            </p>

            {tour.description && (
              <p className="text-sand/80 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
                {tour.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 02. MAIN CONTENT & STICKY BOOKING DESK */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Visual Showcase & Editorial (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Poster Card with Double-Bezel luxury styling */}
            <div className="bg-white p-2.5 sm:p-3 rounded-[2.5rem] border border-forest/15 shadow-xl">
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-forest">
                <img
                  src={tour.poster}
                  alt={`${tour.title} poster`}
                  className="w-full h-full object-cover"
                />
                <a
                  href={tour.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-sand p-2 rounded-full border border-white/20 hover:text-gold transition flex items-center gap-1.5 px-3"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">View on Instagram</span>
                </a>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="bg-white rounded-3xl p-6 border border-forest/15 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <Calendar className="w-5 h-5 text-gold mx-auto" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 block">Season</span>
                <span className="text-xs font-bold text-forest">{tour.travelPeriod || '2027'}</span>
              </div>
              <div className="space-y-1">
                <Users className="w-5 h-5 text-gold mx-auto" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 block">Group Size</span>
                <span className="text-xs font-bold text-forest">Max 6 Pax</span>
              </div>
              <div className="space-y-1">
                <Car className="w-5 h-5 text-gold mx-auto" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 block">Transfers</span>
                <span className="text-xs font-bold text-forest">AC from Nagpur</span>
              </div>
              <div className="space-y-1">
                <Utensils className="w-5 h-5 text-gold mx-auto" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 block">Hospitality</span>
                <span className="text-xs font-bold text-forest">All Meals</span>
              </div>
            </div>

            {/* What We Offer / Included Amenities */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/15 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest text-gold flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-forest">What We Offer</h2>
                  <p className="text-forest/60 text-xs">End-to-end expedition stewardship with native local naturalists.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {tour.highlights.map(h => (
                  <div key={h} className="flex items-start gap-3 p-3 rounded-2xl bg-sand/30 border border-forest/10">
                    <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-forest/90 leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Parks & Corridors Explored */}
            {(tour.premiumParks || tour.alsoExploreParks) && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/15 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-forest text-gold flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-forest">Wildlife Corridors &amp; Parks Covered</h2>
                    <p className="text-forest/60 text-xs">Customized safari allotment across Central India’s premier reserves.</p>
                  </div>
                </div>

                {tour.premiumParks && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold block">
                      Our Premium Parks
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {tour.premiumParks.map(p => (
                        <Link
                          key={p.slug}
                          to={`/destinations/${p.slug}`}
                          className="p-3 bg-sand/40 hover:bg-gold hover:text-forest border border-forest/10 rounded-xl text-center transition group"
                        >
                          <span className="text-xs font-bold block">{p.name}</span>
                          <span className="text-[10px] text-forest/60 group-hover:text-forest/80">Explore Reserve &rarr;</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {tour.alsoExploreParks && (
                  <div className="space-y-2 pt-2 border-t border-forest/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-forest/60 block">
                      Also Explore in the Circuit
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {tour.alsoExploreParks.map(p => (
                        <Link
                          key={p.slug}
                          to={`/destinations/${p.slug}`}
                          className="px-3.5 py-1.5 bg-sand/20 hover:bg-sand/60 border border-forest/10 rounded-lg text-xs text-forest/70 transition"
                        >
                          {p.name} &rarr;
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Why Choose Us (if configured) */}
            {tour.whyChooseUs && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/15 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-forest text-gold flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-forest">Why Safari With Us?</h2>
                    <p className="text-forest/60 text-xs">Native intelligence and trusted forest connections.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {tour.whyChooseUs.map((w, idx) => (
                    <div key={w.title} className="p-4 rounded-2xl bg-sand/30 border border-forest/10 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-bold text-gold">0{idx + 1}.</span>
                        <h3 className="text-xs font-bold text-forest">{w.title}</h3>
                      </div>
                      <p className="text-[11px] text-forest/70 leading-relaxed">{w.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meet Founder Spotlight */}
            {tour.founderNote && (
              <div className="bg-[#132218] text-sand rounded-[2rem] p-6 sm:p-8 border-2 border-gold/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider">
                  <UserCheck className="w-4 h-4" />
                  <span>Meet Our Founder</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-sand">
                  {tour.founderNote.name}
                </h3>
                <p className="text-xs text-sand/70">
                  {tour.founderNote.subtitle} · {tour.founderNote.experience}
                </p>
                <blockquote className="pt-2 text-sm italic font-serif text-gold border-l-2 border-gold/50 pl-3">
                  {tour.founderNote.quote}
                  <span className="block text-[11px] not-italic text-sand/60 mt-1 font-sans">— {tour.founderNote.name}</span>
                </blockquote>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Sticky VIP Safari Booking Desk (5 cols) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* Main Booking Form Card */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-forest/15 shadow-2xl space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                      Direct Reservations
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{tour.availability || 'Limited Slots'}</span>
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-forest leading-snug">
                    Book Your Safari
                  </h3>
                  <p className="text-forest/60 text-xs mt-1">
                    Reserve your seats for <strong>{tour.title}</strong> ({tour.travelPeriod || '2027'}).
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href={`https://wa.me/${PHONE_CLEAN}?text=${encodeURIComponent(`Hi Shutter & Stripes, I would like to book ${tour.title} (${tour.travelPeriod || '2027'})`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Desk</span>
                  </a>
                  <a
                    href={`tel:${PHONE_CLEAN}`}
                    className="py-2.5 px-3 bg-forest hover:bg-forest-light text-sand rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span>Call Desk</span>
                  </a>
                </div>

                {submitted ? (
                  <div className="py-8 text-center space-y-4 bg-sand/30 rounded-2xl p-6 border border-forest/10">
                    <div className="w-14 h-14 rounded-full bg-forest text-gold flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-serif text-xl font-bold text-forest">Enquiry Submitted</h4>
                    <p className="text-forest/70 text-xs leading-relaxed">
                      Thank you for choosing Shutter &amp; Stripes. A naturalist will contact you via WhatsApp/phone within 4 business hours with availability details.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: '', email: '', phone: '', preferredDates: '', message: '' });
                      }}
                      className="px-5 py-2 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest-light transition"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={e => handleSubmit(e, tour.title)} className="space-y-4 pt-2 border-t border-forest/10">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="tour-name" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                        Full Name *
                      </label>
                      <input
                        id="tour-name"
                        type="text"
                        value={form.name}
                        onChange={e => {
                          setForm({ ...form, name: e.target.value });
                          clearFieldError('name');
                        }}
                        placeholder="Dr. Anand Deshmukh"
                        className={`${inputClass} ${fieldErrors.name ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="tour-name-error" error={fieldErrors.name} />
                    </div>

                    <div>
                      <label htmlFor="tour-email" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
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
                        placeholder="anand@example.com"
                        className={`${inputClass} ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="tour-email-error" error={fieldErrors.email} />
                    </div>

                    <div>
                      <label htmlFor="tour-phone" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        id="tour-phone"
                        type="tel"
                        value={form.phone}
                        onChange={e => {
                          setForm({ ...form, phone: e.target.value });
                          clearFieldError('phone');
                        }}
                        placeholder="+91 98765 43210"
                        className={`${inputClass} ${fieldErrors.phone ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="tour-phone-error" error={fieldErrors.phone} />
                    </div>

                    <div>
                      <label htmlFor="tour-dates" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                        Travel Window / Departure
                      </label>
                      <select
                        id="tour-dates"
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

                    <div>
                      <label htmlFor="tour-message" className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                        Special Requirements / Notes *
                      </label>
                      <textarea
                        id="tour-message"
                        rows={3}
                        value={form.message}
                        onChange={e => {
                          setForm({ ...form, message: e.target.value });
                          clearFieldError('message');
                        }}
                        placeholder="Mention party size, dietary needs, preferred zones, or photography interests."
                        className={`${inputClass} ${fieldErrors.message ? 'border-red-500 ring-1 ring-red-400/20' : ''}`}
                      />
                      <FormFieldError id="tour-message-error" error={fieldErrors.message} />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gold hover:bg-gold-light text-forest font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Submitting Booking Request...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Book Now · Confirm Safari Details</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Trust Signals */}
                <div className="pt-4 border-t border-forest/10 space-y-2 text-[11px] text-forest/70">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>Official State Forest Department Permits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>Exclusive Native Guides &amp; Naturalists</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default UpcomingTourPage;
