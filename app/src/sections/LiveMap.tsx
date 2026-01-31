import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  MapPin,
  Navigation,
  Layers,
  Filter,
  Shield,
  Building2,
  Flame,
  Home,
  Car,
  Info,
  X,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockAlerts, mockFacilities } from '@/data/mockData';
import type { Facility, FacilityType } from '@/types';
import { cn } from '@/lib/utils';

// Declare global mappls object from SDK
declare global {
  interface Window {
    mappls: any;
  }
}

// MapmyIndia Map Component
const MapView = ({
  selectedFilter,
  selectedFacility,
  onFacilitySelect
}: {
  selectedFilter: FacilityType | 'all' | 'disaster';
  selectedFacility: Facility | null;
  onFacilitySelect: (facility: Facility) => void;
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Wait for SDK to load
    const initMap = () => {
      if (!window.mappls) {
        setTimeout(initMap, 100);
        return;
      }

      // Initialize the map centered on India (Delhi)
      mapRef.current = new window.mappls.Map(mapContainerRef.current, {
        center: { lat: 28.6139, lng: 77.2090 }, // New Delhi
        zoom: 10,
        zoomControl: true,
      });

      // Add markers after map loads
      mapRef.current.on('load', () => {
        addMarkers();
      });
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const addMarkers = () => {
    if (!mapRef.current || !window.mappls) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add disaster alert markers
    mockAlerts.forEach((alert) => {
      const color = alert.severity === 'critical' ? '#FF4D4D' : '#FFD700';

      const markerEl = document.createElement('div');
      markerEl.className = 'disaster-marker';
      markerEl.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 10px ${color};
        animation: pulse 2s infinite;
      `;

      const marker = new window.mappls.Marker({
        map: mapRef.current,
        position: { lat: alert.location.lat, lng: alert.location.lng },
        element: markerEl,
      });

      markersRef.current.push(marker);
    });

    // Add facility markers
    mockFacilities.forEach((facility) => {
      if (selectedFilter !== 'all' && selectedFilter !== 'disaster' && facility.type !== selectedFilter) {
        return;
      }

      let color = '#00C851';
      if (facility.type === 'hospital') color = '#4D79FF';
      if (facility.type === 'fire_station') color = '#FF8C00';
      if (facility.type === 'police_station') color = '#9B59B6';

      const isSelected = selectedFacility?.id === facility.id;

      const markerEl = document.createElement('div');
      markerEl.style.cssText = `
        width: ${isSelected ? '28px' : '20px'};
        height: ${isSelected ? '28px' : '20px'};
        background: ${color};
        border: 2px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.5)'};
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s;
      `;

      markerEl.onclick = () => onFacilitySelect(facility);

      const marker = new window.mappls.Marker({
        map: mapRef.current,
        position: { lat: facility.location.lat, lng: facility.location.lng },
        element: markerEl,
      });

      markersRef.current.push(marker);
    });
  };

  // Re-add markers when filter or selection changes
  useEffect(() => {
    if (mapRef.current && window.mappls) {
      addMarkers();
    }
  }, [selectedFilter, selectedFacility]);

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
};

export default function LiveMap() {
  const [selectedFilter, setSelectedFilter] = useState<FacilityType | 'all' | 'disaster'>('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mapRef.current,
        { rotateX: 45, opacity: 0 },
        {
          rotateX: 10,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: mapRef.current,
            start: 'top 80%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const filters = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'disaster', label: 'Disasters', icon: MapPin },
    { id: 'shelter', label: 'Shelters', icon: Home },
    { id: 'hospital', label: 'Hospitals', icon: Building2 },
    { id: 'fire_station', label: 'Fire Stations', icon: Flame },
    { id: 'police_station', label: 'Police', icon: Shield },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-alert-blue/20 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-alert-blue" />
              </div>
              <h2 className="text-3xl font-bold text-white">Live Disaster Map</h2>
            </div>
            <p className="text-muted-foreground">
              Real-time view of disasters, shelters, and emergency services
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-alert-green rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live Updates</span>
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapRef}
          className="relative rounded-2xl overflow-hidden"
          style={{
            perspective: '1000px',
            height: '600px'
          }}
        >
          {/* Filter Bar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center gap-2">
            <div className="glass rounded-xl p-2 flex flex-wrap items-center gap-1">
              <Filter className="w-4 h-4 text-muted-foreground mx-2" />
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id as typeof selectedFilter)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                      selectedFilter === filter.id
                        ? 'bg-alert-blue text-white'
                        : 'text-muted-foreground hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Canvas */}
          <div className="absolute inset-0 bg-card">
            <MapView
              selectedFilter={selectedFilter}
              selectedFacility={selectedFacility}
              onFacilitySelect={setSelectedFacility}
            />
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="glass rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-medium text-white mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-alert-red" />
                  <span>Critical Alert</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-alert-yellow" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-alert-green" />
                  <span>Shelter</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-alert-blue" />
                  <span>Hospital</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Facility Panel */}
          {selectedFacility && (
            <div className="absolute bottom-4 right-4 z-10 w-80">
              <div className="glass-strong rounded-xl p-4 animate-cinematic">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      selectedFacility.type === 'shelter' && 'bg-alert-green/20',
                      selectedFacility.type === 'hospital' && 'bg-alert-blue/20',
                      selectedFacility.type === 'fire_station' && 'bg-alert-orange/20',
                      selectedFacility.type === 'police_station' && 'bg-purple-500/20'
                    )}>
                      {selectedFacility.type === 'shelter' && <Home className="w-5 h-5 text-alert-green" />}
                      {selectedFacility.type === 'hospital' && <Building2 className="w-5 h-5 text-alert-blue" />}
                      {selectedFacility.type === 'fire_station' && <Flame className="w-5 h-5 text-alert-orange" />}
                      {selectedFacility.type === 'police_station' && <Shield className="w-5 h-5 text-purple-400" />}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{selectedFacility.name}</h4>
                      <p className="text-xs text-muted-foreground">{selectedFacility.type.replace('_', ' ').toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFacility(null)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{selectedFacility.location.address}</p>

                  {selectedFacility.capacity && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="text-white">
                        {selectedFacility.occupancy}/{selectedFacility.capacity}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="text-white">{selectedFacility.distance} km</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Est. Time</span>
                    <span className="text-white">{selectedFacility.estimatedTime} min</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <a
                      href={`tel:${selectedFacility.contact.phone}`}
                      className="text-alert-blue hover:underline"
                    >
                      {selectedFacility.contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    className="flex-1 bg-alert-blue hover:bg-alert-blue/90"
                    onClick={() => setShowRoutePanel(true)}
                  >
                    <Route className="w-4 h-4 mr-2" />
                    Get Route
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/20"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Route Optimization Info */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Route, label: 'Shortest Path', value: 'Optimized' },
            { icon: Car, label: 'Traffic', value: 'Low' },
            { icon: Shield, label: 'Safety Score', value: 'High' },
            { icon: Navigation, label: 'Est. Time', value: '12 min' },
          ].map((item, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-alert-blue/20 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-alert-blue" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-white font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Panel Modal */}
      {showRoutePanel && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowRoutePanel(false)}
          />
          <div className="relative glass-strong rounded-2xl w-full max-w-lg animate-cinematic">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Optimal Route</h3>
                <button
                  onClick={() => setShowRoutePanel(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Route Summary */}
                <div className="p-4 rounded-xl bg-alert-blue/10 border border-alert-blue/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-alert-blue/20 flex items-center justify-center">
                      <Navigation className="w-6 h-6 text-alert-blue" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{selectedFacility.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedFacility.location.address}</p>
                    </div>
                  </div>
                </div>

                {/* Route Criteria */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Route Optimization</h4>

                  {[
                    { label: 'Distance', value: `${selectedFacility.distance} km`, optimal: true },
                    { label: 'Traffic Level', value: 'Low', optimal: true },
                    { label: 'Accident Risk', value: 'Minimal', optimal: true },
                    { label: 'Estimated Time', value: `${selectedFacility.estimatedTime} minutes`, optimal: true },
                  ].map((criteria, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-sm text-muted-foreground">{criteria.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{criteria.value}</span>
                        {criteria.optimal && (
                          <div className="w-5 h-5 rounded-full bg-alert-green/20 flex items-center justify-center">
                            <Shield className="w-3 h-3 text-alert-green" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-alert-blue hover:bg-alert-blue/90">
                    <Navigation className="w-4 h-4 mr-2" />
                    Start Navigation
                  </Button>
                  <Button variant="outline" className="flex-1 border-white/20">
                    <Car className="w-4 h-4 mr-2" />
                    Share Route
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
