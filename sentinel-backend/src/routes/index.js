/**
 * API Routes Configuration
 */

const express = require('express');
const router = express.Router();

// Controllers
const routingController = require('../controllers/routingController');
const feedController = require('../controllers/feedController');
const reportController = require('../controllers/reportController');
const motivationController = require('../controllers/motivationController');

// Middleware
const { authenticate, authorize } = require('../middleware/auth');

// ==================== ROUTING & EMERGENCY SERVICES ====================

// Calculate optimal emergency route
router.post('/emergency/route', 
  routingController.validateCalculateRoute(),
  routingController.calculateRoute
);

// Find nearby emergency services
router.get('/services/nearby', routingController.findNearbyServices);

// Get service details
router.get('/services/:id', routingController.getServiceDetails);

// ==================== NEWS FEED ====================

// Get aggregated disaster news
router.get('/feed/news', feedController.getNews);

// Get breaking news
router.get('/feed/breaking', feedController.getBreakingNews);

// Get news statistics
router.get('/feed/stats', feedController.getStats);

// ==================== DISCOVERY & HISTORY ====================

// Get historical disaster data
router.get('/discovery/history', feedController.getHistory);

// Get historical event details
router.get('/discovery/history/:id', feedController.getHistoryDetail);

// ==================== USER REPORTS ====================

// Submit incident report
router.post('/report/incident',
  reportController.validateSubmitReport(),
  reportController.submitReport
);

// Get user's reports
router.get('/report/my-reports', authenticate, reportController.getMyReports);

// Get report details
router.get('/report/:id', authenticate, reportController.getReportDetails);

// Get nearby reports
router.get('/reports/nearby', reportController.getNearbyReports);

// ==================== MOTIVATION (HOPE AVATAR) ====================

// Get contextual motivation content
router.get('/api/motivation/contextual', motivationController.getContextualMotivation);

// Get batch of motivation content
router.get('/api/motivation/batch', motivationController.getMotivationBatch);

// Get random motivation
router.get('/api/motivation/random', motivationController.getRandomMotivation);

// Get motivation stats
router.get('/api/motivation/stats', motivationController.getStats);

// ==================== ADMIN ROUTES ====================

// Add motivation content
router.post('/api/admin/motivation', authenticate, authorize('admin'), motivationController.addContent);

// Seed motivation content
router.post('/api/admin/motivation/seed', authenticate, authorize('admin'), motivationController.seedContent);

// Get all reports (admin)
router.get('/admin/reports', authenticate, authorize('admin'), reportController.getAllReports);

// Update report status (admin)
router.patch('/admin/reports/:id/status', authenticate, authorize('admin'), reportController.updateStatus);

// ==================== HEALTH CHECK ====================

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sentinel API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
