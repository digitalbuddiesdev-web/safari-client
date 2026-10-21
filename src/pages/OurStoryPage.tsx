import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Camera, 
  TreePine, 
  Users, 
  ArrowRight
} from 'lucide-react';
import { FOUNDER_NAME, COFOUNDER_NAME, YEARS_OF_EXPERIENCE, TOURS_COMPLETED } from '../lib/site';

// ponytail: co-founder section
const SHOW_COFOUNDER = true;

export const OurStoryPage: React.FC = () => {
  return (
    <div className="bg-sand min-h-screen pt-28 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest mb-6">
            <Compass className="w-3.5 h-3.5 text-gold" />
            <span>The Shutter And Stripes Ethos</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-forest font-bold tracking-tight mb-6 leading-tight">
            Inspired by Nature.<br /> Guided by Locals.
          </h1>
          <p className="text-forest/80 text-lg sm:text-xl leading-relaxed font-sans max-w-2xl mx-auto">
            <strong>The story of Shutter and Stripes is not a business plan born in a boardroom - it is a legacy born on the dusty trails of Moharli, a tiny village right at the gates of the Tadoba - Andhari Tiger Reserve.</strong> <br />Led by {FOUNDER_NAME}, we are naturalists, trackers and photographers
            dedicated to the resident wildlife of Central India&mdash;every tiger, leopard, sloth bear, dhole, and stork
            that lives here year-round, not just the species on a checklist.
          </p>
        </div>

        {/* Hero Full-width Vignette */}
        <div className="mt-12 rounded-3xl overflow-hidden border border-forest/15 shadow-2xl relative h-[500px]">
          <img
            src="/assets/img/Hero/hero-1.webp"
            alt="Bengal Tiger in Central India"
            className="w-full h-full object-cover brightness-[1.03] contrast-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-sand max-w-2xl">
            <span className="text-gold text-xs font-bold uppercase tracking-widest block mb-2 drop-shadow">
              Our Guiding Tenet
            </span>
            <p className="font-serif text-2xl sm:text-3xl italic text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              "The jungle reveals its secrets only to those who possess the patience to listen and the humility to wait."
            </p>
          </div>
        </div>
      </section>

{/* 2. THE FOUNDER */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-earth font-bold text-xs uppercase tracking-widest">
              <Users className="w-4 h-4 text-gold" />
              <span>Section II - Who Leads</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-forest font-bold leading-tight">
              {FOUNDER_NAME}, Founder and Principal Naturalist
            </h2>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              My connection to the wild began in the teak forests of Tadoba, walking alongside my father beneath towering canopy trees. Those early moments sparked a lifelong calling. At a young age, I stepped into the forest as a naturalist, beginning an 18-year journey to understand the untamed wilderness in its purest form.
            </p>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              Over nearly two decades, my perspective shifted from merely seeking tiger sightings to decoding the secret language of the jungle. I came to see the forest as a living classroom, where every creature&mdash;from the sharp alarm call of a chital deer to the quiet movement of an apex predator&mdash;plays a vital role in nature&rsquo;s balance.
            </p>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              Through experience of exploring different forests, a crucial truth emerged: you cannot protect the wild without empowering the people who live beside it. Local trackers, guides, and drivers are not service providers&mdash;they are the true guardians and storytellers of these forests, having coexisted with apex predators for generations.
            </p>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              To put this philosophy into action, we founded Shutter and Stripes&mdash;&ldquo;Shutter&rdquo; for the stories we capture, and &ldquo;Stripes&rdquo; for the iconic predators that define the wild. By pairing travellers with local expert naturalists on every expedition, we pioneer responsible tourism that directly supports forest communities and preserves untouched wilderness for generations to come.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="px-5 py-3 bg-white rounded-2xl border border-forest/15 text-center">
                <span className="block font-serif text-2xl font-bold text-forest">{YEARS_OF_EXPERIENCE}+</span>
                <span className="text-[10px] uppercase tracking-wider text-forest/60">Years in the Field</span>
              </div>
              <div className="px-5 py-3 bg-white rounded-2xl border border-forest/15 text-center">
                <span className="block font-serif text-2xl font-bold text-forest">{TOURS_COMPLETED}+</span>
                <span className="text-[10px] uppercase tracking-wider text-forest/60">Safaris Led</span>
              </div>
              <div className="px-5 py-3 bg-white rounded-2xl border border-forest/15 text-center">
                <span className="block font-serif text-2xl font-bold text-forest">1%</span>
                <span className="text-[10px] uppercase tracking-wider text-forest/60">Community Pledge</span>
              </div>
            </div>
          </div>

          <div className="order-first lg:order-none rounded-3xl overflow-hidden shadow-xl border border-forest/15 aspect-square w-full">
            <img
              src="/assets/img/Founders/founder.webp"
              alt={`${FOUNDER_NAME}, Founder and Principal Naturalist`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2b. THE CO-FOUNDER — hidden for now */}
      {SHOW_COFOUNDER && (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-forest/15 aspect-square w-full">
            <img
              src="/assets/img/Founders/co-founder.png"
              alt={`${COFOUNDER_NAME}, Co-Founder`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-earth font-bold text-xs uppercase tracking-widest">
              <Users className="w-4 h-4 text-gold" />
              <span>A Note from the Co-Founder</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-forest font-bold leading-tight">
              {COFOUNDER_NAME}, Co-Founder and Wildlife Explorer
            </h2>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              Growing up in Mumbai's concrete jungle, I was always drawn to the wild. Over 13 years exploring wildlife across India and the world &mdash; forests, grasslands, wetlands and mountains &mdash; I came to understand the delicate balance of ecosystems and the people who live closest to them.
            </p>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              After nearly two decades in the corporate world, I followed a long-held dream: to connect people with nature while creating real opportunities for local communities. That dream became Shutter and Stripes.
            </p>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              I believe the true custodians of our wild spaces are the communities on the edges of the forest. Through our 1% Conservation Pledge, a portion of our revenue supports conservation and community-led projects &mdash; because conservation only succeeds when communities prosper alongside nature.
            </p>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              In a world shaped by technology, nature remains irreplaceable &mdash; and so does the wisdom of the local naturalists, trackers and guides who read pugmarks and bird calls through years in the field. The jungle is a living classroom, best experienced through the eyes of those who call it home. As co-founder, I hope our journeys inspire exploration, support conservation, and deepen our connection with the natural world. Thank you for being part of this journey.
            </p>
            <p className="text-forest font-medium">
              &mdash; {COFOUNDER_NAME}, Co-Founder
            </p>
            <p className="text-earth text-xs font-bold uppercase tracking-widest">
              Inspired by Nature, Guided by Locals
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="px-5 py-3 bg-white rounded-2xl border border-forest/15 text-center">
                <span className="block font-serif text-2xl font-bold text-forest">13+</span>
                <span className="text-[10px] uppercase tracking-wider text-forest/60">Years in the Wild</span>
              </div>
              <div className="px-5 py-3 bg-white rounded-2xl border border-forest/15 text-center">
                <span className="block font-serif text-2xl font-bold text-forest">20</span>
                <span className="text-[10px] uppercase tracking-wider text-forest/60">Years in Corporate</span>
              </div>
              <div className="px-5 py-3 bg-white rounded-2xl border border-forest/15 text-center">
                <span className="block font-serif text-2xl font-bold text-forest">1%</span>
                <span className="text-[10px] uppercase tracking-wider text-forest/60">Conservation Pledge</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 3. THE PHILOSOPHY OF THE STRIPED MONARCH */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-earth font-bold text-xs uppercase tracking-widest">
              <TreePine className="w-4 h-4 text-gold" />
              <span>Section III - The Sovereign of the Canopy</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-forest font-bold leading-tight">
              Honoring the Apex of the Forest Ecosystem
            </h2>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              To look upon a tiger in its natural habitat is an indelible human experience. Yet for decades, safari tourism has often treated the animal as an item on a checklist. We founded Shutter And Stripes to dismantle that mentality.
            </p>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              We do not treat the jungle as an amusement park. We measure a safari’s success not by the velocity of a chase, but by the understanding gained: the acoustic language of the deer's alarm call, the scent marks left upon ancient trunks, and the delicate equilibrium sustained by top predators.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end lg:pr-12">
            <div className="bg-forest rounded-3xl border border-gold/30 shadow-xl px-8 py-10 sm:px-12 sm:py-14 w-full max-w-xl">
              <img
                src="/assets/logo/nav-logo.svg"
                alt="Shutter and Stripes Emblem"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE CAMERA AS AN INSTRUMENT OF EMPATHY */}
      <section className="bg-forest text-sand py-24 mb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center space-x-2 text-gold text-xs font-bold uppercase tracking-widest mb-3">
              <Camera className="w-4 h-4" />
              <span>Section IV — Photography Philosophy</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight mb-4">
              The Camera as an Instrument of Empathy
            </h2>
            <p className="text-sand/80 text-base sm:text-lg leading-relaxed font-sans">
              Photography is our lens into conservation. We reject reckless vehicle positioning, flash strobes in twilight, and crowding around animals. We celebrate contextual storytelling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-sand/15 p-8 rounded-2xl backdrop-blur-sm">
              <span className="text-gold font-serif text-3xl font-bold block mb-2">01</span>
              <h3 className="font-serif text-xl font-bold mb-3">Context Over Close-Up</h3>
              <p className="text-sand/70 text-xs sm:text-sm leading-relaxed">
                A tiger in its majestic habitat—framing the sal forest, the mist, the riverbeds—tells a far deeper ecological story than an intrusive portrait with a cropped horizon.
              </p>
            </div>

            <div className="bg-white/5 border border-sand/15 p-8 rounded-2xl backdrop-blur-sm">
              <span className="text-gold font-serif text-3xl font-bold block mb-2">02</span>
              <h3 className="font-serif text-xl font-bold mb-3">Natural Light Exclusively</h3>
              <p className="text-sand/70 text-xs sm:text-sm leading-relaxed">
                Zero artificial flash or spotlights in core areas. We train travelers to read dawn and dusk illumination, dust scattering, and rim lighting with high-performance primes and zoom lenses.
              </p>
            </div>

            <div className="bg-white/5 border border-sand/15 p-8 rounded-2xl backdrop-blur-sm">
              <span className="text-gold font-serif text-3xl font-bold block mb-2">03</span>
              <h3 className="font-serif text-xl font-bold mb-3">Patience Over Pursuit</h3>
              <p className="text-sand/70 text-xs sm:text-sm leading-relaxed">
                Rather than burning petrol racing between zones, we study territorial movements, station ourselves silently by water bodies, and let the wild emerge naturally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE BASTIONS OF CENTRAL INDIA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 text-earth font-bold text-xs uppercase tracking-widest mb-3">
            <TreePine className="w-4 h-4 text-gold" />
            <span>Section V — Geography and Focus</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-forest font-bold leading-tight mb-4">
            Why Madhya Pradesh and Maharashtra? <span className="text-forest/60 italic font-normal text-xl sm:text-2xl">&mdash; and beyond.</span>
          </h2>
          <p className="text-forest/80 text-base leading-relaxed font-sans">
            Central India and the northern Western Ghats hold the most vital gene pool of Panthera tigris tigris in the world. By hyper-focusing on our core reserves in Madhya Pradesh and Maharashtra&mdash;and adding new regions as we do the same fieldwork&mdash;we maintain intimate relationships with local forest rangers, village eco-development committees, and certified naturalists.
          </p>
          <p className="text-forest/80 text-base leading-relaxed font-sans mt-4">
            Central India&mdash;specifically Madhya Pradesh and Maharashtra&mdash;is the world's top landscape for wild Bengal tiger tracking. By pairing ground-level research with real-time intelligence from local naturalists and tribal trackers, we bypass generic tourist routes to optimize gate selection, timing, and waterhole activity. Our central focus enables seamless multi-park expeditions across Pench, Kanha, and Tadoba via major hubs like Nagpur and Jabalpur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-forest/15 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-forest text-sand text-xs font-bold rounded-full uppercase tracking-wider">
                Madhya Pradesh
              </span>
              <h3 className="font-serif text-2xl font-bold text-forest">The Tiger State</h3>
            </div>
            <p className="text-forest/70 text-sm leading-relaxed mb-6">
              Home to nearly 800 wild tigers across Kanha's sprawling grasslands, Bandhavgarh's fortress cliffs, Pench's teak hills, and Panna's remarkable conservation revival.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Kanha', 'Bandhavgarh', 'Pench (MP)', 'Satpura', 'Panna', 'Sanjay Dubri', 'Kheoni'].map((name, i) => (
                <span key={i} className="px-3 py-1 bg-sand rounded-lg text-forest font-semibold border border-forest/10">
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-forest/15 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-earth text-sand text-xs font-bold rounded-full uppercase tracking-wider">
                Maharashtra
              </span>
              <h3 className="font-serif text-2xl font-bold text-forest">The Vidarbha Bastions</h3>
            </div>
            <p className="text-forest/70 text-sm leading-relaxed mb-6">
              From Tadoba's legendary dry deciduous valleys to the mist of Melghat and the biodiversity of the Western Ghats. A dynamic terrain of community reserves and buffer stewardship.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Tadoba', 'Pench (MH)', 'Melghat', 'Navegaon-Nagzira', 'Bor', 'Umred Karhandla'].map((name, i) => (
                <span key={i} className="px-3 py-1 bg-sand rounded-lg text-forest font-semibold border border-forest/10">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE GUILD OF LOCAL NATURALISTS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-forest/15 h-96">
            <img
              src="/assets/img/Gallary/Paw-print.webp"
              alt="Pugmarks on the forest trail"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-earth font-bold text-xs uppercase tracking-widest">
              <Users className="w-4 h-4 text-gold" />
              <span>Section VI — Community Empowerment</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-forest font-bold leading-tight">
              The Guild of Indigenous Trackers and Naturalists
            </h2>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              The true custodians of these forests are the Gond, Baiga, and Korku tribal communities whose ancestors walked beside tigers for millennia. Every safari booked through Shutter And Stripes directly enlists and compensates trained local guides and drivers.
            </p>
            <p className="text-forest/80 text-base leading-relaxed font-sans">
              They read pugmarks dried by the sun, distinguish between the distress bark of a sambar and the casual chitter of a langur, and bring the jungle alive with unwritten oral history.
            </p>
            <div className="pt-2">
              <Link
                to="/responsible-tourism"
                className="inline-flex items-center space-x-2 text-forest font-bold text-xs uppercase tracking-wider hover:text-gold transition"
              >
                <span>Read our Community Benefit Report</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ETHICAL CODE OF CONDUCT */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-sand-light p-8 sm:p-12 rounded-3xl border border-forest/15">
          <div className="max-w-2xl mb-8">
            <h2 className="font-serif text-3xl font-bold text-forest mb-2">
              The Shutter And Stripes Field Code
            </h2>
            <p className="text-forest/70 text-sm">
              Non-negotiable ethical agreements upheld on every expedition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-forest/10 space-y-2">
              <span className="font-serif text-2xl font-bold text-forest block">20m</span>
              <h4 className="font-bold text-forest text-sm">Respectful Distance</h4>
              <p className="text-forest/70 text-xs leading-relaxed">
                Vehicles always maintain a respectful distance from any moving predator, without blocking its path.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-forest/10 space-y-2">
              <span className="font-serif text-2xl font-bold text-forest block">0 dB</span>
              <h4 className="font-bold text-forest text-sm">Engine Silence</h4>
              <p className="text-forest/70 text-xs leading-relaxed">
                Engines are cut when stationary at animal sightings. Whispers only; no standing on seats.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-forest/10 space-y-2">
              <span className="font-serif text-2xl font-bold text-forest block">100%</span>
              <h4 className="font-bold text-forest text-sm">Zero Plastic Left</h4>
              <p className="text-forest/70 text-xs leading-relaxed">
                All vehicles carry metal flasks. Single-use plastics are strictly prohibited inside reserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6b. OUR CORE MISSION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-forest-deep text-sand p-8 sm:p-12 rounded-3xl border border-gold/30 max-w-4xl mx-auto text-center space-y-5">
          <span className="text-gold text-xs font-bold uppercase tracking-widest block">
            Our Core Mission
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sand">
            The Jungle is a Classroom, Not a Checklist
          </h2>
          <p className="text-sand/85 text-base leading-relaxed max-w-2xl mx-auto font-sans">
            We exist to move safari tourism away from the frenzy of ticking off sightings and toward genuine understanding &mdash; ecology, behavior, conservation, and the human communities that live beside these forests. Every journey we design teaches something, funds something, and leaves the forest quieter than we found it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center">
            <div className="p-4 bg-white/5 rounded-2xl border border-sand/15">
              <span className="block font-serif text-2xl font-bold text-gold">1%</span>
              <span className="text-[10px] uppercase tracking-wider text-sand/70">of bookings pledged to community and conservation</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-sand/15">
              <span className="block font-serif text-2xl font-bold text-gold">{YEARS_OF_EXPERIENCE}+</span>
              <span className="text-[10px] uppercase tracking-wider text-sand/70">years reading these forests</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-sand/15">
              <span className="block font-serif text-2xl font-bold text-gold">100%</span>
              <span className="text-[10px] uppercase tracking-wider text-sand/70">local guides and naturalists</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
export default OurStoryPage;
