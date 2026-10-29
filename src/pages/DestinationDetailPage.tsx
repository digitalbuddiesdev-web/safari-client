import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Compass, 
  HelpCircle, 
  ArrowRight, 
  AlertCircle,
  Share2,
  ChevronDown,
  Star,
  TreePine
} from 'lucide-react';
import { destinationService, cmsService } from '../services/api';
import { Destination, JournalArticle } from '../types';
import { stateBadgeClass, stateCode, isPrimeZone } from '../lib/site';

export const DestinationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // MOM: How To Reach and Rules removed. How It Works + package enquiry via email covers this.
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [primeOnly, setPrimeOnly] = useState(true);
  const [copied, setCopied] = useState(false);
  const [journal, setJournal] = useState<JournalArticle | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const destData = await destinationService.getBySlug(slug);
        setDestination(destData);
      } catch (err: any) {
        setError(err.message || 'Reserve details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [slug]);

  // Related journal article: prefer one tagged with this reserve, else the latest dispatch.
  useEffect(() => {
    if (!destination) return;
    const tag = destination.name.toLowerCase();
    cmsService.getJournals()
      .then(list => setJournal(list.find(a => (a.destinationTag || '').toLowerCase().includes(tag)) || list[0] || null))
      .catch(() => {});
  }, [destination]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination?.name,
        text: destination?.tagline,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-sand min-h-screen pt-36 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-forest text-lg">Retrieving reserve telemetry and forest records...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="bg-sand min-h-screen pt-36 pb-20 container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-forest/10 shadow-sm">
          <AlertCircle className="w-12 h-12 text-earth mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-forest mb-2">Reserve Not Found</h2>
          <p className="text-forest/70 text-sm mb-6">
            The reserve you are seeking does not exist or may have been updated.
          </p>
          <Link
            to="/destinations"
            className="px-6 py-2.5 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider inline-block"
          >
            Back to Reserves
          </Link>
        </div>
      </div>
    );
  }

  const primeZones = destination.zones.filter(isPrimeZone);
  const visibleZones = primeOnly ? primeZones : destination.zones;

  return (
    <div className="bg-sand min-h-screen">
      {/* Hero Section — mobile: full image with text below; sm+: overlaid banner */}
      {/* ponytail: pt-[74px] clears the fixed navbar height; bump both together if navbar resizes */}
      <section className="relative pt-[74px] sm:pt-0 sm:h-[72vh] sm:min-h-[520px] sm:max-h-[720px] sm:overflow-hidden">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-auto block sm:absolute sm:inset-0 sm:h-full sm:object-cover brightness-[1.02] contrast-[1.02]"
        />
        {/* Dark overlay only where text sits on the image (desktop) */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

        {/* Desktop: breadcrumb + share floating over the image */}
        <div className="hidden sm:block absolute top-28 left-0 right-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-sand/90 drop-shadow">
              <Link to="/destinations" className="hover:text-gold transition">Reserves</Link>
              <span>/</span>
              <span className="text-gold">{destination.state}</span>
              <span>/</span>
              <span className="text-sand">{destination.name}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md text-sand text-xs font-medium hover:bg-black/70 transition flex items-center space-x-1.5 border border-white/20 shadow"
              >
                <Share2 className="w-3.5 h-3.5 text-gold" />
                <span>{copied ? 'Copied Link!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero text: below the image on mobile, overlaid at the bottom on desktop */}
        <div className="relative sm:absolute sm:bottom-10 sm:left-0 sm:right-0 z-10 bg-sand sm:bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:py-0">
            {/* Mobile: breadcrumb + share */}
            <div className="flex items-center justify-between gap-3 mb-3 sm:hidden">
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-forest/70 min-w-0">
                <Link to="/destinations" className="hover:text-gold transition shrink-0">Reserves</Link>
                <span className="shrink-0">/</span>
                <span className="text-gold shrink-0">{destination.state}</span>
                <span className="shrink-0">/</span>
                <span className="text-forest truncate">{destination.name}</span>
              </div>
              <button
                onClick={handleShare}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-forest/10 text-forest text-[11px] font-medium hover:bg-forest/20 transition flex items-center space-x-1.5 border border-forest/15"
              >
                <Share2 className="w-3.5 h-3.5 text-gold" />
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-md ${stateBadgeClass(destination.state)}`}>
                  {destination.state}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-forest sm:text-white font-bold mb-2 sm:mb-3 tracking-tight sm:drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {destination.name}
              </h1>
              <p className="text-forest/80 sm:text-sand text-base sm:text-xl font-light italic mb-4 sm:mb-6 sm:drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                "{destination.tagline}"
              </p>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 bg-white sm:bg-black/60 backdrop-blur-md p-4 sm:p-5 sm:px-6 rounded-2xl border border-forest/10 sm:border-sand/20 w-full max-w-5xl lg:max-w-6xl shadow-lg sm:shadow-2xl">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-forest/50 sm:text-sand/70 block">Core &amp; Buffer Area</span>
                <span className="font-serif text-lg sm:text-xl font-bold text-forest sm:text-sand">{destination.areaSqKm} km²</span>
              </div>
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-forest/50 sm:text-sand/70 block">Headline Species</span>
                <span className="font-serif text-lg sm:text-xl font-bold text-gold">
                  {destination.headlineSpecies || destination.tigerCount}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-forest/50 sm:text-sand/70 block">Prime Season</span>
                <span className="font-serif text-base sm:text-lg font-bold text-forest sm:text-sand leading-snug block">{destination.bestTimeToVisit}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left / Center: one merged, compact flow */}
          <div className="lg:col-span-2 space-y-10">

            {/* OVERVIEW AND HABITAT */}
            <div className="space-y-6 animate-fadeIn">
              <h2 className="font-serif text-2xl font-bold text-forest flex items-center gap-2">
                <Compass className="w-5 h-5 text-gold" />
                <span>Overview and Habitat</span>
              </h2>

              {destination.editorialQuote && (
                <blockquote className="border-l-4 border-gold pl-5 py-2 bg-sand-light/60 rounded-r-2xl text-forest italic text-sm sm:text-base leading-relaxed font-serif">
                  "{destination.editorialQuote}"
                </blockquote>
              )}

              <div className="prose prose-forest text-forest/80 leading-relaxed text-sm space-y-3 font-sans">
                {destination.fullDesc.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Key Fauna */}
              <div>
                <h3 className="font-serif text-lg font-bold text-forest mb-3 flex items-center space-x-2">
                  <TreePine className="w-5 h-5 text-forest" />
                  <span>Key Resident Fauna and Co-predators</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 list-disc pl-5 text-sm text-forest/80 marker:text-gold">
                  {destination.wildlifeHighlights.map((animal, i) => (
                    <li key={i}>{animal}</li>
                  ))}
                </ul>
              </div>

              {/* Prime Zones */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-serif text-lg font-bold text-forest flex items-center gap-2">
                    <Star className="w-5 h-5 text-gold" />
                    <span>Prime Zones</span>
                  </h3>
                  {primeZones.length < destination.zones.length && (
                    <div className="flex space-x-1.5 bg-sand-light p-1 rounded-xl border border-forest/10 text-xs">
                      <button
                        onClick={() => setPrimeOnly(true)}
                        className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition ${
                          primeOnly ? 'bg-forest text-sand' : 'text-forest/70 hover:text-forest'
                        }`}
                      >
                        Prime ({primeZones.length})
                      </button>
                      <button
                        onClick={() => setPrimeOnly(false)}
                        className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition ${
                          !primeOnly ? 'bg-forest text-sand' : 'text-forest/70 hover:text-forest'
                        }`}
                      >
                        All ({destination.zones.length})
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {visibleZones.map((zone, i) => (
                    <div
                      key={i}
                      className={`bg-white p-4 rounded-2xl border shadow-sm hover:border-gold/40 transition ${
                        isPrimeZone(zone) ? 'border-gold/50' : 'border-forest/10'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          zone.type === 'core' ? 'bg-forest text-sand' : 'bg-earth text-sand'
                        }`}>
                          {zone.type}
                        </span>
                        {isPrimeZone(zone) && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold text-forest flex items-center gap-1">
                            <Star className="w-3 h-3" /> Prime
                          </span>
                        )}
                        <h4 className="font-serif text-lg font-bold text-forest">{zone.name}</h4>
                      </div>
                      {zone.highlight && (
                        <p className="text-gold font-medium text-xs mb-1">{zone.highlight}</p>
                      )}
                      {zone.description && (
                        <p className="text-forest/70 text-xs leading-relaxed">{zone.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            {/* What's included */}
            <div className="space-y-4 pt-2 animate-fadeIn">
              <div>
                <h3 className="font-serif text-lg font-bold text-forest">What's Included</h3>
                <p className="text-forest/60 text-xs mt-0.5">
                  Every journey is arranged end to end — park permits, safari vehicle, naturalist guide and applicable forest dues. Share your dates and we'll craft a tailored itinerary and quote.
                </p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-forest/80">
                {['Park permits & entry fees', 'Exclusive safari vehicle', 'Naturalist guide', 'Forest & buffer-zone dues', 'Permit verification & reservations', 'Tailored itinerary planning'].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="text-gold shrink-0">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

              {/* From the Journal */}
              {journal && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-serif text-lg font-bold text-forest">From the Journal</h3>
                  <Link
                    to={`/journal/${journal.slug}`}
                    className="group flex bg-white rounded-2xl border border-forest/10 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  >
                    <img
                      src={journal.coverImage}
                      alt={journal.title}
                      className="w-28 sm:w-40 object-cover shrink-0"
                    />
                    <div className="p-4 space-y-1.5 min-w-0">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-earth">{journal.category}</span>
                      <h4 className="font-serif font-bold text-forest leading-snug group-hover:text-gold transition line-clamp-2">
                        {journal.title}
                      </h4>
                      <p className="text-forest/70 text-xs leading-relaxed line-clamp-2">{journal.excerpt}</p>
                    </div>
                  </Link>
                </div>
              )}

              {/* FAQs */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif text-lg font-bold text-forest">FAQs</h3>
                {destination.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-forest/10 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-sand/30 transition"
                    >
                      <span className="font-serif font-bold text-forest text-sm">
                        {faq.question}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-forest shrink-0 transition-transform ${
                        openFaq === i ? 'rotate-180 text-gold' : ''
                      }`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 pt-1 text-xs text-forest/80 leading-relaxed border-t border-forest/5">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Right Column: Sticky Booking Widget Card (1 col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-forest/15 shadow-xl space-y-6">
              
              <div className="border-b border-forest/10 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold block mb-1">
                  Verified Booking Portal
                </span>
                <h3 className="font-serif text-2xl font-bold text-forest">
                  Reserve {destination.name}
                </h3>
                <p className="text-forest/60 text-xs mt-1">
                  100% official forest department registered slots.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-sand p-3.5 rounded-xl border border-forest/10 flex items-center justify-between">
                  <span className="text-forest/70 font-medium">Forest Territory:</span>
                  <span className="font-bold text-forest">{destination.state} ({stateCode(destination.state)})</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/booking?destination=${destination.slug}`}
                  className="w-full py-3.5 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 hover:bg-forest/90 transition shadow-lg"
                >
                  <span>Plan Your Journey</span>
                  <ArrowRight className="w-4 h-4 text-gold" />
                </Link>
                <p className="text-center text-[10px] text-forest/50 mt-2">
                  No payment charged during initial verification.
                </p>
              </div>

              {/* Guaranteed Protection Note */}
              <div className="bg-forest/5 p-4 rounded-xl border border-forest/10 text-[11px] text-forest/70 leading-relaxed">
                <strong className="text-forest block mb-1">Ethical Wildlife Charter:</strong>
                Shutter And Stripes operates under strict NTCA protocols. We respect safe distances, preserve silence, and do not compromise animal behavior for photographs.
              </div>

            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
export default DestinationDetailPage;
