import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Newspaper, 
  Clock, 
  ArrowRight, 
  TrendingUp,
  AlertTriangle,
  Shield,
  ExternalLink,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockNews } from '@/data/mockData';
import type { NewsItem, DisasterType } from '@/types';
import { cn } from '@/lib/utils';

export default function NewsFeed() {
  const [filter, setFilter] = useState<DisasterType | 'all'>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Breaking news ticker animation
      gsap.fromTo(
        '.breaking-news',
        { x: '100%' },
        {
          x: '-100%',
          duration: 30,
          ease: 'linear',
          repeat: -1,
        }
      );

      // News cards stagger animation
      gsap.fromTo(
        '.news-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const filteredNews = filter === 'all' 
    ? mockNews 
    : mockNews.filter(n => n.type === filter);

  const breakingNews = mockNews.filter(n => n.severity === 'critical' || n.severity === 'warning').slice(0, 3);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-alert-red bg-alert-red/20';
      case 'warning': return 'text-alert-yellow bg-alert-yellow/20';
      case 'safe': return 'text-alert-green bg-alert-green/20';
      default: return 'text-alert-blue bg-alert-blue/20';
    }
  };

  return (
    <div ref={sectionRef} className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-alert-blue/20 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-alert-blue" />
              </div>
              <h2 className="text-3xl font-bold text-white">Latest Updates</h2>
            </div>
            <p className="text-muted-foreground">
              Stay informed with real-time disaster news and updates
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(['all', 'flood', 'earthquake', 'fire', 'storm'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  filter === type
                    ? 'bg-alert-blue text-white'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Breaking News Ticker */}
        {breakingNews.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-xl bg-alert-red/10 border border-alert-red/30">
            <div className="flex items-center px-4 py-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-alert-red text-white text-xs font-bold flex-shrink-0">
                <TrendingUp className="w-3 h-3" />
                BREAKING
              </div>
              <div className="overflow-hidden flex-1 ml-4">
                <div className="breaking-news whitespace-nowrap">
                  {breakingNews.map((news) => (
                    <span key={news.id} className="inline-flex items-center mx-8">
                      <AlertTriangle className="w-4 h-4 text-alert-red mr-2" />
                      <span className="text-white font-medium">{news.title}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(news.publishedAt).toLocaleTimeString()}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((news) => (
            <article
              key={news.id}
              className={cn(
                'news-card glass rounded-2xl overflow-hidden card-lift cursor-pointer',
                'group'
              )}
              onClick={() => setSelectedArticle(news)}
            >
              {/* Image Placeholder */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-card to-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  {news.type === 'flood' && <div className="text-6xl">🌊</div>}
                  {news.type === 'earthquake' && <div className="text-6xl">🏚️</div>}
                  {news.type === 'fire' && <div className="text-6xl">🔥</div>}
                  {news.type === 'storm' && <div className="text-6xl">⛈️</div>}
                  {news.type === 'all' && <div className="text-6xl">📢</div>}
                  {news.type === 'accident' && <div className="text-6xl">🚑</div>}
                </div>
                
                {/* Severity Badge */}
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-bold',
                    getSeverityColor(news.severity)
                  )}>
                    {news.severity.toUpperCase()}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-white backdrop-blur-sm">
                    {news.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(news.publishedAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{news.source}</span>
                </div>

                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-alert-blue transition-colors line-clamp-2">
                  {news.title}
                </h3>

                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {news.summary}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-alert-blue font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-10">
          <Button variant="outline" className="border-white/20 hover:bg-white/10">
            Load More Updates
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedArticle(null)}
          />
          <div className="relative glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto animate-cinematic">
            {/* Header Image */}
            <div className="relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-card to-muted flex items-center justify-center">
                {selectedArticle.type === 'flood' && <div className="text-8xl">🌊</div>}
                {selectedArticle.type === 'earthquake' && <div className="text-8xl">🏚️</div>}
                {selectedArticle.type === 'fire' && <div className="text-8xl">🔥</div>}
                {selectedArticle.type === 'storm' && <div className="text-8xl">⛈️</div>}
                {selectedArticle.type === 'all' && <div className="text-8xl">📢</div>}
                {selectedArticle.type === 'accident' && <div className="text-8xl">🚑</div>}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold',
                  getSeverityColor(selectedArticle.severity)
                )}>
                  {selectedArticle.severity.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-white/10 text-white backdrop-blur-sm">
                  {selectedArticle.type.toUpperCase()}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <span className="text-white text-xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="w-4 h-4" />
                <span>{new Date(selectedArticle.publishedAt).toLocaleString()}</span>
                <span>•</span>
                <span>{selectedArticle.source}</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedArticle.title}
              </h2>

              <p className="text-lg text-muted-foreground mb-6">
                {selectedArticle.summary}
              </p>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {selectedArticle.content}
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Emergency services continue to monitor the situation closely. 
                  Residents are advised to stay tuned to official channels for updates 
                  and follow all safety instructions provided by local authorities.
                </p>
              </div>

              {/* Safety Reminder */}
              <div className="mt-8 p-4 rounded-xl bg-alert-green/10 border border-alert-green/30">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-alert-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Stay Safe</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep emergency supplies ready, have an evacuation plan, and 
                      stay informed through official channels.
                    </p>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="mt-6 flex gap-3">
                <Button className="flex-1 bg-alert-blue hover:bg-alert-blue/90">
                  Share Update
                </Button>
                <Button variant="outline" className="flex-1 border-white/20">
                  Save for Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
