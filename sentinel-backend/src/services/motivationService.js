/**
 * Motivation Service (Hope Avatar)
 * Provides contextual motivational content based on disaster type
 */

const { MotivationContent } = require('../models');
const { logger } = require('../config/database');

class MotivationService {
  constructor() {
    // Default content for when database is empty
    this.defaultContent = {
      general: [
        {
          type: 'quote',
          contentText: "You are stronger than you know. Every breath is a victory, every moment a chance to persevere.",
          author: "Unknown"
        },
        {
          type: 'quote',
          contentText: "The human spirit is resilient. We have survived every storm, every trial, every darkness.",
          author: "Unknown"
        },
        {
          type: 'affirmation',
          contentText: "This too shall pass. The storm will end, the waters will recede, and the sun will shine again.",
          author: "Persian Adage"
        }
      ],
      earthquake: [
        {
          type: 'story',
          title: "The Miracle of Haiti",
          contentText: "In 2010, a man survived 27 days trapped under rubble in Haiti, sustained by hope and the will to see his family again. His story reminds us that the human will to survive can overcome impossible odds.",
          heroicStoryReference: "Evan Muncie - Haiti Earthquake 2010"
        },
        {
          type: 'fact',
          contentText: "Did you know? The 1960 Chilean earthquake, the most powerful ever recorded at magnitude 9.5, showed us that preparation and community support save lives. Communities that trained together had 80% higher survival rates.",
          source: "USGS Historical Data"
        },
        {
          type: 'quote',
          contentText: "Buildings may fall, but the human spirit stands tall. Stay calm, stay safe, and remember - you are not alone in this.",
          category: 'encouragement'
        }
      ],
      flood: [
        {
          type: 'story',
          title: "The Tsunami Warning Hero",
          contentText: "During the 2004 Indian Ocean tsunami, a 10-year-old girl named Tilly Smith who had learned about tsunamis in school recognized the warning signs and warned her family and beachgoers, saving hundreds of lives. Knowledge is power.",
          heroicStoryReference: "Tilly Smith - 2004 Indian Ocean Tsunami"
        },
        {
          type: 'fact',
          contentText: "Just 6 inches of fast-flowing water can knock an adult off their feet. But remember - people have survived being swept away by staying calm and finding something to hold onto. Your calm mind is your greatest tool.",
          source: "National Weather Service"
        },
        {
          type: 'quote',
          contentText: "Water is powerful, but so are you. Stay above, stay alert, and help will come.",
          category: 'encouragement'
        }
      ],
      fire: [
        {
          type: 'story',
          title: "The Black Saturday Hero",
          contentText: "During Australia's Black Saturday bushfires in 2009, a firefighter stayed behind to protect his town, working 36 hours straight to save over 100 homes. His dedication shows us the power of courage under fire.",
          heroicStoryReference: "Unknown Firefighter - Black Saturday 2009"
        },
        {
          type: 'fact',
          contentText: "Wildfires can travel at speeds up to 14 mph, but humans can outrun them with proper warning and clear evacuation routes. Trust the system, follow instructions, and you will reach safety.",
          source: "National Interagency Fire Center"
        },
        {
          type: 'quote',
          contentText: "Fire tests gold, adversity tests the brave. You have the strength to endure this.",
          author: "Unknown"
        }
      ],
      storm: [
        {
          type: 'story',
          title: "The Human Chain of 9/11",
          contentText: "During the 9/11 attacks, a group of strangers formed a human chain to help each other down 90 floors to safety. In our darkest moments, humanity's light shines brightest.",
          heroicStoryReference: "World Trade Center Evacuation - September 11, 2001"
        },
        {
          type: 'fact',
          contentText: "Hurricane Katrina taught us that communities that support each other rebuild faster and heal deeper. You are part of a community that cares - help is on the way.",
          source: "FEMA Recovery Studies"
        },
        {
          type: 'quote',
          contentText: "Storms never last forever. Behind the darkest clouds, the sun is always shining.",
          author: "Unknown"
        }
      ],
      survival: [
        {
          type: 'story',
          title: "Juliane's Jungle Odyssey",
          contentText: "Juliane Koepcke survived a plane crash and 11 days in the Amazon rainforest, walking to safety with a broken collarbone. Her story proves that the human body can endure far more than we imagine.",
          heroicStoryReference: "Juliane Koepcke - 1971 LANSA Flight 508"
        },
        {
          type: 'fact',
          contentText: "The 'Rule of Threes' for survival: Humans can survive 3 minutes without air, 3 hours without shelter in extreme conditions, 3 days without water, and 3 weeks without food. You have time. Stay calm.",
          source: "Survival Training Manuals"
        },
        {
          type: 'quote',
          contentText: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
          author: "Mary Anne Radmacher"
        }
      ],
      heroic: [
        {
          type: 'story',
          title: "Katrina's Grocery Angel",
          contentText: "During Hurricane Katrina, a grocery store owner gave away all his food to neighbors, saying 'We're in this together.' In crisis, ordinary people become extraordinary heroes.",
          heroicStoryReference: "Unknown Store Owner - Hurricane Katrina 2005"
        },
        {
          type: 'story',
          title: "The Boat Captain",
          contentText: "During Hurricane Katrina, a boat captain and his crew rescued over 200 people from rooftops during the floods. One person with courage can save hundreds.",
          heroicStoryReference: "Hurricane Katrina Rescue Operations"
        }
      ]
    };
  }

  /**
   * Get contextual motivation content based on disaster type
   * @param {string} disasterType - Type of disaster
   * @param {string} contentType - Type of content (quote, story, fact, affirmation)
   * @returns {Object} - Motivational content
   */
  async getContextualMotivation(disasterType = 'general', contentType = null) {
    try {
      // Build query
      const whereClause = {
        isActive: true
      };

      // Map disaster type to category
      const categoryMap = {
        flood: 'flood',
        earthquake: 'earthquake',
        fire: 'fire',
        storm: 'storm',
        tsunami: 'flood',
        landslide: 'earthquake',
        accident: 'general',
        other: 'general'
      };

      const category = categoryMap[disasterType] || 'general';

      // Try to get from database first
      const dbQuery = {
        where: whereClause,
        order: sequelize.random()
      };

      // Add category filter
      if (category !== 'general') {
        dbQuery.where.category = { [sequelize.Sequelize.Op.in]: [category, 'general'] };
      }

      // Add type filter if specified
      if (contentType) {
        dbQuery.where.type = contentType;
      }

      let content = await MotivationContent.findOne(dbQuery);

      // If no content in database, use defaults
      if (!content) {
        content = this.getDefaultContent(category, contentType);
      }

      return {
        success: true,
        data: content
      };

    } catch (error) {
      logger.error('Error getting motivation content:', error);
      
      // Return default content on error
      return {
        success: true,
        data: this.getDefaultContent('general', contentType)
      };
    }
  }

  /**
   * Get multiple motivation items for rotation
   * @param {string} disasterType - Type of disaster
   * @param {number} count - Number of items to return
   * @returns {Array} - Array of motivational content
   */
  async getMotivationBatch(disasterType = 'general', count = 5) {
    try {
      const categoryMap = {
        flood: 'flood',
        earthquake: 'earthquake',
        fire: 'fire',
        storm: 'storm',
        tsunami: 'flood',
        landslide: 'earthquake',
        accident: 'general',
        other: 'general'
      };

      const category = categoryMap[disasterType] || 'general';

      // Get from database
      const contents = await MotivationContent.findAll({
        where: {
          isActive: true,
          category: { [sequelize.Sequelize.Op.in]: [category, 'general', 'survival', 'heroic'] }
        },
        order: sequelize.random(),
        limit: count
      });

      // If not enough in database, supplement with defaults
      if (contents.length < count) {
        const defaults = this.getDefaultBatch(category, count - contents.length);
        return [...contents, ...defaults];
      }

      return contents;

    } catch (error) {
      logger.error('Error getting motivation batch:', error);
      return this.getDefaultBatch('general', count);
    }
  }

  /**
   * Get default content for a category
   */
  getDefaultContent(category, type = null) {
    const categoryContent = this.defaultContent[category] || this.defaultContent.general;
    
    if (type) {
      const typed = categoryContent.filter(c => c.type === type);
      if (typed.length > 0) {
        return typed[Math.floor(Math.random() * typed.length)];
      }
    }

    return categoryContent[Math.floor(Math.random() * categoryContent.length)];
  }

  /**
   * Get default batch of content
   */
  getDefaultBatch(category, count) {
    const categoryContent = this.defaultContent[category] || this.defaultContent.general;
    const survivalContent = this.defaultContent.survival || [];
    const heroicContent = this.defaultContent.heroic || [];
    
    const allContent = [...categoryContent, ...survivalContent, ...heroicContent];
    
    // Shuffle and return requested count
    const shuffled = allContent.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Seed default motivation content into database
   */
  async seedDefaultContent() {
    try {
      const count = await MotivationContent.count();
      
      if (count > 0) {
        logger.info('Motivation content already seeded');
        return;
      }

      const contentToInsert = [];

      // Flatten default content
      for (const [category, items] of Object.entries(this.defaultContent)) {
        for (const item of items) {
          contentToInsert.push({
            category,
            type: item.type || 'quote',
            contentText: item.contentText,
            title: item.title || null,
            author: item.author || null,
            source: item.source || null,
            heroicStoryReference: item.heroicStoryReference || null,
            isActive: true
          });
        }
      }

      await MotivationContent.bulkCreate(contentToInsert);
      logger.info(`Seeded ${contentToInsert.length} motivation content items`);

    } catch (error) {
      logger.error('Error seeding motivation content:', error);
    }
  }

  /**
   * Add new motivation content
   */
  async addContent(contentData) {
    try {
      const content = await MotivationContent.create(contentData);
      return {
        success: true,
        data: content
      };
    } catch (error) {
      logger.error('Error adding motivation content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get content statistics
   */
  async getStats() {
    try {
      const total = await MotivationContent.count();
      const byCategory = await MotivationContent.findAll({
        attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['category']
      });
      const byType = await MotivationContent.findAll({
        attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['type']
      });

      return {
        success: true,
        data: {
          total,
          byCategory,
          byType
        }
      };
    } catch (error) {
      logger.error('Error getting motivation stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new MotivationService();
