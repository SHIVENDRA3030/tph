import type { Alert, NewsItem, Facility, SafetyGuide, HistoricalEvent, HopeMessage, Complaint } from '@/types';

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'flood',
    severity: 'critical',
    title: 'FLOOD WARNING: Zone 7',
    description: 'Severe flooding reported in Zone 7. Water levels rising rapidly. Immediate evacuation required.',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: 'Downtown District, Zone 7',
      zone: 'Zone 7'
    },
    timestamp: new Date(),
    instructions: [
      'Evacuate immediately to higher ground',
      'Do not walk or drive through flood waters',
      'Take essential medications and documents',
      'Follow designated evacuation routes',
      'Contact emergency services if trapped'
    ],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    type: 'earthquake',
    severity: 'warning',
    title: 'EARTHQUAKE ALERT: Magnitude 4.2',
    description: 'Moderate earthquake detected. Aftershocks possible. Stay alert and prepared.',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: 'Northern District'
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    instructions: [
      'Drop, cover, and hold on during shaking',
      'Stay away from windows and heavy furniture',
      'Have emergency kit ready',
      'Check for gas leaks and structural damage',
      'Be prepared for aftershocks'
    ]
  },
  {
    id: '3',
    type: 'fire',
    severity: 'critical',
    title: 'WILDFIRE: Eastern Ridge',
    description: 'Wildfire spreading rapidly due to strong winds. Evacuation orders in effect.',
    location: {
      lat: 40.6892,
      lng: -73.9442,
      address: 'Eastern Ridge Area'
    },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    instructions: [
      'Evacuate immediately if ordered',
      'Keep vehicle windows closed',
      'Wear N95 mask if available',
      'Stay tuned to emergency broadcasts',
      'Do not return until declared safe'
    ]
  },
  {
    id: '4',
    type: 'storm',
    severity: 'info',
    title: 'THUNDERSTORM WATCH',
    description: 'Severe thunderstorms expected this evening. Potential for hail and strong winds.',
    location: {
      lat: 40.7282,
      lng: -73.9942,
      address: 'Metropolitan Area'
    },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    instructions: [
      'Stay indoors during the storm',
      'Secure outdoor furniture',
      'Charge electronic devices',
      'Have flashlights ready',
      'Avoid using corded phones'
    ]
  }
];

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Earthquake Relief Efforts Underway',
    summary: 'Emergency teams mobilizing to assist affected communities.',
    content: 'Emergency response teams are working around the clock to provide assistance to communities affected by yesterday\'s earthquake. Temporary shelters have been set up, and supplies are being distributed.',
    type: 'earthquake',
    severity: 'warning',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    source: 'Emergency Response Center'
  },
  {
    id: '2',
    title: 'Flood Warning Extended',
    summary: 'River levels continue to rise in affected areas.',
    content: 'The National Weather Service has extended the flood warning for the downtown area as river levels continue to rise. Residents in low-lying areas should remain vigilant.',
    type: 'flood',
    severity: 'critical',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    source: 'Weather Service'
  },
  {
    id: '3',
    title: 'New Emergency Shelters Opened',
    summary: 'Additional capacity for evacuees now available.',
    content: 'Three new emergency shelters have been opened to accommodate the growing number of evacuees. Each shelter is equipped with food, water, and medical supplies.',
    type: 'all',
    severity: 'safe',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    source: 'City Management'
  },
  {
    id: '4',
    title: 'Heroic Rescue: 12 Saved from Building',
    summary: 'Firefighters rescue trapped residents from collapsed structure.',
    content: 'In a dramatic rescue operation, firefighters saved 12 people trapped in a partially collapsed building. All rescued individuals are receiving medical attention.',
    type: 'accident',
    severity: 'info',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    source: 'Fire Department'
  },
  {
    id: '5',
    title: 'Wildfire Containment Progress',
    summary: 'Fire crews making progress on Eastern Ridge fire.',
    content: 'Fire crews report 40% containment of the Eastern Ridge wildfire. Favorable weather conditions are helping efforts to control the blaze.',
    type: 'fire',
    severity: 'warning',
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    source: 'Forest Service'
  },
  {
    id: '6',
    title: 'Emergency Alert System Upgrade',
    summary: 'New features improve disaster notification speed.',
    content: 'The city has upgraded its emergency alert system with new features that improve notification speed and accuracy. Residents are encouraged to update their contact information.',
    type: 'all',
    severity: 'info',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    source: 'IT Department'
  }
];

export const mockFacilities: Facility[] = [
  {
    id: '1',
    type: 'shelter',
    name: 'Central Community Shelter',
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: '123 Main Street, Downtown'
    },
    capacity: 500,
    occupancy: 320,
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'shelter@emergency.gov'
    },
    distance: 2.1,
    estimatedTime: 8
  },
  {
    id: '2',
    type: 'hospital',
    name: 'Metropolitan General Hospital',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: '456 Health Avenue'
    },
    contact: {
      phone: '+1 (555) 987-6543',
      email: 'emergency@metrohospital.com'
    },
    distance: 3.5,
    estimatedTime: 12
  },
  {
    id: '3',
    type: 'fire_station',
    name: 'Station 7 - Downtown',
    location: {
      lat: 40.7282,
      lng: -74.0059,
      address: '789 Firefighter Road'
    },
    contact: {
      phone: '+1 (555) 456-7890'
    },
    distance: 1.8,
    estimatedTime: 6
  },
  {
    id: '4',
    type: 'police_station',
    name: 'Central Police Precinct',
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: '321 Safety Street'
    },
    contact: {
      phone: '+1 (555) 789-0123',
      email: 'dispatch@police.gov'
    },
    distance: 2.8,
    estimatedTime: 10
  },
  {
    id: '5',
    type: 'shelter',
    name: 'Northside Emergency Center',
    location: {
      lat: 40.7789,
      lng: -73.9680,
      address: '654 North Avenue'
    },
    capacity: 300,
    occupancy: 145,
    contact: {
      phone: '+1 (555) 234-5678'
    },
    distance: 4.2,
    estimatedTime: 15
  },
  {
    id: '6',
    type: 'hospital',
    name: 'St. Mary\'s Medical Center',
    location: {
      lat: 40.7023,
      lng: -74.0123,
      address: '987 Care Boulevard'
    },
    contact: {
      phone: '+1 (555) 345-6789'
    },
    distance: 5.1,
    estimatedTime: 18
  }
];

export const mockSafetyGuides: SafetyGuide[] = [
  {
    id: '1',
    type: 'earthquake',
    title: 'Earthquake Safety',
    description: 'Essential guidelines for surviving an earthquake.',
    steps: [
      'Drop to the ground immediately',
      'Take cover under sturdy furniture',
      'Hold on until shaking stops',
      'Stay away from windows and glass',
      'If outdoors, move to open area'
    ],
    dos: [
      'Have emergency kit ready',
      'Secure heavy furniture to walls',
      'Know utility shut-off locations',
      'Practice drills with family'
    ],
    donts: [
      'Do not run outside during shaking',
      'Do not use elevators',
      'Do not stand in doorways',
      'Do not light matches or candles'
    ],
    icon: 'Activity'
  },
  {
    id: '2',
    type: 'flood',
    title: 'Flood Preparedness',
    description: 'How to stay safe during flooding events.',
    steps: [
      'Move to higher ground immediately',
      'Avoid walking through flood waters',
      'Do not drive through flooded roads',
      'Follow evacuation orders promptly',
      'Stay tuned to emergency broadcasts'
    ],
    dos: [
      'Prepare emergency supply kit',
      'Know your evacuation route',
      'Keep important documents waterproof',
      'Have battery-powered radio'
    ],
    donts: [
      'Never drive through flood waters',
      'Do not touch electrical equipment',
      'Do not drink flood water',
      'Do not return until declared safe'
    ],
    icon: 'Waves'
  },
  {
    id: '3',
    type: 'fire',
    title: 'Wildfire Safety',
    description: 'Protect yourself and property from wildfires.',
    steps: [
      'Evacuate immediately when ordered',
      'Keep vehicle fuel tank full',
      'Wear protective clothing',
      'Close all windows and doors',
      'Fill containers with water'
    ],
    dos: [
      'Create defensible space around home',
      'Have fire extinguisher accessible',
      'Keep roof and gutters clean',
      'Plan multiple evacuation routes'
    ],
    donts: [
      'Do not attempt to fight large fires',
      'Do not return to evacuated areas',
      'Do not drive through smoke',
      'Do not leave windows open'
    ],
    icon: 'Flame'
  },
  {
    id: '4',
    type: 'storm',
    title: 'Severe Weather',
    description: 'Stay safe during severe storms and hurricanes.',
    steps: [
      'Seek shelter in interior room',
      'Stay away from windows',
      'Have emergency supplies ready',
      'Monitor weather updates',
      'Avoid using electrical devices'
    ],
    dos: [
      'Prepare emergency kit',
      'Secure outdoor items',
      'Charge all devices',
      'Have battery-powered radio'
    ],
    donts: [
      'Do not go outside during storm',
      'Do not use corded phones',
      'Do not bathe or shower',
      'Do not ignore warnings'
    ],
    icon: 'CloudLightning'
  }
];

export const mockHistoricalEvents: HistoricalEvent[] = [
  {
    id: '1',
    title: 'The Great Chilean Earthquake',
    date: new Date('1960-05-22'),
    location: 'Valdivia, Chile',
    type: 'earthquake',
    description: 'The most powerful earthquake ever recorded, with a magnitude of 9.5.',
    impact: 'Affected over 2 million people, caused tsunamis across the Pacific.',
    lessons: [
      'Importance of building codes',
      'Early warning systems save lives',
      'Community preparedness is crucial'
    ],
    heroStory: 'A young teacher organized her students to safety, saving 40 lives despite losing her own home.'
  },
  {
    id: '2',
    title: 'Hurricane Katrina',
    date: new Date('2005-08-29'),
    location: 'New Orleans, USA',
    type: 'storm',
    description: 'One of the deadliest hurricanes in US history, causing catastrophic flooding.',
    impact: 'Over 1,800 deaths and $125 billion in damages.',
    lessons: [
      'Evacuation planning is critical',
      'Infrastructure must be resilient',
      'Emergency response coordination matters'
    ],
    heroStory: 'A boat captain and his crew rescued over 200 people from rooftops during the floods.'
  },
  {
    id: '3',
    title: 'Indian Ocean Tsunami',
    date: new Date('2004-12-26'),
    location: 'Indian Ocean Region',
    type: 'flood',
    description: 'Deadliest tsunami in recorded history, triggered by a 9.1 magnitude earthquake.',
    impact: 'Over 230,000 deaths across 14 countries.',
    lessons: [
      'Tsunami warning systems are essential',
      'Coastal communities need evacuation plans',
      'International cooperation saves lives'
    ],
    heroStory: 'A 10-year-old girl who learned about tsunamis in school warned her family and beachgoers, saving hundreds.'
  },
  {
    id: '4',
    title: 'Black Saturday Bushfires',
    date: new Date('2009-02-07'),
    location: 'Victoria, Australia',
    type: 'fire',
    description: 'Series of bushfires that burned across Victoria, killing 173 people.',
    impact: 'Over 450,000 hectares burned, 3,500 structures destroyed.',
    lessons: [
      'Stay or go decisions must be made early',
      'Fire plans save lives',
      'Community warning systems need improvement'
    ],
    heroStory: 'A firefighter stayed behind to protect his town, working 36 hours straight to save over 100 homes.'
  }
];

export const mockHopeMessages: HopeMessage[] = [
  {
    id: '1',
    message: "You are stronger than you know. Every breath is a victory, every moment a chance to persevere.",
    story: "In 2010, a man survived 27 days trapped under rubble in Haiti, sustained by hope and the will to see his family again.",
    category: 'survival_story'
  },
  {
    id: '2',
    message: "Darkness cannot drive out darkness; only light can do that. Be the light for someone today.",
    category: 'encouragement'
  },
  {
    id: '3',
    message: "The human spirit is resilient. We have survived every storm, every trial, every darkness.",
    story: "During the 9/11 attacks, a group of strangers formed a human chain to help each other down 90 floors to safety.",
    category: 'heroic_deed'
  },
  {
    id: '4',
    message: "Hope is being able to see that there is light despite all of the darkness.",
    category: 'hope'
  },
  {
    id: '5',
    message: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
    story: "Juliane Koepcke survived a plane crash and 11 days in the Amazon rainforest, walking to safety with a broken collarbone.",
    category: 'survival_story'
  },
  {
    id: '6',
    message: "Together we are stronger. Communities that support each other rebuild faster and heal deeper.",
    category: 'encouragement'
  },
  {
    id: '7',
    message: "Never underestimate the power of a single act of kindness in a crisis.",
    story: "During Hurricane Katrina, a grocery store owner gave away all his food to neighbors, saying 'We\'re in this together.'",
    category: 'heroic_deed'
  },
  {
    id: '8',
    message: "This too shall pass. The storm will end, the waters will recede, and the sun will shine again.",
    category: 'hope'
  }
];

export const mockComplaints: Complaint[] = [
  {
    id: '1',
    type: 'hazard',
    title: 'Downed Power Line',
    description: 'Power line down on Oak Street near the intersection with 5th Avenue.',
    location: {
      lat: 40.7500,
      lng: -74.0000,
      address: 'Oak St & 5th Ave'
    },
    status: 'in_progress',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    type: 'infrastructure',
    title: 'Blocked Drainage',
    description: 'Storm drain completely blocked, causing flooding during rain.',
    location: {
      lat: 40.7600,
      lng: -73.9900,
      address: 'Main St & Broadway'
    },
    status: 'pending',
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  }
];
