import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  BookOpen, 
  Shield, 
  AlertTriangle, 
  Waves, 
  Activity, 
  Flame, 
  CloudLightning,
  Check,
  X,
  History,
  Heart,
  ChevronRight,
  Lightbulb,
  Users
} from 'lucide-react';
import { mockSafetyGuides, mockHistoricalEvents } from '@/data/mockData';
import type { SafetyGuide, HistoricalEvent, DisasterType } from '@/types';
import { cn } from '@/lib/utils';

const disasterIcons: Record<DisasterType, React.ElementType> = {
  flood: Waves,
  earthquake: Activity,
  fire: Flame,
  storm: CloudLightning,
  accident: AlertTriangle,
  all: Shield,
};

export default function DiscoveryPage() {
  const [selectedGuide, setSelectedGuide] = useState<SafetyGuide | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'guides' | 'history'>('guides');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards animation
      gsap.fromTo(
        '.guide-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // History cards animation
      gsap.fromTo(
        '.history-card',
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.history-section',
            start: 'top 70%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-alert-green/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-alert-green" />
            </div>
            <h2 className="text-3xl font-bold text-white">Discovery & Safety</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn how to protect yourself and your loved ones during emergencies. 
            Knowledge is your best defense against disasters.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab('guides')}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2',
              activeTab === 'guides'
                ? 'bg-alert-green text-white'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            )}
          >
            <Shield className="w-5 h-5" />
            Safety Guides
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2',
              activeTab === 'history'
                ? 'bg-alert-green text-white'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            )}
          >
            <History className="w-5 h-5" />
            Historical Events
          </button>
        </div>

        {/* Safety Guides */}
        {activeTab === 'guides' && (
          <div className="space-y-8">
            {/* Guide Cards - Accordion Style */}
            <div className="flex flex-col lg:flex-row gap-4">
              {mockSafetyGuides.map((guide) => {
                const Icon = disasterIcons[guide.type];
                const isSelected = selectedGuide?.id === guide.id;

                return (
                  <div
                    key={guide.id}
                    className={cn(
                      'guide-card glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-500',
                      'lg:flex-1',
                      isSelected && 'lg:flex-[3]'
                    )}
                    onClick={() => setSelectedGuide(isSelected ? null : guide)}
                  >
                    {/* Card Header */}
                    <div className={cn(
                      'p-6 transition-colors',
                      isSelected ? 'bg-alert-green/20' : 'hover:bg-white/5'
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                          guide.type === 'earthquake' && 'bg-alert-yellow/20',
                          guide.type === 'flood' && 'bg-alert-blue/20',
                          guide.type === 'fire' && 'bg-alert-red/20',
                          guide.type === 'storm' && 'bg-purple-500/20'
                        )}>
                          <Icon className={cn(
                            'w-6 h-6',
                            guide.type === 'earthquake' && 'text-alert-yellow',
                            guide.type === 'flood' && 'text-alert-blue',
                            guide.type === 'fire' && 'text-alert-red',
                            guide.type === 'storm' && 'text-purple-400'
                          )} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{guide.title}</h3>
                          <p className="text-sm text-muted-foreground">{guide.description}</p>
                        </div>
                        <ChevronRight className={cn(
                          'w-5 h-5 text-muted-foreground transition-transform',
                          isSelected && 'rotate-90'
                        )} />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isSelected && (
                      <div className="px-6 pb-6 border-t border-border animate-cinematic">
                        {/* Steps */}
                        <div className="mt-4">
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-alert-green" />
                            Emergency Steps
                          </h4>
                          <ol className="space-y-2">
                            {guide.steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="w-6 h-6 rounded-full bg-alert-green/20 text-alert-green flex items-center justify-center text-xs flex-shrink-0">
                                  {i + 1}
                                </span>
                                <span className="text-muted-foreground">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Do's and Don'ts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <Check className="w-4 h-4 text-alert-green" />
                              Do's
                            </h4>
                            <ul className="space-y-2">
                              {guide.dos.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Check className="w-4 h-4 text-alert-green flex-shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <X className="w-4 h-4 text-alert-red" />
                              Don'ts
                            </h4>
                            <ul className="space-y-2">
                              {guide.donts.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <X className="w-4 h-4 text-alert-red flex-shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Prevention Tips */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-alert-yellow" />
                General Prevention Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Emergency Kit',
                    description: 'Keep a kit with water, food, medications, and important documents.',
                    icon: Shield,
                  },
                  {
                    title: 'Family Plan',
                    description: 'Have a communication plan and meeting point for your family.',
                    icon: Users,
                  },
                  {
                    title: 'Stay Informed',
                    description: 'Monitor local news and weather alerts regularly.',
                    icon: Activity,
                  },
                ].map((tip, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <tip.icon className="w-8 h-8 text-alert-blue mb-3" />
                    <h4 className="text-white font-medium mb-2">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historical Events */}
        {activeTab === 'history' && (
          <div className="history-section space-y-6">
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
              Learning from past disasters helps us prepare for the future. 
              These stories of resilience and heroism inspire us to stay strong.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockHistoricalEvents.map((event) => {
                const Icon = disasterIcons[event.type];

                return (
                  <div
                    key={event.id}
                    className="history-card glass rounded-2xl overflow-hidden card-lift cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                          event.type === 'earthquake' && 'bg-alert-yellow/20',
                          event.type === 'flood' && 'bg-alert-blue/20',
                          event.type === 'fire' && 'bg-alert-red/20',
                          event.type === 'storm' && 'bg-purple-500/20'
                        )}>
                          <Icon className={cn(
                            'w-7 h-7',
                            event.type === 'earthquake' && 'text-alert-yellow',
                            event.type === 'flood' && 'text-alert-blue',
                            event.type === 'fire' && 'text-alert-red',
                            event.type === 'storm' && 'text-purple-400'
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{event.location}</span>
                          </div>
                          <h3 className="text-white font-semibold text-lg mb-2">{event.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
                        </div>
                      </div>

                      {/* Impact & Lessons */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-alert-yellow flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">{event.impact}</p>
                        </div>
                        
                        {event.heroStory && (
                          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-alert-green/10">
                            <Heart className="w-4 h-4 text-alert-green flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground">{event.heroStory}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto animate-cinematic">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={cn(
                  'w-16 h-16 rounded-xl flex items-center justify-center',
                  selectedEvent.type === 'earthquake' && 'bg-alert-yellow/20',
                  selectedEvent.type === 'flood' && 'bg-alert-blue/20',
                  selectedEvent.type === 'fire' && 'bg-alert-red/20',
                  selectedEvent.type === 'storm' && 'bg-purple-500/20'
                )}>
                  {(() => {
                    const Icon = disasterIcons[selectedEvent.type];
                    return <Icon className={cn(
                      'w-8 h-8',
                      selectedEvent.type === 'earthquake' && 'text-alert-yellow',
                      selectedEvent.type === 'flood' && 'text-alert-blue',
                      selectedEvent.type === 'fire' && 'text-alert-red',
                      selectedEvent.type === 'storm' && 'text-purple-400'
                    )} />;
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{selectedEvent.location}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Impact</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedEvent.impact}</p>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-alert-yellow" />
                    Key Lessons Learned
                  </h3>
                  <ul className="space-y-2">
                    {selectedEvent.lessons.map((lesson, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-alert-yellow/20 text-alert-yellow flex items-center justify-center text-xs flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedEvent.heroStory && (
                  <div className="p-4 rounded-xl bg-alert-green/10 border border-alert-green/30">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-alert-green" />
                      Hero Story
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedEvent.heroStory}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
