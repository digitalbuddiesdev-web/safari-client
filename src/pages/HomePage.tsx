import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, MapPin, BookOpen, 
  Users, Award, HeartHandshake, Eye, Sparkles, Calendar,
  X, Send, CheckCircle2, AlertCircle,
  Play, Star, ExternalLink, Film
} from 'lucide-react';
import { Destination, GalleryItem } from '../types';
import { destinationService, cmsService } from '../services/api';
import { SafariCalendar } from '../components/SafariCalendar';
import { stateCode, YEARS_OF_EXPERIENCE } from '../lib/site';
import { UPCOMING_TOURS } from '../lib/upcomingTours';
import { UpcomingToursSlider } from '../components/upcoming/UpcomingToursSlider';
import InstagramIcon from '../components/InstagramIcon';
import { Carousel } from '../components/Carousel';
import { validateName, validateEmail, validatePhone, validateGuests } from '../lib/validation';
import { FormFieldError } from '../components/common/FormFieldError';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { ClientStoriesSection } from '../components/home/ClientStoriesSection';
import { 
  ClientStoriesData, 
  DEFAULT_CLIENT_STORIES_DATA, 
  normalizeClientStoriesData 
} from '../lib/clientStories';

// On mobile the card sections loop continuously; at sm the track dissolves
// (display:contents) so the same cards flow into the grid laid out by the
// parent. The second copy is hidden at sm so the grid isn't doubled.
const Marquee: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="marquee-track flex w-max sm:contents">
    {children}
    <div className="contents sm:hidden" aria-hidden="true">{children}</div>
  </div>
);

const fmtQuoteDate = (iso: string) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const HomePage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeGallery, setActiveGallery] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  // Client stories are CMS-managed (key `client_stories`); section hides itself while empty.
  const [clientStories, setClientStories] = useState<ClientStoriesData>(DEFAULT_CLIENT_STORIES_DATA);

  // Hero Slider State
  const HERO_SLIDES_DESKTOP = [
    '/assets/img/Hero/hero-1.webp',
    '/assets/img/Hero/hero-2.webp',
    '/assets/img/Hero/hero-3.webp',
    '/assets/img/Hero/hero-4.webp',
    '/assets/img/Hero/hero-5.webp',
    '/assets/img/Hero/hero-7.webp',
    '/assets/img/Hero/hero-8.webp',
    '/assets/img/Hero/hero-9.webp',
  ];

  // Mobile curated collection: only perfectly-centered, uncropped subjects that look stunning in portrait full-screen
  const HERO_SLIDES_MOBILE = [
    '/assets/img/Hero/hero-1.webp',
    '/assets/img/Hero/hero-6.webp',
    '/assets/img/Hero/hero-8.webp',
    '/assets/img/Hero/hero-9.webp',
    '/assets/img/Hero/hero-10.webp',
  ];

  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroSlides = isMobile ? HERO_SLIDES_MOBILE : HERO_SLIDES_DESKTOP;
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    setHeroIndex(0);
  }, [isMobile]);

  useEffect(() => {
    const id = window.setInterval(
      () => setHeroIndex(i => (i + 1) % heroSlides.length),
      4000
    );
    return () => window.clearInterval(id);
  }, [heroSlides.length]);

  // Prefetch subsequent hero slides for instant transition caching
  useEffect(() => {
    heroSlides.slice(1).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [heroSlides]);

  useEffect(() => {
    Promise.all([
      destinationService.getAll(),
      cmsService.getGallery({ isFeatured: true })
    ]).then(([dests, gal]) => {
      setDestinations(dests);
      setGallery(gal.slice(0, 6));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    cmsService.getContent('client_stories')
      .then((data) => setClientStories(data ? normalizeClientStoriesData(data) : DEFAULT_CLIENT_STORIES_DATA))
      .catch(() => {});
  }, []);

  // Package finder state
  const [searchState, setSearchState] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchGuests, setSearchGuests] = useState('2');
  const [calendarFor, setCalendarFor] = useState<'start' | 'end' | null>(null);

  // "Get Quote" — direct enquiry: the finder feeds a contact modal, whose submit
  // posts to the existing inquiry API rather than routing to the booking wizard.
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteFieldErrors, setQuoteFieldErrors] = useState<Record<string, string | null>>({});
  const [quoteContact, setQuoteContact] = useState({ name: '', email: '', phone: '' });

  const quoteDestinationName =
    destinations.find(d => d.slug === searchDestination)?.name || '';
  const quoteDates = [fmtQuoteDate(searchDate), fmtQuoteDate(searchEndDate)].filter(Boolean).join(' – ');
  const quoteGuests = searchGuests === '6' ? 'Private Safari Jeep (6 guests)' : `${searchGuests} guest${searchGuests === '1' ? '' : 's'}`;

  const clearQuoteFieldError = (field: string) => {
    setQuoteFieldErrors(prev => (prev[field] ? { ...prev, [field]: null } : prev));
  };

  const openQuote = () => {
    setQuoteSent(false);
    setQuoteError(null);
    setQuoteFieldErrors({});
    setQuoteOpen(true);
  };
  const closeQuote = () => setQuoteOpen(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openQuote();
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone } = quoteContact;

    const errors: Record<string, string | null> = {};
    const nameErr = validateName(name, 'Full name');
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(phone);
    if (phoneErr) errors.phone = phoneErr;

    const guestsCount = Number(searchGuests) || 2;
    const guestsErr = validateGuests(guestsCount);
    if (guestsErr) errors.guests = guestsErr;

    if (Object.keys(errors).length > 0) {
      setQuoteFieldErrors(errors);
      setQuoteError('Please review the highlighted fields before submitting.');
      return;
    }

    setQuoteSubmitting(true);
    setQuoteError(null);
    setQuoteFieldErrors({});
    try {
      await cmsService.submitInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        destination: quoteDestinationName || 'Any / Unsure',
        preferredDates: quoteDates,
        guests: guestsCount,
        message: `Quote request — Reserve: ${quoteDestinationName || 'Any / Unsure'}; Dates: ${quoteDates || 'flexible'}; Guests: ${quoteGuests}.`,
      });
      setQuoteSent(true);
    } catch (err: any) {
      setQuoteError(err?.response?.data?.message || 'Could not send your request. Please try again.');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  

  // Hand-picked spotlight order + marketing copy for the homepage rail.
  const featuredDestinations = [
    { slug: 'tadoba-andhari', name: 'Tadoba-Andhari', tagline: 'The Sighting Capital' },
    { slug: 'pench-mh', name: 'Pench', tagline: 'The Kipling Corridor' },
    { slug: 'kanha', name: 'Kanha', tagline: 'The Sal Forest Kingdom' },
    { slug: 'bandhavgarh', name: 'Bandhavgarh', tagline: 'The Fort of Tigers' },
  ]
    .map(f => {
      const d = destinations.find(x => x.slug === f.slug);
      return d ? { ...d, name: f.name, tagline: f.tagline } : null;
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  return (
    <div className="bg-sand text-forest min-h-screen">
      
      {/* 01. HERO IMAGE SLIDER */}
      <section className="relative flex items-end sm:items-center justify-center overflow-hidden w-full h-[100vh] h-[100dvh] max-h-[100vh] max-h-[100dvh] sm:h-auto sm:max-h-none sm:min-h-[520px] sm:aspect-video">
        {/* Full-bleed crossfade slider, 4s interval */}
        <div className="absolute inset-0 z-0">
          {heroSlides.map((src, i) => (
            <img
              key={src}
              src={src}
              alt="Central India Tiger Reserve Safari"
              aria-hidden={i !== (heroIndex % heroSlides.length)}
              fetchPriority={i === 0 ? "high" : "low"}
              loading={i === 0 ? "eager" : "lazy"}
              decoding={i === 0 ? "sync" : "async"}
              className={`absolute inset-0 w-full h-full object-cover brightness-[1.02] contrast-[1.03] transition-opacity duration-[1200ms] ease-in-out ${
                i === (heroIndex % heroSlides.length) ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {/* Left-side subtle scrim for text legibility, leaving the rest of the frame completely clear and vibrant */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent w-full lg:w-3/5 pointer-events-none" />
          
          {/* Subtle top header shade */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/50 via-black/15 to-transparent pointer-events-none" />

          {/* Seamless bottom fade into page body */}
          <div className="absolute bottom-0 inset-x-0 h-10 sm:h-28 bg-gradient-to-t from-sand/40 sm:from-sand via-sand/10 sm:via-sand/25 to-transparent pointer-events-none" />
        </div>

        {/* Slide indicators (Bottom Right) */}
        <div className="absolute bottom-16 right-6 sm:right-10 z-20 hidden sm:flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-full border border-sand/30 shadow-xl">
          {heroSlides.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setHeroIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === (heroIndex % heroSlides.length) ? 'w-6 bg-gold' : 'w-1.5 bg-sand/50 hover:bg-sand/80'
              }`}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === (heroIndex % heroSlides.length)}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 sm:py-24 text-sand w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-gold/40 shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">What We Do</span>
              <span aria-hidden className="w-px h-3.5 bg-sand/40" />
              <span className="text-[11px] font-semibold text-sand">Complete Safari Experiences, Crafted for You.</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              GUIDED BY LOCALS. <br />
              <span className="italic font-normal text-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">INSPIRED BY NATURE.</span>
            </h1>

            <p className="text-xs sm:text-base text-sand font-normal leading-relaxed max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Step into the wild with people who know it from the inside. Immersive, expert-led wildlife journeys across the forests of Maharashtra and Madhya Pradesh.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                to="/booking" 
                className="px-6 py-3.5 bg-gold text-forest font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all shadow-xl flex items-center gap-2"
              >
                <span>Customize Your Journey</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/destinations" 
                className="px-6 py-3.5 bg-black/40 backdrop-blur-md border border-sand/40 text-sand font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-black/60 transition-colors flex items-center gap-2 shadow-lg"
              >
                <MapPin className="w-4 h-4 text-gold" />
                <span>Explore Reserves</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 04. FEATURED DESTINATIONS */}
      <section className="py-16 bg-sand-warm border-y border-forest/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] tracking-widest-safari uppercase text-earth font-bold block">
                Safaris Spotlight 
              </span>
              <h2 className="font-serif text-3xl font-bold text-forest mt-1">
                Premier Tiger Reserves
              </h2>
            </div>
            <Link 
              to="/destinations" 
              className="text-xs font-bold uppercase tracking-wider text-earth hover:text-forest flex items-center gap-1.5"
            >
              <span>View All Reserves</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Carousel
            label="Premier tiger reserves"
            trackClassName="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible sm:snap-none"
          >
            {featuredDestinations.map(d => (
              <div
                key={d.slug}
                className="snap-start shrink-0 w-[85%] sm:w-auto bg-sand rounded-xl overflow-hidden border border-forest/20 shadow-md group flex flex-col justify-between hover:shadow-xl transition-all"
              >
                <Link to={`/destinations/${d.slug}`} className="block">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={d.heroImage} 
                      alt={d.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-sand text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/20 shadow">
                      {d.state}
                    </div>
                  </div>
                  <div className="p-5 pb-3 space-y-2">
                    <span className="text-[10px] text-earth uppercase font-semibold tracking-wider block">
                      {d.tagline}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-forest leading-snug line-clamp-1">
                      {d.name}
                    </h3>
                  </div>
                </Link>

                <div className="p-5 pt-0 mt-3 border-t border-forest/10 flex gap-2">
                  <Link
                    to={`/destinations/${d.slug}`}
                    className="flex-1 py-2.5 text-center border border-forest/30 text-forest rounded-lg text-[11px] uppercase font-bold tracking-wider hover:bg-forest hover:text-sand transition"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/booking?destination=${d.slug}`}
                    className="flex-1 py-2.5 text-center bg-forest text-sand rounded-lg text-[11px] uppercase font-bold tracking-wider hover:bg-forest/90 transition shadow"
                  >
                    Book Safari
                  </Link>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* 04c. UPCOMING TOURS SLIDER */}
      <section className="py-20 bg-forest-deep text-sand border-y border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <UpcomingToursSlider
            tours={UPCOMING_TOURS}
            theme="dark"
            title="Upcoming Tours"
            subtitle="Fixed-date group departures and themed escapes — small groups, confirmed permits, and every seat booked with the forest department in advance."
            eyebrow="The Safari Calendar · Limited Seats"
            showViewAll={true}
          />
        </div>
      </section>

      {/* 04b. WHY TRAVEL WITH US */}
      <section className="py-20 bg-sand-warm border-y border-forest/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] tracking-widest-safari uppercase text-earth font-bold block">
              Why Travel With Us
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              What Sets Us Apart
            </h2>
            <p className="text-xs text-forest/70 leading-relaxed">
              The jungle is a classroom, not a checklist. Everything we do is built on local mastery, respect, and ecological familiarity.
            </p>
          </div>

          <Carousel
            label="What sets us apart"
            trackClassName="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible sm:snap-none"
          >
            {[
              { icon: <Award className="w-5 h-5" />, title: `${YEARS_OF_EXPERIENCE}+ Years of Field Expertise`, desc: 'Son of the Soil. Our founder began tracking in these forests as a boy — 15+ years of raw field experience, not textbook knowledge.' },
              { icon: <BookOpen className="w-5 h-5" />, title: 'The Jungle is a Classroom', desc: 'Naturalist-led safaris where every drive teaches ecology, behavior and conservation. We slow down so the forest can speak.' },
              { icon: <Users className="w-5 h-5" />, title: 'Unmatched Local Elite Talent', desc: 'Handpicked local guides and naturalists — the elite talent of each reserve, vetted for instinct, ethics and storytelling.' },
              { icon: <HeartHandshake className="w-5 h-5" />, title: 'The 1% Community Pledge', desc: '1% of all bookings is contributed to the welfare of the local community and nature preservation, transparently.' },
              { icon: <Eye className="w-5 h-5" />, title: 'Consent-Driven Photography', desc: 'Wildlife first, shutter second. We photograph on the animal’s terms — no baiting, no harassment, no cornering.' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'Custom-Designed Experiences', desc: 'Every journey is co-designed around your pace, interests and comfort — from first-time families to serious photographers.' },
            ].map(usp => (
              <div key={usp.title} className="shrink-0 w-[85%] snap-start sm:w-auto bg-sand rounded-2xl border border-forest/15 p-6 shadow-sm hover:shadow-xl transition-all space-y-3">
                <div className="w-11 h-11 rounded-xl bg-forest text-gold flex items-center justify-center shrink-0">
                  {usp.icon}
                </div>
                <h3 className="font-serif text-base font-bold text-forest">{usp.title}</h3>
                <p className="text-xs text-forest/80 leading-relaxed">{usp.desc}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* 05. HOW IT WORKS */}
      <section className="py-20 bg-forest text-sand border-y border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-[11px] tracking-widest-safari uppercase text-gold font-bold block">
              The Journey to the Forest
            </span>
            <h2 className="font-serif text-3xl font-bold text-sand">
              How It Works
            </h2>
            <p className="text-xs text-sand/70">
              A seamless, transparent pathway from discovery to the morning forest briefing.
            </p>
          </div>

          <Carousel
            label="How it works"
            trackClassName="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-6 sm:overflow-visible sm:snap-none"
          >
            {[
              { num: '01', title: 'DISCOVER', desc: 'Explore reserves across MP and Maharashtra, examining seasonal tiger activity and zone terrain.' },
              { num: '02', title: 'CHOOSE', desc: 'Compare morning vs. afternoon slots, private photography setups, and experienced local naturalists.' },
              { num: '03', title: 'PLAN', desc: 'Select preferred dates, verify core vs. buffer quota, and configure your vehicle and guest count.' },
              { num: '04', title: 'BOOK', desc: 'Submit traveler government ID proof for official Forest Department permit allocation.' },
              { num: '05', title: 'EXPERIENCE', desc: 'Arrive for your dawn briefing at the reserve as the first rays break through the sal trees.' }
            ].map((step, idx) => (
              <div key={step.num} className="shrink-0 w-[85%] snap-start sm:w-auto bg-forest-deep p-6 rounded-xl border border-sand/15 relative space-y-3">
                <span className="font-serif text-3xl font-bold text-gold/40 block">
                  {step.num}
                </span>
                <h3 className="font-serif text-base font-bold text-sand">{step.title}</h3>
                <p className="text-xs text-sand/75 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* 07. WILDLIFE PHOTOGRAPHY GALLERY PREVIEW */}
      <section className="py-20 bg-forest-deep text-sand border-y border-sand/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] tracking-widest-safari uppercase text-gold font-bold block">
                Visual Chronicles
              </span>
              <h2 className="font-serif text-3xl font-bold text-sand mt-1">
                The Master Gallery
              </h2>
            </div>
            <Link 
              to="/gallery" 
              className="text-xs font-bold uppercase tracking-wider text-gold hover:underline flex items-center gap-1.5"
            >
              <span>Explore Complete Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            <Marquee>
            {gallery.map(item => (
              <button
                type="button"
                key={item._id}
                onClick={() => setActiveGallery(item)}
                className="shrink-0 mr-6 w-[85vw] sm:mr-0 sm:w-auto relative rounded-2xl overflow-hidden group border border-sand/15 aspect-[4/3] shadow-lg text-left cursor-pointer"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[1.02]"
                />
              </button>
            ))}
            </Marquee>
          </div>
        </div>
      </section>

      {/* 07b. CLIENT STORIES & INSTAGRAM REELS (CMS-driven, backed by curated defaults) */}
      <ClientStoriesSection data={clientStories} />


      <GalleryLightbox
        items={gallery}
        activeItem={activeGallery}
        onClose={() => setActiveGallery(null)}
        onChange={setActiveGallery}
      />

      {/* 08. FINAL BOOKING CTA */}
      <section className="py-24 bg-forest text-sand relative overflow-hidden border-t-2 border-gold/40">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/img/Hero/hero-3.webp" 
            alt="Forest Canopy Wilderness" 
            className="w-full h-full object-cover brightness-[0.25] contrast-[1.05]" 
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <span className="text-xs uppercase tracking-widest-safari text-gold font-bold block drop-shadow">
            Begin Your Wilderness Chapter
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            The Forests of Central India Await.
          </h2>
          <p className="text-xs sm:text-sm text-sand/90 max-w-xl mx-auto leading-relaxed drop-shadow">
            Tell us your dates and we'll shape the permits, the naturalists and the dawn drives around the way you want to meet the wild.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link 
              to="/booking" 
              className="px-8 py-3.5 bg-gold text-forest font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all shadow-xl"
            >
              Book Your Expedition
            </Link>
            <Link 
              to="/compare" 
              className="px-6 py-3.5 bg-black/40 backdrop-blur-md border border-sand/30 text-sand text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-black/60 transition-colors shadow-lg"
            >
              Compare Sanctuaries
            </Link>
          </div>
        </div>
      </section>

      {/* GET QUOTE ENQUIRY MODAL */}
      {quoteOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm"
          onClick={closeQuote}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-sand text-forest rounded-2xl border border-gold/40 shadow-2xl overflow-hidden"
          >
            {quoteSent ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-forest text-gold flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 id="quote-title" className="font-serif text-2xl font-bold text-forest">Request Sent</h3>
                <p className="text-forest/80 text-sm max-w-sm mx-auto leading-relaxed">
                  Your request is sent — a representative will contact you shortly.
                </p>
                <p className="text-forest/60 text-xs max-w-sm mx-auto leading-relaxed">
                  We'll prepare a specialized quote tailored to your {quoteDates ? 'dates' : 'safari'}
                  {quoteDestinationName ? ` at ${quoteDestinationName}` : ''}.
                </p>
                <button
                  type="button"
                  onClick={closeQuote}
                  className="mt-2 px-6 py-2.5 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest-light transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="p-6 sm:p-7 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 id="quote-title" className="font-serif text-2xl font-bold text-forest">Get A Specialized Quote</h3>
                    <p className="text-forest/60 text-xs mt-1">Share your contact details and we'll send a quote tailored to your safari.</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={closeQuote}
                    className="p-1.5 rounded-lg text-forest/50 hover:bg-forest/10 hover:text-forest transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-forest text-sand rounded-xl p-4 text-xs space-y-1.5">
                  <div className="flex justify-between gap-4"><span className="text-sand/60">Reserve</span><span className="font-semibold text-right">{quoteDestinationName || 'Any / Unsure'}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-sand/60">Dates</span><span className="font-semibold text-right">{quoteDates || 'Flexible'}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-sand/60">Guests</span><span className="font-semibold text-right">{quoteGuests}</span></div>
                </div>

                {quoteError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{quoteError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={quoteContact.name}
                      onChange={(e) => {
                        setQuoteContact({ ...quoteContact, name: e.target.value });
                        clearQuoteFieldError('name');
                      }}
                      onBlur={() => {
                        const err = validateName(quoteContact.name, 'Full name');
                        if (err) setQuoteFieldErrors(prev => ({ ...prev, name: err }));
                      }}
                      placeholder="Full name *"
                      aria-invalid={!!quoteFieldErrors.name}
                      aria-describedby={quoteFieldErrors.name ? 'quote-name-error' : undefined}
                      className={`w-full px-4 py-3 bg-sand-warm border rounded-xl text-xs text-forest focus:outline-none transition-colors ${
                        quoteFieldErrors.name
                          ? 'border-red-500 ring-1 ring-red-400/20'
                          : 'border-forest/15 focus:ring-2 focus:ring-forest/30'
                      }`}
                    />
                    <FormFieldError id="quote-name-error" error={quoteFieldErrors.name} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="email"
                        value={quoteContact.email}
                        onChange={(e) => {
                          setQuoteContact({ ...quoteContact, email: e.target.value });
                          clearQuoteFieldError('email');
                        }}
                        onBlur={() => {
                          const err = validateEmail(quoteContact.email);
                          if (err) setQuoteFieldErrors(prev => ({ ...prev, email: err }));
                        }}
                        placeholder="Email address *"
                        aria-invalid={!!quoteFieldErrors.email}
                        aria-describedby={quoteFieldErrors.email ? 'quote-email-error' : undefined}
                        className={`w-full px-4 py-3 bg-sand-warm border rounded-xl text-xs text-forest focus:outline-none transition-colors ${
                          quoteFieldErrors.email
                            ? 'border-red-500 ring-1 ring-red-400/20'
                            : 'border-forest/15 focus:ring-2 focus:ring-forest/30'
                        }`}
                      />
                      <FormFieldError id="quote-email-error" error={quoteFieldErrors.email} />
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={quoteContact.phone}
                        onChange={(e) => {
                          setQuoteContact({ ...quoteContact, phone: e.target.value });
                          clearQuoteFieldError('phone');
                        }}
                        onBlur={() => {
                          const err = validatePhone(quoteContact.phone);
                          if (err) setQuoteFieldErrors(prev => ({ ...prev, phone: err }));
                        }}
                        placeholder="Phone / WhatsApp number *"
                        aria-invalid={!!quoteFieldErrors.phone}
                        aria-describedby={quoteFieldErrors.phone ? 'quote-phone-error' : undefined}
                        className={`w-full px-4 py-3 bg-sand-warm border rounded-xl text-xs text-forest focus:outline-none transition-colors ${
                          quoteFieldErrors.phone
                            ? 'border-red-500 ring-1 ring-red-400/20'
                            : 'border-forest/15 focus:ring-2 focus:ring-forest/30'
                        }`}
                      />
                      <FormFieldError id="quote-phone-error" error={quoteFieldErrors.phone} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  className="w-full py-3.5 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-forest-light transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {quoteSubmitting ? (
                    <div className="w-4 h-4 border-2 border-sand border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-gold" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
