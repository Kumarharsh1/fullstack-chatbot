const { v4: uuidv4 } = require('uuid');
const { redisClient, qdrantClient } = require('../config/database');
const { validateApiKey } = require('../services/validationService');
const { getAIResponse } = require('../services/aiService');
const { retrieveRelevantContent } = require('../services/embeddingService');

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, apiKey, serviceType, characteristic } = req.body;
    
    // Validate API key
    const isValid = await validateApiKey(apiKey, serviceType);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Create new session if none provided
    const currentSessionId = sessionId || uuidv4();
    
    // Get chat history from Redis
    const historyKey = `chat:${currentSessionId}:history`;
    let history = await redisClient.get(historyKey);
    history = history ? JSON.parse(history) : [];
    
    // Retrieve relevant content from vector store if RAG is enabled
    let context = '';
    if (characteristic === 'news') {
      context = await retrieveRelevantContent(message);
    }
    
    // Get AI response
    const aiResponse = await getAIResponse(
      message, 
      history, 
      apiKey, 
      serviceType, 
      characteristic,
      context
    );
    
    // Update history
    const newHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    ];
    
    // Store updated history (limit to last 20 messages)
    const trimmedHistory = newHistory.slice(-20);
    await redisClient.setEx(historyKey, 86400, JSON.stringify(trimmedHistory)); // 24h TTL
    
    // Store session ID if it's new
    if (!sessionId) {
      await redisClient.setEx(`chat:${currentSessionId}:metadata`, 86400, JSON.stringify({
        createdAt: new Date().toISOString(),
        characteristic,
        serviceType
      }));
    }
    
    res.json({
      response: aiResponse,
      sessionId: currentSessionId,
      history: trimmedHistory
    });
    
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const historyKey = `chat:${sessionId}:history`;
    const history = await redisClient.get(historyKey);
    
    if (!history) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ history: JSON.parse(history) });
  } catch (error) {
    console.error('Error in getHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const historyKey = `chat:${sessionId}:history`;
    const metadataKey = `chat:${sessionId}:metadata`;
    
    await redisClient.del(historyKey);
    await redisClient.del(metadataKey);
    
    res.json({ message: 'Session cleared successfully' });
  } catch (error) {
    console.error('Error in clearHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};