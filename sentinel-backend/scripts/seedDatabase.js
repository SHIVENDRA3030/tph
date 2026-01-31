/**
 * Database Seeding Script
 * Populates database with initial data
 */

require('dotenv').config();

const { sequelize } = require('../src/config/database');
const { 
  User, 
  EmergencyService, 
  DisasterEvent, 
  AccidentHistory,
  MotivationContent,
  HistoricalEvent,
  NewsArticle
} = require('../src/models');

const seedData = {
  // Emergency Services
  emergencyServices: [
    {
      name: 'Central Community Shelter',
      type: 'shelter',
      location: { type: 'Point', coordinates: [-73.9934, 40.7505] },
      capacity: 500,
      occupancy: 320,
      contactInfo: '+1 (555) 123-4567',
      address: '123 Main Street, Downtown',
      operatingHours: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' }
      }
    },
    {
      name: 'Metropolitan General Hospital',
      type: 'hospital',
      location: { type: 'Point', coordinates: [-73.9776, 40.7614] },
      capacity: 300,
      occupancy: 245,
      contactInfo: '+1 (555) 987-6543',
      address: '456 Health Avenue',
      operatingHours: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' }
      }
    },
    {
      name: 'Station 7 - Downtown Fire Department',
      type: 'fire',
      location: { type: 'Point', coordinates: [-74.0059, 40.7282] },
      contactInfo: '+1 (555) 456-7890',
      address: '789 Firefighter Road',
      operatingHours: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' }
      }
    },
    {
      name: 'Central Police Precinct',
      type: 'police',
      location: { type: 'Point', coordinates: [-73.9855, 40.7580] },
      contactInfo: '+1 (555) 789-0123',
      address: '321 Safety Street',
      operatingHours: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' }
      }
    },
    {
      name: 'Northside Emergency Center',
      type: 'shelter',
      location: { type: 'Point', coordinates: [-73.9680, 40.7789] },
      capacity: 300,
      occupancy: 145,
      contactInfo: '+1 (555) 234-5678',
      address: '654 North Avenue',
      operatingHours: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' }
      }
    },
    {
      name: "St. Mary's Medical Center",
      type: 'hospital',
      location: { type: 'Point', coordinates: [-74.0123, 40.7023] },
      capacity: 250,
      occupancy: 180,
      contactInfo: '+1 (555) 345-6789',
      address: '987 Care Boulevard',
      operatingHours: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' }
      }
    }
  ],

  // Historical Events
  historicalEvents: [
    {
      title: 'The Great Chilean Earthquake',
      eventDate: new Date('1960-05-22'),
      location: { type: 'Point', coordinates: [-72.9333, -38.2333] },
      locationName: 'Valdivia, Chile',
      disasterType: 'earthquake',
      description: 'The most powerful earthquake ever recorded, with a magnitude of 9.5. It triggered tsunamis that affected the entire Pacific Basin.',
      impact: 'Affected over 2 million people, caused tsunamis across the Pacific, resulted in approximately 1,655 deaths.',
      casualties: 1655,
      damageEstimate: '$550 million (1960 USD)',
      lessons: [
        'Importance of building codes and seismic-resistant construction',
        'Early warning systems save lives',
        'Community preparedness and drills are crucial',
        'International cooperation in disaster response'
      ],
      heroStory: 'A young teacher organized her students to safety, saving 40 lives despite losing her own home.',
      heroName: 'Unknown Teacher',
      sources: ['USGS', 'Wikipedia', 'Chilean Government Archives']
    },
    {
      title: 'Hurricane Katrina',
      eventDate: new Date('2005-08-29'),
      location: { type: 'Point', coordinates: [-89.9345, 30.0688] },
      locationName: 'New Orleans, Louisiana, USA',
      disasterType: 'storm',
      description: 'One of the deadliest hurricanes in US history, causing catastrophic flooding due to levee failures.',
      impact: 'Over 1,800 deaths and $125 billion in damages. Displaced over 1 million people.',
      casualties: 1833,
      damageEstimate: '$125 billion',
      lessons: [
        'Evacuation planning and communication are critical',
        'Infrastructure must be resilient and well-maintained',
        'Emergency response coordination at all government levels matters',
        'Vulnerable populations need special attention'
      ],
      heroStory: 'A boat captain and his crew rescued over 200 people from rooftops during the floods.',
      heroName: 'Unknown Boat Captain',
      sources: ['FEMA', 'NOAA', 'The Katrina Report']
    },
    {
      title: 'Indian Ocean Tsunami',
      eventDate: new Date('2004-12-26'),
      location: { type: 'Point', coordinates: [95.7129, 3.5952] },
      locationName: 'Indian Ocean',
      disasterType: 'flood',
      description: 'Deadliest tsunami in recorded history, triggered by a 9.1 magnitude earthquake off the coast of Sumatra.',
      impact: 'Over 230,000 deaths across 14 countries. Millions displaced.',
      casualties: 230000,
      damageEstimate: '$15 billion',
      lessons: [
        'Tsunami warning systems are essential for coastal regions',
        'Coastal communities need evacuation plans and routes',
        'International cooperation saves lives in regional disasters',
        'Education about natural warning signs is crucial'
      ],
      heroStory: 'A 10-year-old girl who learned about tsunamis in school recognized the warning signs and warned her family and beachgoers, saving hundreds.',
      heroName: 'Tilly Smith',
      sources: ['UNESCO', 'USGS', 'National Geographic']
    },
    {
      title: 'Black Saturday Bushfires',
      eventDate: new Date('2009-02-07'),
      location: { type: 'Point', coordinates: [145.0458, -37.5622] },
      locationName: 'Victoria, Australia',
      disasterType: 'fire',
      description: 'Series of bushfires that burned across Victoria, killing 173 people and destroying thousands of structures.',
      impact: '173 deaths, over 450,000 hectares burned, 3,500 structures destroyed.',
      casualties: 173,
      damageEstimate: '$4.4 billion AUD',
      lessons: [
        '"Stay or go" decisions must be made early and definitively',
        'Fire plans and preparation save lives',
        'Community warning systems need continuous improvement',
        'Building design in fire-prone areas matters'
      ],
      heroStory: 'A firefighter stayed behind to protect his town, working 36 hours straight to save over 100 homes.',
      heroName: 'Unknown Firefighter',
      sources: ['Victorian Government', 'CFA', 'Royal Commission Report']
    }
  ],

  // Sample News Articles
  newsArticles: [
    {
      title: 'Earthquake Relief Efforts Underway in Affected Regions',
      summary: 'Emergency response teams are working around the clock to provide assistance to communities affected by yesterday\'s earthquake.',
      content: 'Emergency response teams are working around the clock to provide assistance to communities affected by yesterday\'s earthquake. Temporary shelters have been set up, and supplies are being distributed to those in need.',
      source: 'Emergency Response Center',
      sourceUrl: 'https://example.com/news/1',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      disasterType: 'earthquake',
      severity: 'warning'
    },
    {
      title: 'Flood Warning Extended for Downtown Area',
      summary: 'The National Weather Service has extended the flood warning as river levels continue to rise.',
      content: 'The National Weather Service has extended the flood warning for the downtown area as river levels continue to rise. Residents in low-lying areas should remain vigilant and consider evacuation.',
      source: 'Weather Service',
      sourceUrl: 'https://example.com/news/2',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      disasterType: 'flood',
      severity: 'critical'
    },
    {
      title: 'New Emergency Shelters Opened for Evacuees',
      summary: 'Three new emergency shelters have been opened to accommodate the growing number of evacuees.',
      content: 'Three new emergency shelters have been opened to accommodate the growing number of evacuees. Each shelter is equipped with food, water, medical supplies, and trained staff.',
      source: 'City Management',
      sourceUrl: 'https://example.com/news/3',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      disasterType: 'general',
      severity: 'safe'
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');

    // Seed Emergency Services
    console.log('Seeding emergency services...');
    for (const service of seedData.emergencyServices) {
      await EmergencyService.findOrCreate({
        where: { name: service.name },
        defaults: service
      });
    }
    console.log(`Seeded ${seedData.emergencyServices.length} emergency services`);

    // Seed Historical Events
    console.log('Seeding historical events...');
    for (const event of seedData.historicalEvents) {
      await HistoricalEvent.findOrCreate({
        where: { title: event.title },
        defaults: event
      });
    }
    console.log(`Seeded ${seedData.historicalEvents.length} historical events`);

    // Seed News Articles
    console.log('Seeding news articles...');
    for (const article of seedData.newsArticles) {
      await NewsArticle.findOrCreate({
        where: { title: article.title },
        defaults: {
          ...article,
          externalId: `seed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      });
    }
    console.log(`Seeded ${seedData.newsArticles.length} news articles`);

    // Create sample accident data for routing
    console.log('Seeding accident history...');
    const accidentLocations = [
      { lng: -73.99, lat: 40.75, severity: 7 },
      { lng: -73.98, lat: 40.76, severity: 5 },
      { lng: -74.00, lat: 40.73, severity: 8 },
      { lng: -73.97, lat: 40.77, severity: 4 },
      { lng: -74.01, lat: 40.70, severity: 6 }
    ];

    for (const acc of accidentLocations) {
      await AccidentHistory.findOrCreate({
        where: { 
          location: { type: 'Point', coordinates: [acc.lng, acc.lat] },
          occurredAt: new Date('2023-01-01')
        },
        defaults: {
          location: { type: 'Point', coordinates: [acc.lng, acc.lat] },
          severity: acc.severity,
          occurredAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          description: 'Historical accident for routing safety calculations',
          weatherConditions: 'clear',
          roadType: 'urban'
        }
      });
    }
    console.log(`Seeded ${accidentLocations.length} accident records`);

    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Database seeding error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
