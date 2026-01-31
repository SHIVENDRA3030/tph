/**
 * Report Controller
 * Handles user-submitted incident reports
 */

const { UserReport } = require('../models');
const { logger } = require('../config/database');
const { validationResult, body } = require('express-validator');
const { Op } = require('sequelize');

class ReportController {
  /**
   * Submit a new incident report
   * POST /report/incident
   */
  async submitReport(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        type,
        title,
        description,
        location,
        address,
        images,
        contactName,
        contactPhone
      } = req.body;

      // Get user ID if authenticated
      const userId = req.user?.id || null;

      // Create report
      const report = await UserReport.create({
        userId,
        type,
        title,
        description,
        location: location ? sequelize.fn('ST_SetSRID',
          sequelize.fn('ST_MakePoint', location.lng, location.lat),
          4326
        ) : null,
        address,
        images: images || [],
        contactName,
        contactPhone,
        status: 'pending',
        priority: this.calculatePriority(type)
      });

      logger.info(`New report submitted: ${report.id} - ${title}`);

      // TODO: Notify relevant authorities based on report type and location

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: {
          id: report.id,
          type: report.type,
          title: report.title,
          status: report.status,
          priority: report.priority,
          createdAt: report.createdAt
        }
      });

    } catch (error) {
      logger.error('Error submitting report:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user's reports
   * GET /report/my-reports
   */
  async getMyReports(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { status, limit = 20, offset = 0 } = req.query;

      const whereClause = { userId };

      if (status) {
        whereClause.status = status;
      }

      const { count, rows: reports } = await UserReport.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: reports.map(report => ({
          id: report.id,
          type: report.type,
          title: report.title,
          description: report.description,
          address: report.address,
          images: report.images,
          status: report.status,
          priority: report.priority,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
        })),
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: count > parseInt(offset) + parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Error getting user reports:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get report details
   * GET /report/:id
   */
  async getReportDetails(req, res) {
    try {
      const { id } = req.params;

      const report = await UserReport.findByPk(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found'
        });
      }

      // Check if user owns this report or is admin
      if (req.user?.id !== report.userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: {
          id: report.id,
          type: report.type,
          title: report.title,
          description: report.description,
          location: report.location ? {
            lat: report.location.coordinates[1],
            lng: report.location.coordinates[0]
          } : null,
          address: report.address,
          images: report.images,
          contactName: report.contactName,
          contactPhone: report.contactPhone,
          status: report.status,
          priority: report.priority,
          assignedTo: report.assignedTo,
          resolutionNotes: report.resolutionNotes,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
        }
      });

    } catch (error) {
      logger.error('Error getting report details:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get all reports (admin only)
   * GET /admin/reports
   */
  async getAllReports(req, res) {
    try {
      const {
        status,
        type,
        priority,
        limit = 50,
        offset = 0
      } = req.query;

      const whereClause = {};

      if (status) whereClause.status = status;
      if (type) whereClause.type = type;
      if (priority) whereClause.priority = priority;

      const { count, rows: reports } = await UserReport.findAndCountAll({
        where: whereClause,
        order: [
          ['priority', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: reports.map(report => ({
          id: report.id,
          type: report.type,
          title: report.title,
          address: report.address,
          status: report.status,
          priority: report.priority,
          assignedTo: report.assignedTo,
          createdAt: report.createdAt
        })),
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: count > parseInt(offset) + parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Error getting all reports:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update report status (admin only)
   * PATCH /admin/reports/:id/status
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, assignedTo, resolutionNotes } = req.body;

      const report = await UserReport.findByPk(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found'
        });
      }

      // Update fields
      if (status) report.status = status;
      if (assignedTo) report.assignedTo = assignedTo;
      if (resolutionNotes) report.resolutionNotes = resolutionNotes;

      await report.save();

      logger.info(`Report ${id} status updated to ${status}`);

      res.json({
        success: true,
        message: 'Report updated successfully',
        data: {
          id: report.id,
          status: report.status,
          assignedTo: report.assignedTo,
          updatedAt: report.updatedAt
        }
      });

    } catch (error) {
      logger.error('Error updating report status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get reports near a location
   * GET /reports/nearby
   */
  async getNearbyReports(req, res) {
    try {
      const { lat, lng, radius = 5, limit = 20 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      const reports = await UserReport.findAll({
        where: {
          status: { [Op.ne]: 'resolved' },
          [Op.and]: sequelize.where(
            sequelize.fn('ST_DWithin',
              sequelize.col('location::geography'),
              sequelize.fn('ST_SetSRID',
                sequelize.fn('ST_MakePoint', parseFloat(lng), parseFloat(lat)),
                4326
              )::geography,
              parseFloat(radius) * 1000
            ),
            true
          )
        },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: reports.map(report => ({
          id: report.id,
          type: report.type,
          title: report.title,
          description: report.description,
          location: report.location ? {
            lat: report.location.coordinates[1],
            lng: report.location.coordinates[0]
          } : null,
          address: report.address,
          status: report.status,
          priority: report.priority,
          createdAt: report.createdAt
        }))
      });

    } catch (error) {
      logger.error('Error getting nearby reports:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Calculate report priority based on type
   */
  calculatePriority(type) {
    const priorityMap = {
      emergency: 'critical',
      hazard: 'high',
      infrastructure: 'medium',
      other: 'low'
    };
    return priorityMap[type] || 'medium';
  }

  /**
   * Validation rules for submit report
   */
  validateSubmitReport() {
    return [
      body('type').isIn(['emergency', 'hazard', 'infrastructure', 'other']).withMessage('Invalid report type'),
      body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
      body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
      body('location').optional().isObject(),
      body('location.lat').optional().isFloat({ min: -90, max: 90 }),
      body('location.lng').optional().isFloat({ min: -180, max: 180 }),
      body('images').optional().isArray(),
      body('contactName').optional().trim(),
      body('contactPhone').optional().trim()
    ];
  }
}

module.exports = new ReportController();
