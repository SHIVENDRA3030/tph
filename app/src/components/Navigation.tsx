import { useState, useEffect } from 'react';
import {
  Home,
  Bell,
  Map,
  Newspaper,
  BookOpen,
  MessageSquare,
  Menu,
  X,
  Shield,
  AlertTriangle,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  user: any;
  onAuthClick: () => void;
}

const navItems = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'discovery', label: 'Discovery', icon: BookOpen },
  { id: 'complaint', label: 'Report', icon: MessageSquare },
];

export default function Navigation({ activeSection, onNavigate, user, onAuthClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasAlert] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
          isScrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavClick('hero')}
            >
              <div className={cn(
                'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                'bg-gradient-to-br from-alert-red to-alert-orange',
                'group-hover:shadow-lg group-hover:shadow-alert-red/30'
              )}>
                <Shield className="w-5 h-5 text-white" />
                {hasAlert && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-alert-red rounded-full animate-pulse" />
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white leading-tight">
                  Disaster<span className="text-alert-red">Alert</span>
                </h1>
                <p className="text-xs text-muted-foreground">Stay Safe, Stay Informed</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'relative px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300',
                      'text-sm font-medium',
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.id === 'alerts' && hasAlert && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-alert-red rounded-full" />
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-alert-red rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Emergency Button & Mobile Menu */}
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                size="sm"
                className={cn(
                  'hidden sm:flex items-center gap-2 animate-urgent-pulse',
                  'bg-alert-red hover:bg-alert-red/90 text-white'
                )}
                onClick={() => handleNavClick('alerts')}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency</span>
              </Button>

              <Button
                variant={user ? "outline" : "default"}
                size="sm"
                className={cn(
                  'hidden sm:flex items-center gap-2',
                  user ? 'border-white/20 hover:bg-white/10' : 'bg-alert-blue hover:bg-alert-blue/90'
                )}
                onClick={onAuthClick}
              >
                {user ? (
                  <User className="w-4 h-4" />
                ) : (
                  <span>Sign In</span>
                )}
              </Button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-30 lg:hidden transition-all duration-500',
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-72 bg-card border-l border-border',
            'transform transition-transform duration-500',
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="p-6 pt-20">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300',
                      isActive
                        ? 'bg-alert-red/20 text-white border border-alert-red/30'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'alerts' && hasAlert && (
                      <span className="ml-auto w-2 h-2 bg-alert-red rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <Button
                variant="destructive"
                className="w-full bg-alert-red hover:bg-alert-red/90"
                onClick={() => handleNavClick('alerts')}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                View Emergency Alerts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
