import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Destination } from '../../types';
import type { FeatureCollection } from 'geojson';
import { Compass, ArrowRight, Star } from 'lucide-react';
import { MAP_LABEL, stateCode, isCoreState, isPrimeZone, BOOKINGS_EMAIL, reserveKind, RESERVE_KIND_COLOR, durationText, escapeHtml } from '../../lib/site';

interface ReserveMapProps {
  destinations: Destination[];
  activeFilter: string;
  onFilterChange: (state: string) => void;
  selectedSlug?: string;
  onSelectDestination?: (dest: Destination) => void;
}

// State boundaries are static; fetch once per session and share across mounts.
let statesGeoPromise: Promise<FeatureCollection> | null = null;
const loadStatesGeo = (): Promise<FeatureCollection> => {
  if (!statesGeoPromise) {
    statesGeoPromise = fetch('/assets/geo/india-states.geojson')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`states geojson ${res.status}`))))
      .catch(err => {
        statesGeoPromise = null; // allow a retry on the next mount
        throw err;
      });
  }
  return statesGeoPromise;
};

export const ReserveMap: React.FC<ReserveMapProps> = ({ 
  destinations, 
  activeFilter,
  onFilterChange,
  selectedSlug, 
  onSelectDestination 
}) => {
  const [activeDest, setActiveDest] = useState<Destination | null>(null);
  const [statesGeo, setStatesGeo] = useState<FeatureCollection | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const boundaryRef = useRef<L.GeoJSON | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Toggle/legend states, core states first. Derived from data, never hardcoded.
  const states = useMemo(
    () => [...new Set(destinations.map(d => d.state))].sort(
      (a, b) => Number(isCoreState(b)) - Number(isCoreState(a)) || a.localeCompare(b)
    ),
    [destinations]
  );

  const filtered = useMemo(
    () => destinations.filter(d => activeFilter === 'All' || d.state === activeFilter),
    [destinations, activeFilter]
  );

  useEffect(() => {
    if (activeFilter !== 'All' && !states.includes(activeFilter)) {
      onFilterChange('All');
    }
  }, [states, activeFilter]);

  // Create the map once. OpenStreetMap tiles, no API key.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [21.5, 79.0],
      zoom: 6,
      scrollWheelZoom: false,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 12,
      attribution: 'and OpenStreetMap contributors',
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Container is hidden until layout settles; Leaflet needs a nudge.
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 120);
    return () => clearTimeout(t);
  }, []);

  // Load the static state-boundary polygons once; a failure just means no borders.
  useEffect(() => {
    let cancelled = false;
    loadStatesGeo()
      .then(geo => { if (!cancelled) setStatesGeo(geo); })
      .catch(err => console.error('Failed to load state boundaries', err));
    return () => { cancelled = true; };
  }, []);

  // Outline each state currently in view, under the markers, so the two states read apart.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !statesGeo) return;

    const wanted = new Set(filtered.map(d => d.state));
    const features = statesGeo.features.filter(
      f => wanted.has((f.properties as { name?: string } | null)?.name ?? '')
    );

    const layer = L.geoJSON({ type: 'FeatureCollection', features } as FeatureCollection, {
      interactive: false,
      style: () => ({
        color: '#8A8478',
        weight: 1.5,
        opacity: 0.7,
        dashArray: '6 5',
        fillColor: '#8A8478',
        fillOpacity: 0.05,
      }),
    }).addTo(map);
    layer.bringToBack();
    boundaryRef.current = layer;

    return () => {
      map.removeLayer(layer);
      if (boundaryRef.current === layer) boundaryRef.current = null;
    };
  }, [statesGeo, filtered]);

  // Draw markers for whatever is currently visible.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    for (const dest of filtered) {
      const { lat, lng } = dest.coordinates;
      const isSelected = activeDest?.slug === dest.slug;
      const kind = reserveKind(dest.name);

      const marker = L.circleMarker([lat, lng], {
        radius: isSelected ? 12 : 8,
        color: '#202918',
        weight: 2,
        fillColor: isSelected ? '#D4A35B' : RESERVE_KIND_COLOR[kind],
        fillOpacity: 0.95,
      }).addTo(layer);

      marker.bindTooltip(
        `<strong>${escapeHtml(dest.name)}</strong><br/><span style="font-size:11px;opacity:.75">${escapeHtml(kind)} · ${escapeHtml(dest.state)}</span>`,
        { direction: 'top', offset: [0, -6] }
      );

      marker.bindPopup(
        `<div class="text-sand text-xs leading-relaxed">
          <strong class="font-serif text-sm">${escapeHtml(dest.name)}</strong><br/>
          ${escapeHtml(dest.tagline)}<br/>
          <span style="opacity:.7">Custom journeys — share your dates for a quote</span>
        </div>`,
        { className: 'custom-map-popup' }
      );

      marker.on('click', () => {
        setActiveDest(dest);
        if (onSelectDestination) onSelectDestination(dest);
      });
    }

    if (filtered.length > 1) {
      const bounds = L.latLngBounds(filtered.map(d => [d.coordinates.lat, d.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [filtered, activeDest, onSelectDestination]);

  useEffect(() => {
    if (selectedSlug && destinations.length > 0) {
      const found = destinations.find(d => d.slug === selectedSlug);
      if (found) setActiveDest(found);
    } else if (destinations.length > 0 && !activeDest) {
      setActiveDest(destinations[0]);
    }
  }, [selectedSlug, destinations]);

  // Pan to whatever got selected from outside the map (sidebar / list click).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeDest) return;
    map.flyTo([activeDest.coordinates.lat, activeDest.coordinates.lng], Math.max(map.getZoom(), 7), { duration: 0.6 });
  }, [activeDest?.slug]);

  const primeZones = activeDest ? activeDest.zones.filter(isPrimeZone) : [];

  return (
    <div className="bg-forest-deep text-sand rounded-2xl overflow-hidden border-2 border-forest/40 shadow-2xl isolate">
      {/* Map Control Bar */}
      <div className="p-4 sm:p-6 bg-forest border-b border-sand/15 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest-safari text-gold font-bold">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>Topographic Survey Sheet</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-sand mt-0.5">
            {MAP_LABEL}
          </h3>
          <p className="text-xs text-sand/70">
            Click any reserve marker to view territory details, prime zones, and rates.
          </p>
        </div>

        {/* State Toggle — one map per state, plus the whole network. Derived from data. */}
        <div className="flex flex-wrap items-center bg-forest-deep/80 p-1 rounded-lg border border-sand/15 text-xs" role="tablist" aria-label="Select reserve map">
          <button
            role="tab"
            aria-selected={activeFilter === 'All'}
            onClick={() => onFilterChange('All')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeFilter === 'All'
                ? 'bg-gold text-forest font-bold shadow-sm'
                : 'text-sand/80 hover:text-sand hover:bg-forest/50'
            }`}
          >
            All ({destinations.length})
          </button>
          {states.map(state => (
            <button
              key={state}
              role="tab"
              aria-selected={activeFilter === state}
              onClick={() => onFilterChange(state)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeFilter === state
                  ? 'bg-gold text-forest font-bold shadow-sm'
                  : 'text-sand/80 hover:text-sand hover:bg-forest/50'
              }`}
            >
              {isCoreState(state) && <Star className="w-3 h-3 text-gold" />}
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Visual Map + Active Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        
        {/* Real Leaflet Map */}
        <div className="lg:col-span-8 relative border-r border-sand/10">
          <div ref={containerRef} className="w-full h-full min-h-[560px]" />

          {/* Map Legend — designation colour key, generated from the markers actually shown */}
          <div className="absolute bottom-6 left-3 z-[500] bg-forest-deep/90 backdrop-blur-md px-3 py-2 rounded-md border border-sand/15 text-[11px] flex items-center gap-4 text-sand/80 max-w-[calc(100%-1.5rem)] flex-wrap pointer-events-none">
            {[...new Set(filtered.map(d => reserveKind(d.name)))].map(kind => (
              <div key={kind} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: RESERVE_KIND_COLOR[kind] }} />
                <span>{kind} ({filtered.filter(d => reserveKind(d.name) === kind).length})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Reserve Detail Preview Drawer */}
        <div className="lg:col-span-4 bg-forest p-6 flex flex-col justify-between">
          {activeDest ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Photo Banner */}
              <div className="relative h-44 rounded-xl overflow-hidden border border-sand/20 group">
                <img 
                  src={activeDest.heroImage} 
                  alt={activeDest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-forest-deep/85 text-sand">
                    {activeDest.state} ({stateCode(activeDest.state)})
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-forest"
                    style={{ backgroundColor: RESERVE_KIND_COLOR[reserveKind(activeDest.name)] }}
                  >
                    {reserveKind(activeDest.name)}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] text-gold uppercase tracking-wider block font-semibold">
                    {activeDest.tagline}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-sand leading-snug">
                    {activeDest.name}
                  </h4>
                </div>
              </div>

              {/* Reserve Quick Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-forest-deep/60 p-2.5 rounded border border-sand/10">
                  <span className="text-sand/60 block text-[10px]">HEADLINE SPECIES</span>
                  <strong className="text-gold font-serif">{activeDest.headlineSpecies || activeDest.tigerCount}</strong>
                </div>
                <div className="bg-forest-deep/60 p-2.5 rounded border border-sand/10">
                  <span className="text-sand/60 block text-[10px]">TERRITORY</span>
                  <strong className="text-gold font-serif">{activeDest.areaSqKm} km²</strong>
                </div>
              </div>

              {/* Short Narrative */}
              <p className="text-xs text-sand/80 leading-relaxed line-clamp-3">
                {activeDest.shortDesc}
              </p>

              {/* Prime Zones */}
              {primeZones.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] text-gold uppercase font-bold tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3" /> Prime Zones ({primeZones.length})
                  </span>
                  <div className="space-y-1">
                    {primeZones.slice(0, 4).map(z => (
                      <div key={z.name} className="bg-forest-deep/50 px-2.5 py-1.5 rounded border border-sand/10">
                        <span className="text-sand font-medium">{z.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard trip length — permits/vehicle/guide are bundled in. */}
              <div className="pt-3 border-t border-sand/10">
                <span className="text-[10px] text-sand/60 block">Standard Trip</span>
                <span className="font-serif text-base text-gold font-bold">
                  {durationText(activeDest.packageDuration)}
                </span>
                <span className="text-[10px] text-sand/50 block">Permits, vehicle & guide included</span>
                <Link
                  to={`/destinations/${activeDest.slug}`}
                  className="text-[11px] text-sand/70 hover:text-gold underline underline-offset-2 mt-1 inline-block"
                >
                  View full inclusions
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/destinations/${activeDest.slug}`}
                  className="flex-1 text-center py-2.5 px-3 bg-sand text-forest font-semibold rounded text-xs hover:bg-gold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explore Reserve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/booking?destination=${activeDest.slug}`}
                  className="flex-1 text-center py-2.5 px-3 bg-gold text-forest font-bold rounded text-xs hover:bg-gold-light transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Book Safari</span>
                </Link>
              </div>

              <a
                href={`mailto:${BOOKINGS_EMAIL}?subject=${encodeURIComponent(`Journey Enquiry — ${activeDest.name}`)}&body=${encodeURIComponent(`Reserve: ${activeDest.name} (${activeDest.state})\n\nI'd like to discuss:\n`)}`}
                className="pt-3 border-t border-sand/10 text-center text-[11px] text-sand/70 hover:text-gold transition"
              >
                Prefer email? Enquire about this reserve →
              </a>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-sand/60 text-xs">
              Select a reserve pin on the map to inspect territory details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
