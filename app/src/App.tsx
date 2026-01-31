import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import AuthModal from '@/components/AuthModal';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Navigation from '@/components/Navigation';
import HeroSection from '@/sections/HeroSection';
import AlertPanel from '@/sections/AlertPanel';
import LiveMap from '@/sections/LiveMap';
import NewsFeed from '@/sections/NewsFeed';
import DiscoveryPage from '@/sections/DiscoveryPage';
import ComplaintPage from '@/sections/ComplaintPage';
import HopeAvatar from '@/components/HopeAvatar';
import Footer from '@/components/Footer';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [currentAlert, setCurrentAlert] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // Set up scroll triggers for sections
    const sections = ['hero', 'alerts', 'map', 'news', 'discovery', 'complaint'];

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: `#${section}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSection(section),
        onEnterBack: () => setActiveSection(section),
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 noise-overlay opacity-50" />

      {/* Navigation */}
      <Navigation
        activeSection={activeSection}
        onNavigate={scrollToSection}
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <section id="hero" className="relative min-h-screen">
          <HeroSection onAlertClick={(alertId: string) => {
            setCurrentAlert(alertId);
            scrollToSection('alerts');
          }} />
        </section>

        {/* Alert Panel */}
        <section id="alerts" className="relative py-20">
          <AlertPanel currentAlert={currentAlert} />
        </section>

        {/* Live Map */}
        <section id="map" className="relative py-20">
          <LiveMap />
        </section>

        {/* News Feed */}
        <section id="news" className="relative py-20">
          <NewsFeed />
        </section>

        {/* Discovery Page */}
        <section id="discovery" className="relative py-20">
          <DiscoveryPage />
        </section>

        {/* Complaint Page */}
        <section id="complaint" className="relative py-20">
          <ComplaintPage user={user} />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Hope Avatar - Always visible */}
      <HopeAvatar />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
