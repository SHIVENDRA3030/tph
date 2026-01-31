import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Sparkles, Quote, ChevronRight } from 'lucide-react';
import { mockHopeMessages } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function HopeAvatar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showStory, setShowStory] = useState(false);

  const currentMessage = mockHopeMessages[currentMessageIndex];

  const typeMessage = useCallback((text: string) => {
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    
    const typeChar = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
        setTimeout(typeChar, 30);
      } else {
        setIsTyping(false);
      }
    };
    
    typeChar();
  }, []);

  useEffect(() => {
    if (isExpanded) {
      typeMessage(currentMessage.message);
    }
  }, [isExpanded, currentMessage, typeMessage]);

  useEffect(() => {
    // Rotate messages every 30 seconds when expanded
    if (isExpanded) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % mockHopeMessages.length);
        setShowStory(false);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isExpanded]);

  const handleNextMessage = () => {
    setCurrentMessageIndex((prev) => (prev + 1) % mockHopeMessages.length);
    setShowStory(false);
  };

  const toggleStory = () => {
    setShowStory(!showStory);
  };

  return (
    <>
      {/* Collapsed State - Floating Orb */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-16 h-16 rounded-full',
            'bg-gradient-to-br from-alert-yellow/30 to-alert-yellow/10',
            'border border-alert-yellow/30',
            'flex items-center justify-center',
            'animate-float animate-heartbeat',
            'hover:scale-110 transition-transform duration-300',
            'group'
          )}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-alert-yellow/20 blur-xl animate-pulse" />
          
          {/* Inner orb */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-alert-yellow to-orange-400 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 px-3 py-2 bg-card border border-border rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm text-white">Need encouragement?</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-card border-t border-r border-border rotate-45" />
          </div>
        </button>
      )}

      {/* Expanded State - Full Card */}
      {isExpanded && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-96 max-w-[calc(100vw-3rem)]',
            'animate-cinematic'
          )}
        >
          <div className="glass-strong rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="relative px-6 py-4 bg-gradient-to-r from-alert-yellow/20 to-orange-500/20 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-alert-yellow to-orange-400 flex items-center justify-center animate-heartbeat">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Hope Companion</h3>
                    <p className="text-xs text-muted-foreground">Here to inspire you</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              {/* Decorative glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-alert-yellow/20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Quote */}
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-alert-yellow/30" />
                <p className="text-white text-lg leading-relaxed pl-4 min-h-[80px]">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-block w-0.5 h-5 bg-alert-yellow ml-1 animate-pulse" />
                  )}
                </p>
              </div>

              {/* Story Section */}
              {currentMessage.story && (
                <div>
                  <button
                    onClick={toggleStory}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl text-left transition-all duration-300',
                      'bg-alert-yellow/10 border border-alert-yellow/20',
                      'hover:bg-alert-yellow/20'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-alert-yellow">
                        {showStory ? 'Hide Story' : 'Read Hero Story'}
                      </span>
                      <ChevronRight 
                        className={cn(
                          'w-4 h-4 text-alert-yellow transition-transform',
                          showStory && 'rotate-90'
                        )} 
                      />
                    </div>
                  </button>
                  
                  {showStory && (
                    <div className="mt-3 p-4 bg-card rounded-xl border border-border animate-cinematic">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {currentMessage.story}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Category Badge */}
              <div className="flex items-center justify-between">
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  currentMessage.category === 'survival_story' && 'bg-green-500/20 text-green-400',
                  currentMessage.category === 'encouragement' && 'bg-blue-500/20 text-blue-400',
                  currentMessage.category === 'heroic_deed' && 'bg-purple-500/20 text-purple-400',
                  currentMessage.category === 'hope' && 'bg-alert-yellow/20 text-alert-yellow'
                )}>
                  {currentMessage.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>

                {/* Navigation */}
                <button
                  onClick={handleNextMessage}
                  disabled={isTyping}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg',
                    'bg-white/5 hover:bg-white/10',
                    'text-sm text-white transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-white/5 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Remember: You are stronger than any storm
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
