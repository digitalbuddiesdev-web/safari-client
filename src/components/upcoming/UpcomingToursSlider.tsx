import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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

    const cardWidth = 300 + 20; // approximate card width + gap
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

    const scrollAmount = direction === 'left' ? -320 : 320;
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
              <span>Explore Tours</span>
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

      {/* Slider Track with Reverted Original Card Design */}
      <div
        ref={trackRef}
        className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {tours.map(tour => (
          <article
            key={tour.slug}
            className="snap-start shrink-0 w-[82vw] sm:w-[280px] lg:w-[295px] bg-forest rounded-2xl overflow-hidden border border-sand/15 shadow-lg flex flex-col hover:border-gold/50 transition-colors"
          >
            {/* Poster — tapping opens the Instagram post */}
            <a
              href={tour.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${tour.title} on Instagram`}
              className="relative block aspect-[3/4] overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-forest-muted to-forest-deep" />
              <img
                src={tour.poster}
                alt={`${tour.title} poster`}
                onError={e => { e.currentTarget.style.display = 'none'; }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-3 left-3 bg-gold text-forest text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
                Upcoming Tour
              </span>
              <span className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-sand p-1.5 rounded-full border border-white/20">
                <InstagramIcon className="w-3.5 h-3.5" />
              </span>
            </a>

            {/* Actions: Explore Now & Instagram */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Link
                  to={`/upcoming-tours/${tour.slug}`}
                  className="flex-1 text-center py-2.5 px-3 bg-gold text-forest font-bold rounded text-xs hover:bg-gold-light transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={tour.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View this tour on Instagram"
                  className="p-2.5 bg-forest-deep border border-sand/20 text-sand rounded hover:text-gold hover:border-gold/50 transition-colors"
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
