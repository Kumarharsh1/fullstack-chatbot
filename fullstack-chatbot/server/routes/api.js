const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getHistory, 
  clearHistory 
} = require('../controllers/chatController');
const { 
  validateKey, 
  getKeyStats 
} = require('../controllers/apiKeyController');
const { 
  ingestDocuments, 
  searchDocuments, 
  getCollectionInfo 
} = require('../controllers/ragController');
const { 
  validateChatRequest, 
  validateApiKeyRequest 
} = require('../middleware/validation');
const { 
  chatRateLimiter, 
  apiKeyRateLimiter 
} = require('../middleware/authentication');

// Define mode-specific prompts
const modePrompts = {
  'news-assistant': 'You are a news assistant specialized in providing current news and information. Provide accurate, up-to-date information about current events, news topics, and recent developments.',
  'sales-chatbot': 'You are a sales assistant helping customers with product inquiries and purchases. Be helpful, persuasive, and focus on understanding customer needs to recommend appropriate products or services.',
  'cybersecurity-expert': 'You are a cybersecurity expert providing security advice and threat analysis. Offer practical security recommendations, explain threats clearly, and help users understand security best practices.',
  'general-assistant': 'You are a helpful, friendly assistant focused on providing clear and useful information across a wide range of topics.'
};

// Enhanced chat endpoint with mode support
router.post('/chat', validateChatRequest, chatRateLimiter, async (req, res, next) => {
  try {
    const { message, mode = 'general-assistant', apiKey } = req.body;
    
    // Add mode-specific system prompt to the message
    const systemPrompt = modePrompts[mode] || modePrompts['general-assistant'];
    
    // Create a new request object with the system prompt
    const enhancedRequest = {
      ...req,
      body: {
        ...req.body,
        systemPrompt: systemPrompt
      }
    };
    
    // Pass to the original sendMessage controller
    await sendMessage(enhancedRequest, res, next);
  } catch (error) {
    console.error('Mode processing error:', error);
    next(error);
  }
});

// Keep the other endpoints unchanged
router.get('/chat/history/:sessionId', getHistory);
router.delete('/chat/history/:sessionId', clearHistory);

// API key endpoints
router.post('/validate-key', validateApiKeyRequest, apiKeyRateLimiter, validateKey);
router.get('/key-stats/:apiKey', getKeyStats);

// RAG endpoints
router.post('/rag/ingest', ingestDocuments);
router.post('/rag/search', searchDocuments);
router.get('/rag/collection-info', getCollectionInfo);

module.exports = router;