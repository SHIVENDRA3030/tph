import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowDown, AlertTriangle, MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockAlerts } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  onAlertClick: (alertId: string) => void;
}

export default function HeroSection({ onAlertClick }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const alertBannerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fluid background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle system for fluid effect
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const colors = ['rgba(255, 77, 77, 0.3)', 'rgba(77, 121, 255, 0.3)', 'rgba(255, 215, 0, 0.2)'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 100 + 50,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      time += 0.005;
      ctx.fillStyle = 'rgba(26, 26, 26, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        // Update position with sine wave motion
        particle.x += particle.vx + Math.sin(time + i) * 0.3;
        particle.y += particle.vy + Math.cos(time + i) * 0.3;

        // Wrap around edges
        if (particle.x < -particle.radius) particle.x = canvas.width + particle.radius;
        if (particle.x > canvas.width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = canvas.height + particle.radius;
        if (particle.y > canvas.height + particle.radius) particle.y = -particle.radius;

        // Draw gradient blob
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }
      );

      // Subtitle animation
      gsap.fromTo(
        subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
      );

      // Alert banner animation
      gsap.fromTo(
        alertBannerRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.8 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const criticalAlert = mockAlerts.find(a => a.severity === 'critical');

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fluid Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'blur(60px)' }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-24 pb-12">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-alert-red/10 border border-alert-red/30 mb-8">
            <span className="w-2 h-2 bg-alert-red rounded-full animate-pulse" />
            <span className="text-sm text-alert-red font-medium">Live Emergency Monitoring</span>
          </div>

          {/* Main Title */}
          <h1
            ref={titleRef}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-6 leading-tight"
          >
            Stay Ahead of{' '}
            <span className="text-gradient">Disasters</span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Real-time alerts, safety routes, and emergency resources. 
            We're dedicated to keeping you and your loved ones safe when it matters most.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="bg-alert-red hover:bg-alert-red/90 text-white px-8 py-6 text-lg font-semibold btn-lift"
              onClick={() => onAlertClick(criticalAlert?.id || '1')}
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              View Active Alerts
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 hover:bg-white/10 px-8 py-6 text-lg"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Find Safe Routes
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
            {[
              { icon: AlertTriangle, value: '4', label: 'Active Alerts' },
              { icon: Shield, value: '12', label: 'Safe Shelters' },
              { icon: MapPin, value: '3.2K', label: 'Users Protected' },
              { icon: Clock, value: '<2min', label: 'Alert Time' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-5 h-5 text-alert-red" />
                  <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Banner */}
        {criticalAlert && (
          <div
            ref={alertBannerRef}
            className="max-w-4xl mx-auto"
          >
            <div
              className={cn(
                'glass rounded-2xl p-6 cursor-pointer',
                'border-l-4 border-alert-red alert-pulse-enhanced',
                'hover:bg-white/5 transition-colors'
              )}
              onClick={() => onAlertClick(criticalAlert.id)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-alert-red/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-alert-red" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 rounded bg-alert-red text-white text-xs font-bold">
                      CRITICAL
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {criticalAlert.location.zone}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg">{criticalAlert.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {criticalAlert.description}
                  </p>
                </div>
                <ArrowDown className="w-5 h-5 text-muted-foreground rotate-[-90deg] hidden sm:block" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
