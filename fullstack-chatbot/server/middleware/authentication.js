// Simple API key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  // In a real application, you would validate this against a database
  // For this demo, we'll use a simple environment variable check
  const validKey = process.env.ADMIN_API_KEY;
  
  if (!validKey) {
    // If no admin key is set, allow all requests (for development)
    return next();
  }
  
  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ 
      error: 'Invalid or missing API key' 
    });
  }
  
  next();
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Apply different rate limits based on endpoint
const chatRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // Max 100 requests per window
  'Too many chat requests, please try again later.'
);

const apiKeyRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  50, // Max 50 validations per hour
  'Too many API key validations, please try again later.'
);

module.exports = {
  authenticateApiKey,
  chatRateLimiter,
  apiKeyRateLimiter
};