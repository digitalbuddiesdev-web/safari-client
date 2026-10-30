import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { UPCOMING_TOURS, UpcomingTour } from '../../lib/upcomingTours';
import InstagramIcon from '../InstagramIcon';

interface UpcomingToursSliderProps {
  tours?: UpcomingTour[];
  theme?: 'dark' | 'light';
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showViewAll?: boolean;
}

export const UpcomingToursSlider: React.FC<UpcomingToursSliderProps> = ({
  tours = UPCOMING_TOURS,
  theme = 'dark',
  title = 'Upcoming Tours',
  subtitle = 'Fixed-date group departures and themed escapes — small groups, confirmed permits, and every seat booked with the forest department in advance.',
  eyebrow = 'The Safari Calendar · Limited Seats',
  showViewAll = true,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate approximate active card index for dots/counter
    const cardWidth = 320 + 24; // card width + gap
    const idx = Math.min(Math.round(scrollLeft / cardWidth), tours.length - 1);
    setActiveIndex(Math.max(0, idx));
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [tours]);

  const slide = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;

    // Scroll by roughly 1 card width on mobile or 2 cards on desktop
    const cardWidth = el.clientWidth > 768 ? 680 : 320;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const isDark = theme === 'dark';

  return (
    <div className="relative">
      {/* Header with Title and Slider Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          {eyebrow && (
            <span className="text-[11px] tracking-widest uppercase text-gold font-bold block mb-1">
              {eyebrow}
            </span>
          )}
          <h2 className={`font-serif text-3xl sm:text-4xl font-bold ${isDark ? 'text-sand' : 'text-forest'}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-xs ${isDark ? 'text-sand/70' : 'text-forest/70'} leading-relaxed mt-2 max-w-xl`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Action and Navigation Controls */}
        <div className="flex items-center gap-4 shrink-0">
          {showViewAll && (
            <Link
              to="/upcoming-tours"
              className="text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-light flex items-center gap-1.5 transition"
            >
              <span>View All Tours</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Slider Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => slide('left')}
              disabled={!canScrollLeft}
              aria-label="Previous tour"
              className={`p-2.5 rounded-full border transition flex items-center justify-center ${
                isDark
                  ? 'border-sand/20 text-sand hover:bg-gold hover:text-forest hover:border-gold disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-sand'
                  : 'border-forest/20 text-forest hover:bg-forest hover:text-sand disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-forest'
              } disabled:cursor-not-allowed`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => slide('right')}
              disabled={!canScrollRight}
              aria-label="Next tour"
              className={`p-2.5 rounded-full border transition flex items-center justify-center ${
                isDark
                  ? 'border-sand/20 text-sand hover:bg-gold hover:text-forest hover:border-gold disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-sand'
                  : 'border-forest/20 text-forest hover:bg-forest hover:text-sand disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-forest'
              } disabled:cursor-not-allowed`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slider Track */}
      <div
        ref={trackRef}
        className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {tours.map((tour, idx) => (
          <article
            key={tour.slug}
            className={`snap-start shrink-0 w-[84vw] sm:w-[320px] md:w-[340px] rounded-2xl overflow-hidden border shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
              isDark
                ? 'bg-forest border-sand/15 hover:border-gold/50'
                : 'bg-white border-forest/15 hover:border-forest/40'
            }`}
          >
            {/* Poster Header */}
            <div className="relative aspect-[3/4] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-forest-muted to-forest-deep" />
              <img
                src={tour.poster}
                alt={`${tour.title} poster`}
                onError={e => { e.currentTarget.style.display = 'none'; }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Status Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                <span className="bg-gold text-forest text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
                  {tour.travelPeriod || tour.bookingStatus || 'Upcoming Tour'}
                </span>
                {tour.availability && (
                  <span className="bg-black/70 backdrop-blur-sm text-sand text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/20 self-start">
                    {tour.availability}
                  </span>
                )}
              </div>

              {/* Instagram Icon Pill */}
              <a
                href={tour.instagram}
                target="_blank"
                rel="noreferrer"
                className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-sand p-2 rounded-full border border-white/20 hover:text-gold transition z-10"
                aria-label={`View ${tour.title} on Instagram`}
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>

              {/* Subtle bottom gradient on poster */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-sand z-10">
                <span className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-0.5">
                  Departure Window
                </span>
                <span className="text-xs font-semibold block truncate">
                  {tour.dates[0]?.label || tour.travelPeriod || 'Flexible Bookings'}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className={`font-serif text-lg sm:text-xl font-bold mb-1 leading-snug line-clamp-1 ${isDark ? 'text-sand' : 'text-forest'}`}>
                  {tour.title}
                </h3>
                <p className="text-gold text-xs font-medium italic line-clamp-1">
                  {tour.tagline}
                </p>
                {tour.description ? (
                  <p className={`text-[11px] ${isDark ? 'text-sand/70' : 'text-forest/70'} line-clamp-2 mt-2 leading-relaxed`}>
                    {tour.description}
                  </p>
                ) : (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {tour.highlights.slice(0, 3).map(h => (
                      <span
                        key={h}
                        className={`text-[10px] px-2 py-0.5 rounded-md ${
                          isDark ? 'bg-sand/10 text-sand/80' : 'bg-sand text-forest/80'
                        }`}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`pt-3 border-t flex items-center gap-2 ${isDark ? 'border-sand/10' : 'border-forest/10'}`}>
                <Link
                  to={`/upcoming-tours/${tour.slug}`}
                  className="flex-1 text-center py-2.5 px-3 bg-gold text-forest font-bold rounded-xl text-xs hover:bg-gold-light transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={tour.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View on Instagram"
                  className={`p-2.5 rounded-xl border transition ${
                    isDark
                      ? 'bg-forest-deep border-sand/20 text-sand hover:text-gold hover:border-gold/50'
                      : 'bg-sand/40 border-forest/15 text-forest hover:text-gold hover:border-gold'
                  }`}
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Slide dots indicator on mobile */}
      <div className="flex justify-center items-center gap-1.5 mt-3 sm:hidden">
        {tours.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'w-6 bg-gold'
                : `w-1.5 ${isDark ? 'bg-sand/30' : 'bg-forest/25'}`
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default UpcomingToursSlider;

