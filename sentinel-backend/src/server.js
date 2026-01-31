/**
 * Sentinel Backend Server
 * Real-time Disaster Management System
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const { sequelize, testConnection, logger } = require('./config/database');
const routes = require('./routes');
const { rateLimit } = require('./middleware/rateLimiter');
const DisasterMonitor = require('./services/disasterMonitor');
const motivationService = require('./services/motivationService');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for API server
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimit);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// API Routes
app.use('/api', routes);

// ==================== WEBSOCKET HANDLERS ====================

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // User authentication via socket
  socket.on('authenticate', async (data) => {
    try {
      const { userId, location } = data;
      
      // Store user connection
      connectedUsers.set(socket.id, {
        userId,
        socketId: socket.id,
        location,
        connectedAt: new Date()
      });

      // Update user's socket ID and location in database
      if (userId) {
        const { User } = require('./models');
        await User.update(
          { 
            socketId: socket.id,
            currentLocation: location ? sequelize.fn('ST_SetSRID',
              sequelize.fn('ST_MakePoint', location.lng, location.lat),
              4326
            ) : null
          },
          { where: { id: userId } }
        );
      }

      socket.emit('authenticated', { success: true });
      logger.info(`User ${userId} authenticated on socket ${socket.id}`);

    } catch (error) {
      logger.error('Socket authentication error:', error);
      socket.emit('authenticated', { success: false, error: error.message });
    }
  });

  // Location update
  socket.on('location_update', async (data) => {
    try {
      const { lat, lng } = data;
      const userData = connectedUsers.get(socket.id);
      
      if (userData) {
        userData.location = { lat, lng };
        connectedUsers.set(socket.id, userData);

        // Update database
        if (userData.userId) {
          const { User } = require('./models');
          await User.update(
            { 
              currentLocation: sequelize.fn('ST_SetSRID',
                sequelize.fn('ST_MakePoint', lng, lat),
                4326
              )
            },
            { where: { id: userData.userId } }
          );
        }
      }
    } catch (error) {
      logger.error('Location update error:', error);
    }
  });

  // Subscribe to disaster alerts
  socket.on('subscribe_alerts', (data) => {
    const { disasterTypes, radius } = data;
    
    // Join disaster type rooms
    if (disasterTypes && Array.isArray(disasterTypes)) {
      disasterTypes.forEach(type => {
        socket.join(`disaster:${type}`);
      });
    }

    socket.emit('subscribed', { 
      success: true, 
      message: 'Subscribed to disaster alerts' 
    });
  });

  // Unsubscribe from alerts
  socket.on('unsubscribe_alerts', () => {
    // Leave all disaster rooms
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room.startsWith('disaster:')) {
        socket.leave(room);
      }
    });

    socket.emit('unsubscribed', { 
      success: true, 
      message: 'Unsubscribed from alerts' 
    });
  });

  // Request motivation content
  socket.on('get_motivation', async (data) => {
    try {
      const { disasterType } = data;
      const result = await motivationService.getContextualMotivation(disasterType);
      
      socket.emit('motivation', {
        success: true,
        data: result.data
      });
    } catch (error) {
      logger.error('Motivation request error:', error);
      socket.emit('motivation', {
        success: false,
        error: 'Failed to get motivation content'
      });
    }
  });

  // Disconnect handler
  socket.on('disconnect', async () => {
    try {
      const userData = connectedUsers.get(socket.id);
      
      if (userData && userData.userId) {
        // Clear socket ID from database
        const { User } = require('./models');
        await User.update(
          { socketId: null },
          { where: { id: userData.userId } }
        );
      }

      connectedUsers.delete(socket.id);
      logger.info(`Client disconnected: ${socket.id}`);

    } catch (error) {
      logger.error('Disconnect handler error:', error);
    }
  });
});

// Make io accessible to other modules
app.set('io', io);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Sync database models (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }

    // Seed motivation content
    await motivationService.seedDefaultContent();

    // Start disaster monitor
    const disasterMonitor = new DisasterMonitor(io);
    disasterMonitor.start();

    // Start server
    server.listen(PORT, () => {
      logger.info(`=================================`);
      logger.info(`Sentinel Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`WebSocket: Enabled`);
      logger.info(`Disaster Monitor: Active`);
      logger.info(`=================================`);
    });

  } catch (error) {
    logger.error('Server startup error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    sequelize.close().then(() => {
      logger.info('Database connection closed');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();

module.exports = { app, server, io };
