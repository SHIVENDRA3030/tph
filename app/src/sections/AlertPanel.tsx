import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { gsap } from 'gsap';
import {
  AlertTriangle,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  Bell,
  X,
  Navigation,
  Shield,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockFacilities } from '@/data/mockData';
import type { Alert, AlertSeverity, DisasterType } from '@/types';
import { cn } from '@/lib/utils';

interface AlertPanelProps {
  currentAlert?: string | null;
}

const severityConfig: Record<AlertSeverity, { color: string; bg: string; label: string }> = {
  critical: { color: 'text-alert-red', bg: 'bg-alert-red/20', label: 'CRITICAL' },
  warning: { color: 'text-alert-yellow', bg: 'bg-alert-yellow/20', label: 'WARNING' },
  info: { color: 'text-alert-blue', bg: 'bg-alert-blue/20', label: 'INFO' },
  safe: { color: 'text-alert-green', bg: 'bg-alert-green/20', label: 'SAFE' },
};


// Vercel Cache Bust: 1
export default function AlertPanel({ currentAlert }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [expandedAlert, setExpandedAlert] = useState<string | null>(currentAlert ?? null);
  const [filter, setFilter] = useState<DisasterType | 'all'>('all');
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentAlert) {
      setExpandedAlert(currentAlert);
    }
  }, [currentAlert]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedAlerts: Alert[] = (data || []).map(item => ({
          id: item.id.toString(),
          type: item.type,
          severity: item.severity,
          title: item.title,
          description: item.description,
          location: {
            lat: 0,
            lng: 0,
            address: item.location_text || 'Unknown Location' // Assuming we added location_text or address column
          },
          timestamp: new Date(item.created_at),
          instructions: item.instructions || ['Stay safe', 'Follow local authorities'],
          expiresAt: item.expires_at ? new Date(item.expires_at) : undefined
        }));
        setAlerts(formattedAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        // setLoading(false);
      }
    };

    fetchAlerts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          const newAlert = payload.new;
          setAlerts(prev => [{
            id: newAlert.id.toString(),
            type: newAlert.type,
            severity: newAlert.severity,
            title: newAlert.title,
            description: newAlert.description,
            location: {
              lat: 0,
              lng: 0,
              address: newAlert.location_text || 'Unknown Location'
            },
            timestamp: new Date(newAlert.created_at),
            instructions: newAlert.instructions || ['Stay safe', 'Follow local authorities'],
            expiresAt: newAlert.expires_at ? new Date(newAlert.expires_at) : undefined
          }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.alert-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: panelRef.current,
            start: 'top 80%',
          },
        }
      );
    }, panelRef);

    return () => ctx.revert();
  }, []);

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.type === filter);

  const toggleAlert = (id: string) => {
    setExpandedAlert(expandedAlert === id ? null : id);
  };

  const handleFindRoute = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowRouteModal(true);
  };

  // Find nearest facilities
  const nearestShelter = mockFacilities.find(f => f.type === 'shelter');
  const nearestHospital = mockFacilities.find(f => f.type === 'hospital');

  return (
    <div ref={panelRef} className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-alert-red/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-alert-red" />
              </div>
              <h2 className="text-3xl font-bold text-white">Active Alerts</h2>
            </div>
            <p className="text-muted-foreground">
              Real-time emergency notifications for your area
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground mr-2" />
            {(['all', 'flood', 'earthquake', 'fire', 'storm'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  filter === type
                    ? 'bg-alert-red text-white'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => {
            const severity = severityConfig[alert.severity];
            const isExpanded = expandedAlert === alert.id;

            return (
              <div
                key={alert.id}
                className={cn(
                  'alert-card glass rounded-2xl overflow-hidden transition-all duration-500',
                  'border-l-4',
                  alert.severity === 'critical' && 'border-alert-red',
                  alert.severity === 'warning' && 'border-alert-yellow',
                  alert.severity === 'info' && 'border-alert-blue',
                  alert.severity === 'safe' && 'border-alert-green',
                  isExpanded && 'ring-1 ring-white/10'
                )}
              >
                {/* Alert Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleAlert(alert.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', severity.bg)}>
                        <AlertTriangle className={cn('w-6 h-6', severity.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('px-2 py-0.5 rounded text-xs font-bold', severity.bg, severity.color)}>
                            {severity.label}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {alert.type.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold">{alert.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.location.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-white/10 rounded transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border animate-cinematic">
                    <div className="pt-4 space-y-4">
                      <p className="text-muted-foreground">{alert.description}</p>

                      {/* Safety Instructions */}
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-alert-green" />
                          Safety Instructions
                        </h4>
                        <ul className="space-y-2">
                          {alert.instructions.map((instruction, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-5 h-5 rounded-full bg-alert-green/20 text-alert-green flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                          size="sm"
                          className="bg-alert-red hover:bg-alert-red/90"
                          onClick={() => handleFindRoute(alert)}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Find Safe Route
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          More Info
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-alert-green/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-alert-green" />
            </div>
            <h3 className="text-white font-semibold mb-2">No Active Alerts</h3>
            <p className="text-muted-foreground">Your area is currently safe. Stay prepared!</p>
          </div>
        )}
      </div>

      {/* Route Modal */}
      {showRouteModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowRouteModal(false)}
          />
          <div className="relative glass-strong rounded-2xl w-full max-w-lg animate-cinematic">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Safe Route Options</h3>
                <button
                  onClick={() => setShowRouteModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nearest Shelter */}
                {nearestShelter && (
                  <div className="p-4 rounded-xl bg-alert-green/10 border border-alert-green/30">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-alert-green/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-alert-green" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{nearestShelter.name}</h4>
                        <p className="text-sm text-muted-foreground">{nearestShelter.location.address}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-alert-green">{nearestShelter.distance} km</span>
                          <span className="text-muted-foreground">{nearestShelter.estimatedTime} min</span>
                          <span className="text-muted-foreground">
                            {nearestShelter.occupancy}/{nearestShelter.capacity} occupied
                          </span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-alert-green hover:bg-alert-green/90">
                        Navigate
                      </Button>
                    </div>
                  </div>
                )}

                {/* Nearest Hospital */}
                {nearestHospital && (
                  <div className="p-4 rounded-xl bg-alert-blue/10 border border-alert-blue/30">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-alert-blue/20 flex items-center justify-center">
                        <Info className="w-5 h-5 text-alert-blue" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{nearestHospital.name}</h4>
                        <p className="text-sm text-muted-foreground">{nearestHospital.location.address}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-alert-blue">{nearestHospital.distance} km</span>
                          <span className="text-muted-foreground">{nearestHospital.estimatedTime} min</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-alert-blue hover:bg-alert-blue/90">
                        Navigate
                      </Button>
                    </div>
                  </div>
                )}

                {/* Route Criteria */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-white mb-3">Optimal Route Criteria</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Shortest Path', 'Low Traffic', 'Low Accident Risk', 'Minimal Time'].map((criteria) => (
                      <div key={criteria} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-alert-green" />
                        {criteria}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
