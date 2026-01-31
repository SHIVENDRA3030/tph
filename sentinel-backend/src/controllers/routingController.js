/**
 * Routing Controller
 * Handles route calculation and emergency service queries
 */

const routingService = require('../services/routingService');
const { EmergencyService } = require('../models');
const { logger } = require('../config/database');
const { validationResult, body } = require('express-validator');

class RoutingController {
  /**
   * Calculate optimal emergency route
   * POST /emergency/route
   */
  async calculateRoute(req, res) {
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
        userLocation,
        emergencyType,
        destinationType,
        preferences
      } = req.body;

      // Validate location
      if (!userLocation || !userLocation.lat || !userLocation.lng) {
        return res.status(400).json({
          success: false,
          error: 'Valid user location (lat, lng) is required'
        });
      }

      // Determine destination
      let destination;
      let services = [];

      if (destinationType) {
        // Find nearest service of specified type
        services = await routingService.findNearestService(
          userLocation,
          destinationType,
          3
        );

        if (services.length === 0) {
          return res.status(404).json({
            success: false,
            error: `No ${destinationType} services found nearby`
          });
        }

        destination = {
          lat: services[0].location.coordinates[1],
          lng: services[0].location.coordinates[0]
        };
      } else if (req.body.destination) {
        destination = req.body.destination;
      } else {
        // Auto-determine destination based on emergency type
        const autoDestination = await this.autoDetermineDestination(
          userLocation,
          emergencyType
        );

        if (!autoDestination) {
          return res.status(404).json({
            success: false,
            error: 'Could not determine appropriate destination'
          });
        }

        destination = autoDestination.location;
        services = autoDestination.services;
      }

      // Calculate route
      const routeResult = await routingService.calculateOptimalRoute(
        userLocation,
        destination,
        {
          ...preferences,
          emergencyType
        }
      );

      if (!routeResult.success) {
        return res.status(500).json(routeResult);
      }

      // Return response
      res.json({
        success: true,
        data: {
          route: routeResult.route,
          instructions: routeResult.instructions,
          metadata: routeResult.metadata,
          destination: {
            type: destinationType || this.inferDestinationType(emergencyType),
            services: services.map(s => ({
              id: s.id,
              name: s.name,
              type: s.type,
              address: s.address,
              contactInfo: s.contactInfo,
              distanceKm: s.distanceKm,
              estimatedTimeMin: s.estimatedTimeMin,
              capacity: s.capacity,
              occupancy: s.occupancy
            }))
          }
        }
      });

    } catch (error) {
      logger.error('Error calculating route:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Find nearest emergency services
   * GET /services/nearby
   */
  async findNearbyServices(req, res) {
    try {
      const { lat, lng, type, radius = 10, limit = 10 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      const userLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };

      const whereClause = {
        isActive: true
      };

      if (type) {
        whereClause.type = type;
      }

      const services = await EmergencyService.findAll({
        where: whereClause,
        order: sequelize.literal(`ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(${userLocation.lng}, ${userLocation.lat}), 4326)::geography
        )`),
        limit: parseInt(limit)
      });

      // Calculate distances
      const servicesWithDistance = services.map(service => {
        const serviceLoc = service.location.coordinates;
        const distance = routingService.haversineDistance(
          userLocation.lat, userLocation.lng,
          serviceLoc[1], serviceLoc[0]
        );

        return {
          id: service.id,
          name: service.name,
          type: service.type,
          address: service.address,
          contactInfo: service.contactInfo,
          location: {
            lat: serviceLoc[1],
            lng: serviceLoc[0]
          },
          capacity: service.capacity,
          occupancy: service.occupancy,
          operatingHours: service.operatingHours,
          distanceKm: Math.round(distance * 100) / 100,
          estimatedTimeMin: Math.round(distance * 2),
          isOpen: this.isServiceOpen(service.operatingHours)
        };
      });

      // Filter by radius
      const filteredServices = servicesWithDistance.filter(
        s => s.distanceKm <= parseFloat(radius)
      );

      res.json({
        success: true,
        data: filteredServices
      });

    } catch (error) {
      logger.error('Error finding nearby services:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get service details by ID
   * GET /services/:id
   */
  async getServiceDetails(req, res) {
    try {
      const { id } = req.params;

      const service = await EmergencyService.findByPk(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      const serviceLoc = service.location.coordinates;

      res.json({
        success: true,
        data: {
          id: service.id,
          name: service.name,
          type: service.type,
          address: service.address,
          contactInfo: service.contactInfo,
          location: {
            lat: serviceLoc[1],
            lng: serviceLoc[0]
          },
          capacity: service.capacity,
          occupancy: service.occupancy,
          operatingHours: service.operatingHours,
          isActive: service.isActive,
          createdAt: service.createdAt
        }
      });

    } catch (error) {
      logger.error('Error getting service details:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Auto-determine destination based on emergency type
   */
  async autoDetermineDestination(userLocation, emergencyType) {
    const destinationMap = {
      flood: 'shelter',
      earthquake: 'shelter',
      fire: 'shelter',
      storm: 'shelter',
      accident: 'hospital',
      medical: 'hospital',
      crime: 'police',
      fire_emergency: 'fire'
    };

    const serviceType = destinationMap[emergencyType] || 'shelter';
    
    const services = await routingService.findNearestService(
      userLocation,
      serviceType,
      1
    );

    if (services.length === 0) {
      return null;
    }

    return {
      location: {
        lat: services[0].location.coordinates[1],
        lng: services[0].location.coordinates[0]
      },
      services
    };
  }

  /**
   * Infer destination type from emergency type
   */
  inferDestinationType(emergencyType) {
    const map = {
      flood: 'shelter',
      earthquake: 'shelter',
      fire: 'shelter',
      storm: 'shelter',
      accident: 'hospital',
      medical: 'hospital',
      crime: 'police'
    };
    return map[emergencyType] || 'shelter';
  }

  /**
   * Check if service is currently open
   */
  isServiceOpen(operatingHours) {
    if (!operatingHours) return true; // Assume 24/7 if not specified

    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    const todayHours = operatingHours[day];
    if (!todayHours) return false;

    if (todayHours.open === '00:00' && todayHours.close === '23:59') {
      return true;
    }

    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  }

  /**
   * Validation rules for calculate route
   */
  validateCalculateRoute() {
    return [
      body('userLocation').isObject().withMessage('userLocation must be an object'),
      body('userLocation.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
      body('userLocation.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
      body('emergencyType').optional().isString(),
      body('destinationType').optional().isIn(['shelter', 'hospital', 'police', 'fire']),
      body('preferences').optional().isObject()
    ];
  }
}

module.exports = new RoutingController();
