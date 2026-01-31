import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Facebook, 
  Instagram,
  Heart,
  ExternalLink
} from 'lucide-react';

const footerLinks = {
  quickLinks: [
    { label: 'Live Alerts', href: '#alerts' },
    { label: 'Disaster Map', href: '#map' },
    { label: 'Safety Guides', href: '#discovery' },
    { label: 'Report Incident', href: '#complaint' },
  ],
  resources: [
    { label: 'Emergency Contacts', href: '#' },
    { label: 'Evacuation Routes', href: '#' },
    { label: 'Shelter Locations', href: '#map' },
    { label: 'First Aid Guide', href: '#discovery' },
  ],
  about: [
    { label: 'About Us', href: '#' },
    { label: 'Our Mission', href: '#' },
    { label: 'Partner Organizations', href: '#' },
    { label: 'Contact', href: '#' },
  ],
};

const emergencyContacts = [
  { label: 'Emergency', number: '911' },
  { label: 'Poison Control', number: '1-800-222-1222' },
  { label: 'Disaster Distress', number: '1-800-985-5990' },
];

export default function Footer() {
  return (
    <footer className="relative bg-card border-t border-border">
      {/* Emergency Banner */}
      <div className="bg-alert-red/10 border-b border-alert-red/20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {emergencyContacts.map((contact) => (
              <div key={contact.label} className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-alert-red" />
                <span className="text-muted-foreground">{contact.label}:</span>
                <a 
                  href={`tel:${contact.number.replace(/-/g, '')}`}
                  className="font-bold text-alert-red hover:underline"
                >
                  {contact.number}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-alert-red to-alert-orange flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Disaster<span className="text-alert-red">Alert</span>
                </h2>
                <p className="text-xs text-muted-foreground">Stay Safe, Stay Informed</p>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              Real-time disaster alerts, safety routes, and emergency resources. 
              We're dedicated to keeping communities safe and informed during emergencies.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-alert-red" />
                <span>123 Safety Street, Emergency City, EC 12345</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-alert-red" />
                <a href="mailto:help@disasteralert.com" className="hover:text-white transition-colors">
                  help@disasteralert.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-alert-red" />
                <a href="tel:1-800-SAFE-NOW" className="hover:text-white transition-colors">
                  1-800-SAFE-NOW
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} DisasterAlert Pro. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-alert-red/20 flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4 text-muted-foreground hover:text-alert-red" />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-alert-red/20 flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4 text-muted-foreground hover:text-alert-red" />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-alert-red/20 flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4 text-muted-foreground hover:text-alert-red" />
                </a>
              </div>

              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-alert-red fill-alert-red" />
                <span>for humanity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
