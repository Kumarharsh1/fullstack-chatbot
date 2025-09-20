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

// Chat endpoints
router.post('/chat', validateChatRequest, chatRateLimiter, sendMessage);
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