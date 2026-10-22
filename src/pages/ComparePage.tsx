import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { stateCode, stateBadgeClass } from '../lib/site';
import { 
  Scale, 
  Plus, 
  X, 
  MapPin, 
  Check, 
  ArrowRight, 
  Compass, 
  Plane, 
  Train, 
  Layers, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { destinationService } from '../services/api';
import { Destination } from '../types';
import { useToast } from '../components/common/Toast';

export const ComparePage: React.FC = () => {
  const { info } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const data = await destinationService.getAll();
        setAllDestinations(data);

        // Parse query params
        const reservesParam = searchParams.get('reserves');
        if (reservesParam) {
          const slugs = reservesParam.split(',').filter(Boolean);
          setSelectedSlugs(slugs.slice(0, 3));
        } else if (data.length >= 2) {
          // Default compare Kanha and Tadoba
          const defaultSlugs = ['kanha', 'tadoba-andhari'];
          setSelectedSlugs(defaultSlugs);
          setSearchParams({ reserves: defaultSlugs.join(',') });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const updateSelectedSlugs = (newSlugs: string[]) => {
    setSelectedSlugs(newSlugs);
    if (newSlugs.length > 0) {
      setSearchParams({ reserves: newSlugs.join(',') });
    } else {
      searchParams.delete('reserves');
      setSearchParams(searchParams);
    }
  };

  const removeSlug = (slugToRemove: string) => {
    updateSelectedSlugs(selectedSlugs.filter(s => s !== slugToRemove));
  };

  const addSlug = (slugToAdd: string) => {
    if (selectedSlugs.length >= 3) {
      info('You can compare a maximum of 3 reserves at a time.');
      return;
    }
    if (!selectedSlugs.includes(slugToAdd)) {
      updateSelectedSlugs([...selectedSlugs, slugToAdd]);
    }
  };

  const comparedDestinations = selectedSlugs
    .map(slug => allDestinations.find(d => d.slug === slug))
    .filter((d): d is Destination => Boolean(d));

  const availableToAdd = allDestinations.filter(d => !selectedSlugs.includes(d.slug));

  return (
    <div className="bg-sand min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest mb-4">
            <Scale className="w-3.5 h-3.5 text-gold" />
            <span>Ecological Comparison Matrix</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-forest font-bold tracking-tight mb-4">
            Compare Tiger Reserves Side-by-Side
          </h1>
          <p className="text-forest/80 text-base sm:text-lg leading-relaxed font-sans">
            Evaluate habitat morphology, core versus buffer zoning, transit hubs, and permit dynamics across Madhya Pradesh and Maharashtra to design your ideal wildlife itinerary.
          </p>
        </div>

        {/* Add Reserve Selector Bar */}
        {selectedSlugs.length < 3 && availableToAdd.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-forest/10 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs uppercase font-bold tracking-wider text-forest/70">
              Add Reserve to Comparison ({selectedSlugs.length}/3 selected):
            </span>
            <div className="flex items-center space-x-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addSlug(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="px-3.5 py-2 bg-sand/40 border border-forest/15 rounded-xl text-xs font-medium text-forest focus:outline-none"
              >
                <option value="" disabled>-- Select a reserve to compare --</option>
                {availableToAdd.map(d => (
                  <option key={d._id} value={d.slug}>{d.name} ({stateCode(d.state)})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-forest border-t-transparent mb-4"></div>
            <p className="font-serif text-forest">Synthesizing field data...</p>
          </div>
        ) : comparedDestinations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-forest/10">
            <Compass className="w-12 h-12 text-forest/30 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-forest mb-2">No Reserves Selected</h3>
            <p className="text-forest/70 text-sm mb-4">Please select up to 3 reserves above to begin comparing.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-forest/15 shadow-lg overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-forest/10 bg-sand/30">
                  <th className="p-6 text-left w-1/4 min-w-[200px] text-xs font-bold uppercase tracking-widest text-forest/60">
                    Reserve Feature
                  </th>
                  {comparedDestinations.map(d => (
                    <th key={d._id} className="p-6 text-left min-w-[280px] w-1/3 align-top">
                      <div className="relative">
                        <button
                          onClick={() => removeSlug(d.slug)}
                          className="absolute -top-2 -right-2 p-1 bg-sand hover:bg-forest hover:text-sand rounded-full text-forest/60 transition shadow-sm"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="h-32 rounded-xl overflow-hidden mb-3 border border-forest/10">
                          <img
                            src={d.heroImage}
                            alt={d.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white ${stateBadgeClass(d.state)}`}>
                          {d.state}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-forest mt-1.5">{d.name}</h3>
                        <p className="text-xs text-forest/70 italic line-clamp-1">{d.tagline}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10 text-xs sm:text-sm text-forest/80 font-sans">
                
                {/* State */}
                <tr>
                  <td className="p-5 font-bold text-forest bg-sand/10">State / Territory</td>
                  {comparedDestinations.map(d => (
                    <td key={d._id} className="p-5 font-medium">{d.state}</td>
                  ))}
                </tr>

                {/* Tiger Count */}
                <tr>
                  <td className="p-5 font-bold text-forest bg-sand/10">Tiger Estimate</td>
                  {comparedDestinations.map(d => (
                    <td key={d._id} className="p-5 font-serif font-bold text-base text-forest">
                      {d.tigerCount}
                    </td>
                  ))}
                </tr>

                {/* Area */}
                <tr>
                  <td className="p-5 font-bold text-forest bg-sand/10">Protected Area</td>
                  {comparedDestinations.map(d => (
                    <td key={d._id} className="p-5 font-medium">{d.areaSqKm} km²</td>
                  ))}
                </tr>

                {/* Best Season */}
                <tr>
                  <td className="p-5 font-bold text-forest bg-sand/10">Recommended Months</td>
                  {comparedDestinations.map(d => (
                    <td key={d._id} className="p-5">{d.bestTimeToVisit}</td>
                  ))}
                </tr>

                {/* Zones Count */}
                <tr>
                  <td className="p-5 font-bold text-forest bg-sand/10">Zones</td>
                  {comparedDestinations.map(d => (
                    <td key={d._id} className="p-5 space-y-2">
                      <div className="font-semibold text-forest">
                        {d.zones.length} Managed Zones
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {d.zones.map((z, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-sand border border-forest/10 font-medium">
                            {z.name} ({z.type})
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Key Wildlife */}
                <tr>
                  <td className="p-5 font-bold text-forest bg-sand/10">Fauna Highlights</td>
                  {comparedDestinations.map(d => (
                    <td key={d._id} className="p-5">
                      <div className="flex flex-wrap gap-1">
                        {d.wildlifeHighlights.map((w, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-forest/5 text-forest font-medium">
                            {w}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Transit Access */}
                <tr>
                  <td className="p-5 font-bold text-forest bg-sand/10">Transit Access</td>
                  {comparedDestinations.map(d => (
                    <td key={d._id} className="p-5 space-y-1.5 text-xs">
                      <div><strong className="text-forest">Air:</strong> {d.howToReach.air}</div>
                      <div><strong className="text-forest">Rail:</strong> {d.howToReach.rail}</div>
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr className="bg-sand/20">
                  <td className="p-5 font-bold text-forest bg-sand/30">Action</td>
                  {comparedDestinations.map(d => (
                    <td key={d._id} className="p-5 space-y-2">
                      <Link
                        to={`/booking?destination=${d.slug}`}
                        className="w-full py-2.5 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition shadow flex items-center justify-center space-x-1.5"
                      >
                        <span>Book Safari</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gold" />
                      </Link>
                      <Link
                        to={`/destinations/${d.slug}`}
                        className="w-full py-2 border border-forest/20 text-forest rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-sand transition flex items-center justify-center"
                      >
                        Full Details
                      </Link>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
export default ComparePage;
