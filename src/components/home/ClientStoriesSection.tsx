import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, ExternalLink, Film, Sparkles, MapPin, X, ArrowRight } from 'lucide-react';
import InstagramIcon from '../InstagramIcon';
import { ClientStoriesData } from '../../lib/clientStories';

interface ClientStoriesSectionProps {
  data: ClientStoriesData;
}

export const ClientStoriesSection: React.FC<ClientStoriesSectionProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!data || !Array.isArray(data.stories) || data.stories.length === 0) {
    return null;
  }

  // Showcase only the single verified real guest story
  const story = data.featuredReel || data.stories[0];
  const videoSrc = story.videoUrl || '/assets/video/tadoba-guests-reel.mp4';
  const posterSrc = story.imageUrl || '/assets/img/instagram/reel-De1yY0hzcIc.jpg';

  return (
    <section className="py-20 md:py-28 bg-sand-warm border-y border-forest/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/5 border border-forest/15 text-earth text-[11px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{data.eyebrow || 'Guest Story & Field Encounter'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest tracking-tight">
            {data.heading || 'In Their Own Words'}
          </h2>
          <p className="text-xs sm:text-sm text-forest/70 max-w-xl mx-auto leading-relaxed">
            Real guest experiences and unscripted wildlife encounters captured live in the tiger reserves of Central India.
          </p>
        </div>

        {/* Horizontal Luxury Showcase Card */}
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
                <p className="text-xs text-forest/60 uppercase tracking-wider">
                  {story.location} &bull; {story.safariType}
                </p>
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
                  to="/client-stories"
                  className="w-full sm:w-auto px-5 py-3 bg-forest text-sand text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-forest/90 transition shadow flex items-center justify-center gap-1.5"
                >
                  <span>Explore Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ClientStoriesSection;
