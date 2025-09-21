// Request validation middleware
const { body, validationResult } = require('express-validator');

// Validate chat request
const validateChatRequest = [
  body('message')
    .isString()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters'),
  
  body('apiKey')
    .isString()
    .notEmpty()
    .withMessage('API key is required'),
  
  body('serviceType')
    .isString()
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['groq', 'gemini', 'openai', 'deepseek'])
    .withMessage('Invalid service type'),
  
  body('characteristic')
    .optional()
    .isString()
    .isIn(['news', 'sales', 'cybersecurity', 'default'])
    .withMessage('Invalid characteristic'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validate API key request
const validateApiKeyRequest = [
  body('apiKey')
    .isString()
    .notEmpty()
    .withMessage('API key is required'),
  
  body('serviceType')
    .isString()
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['groq', 'gemini', 'openai', 'deepseek'])
    .withMessage('Invalid service type'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateChatRequest,
  validateApiKeyRequest
};