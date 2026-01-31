// Disaster Alert System Types

export type DisasterType = 'flood' | 'earthquake' | 'fire' | 'storm' | 'accident' | 'all';
export type AlertSeverity = 'critical' | 'warning' | 'info' | 'safe';
export type FacilityType = 'shelter' | 'hospital' | 'fire_station' | 'police_station';

export interface Alert {
  id: string;
  type: DisasterType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    zone?: string;
  };
  timestamp: Date;
  instructions: string[];
  expiresAt?: Date;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image?: string;
  type: DisasterType;
  severity: AlertSeverity;
  publishedAt: Date;
  source: string;
}

export interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  capacity?: number;
  occupancy?: number;
  contact: {
    phone: string;
    email?: string;
  };
  distance?: number;
  estimatedTime?: number;
}

export interface Route {
  id: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  distance: number;
  estimatedTime: number;
  trafficLevel: 'low' | 'medium' | 'high';
  safetyScore: number;
  path: { lat: number; lng: number }[];
}

export interface SafetyGuide {
  id: string;
  type: DisasterType;
  title: string;
  description: string;
  steps: string[];
  dos: string[];
  donts: string[];
  icon: string;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  type: DisasterType;
  description: string;
  impact: string;
  lessons: string[];
  heroStory?: string;
}

export interface Complaint {
  id: string;
  type: 'emergency' | 'hazard' | 'infrastructure' | 'other';
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  contact?: {
    name: string;
    phone: string;
    email?: string;
  };
  images?: string[];
  status: 'pending' | 'in_progress' | 'resolved';
  submittedAt: Date;
}

export interface HopeMessage {
  id: string;
  message: string;
  story?: string;
  author?: string;
  category: 'encouragement' | 'survival_story' | 'heroic_deed' | 'hope';
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  alert?: string;
}
