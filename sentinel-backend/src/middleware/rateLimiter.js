/**
 * Rate Limiting Middleware
 */

const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logger } = require('../config/database');

// General API rate limiter
const generalLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: 100, // 100 requests
  duration: 60 // per minute
});

// Strict rate limiter for sensitive endpoints
const strictLimiter = new RateLimiterMemory({
  keyPrefix: 'strict',
  points: 10, // 10 requests
  duration: 60 // per minute
});

// Report submission rate limiter
const reportLimiter = new RateLimiterMemory({
  keyPrefix: 'report',
  points: 5, // 5 reports
  duration: 3600 // per hour
});

/**
 * General rate limit middleware
 */
const rateLimit = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress;
    await generalLimiter.consume(key);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

/**
 * Strict rate limit middleware
 */
const strictRateLimit = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress;
    await strictLimiter.consume(key);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

/**
 * Report submission rate limit
 */
const reportRateLimit = async (req, res, next) => {
  try {
    const key = req.user?.id || req.ip || req.connection.remoteAddress;
    await reportLimiter.consume(key);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: 'Report limit exceeded, please try again later',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

module.exports = {
  rateLimit,
  strictRateLimit,
  reportRateLimit
};
