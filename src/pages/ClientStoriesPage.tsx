import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Compass, 
  Play, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  Film,
  X
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import { cmsService } from '../services/api';
import { 
  ClientStoriesData, 
  DEFAULT_CLIENT_STORIES_DATA, 
  normalizeClientStoriesData 
} from '../lib/clientStories';

export const ClientStoriesPage: React.FC = () => {
  const [data, setData] = useState<ClientStoriesData>(DEFAULT_CLIENT_STORIES_DATA);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    cmsService.getContent('client_stories')
      .then((res) => {
        if (res) {
          setData(normalizeClientStoriesData(res));
        }
      })
      .catch(() => {
        // Fallback to rich defaults
      });
  }, []);

  const story = data.featuredReel || data.stories[0];
  const videoSrc = story?.videoUrl || '/assets/video/tadoba-guests-reel.mp4';
  const posterSrc = story?.imageUrl || '/assets/img/instagram/reel-De1yY0hzcIc.webp';

  return (
    <div className="bg-sand min-h-screen text-forest selection:bg-gold selection:text-forest">
      
      {/* 01. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-forest text-sand overflow-hidden border-b-2 border-gold/40">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="/assets/img/Hero/hero-3.webp" 
            alt="Forest Canopy Wilderness" 
            className="w-full h-full object-cover brightness-75 scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/90 via-forest/80 to-forest" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{data.eyebrow || 'Field Encounters & Traveler Stories'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-sand max-w-4xl mx-auto leading-[1.15]">
            {data.heading || 'In Their Own Words'}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-sand/80 max-w-2xl mx-auto leading-relaxed">
            Real moments, unscripted wildlife encounters, and heartfelt stories from travelers who explored the tiger heartlands of Central India with our naturalists.
          </p>
        </div>
      </section>

      {/* 02. HORIZONTAL WIDESCREEN VIDEO SPOTLIGHT */}
      {story && (
        <section className="py-16 md:py-24 bg-sand-warm border-b border-forest/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-widest text-earth font-bold">
                Verified Guest Encounter
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">
                Field Dispatch: Reel from Tadoba
              </h2>
            </div>

            {/* Horizontal Card */}
            <div className="max-w-6xl mx-auto bg-sand rounded-3xl border border-forest/20 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              {/* Horizontal Video Player (Widescreen 16:9 Landscape) */}
              <div className="lg:col-span-7 bg-black flex items-center justify-center relative min-h-[260px] sm:min-h-[360px] lg:min-h-[420px]">
                {isPlaying ? (
                  <div className="w-full h-full relative aspect-video flex items-center justify-center bg-black">
                    <video
                      src={videoSrc}
                      controls
                      autoPlay
                      playsInline
                      poster={posterSrc}
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPlaying(false)}
                      className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-sand text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/20 transition shadow backdrop-blur-md cursor-pointer"
                      title="Close video and show cover"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cover</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full h-full aspect-video flex items-center justify-center overflow-hidden group">
                    <img 
                      src={posterSrc} 
                      alt={story.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-sand border border-white/20 flex items-center gap-1.5 shadow">
                        <Film className="w-3.5 h-3.5 text-gold" />
                        <span>Instagram Reel</span>
                      </span>
                      {story.duration && (
                        <span className="text-[11px] font-mono text-sand/90 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                          {story.duration}
                        </span>
                      )}
                    </div>

                    {/* Centered Glowing Gold Play Button */}
                    <button
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center z-10 group/play cursor-pointer"
                      aria-label="Play Video Horizontally"
                    >
                      <div className="w-20 h-20 sm:w-20 sm:h-20 rounded-full bg-gold/90 text-forest flex items-center justify-center shadow-2xl group-hover/play:scale-110 group-hover/play:bg-gold transition-all duration-300">
                        <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-forest translate-x-0.5" />
                      </div>
                    </button>

                    {/* Bottom Overlay Info on Video */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 shadow">
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-bold text-white drop-shadow">@shutterandstripes</span>
                      </div>
                      <span className="font-semibold text-sand/80 hidden sm:inline drop-shadow flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gold" />
                        {story.reserve}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Testimonial & Review Details Side */}
              <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-sand">
                
                {/* Header / Rating */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-gold/20 text-forest text-xs font-bold uppercase tracking-wider rounded-full border border-gold/40">
                      {story.tag || 'Guest Story & Sighting'}
                    </span>
                    <div className="flex items-center text-gold">
                      {[...Array(story.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-gold" />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-earth text-xs font-bold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-earth" />
                    <span>{story.reserve}</span>
                  </div>
                </div>

                {/* Quote Body */}
                <blockquote className="font-serif text-lg sm:text-xl text-forest/90 italic leading-relaxed border-l-4 border-gold pl-4 py-1">
                  "{story.quote}"
                </blockquote>

                {/* Author Attribution & Action Buttons */}
                <div className="pt-4 border-t border-forest/15 space-y-5">
                  <div>
                    <h3 className="font-serif font-bold text-forest text-lg">
                      {story.name}
                    </h3>
                    {[story.location, story.safariType].filter(Boolean).length > 0 && (
                      <p className="text-xs text-forest/60 uppercase tracking-wider">
                        {[story.location, story.safariType].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={story.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shrink-0"
                    >
                      <InstagramIcon className="w-4 h-4" />
                      <span>Watch Reel on Instagram</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <Link
                      to="/booking"
                      className="w-full sm:w-auto px-5 py-3 bg-forest text-sand text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-forest/90 transition shadow flex items-center justify-center gap-1.5"
                    >
                      <span>Plan Your Safari</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>
      )}

      {/* 03. INSTAGRAM CALLOUT BANNER */}
      <section className="py-14 bg-forest-deep text-sand border-y border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 shadow-xl">
              <InstagramIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-sand">
                Follow Our Field Dispatches on Instagram
              </h3>
              <p className="text-xs sm:text-sm text-sand/70 mt-1">
                Daily sighting updates, tiger tracking logs, and high-resolution wildlife reels straight from Central India.
              </p>
            </div>
          </div>

          <a
            href="https://www.instagram.com/shutterandstripes"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-gold text-forest rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-gold-light transition shadow-lg flex items-center gap-2 shrink-0"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Follow @shutterandstripes</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* 04. FINAL CTA SECTION */}
      <section className="py-24 bg-forest text-sand relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/img/Hero/hero-2.webp" 
            alt="Central India Safari Landscape" 
            className="w-full h-full object-cover brightness-[0.22] contrast-125" 
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            Write Your Own Story
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-sand leading-tight">
            Ready to Stand Face to Face with the Royal Bengal Tiger?
          </h2>
          <p className="text-sand/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Let our native naturalists plan an extraordinary wildlife expedition customized to your dates, photography ambitions, and safari pace.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/booking"
              className="w-full sm:w-auto px-8 py-4 bg-gold text-forest rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-gold-light transition shadow-xl flex items-center justify-center gap-2 group"
            >
              <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <span>Customize Your Journey</span>
            </Link>
            <Link
              to="/destinations"
              className="w-full sm:w-auto px-8 py-4 bg-sand/10 hover:bg-sand/20 text-sand border border-gold/40 rounded-xl font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2"
            >
              <span>Explore 17 Tiger Reserves</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ClientStoriesPage;
