/**
 * Motivation Controller
 * Handles Hope Avatar content requests
 */

const motivationService = require('../services/motivationService');
const { logger } = require('../config/database');

class MotivationController {
  /**
   * Get contextual motivation content
   * GET /api/motivation/contextual
   */
  async getContextualMotivation(req, res) {
    try {
      const { disasterType, contentType } = req.query;

      const result = await motivationService.getContextualMotivation(
        disasterType || 'general',
        contentType
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      logger.error('Error getting contextual motivation:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get batch of motivation content for rotation
   * GET /api/motivation/batch
   */
  async getMotivationBatch(req, res) {
    try {
      const { disasterType, count = 5 } = req.query;

      const contents = await motivationService.getMotivationBatch(
        disasterType || 'general',
        parseInt(count)
      );

      res.json({
        success: true,
        data: contents
      });

    } catch (error) {
      logger.error('Error getting motivation batch:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get random motivation content
   * GET /api/motivation/random
   */
  async getRandomMotivation(req, res) {
    try {
      const { category } = req.query;

      const result = await motivationService.getContextualMotivation(
        category || 'general'
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      logger.error('Error getting random motivation:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get motivation statistics
   * GET /api/motivation/stats
   */
  async getStats(req, res) {
    try {
      const result = await motivationService.getStats();

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      logger.error('Error getting motivation stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Add new motivation content (admin only)
   * POST /api/admin/motivation
   */
  async addContent(req, res) {
    try {
      const contentData = req.body;

      const result = await motivationService.addContent(contentData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: 'Motivation content added successfully',
        data: result.data
      });

    } catch (error) {
      logger.error('Error adding motivation content:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Seed default motivation content (admin only)
   * POST /api/admin/motivation/seed
   */
  async seedContent(req, res) {
    try {
      await motivationService.seedDefaultContent();

      res.json({
        success: true,
        message: 'Default motivation content seeded successfully'
      });

    } catch (error) {
      logger.error('Error seeding motivation content:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new MotivationController();
