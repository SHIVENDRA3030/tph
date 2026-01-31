/**
 * Disaster Monitor Service
 * Polls external APIs and triggers real-time alerts for affected users
 */

const cron = require('node-cron');
const axios = require('axios');
const { sequelize } = require('../config/database');
const { DisasterEvent, User, NewsArticle } = require('../models');
const { logger } = require('../config/database');

class DisasterMonitor {
  constructor(io) {
    this.io = io;
    this.isRunning = false;
    this.tasks = [];
    
    // API Configuration
    this.apis = {
      openWeatherMap: {
        url: 'https://api.openweathermap.org/data/2.5/onecall',
        key: process.env.OPENWEATHERMAP_API_KEY
      },
      newsApi: {
        url: 'https://newsapi.org/v2/everything',
        key: process.env.NEWSAPI_KEY
      },
      usgs: {
        url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson'
      }
    };

    // Disaster keywords for categorization
    this.disasterKeywords = {
      flood: ['flood', 'flooding', 'deluge', 'inundation'],
      earthquake: ['earthquake', 'tremor', 'seismic', 'quake'],
      fire: ['fire', 'wildfire', 'bushfire', 'blaze', 'inferno'],
      storm: ['storm', 'hurricane', 'typhoon', 'cyclone', 'tornado'],
      tsunami: ['tsunami', 'tidal wave'],
      landslide: ['landslide', 'mudslide', 'avalanche']
    };
  }

  /**
   * Start the disaster monitoring service
   */
  start() {
    if (this.isRunning) {
      logger.warn('Disaster monitor is already running');
      return;
    }

    logger.info('Starting Disaster Monitor Service...');
    this.isRunning = true;

    // Schedule tasks
    const pollInterval = process.env.ALERT_POLL_INTERVAL_MINUTES || 5;
    
    // Poll weather APIs every N minutes
    this.tasks.push(cron.schedule(`*/${pollInterval} * * * *`, () => {
      this.pollWeatherData();
    }));

    // Poll news APIs every N minutes
    this.tasks.push(cron.schedule(`*/${pollInterval} * * * *`, () => {
      this.pollNewsData();
    }));

    // Poll earthquake data every 2 minutes
    this.tasks.push(cron.schedule('*/2 * * * *', () => {
      this.pollEarthquakeData();
    }));

    // Clean up old events daily
    this.tasks.push(cron.schedule('0 0 * * *', () => {
      this.cleanupOldEvents();
    }));

    logger.info(`Disaster Monitor started with ${pollInterval} minute intervals`);
  }

  /**
   * Stop the disaster monitoring service
   */
  stop() {
    logger.info('Stopping Disaster Monitor Service...');
    this.tasks.forEach(task => task.stop());
    this.tasks = [];
    this.isRunning = false;
    logger.info('Disaster Monitor stopped');
  }

  /**
   * Poll OpenWeatherMap for severe weather alerts
   */
  async pollWeatherData() {
    try {
      logger.debug('Polling weather data...');

      // Get active users' locations
      const activeUsers = await User.findAll({
        where: { isActive: true },
        attributes: ['id', 'current_location']
      });

      // Sample locations to check (in production, check all unique locations)
      const locationsToCheck = this.getUniqueLocations(activeUsers);

      for (const location of locationsToCheck.slice(0, 5)) { // Limit to 5 locations per poll
        try {
          const response = await axios.get(this.apis.openWeatherMap.url, {
            params: {
              lat: location.lat,
              lon: location.lng,
              appid: this.apis.openWeatherMap.key,
              exclude: 'minutely,hourly,daily'
            },
            timeout: 10000
          });

          // Check for alerts in the response
          const alerts = response.data.alerts || [];
          
          for (const alert of alerts) {
            await this.processWeatherAlert(alert, location);
          }
        } catch (error) {
          logger.error(`Error fetching weather for location ${location.lat},${location.lng}:`, error.message);
        }
      }
    } catch (error) {
      logger.error('Error in pollWeatherData:', error);
    }
  }

  /**
   * Poll NewsAPI for disaster-related news
   */
  async pollNewsData() {
    try {
      logger.debug('Polling news data...');

      const disasterKeywords = Object.values(this.disasterKeywords).flat().join(' OR ');
      
      const response = await axios.get(this.apis.newsApi.url, {
        params: {
          q: `${disasterKeywords} disaster emergency`,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: this.apis.newsApi.key
        },
        timeout: 10000
      });

      const articles = response.data.articles || [];

      for (const article of articles) {
        await this.processNewsArticle(article);
      }
    } catch (error) {
      logger.error('Error in pollNewsData:', error.message);
    }
  }

  /**
   * Poll USGS for earthquake data
   */
  async pollEarthquakeData() {
    try {
      logger.debug('Polling earthquake data...');

      const response = await axios.get(this.apis.usgs.url, {
        timeout: 10000
      });

      const earthquakes = response.data.features || [];

      for (const quake of earthquakes) {
        const magnitude = quake.properties.mag;
        
        // Only process significant earthquakes (magnitude >= 5.0)
        if (magnitude >= 5.0) {
          await this.processEarthquake(quake);
        }
      }
    } catch (error) {
      logger.error('Error in pollEarthquakeData:', error.message);
    }
  }

  /**
   * Process a weather alert
   */
  async processWeatherAlert(alert, location) {
    try {
      // Determine disaster type from alert event
      const disasterType = this.categorizeDisaster(alert.event);
      const severity = this.determineSeverity(alert.event, alert.description);

      // Check if this alert already exists
      const existingEvent = await DisasterEvent.findOne({
        where: {
          externalId: alert.sender_name + alert.start,
          isActive: true
        }
      });

      if (existingEvent) {
        logger.debug('Alert already exists, skipping');
        return;
      }

      // Create new disaster event
      const event = await DisasterEvent.create({
        type: disasterType,
        severityLevel: severity,
        title: alert.event,
        description: alert.description,
        location: sequelize.fn('ST_SetSRID', 
          sequelize.fn('ST_MakePoint', location.lng, location.lat),
          4326
        ),
        impactRadiusKm: this.estimateImpactRadius(disasterType, severity),
        instructions: [alert.description],
        source: alert.sender_name,
        externalId: alert.sender_name + alert.start,
        startedAt: new Date(alert.start * 1000)
      });

      logger.info(`Created weather alert: ${alert.event}`);

      // Notify affected users
      await this.notifyAffectedUsers(event);

    } catch (error) {
      logger.error('Error processing weather alert:', error);
    }
  }

  /**
   * Process a news article
   */
  async processNewsArticle(article) {
    try {
      // Determine disaster type from content
      const disasterType = this.categorizeDisaster(article.title + ' ' + article.description);
      
      // Check if article already exists
      const existingArticle = await NewsArticle.findOne({
        where: { externalId: article.url }
      });

      if (existingArticle) {
        return;
      }

      // Create news article record
      await NewsArticle.create({
        title: article.title,
        summary: article.description,
        source: article.source.name,
        sourceUrl: article.url,
        imageUrl: article.urlToImage,
        publishedAt: new Date(article.publishedAt),
        disasterType: disasterType === 'other' ? 'general' : disasterType,
        severity: this.determineSeverityFromContent(article.title + ' ' + article.description),
        externalId: article.url
      });

      logger.debug(`Cached news article: ${article.title.substring(0, 50)}...`);

    } catch (error) {
      logger.error('Error processing news article:', error);
    }
  }

  /**
   * Process earthquake data
   */
  async processEarthquake(quake) {
    try {
      const coords = quake.geometry.coordinates;
      const magnitude = quake.properties.mag;
      const place = quake.properties.place;

      // Check if earthquake already exists
      const existingEvent = await DisasterEvent.findOne({
        where: {
          externalId: quake.id,
          isActive: true
        }
      });

      if (existingEvent) {
        return;
      }

      // Create earthquake event
      const event = await DisasterEvent.create({
        type: 'earthquake',
        severityLevel: Math.min(5, Math.ceil(magnitude)),
        title: `M${magnitude} Earthquake - ${place}`,
        description: `A magnitude ${magnitude} earthquake occurred ${place}. ` +
                    `Depth: ${coords[2]}km. ` +
                    'Drop, cover, and hold on. Be prepared for aftershocks.',
        location: sequelize.fn('ST_SetSRID',
          sequelize.fn('ST_MakePoint', coords[0], coords[1]),
          4326
        ),
        impactRadiusKm: this.estimateEarthquakeRadius(magnitude),
        instructions: [
          'Drop to the ground immediately',
          'Take cover under sturdy furniture',
          'Hold on until shaking stops',
          'Stay away from windows and glass',
          'Be prepared for aftershocks'
        ],
        source: 'USGS',
        externalId: quake.id,
        startedAt: new Date(quake.properties.time)
      });

      logger.info(`Created earthquake alert: M${magnitude} - ${place}`);

      // Notify affected users
      await this.notifyAffectedUsers(event);

    } catch (error) {
      logger.error('Error processing earthquake:', error);
    }
  }

  /**
   * Notify users within the disaster impact zone
   */
  async notifyAffectedUsers(disasterEvent) {
    try {
      const proximityKm = process.env.DISASTER_PROXIMITY_KM || 50;

      // Find users within the disaster radius
      const affectedUsers = await User.findAll({
        where: sequelize.and(
          { isActive: true },
          sequelize.where(
            sequelize.fn('ST_DWithin',
              sequelize.col('current_location::geography'),
              sequelize.fn('ST_SetSRID',
                sequelize.fn('ST_MakePoint',
                  disasterEvent.location.coordinates[0],
                  disasterEvent.location.coordinates[1]
                ),
                4326
              )::geography,
              proximityKm * 1000 // Convert to meters
            ),
            true
          )
        )
      });

      logger.info(`Found ${affectedUsers.length} users affected by disaster ${disasterEvent.id}`);

      // Prepare notification payload
      const notification = {
        type: 'DISASTER_ALERT',
        priority: disasterEvent.severityLevel >= 4 ? 'critical' : 'high',
        data: {
          disasterId: disasterEvent.id,
          type: disasterEvent.type,
          severity: disasterEvent.severityLevel,
          title: disasterEvent.title,
          description: disasterEvent.description,
          instructions: disasterEvent.instructions,
          timestamp: disasterEvent.startedAt,
          location: disasterEvent.location.coordinates
        }
      };

      // Send notifications via WebSocket
      for (const user of affectedUsers) {
        if (user.socketId) {
          this.io.to(user.socketId).emit('disaster_alert', notification);
          logger.debug(`Sent alert to user ${user.id} via socket ${user.socketId}`);
        }
      }

      // Broadcast to disaster-specific room
      this.io.emit(`disaster:${disasterEvent.type}`, notification);

    } catch (error) {
      logger.error('Error notifying affected users:', error);
    }
  }

  /**
   * Categorize disaster type from text
   */
  categorizeDisaster(text) {
    const lowerText = text.toLowerCase();
    
    for (const [type, keywords] of Object.entries(this.disasterKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return type;
        }
      }
    }
    
    return 'other';
  }

  /**
   * Determine severity level (1-5)
   */
  determineSeverity(event, description) {
    const text = (event + ' ' + description).toLowerCase();
    
    if (text.includes('extreme') || text.includes('catastrophic') || text.includes('deadly')) {
      return 5;
    }
    if (text.includes('severe') || text.includes('major') || text.includes('dangerous')) {
      return 4;
    }
    if (text.includes('moderate') || text.includes('significant')) {
      return 3;
    }
    if (text.includes('minor') || text.includes('light')) {
      return 2;
    }
    return 3; // Default to moderate
  }

  /**
   * Determine severity from content
   */
  determineSeverityFromContent(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('critical') || lowerText.includes('emergency') || lowerText.includes('deadly')) {
      return 'critical';
    }
    if (lowerText.includes('warning') || lowerText.includes('severe') || lowerText.includes('danger')) {
      return 'warning';
    }
    if (lowerText.includes('alert') || lowerText.includes('caution')) {
      return 'info';
    }
    return 'safe';
  }

  /**
   * Estimate impact radius based on disaster type and severity
   */
  estimateImpactRadius(type, severity) {
    const baseRadius = {
      flood: 10,
      earthquake: 50,
      fire: 5,
      storm: 100,
      tsunami: 200,
      landslide: 2,
      other: 10
    };

    return baseRadius[type] * severity;
  }

  /**
   * Estimate earthquake impact radius based on magnitude
   */
  estimateEarthquakeRadius(magnitude) {
    if (magnitude >= 8) return 500;
    if (magnitude >= 7) return 300;
    if (magnitude >= 6) return 150;
    if (magnitude >= 5) return 75;
    return 25;
  }

  /**
   * Get unique locations from users
   */
  getUniqueLocations(users) {
    const locationMap = new Map();
    
    for (const user of users) {
      if (user.current_location) {
        const coords = user.current_location.coordinates;
        const key = `${coords[1].toFixed(1)},${coords[0].toFixed(1)}`;
        
        if (!locationMap.has(key)) {
          locationMap.set(key, { lat: coords[1], lng: coords[0] });
        }
      }
    }

    return Array.from(locationMap.values());
  }

  /**
   * Clean up old disaster events
   */
  async cleanupOldEvents() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep 7 days of history

      const deleted = await DisasterEvent.update(
        { isActive: false },
        {
          where: {
            isActive: true,
            startedAt: { [sequelize.Sequelize.Op.lt]: cutoffDate }
          }
        }
      );

      logger.info(`Cleaned up ${deleted[0]} old disaster events`);
    } catch (error) {
      logger.error('Error cleaning up old events:', error);
    }
  }
}

module.exports = DisasterMonitor;
