/**
 * Feed Controller
 * Handles news feed and discovery content
 */

const { NewsArticle, HistoricalEvent } = require('../models');
const { logger } = require('../config/database');
const { Op } = require('sequelize');

class FeedController {
  /**
   * Get aggregated disaster news
   * GET /feed/news
   */
  async getNews(req, res) {
    try {
      const {
        type,
        severity,
        limit = 20,
        offset = 0,
        search,
        startDate,
        endDate
      } = req.query;

      const whereClause = {
        isActive: true
      };

      // Filter by disaster type
      if (type) {
        whereClause.disasterType = type;
      }

      // Filter by severity
      if (severity) {
        whereClause.severity = severity;
      }

      // Search in title or summary
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { summary: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Date range filter
      if (startDate || endDate) {
        whereClause.publishedAt = {};
        if (startDate) {
          whereClause.publishedAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereClause.publishedAt[Op.lte] = new Date(endDate);
        }
      }

      const { count, rows: articles } = await NewsArticle.findAndCountAll({
        where: whereClause,
        order: [['publishedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Format response
      const formattedArticles = articles.map(article => ({
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        source: article.source,
        sourceUrl: article.sourceUrl,
        imageUrl: article.imageUrl,
        publishedAt: article.publishedAt,
        disasterType: article.disasterType,
        severity: article.severity,
        location: article.location ? {
          lat: article.location.coordinates[1],
          lng: article.location.coordinates[0]
        } : null
      }));

      res.json({
        success: true,
        data: formattedArticles,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: count > parseInt(offset) + parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Error getting news:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get breaking news (critical alerts)
   * GET /feed/breaking
   */
  async getBreakingNews(req, res) {
    try {
      const { limit = 5 } = req.query;

      const articles = await NewsArticle.findAll({
        where: {
          isActive: true,
          severity: 'critical'
        },
        order: [['publishedAt', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: articles.map(article => ({
          id: article.id,
          title: article.title,
          summary: article.summary,
          source: article.source,
          publishedAt: article.publishedAt,
          disasterType: article.disasterType
        }))
      });

    } catch (error) {
      logger.error('Error getting breaking news:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get historical disaster data
   * GET /discovery/history
   */
  async getHistory(req, res) {
    try {
      const {
        type,
        year,
        limit = 20,
        offset = 0,
        search
      } = req.query;

      const whereClause = {};

      // Filter by disaster type
      if (type) {
        whereClause.disasterType = type;
      }

      // Filter by year
      if (year) {
        const startOfYear = new Date(`${year}-01-01`);
        const endOfYear = new Date(`${year}-12-31`);
        whereClause.eventDate = {
          [Op.between]: [startOfYear, endOfYear]
        };
      }

      // Search
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { locationName: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: events } = await HistoricalEvent.findAndCountAll({
        where: whereClause,
        order: [['eventDate', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Format response
      const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
        location: event.location ? {
          lat: event.location.coordinates[1],
          lng: event.location.coordinates[0]
        } : null,
        locationName: event.locationName,
        disasterType: event.disasterType,
        description: event.description,
        impact: event.impact,
        casualties: event.casualties,
        damageEstimate: event.damageEstimate,
        lessons: event.lessons,
        heroStory: event.heroStory,
        heroName: event.heroName,
        sources: event.sources
      }));

      res.json({
        success: true,
        data: formattedEvents,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: count > parseInt(offset) + parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Error getting history:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get single historical event details
   * GET /discovery/history/:id
   */
  async getHistoryDetail(req, res) {
    try {
      const { id } = req.params;

      const event = await HistoricalEvent.findByPk(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Historical event not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          location: event.location ? {
            lat: event.location.coordinates[1],
            lng: event.location.coordinates[0]
          } : null,
          locationName: event.locationName,
          disasterType: event.disasterType,
          description: event.description,
          impact: event.impact,
          casualties: event.casualties,
          damageEstimate: event.damageEstimate,
          lessons: event.lessons,
          heroStory: event.heroStory,
          heroName: event.heroName,
          sources: event.sources
        }
      });

    } catch (error) {
      logger.error('Error getting history detail:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get disaster statistics
   * GET /feed/stats
   */
  async getStats(req, res) {
    try {
      // Count by type
      const byType = await NewsArticle.findAll({
        attributes: [
          'disasterType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { isActive: true },
        group: ['disasterType']
      });

      // Count by severity
      const bySeverity = await NewsArticle.findAll({
        attributes: [
          'severity',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { isActive: true },
        group: ['severity']
      });

      // Recent count (last 24 hours)
      const last24h = await NewsArticle.count({
        where: {
          isActive: true,
          publishedAt: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      // Total count
      const total = await NewsArticle.count({
        where: { isActive: true }
      });

      res.json({
        success: true,
        data: {
          total,
          last24h,
          byType,
          bySeverity
        }
      });

    } catch (error) {
      logger.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new FeedController();
