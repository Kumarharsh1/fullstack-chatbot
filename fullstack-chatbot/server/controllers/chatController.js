const { v4: uuidv4 } = require('uuid');
const { redisClient, qdrantClient } = require('../config/database');
const { validateApiKey } = require('../services/validationService');
const { getAIResponse } = require('../services/aiService');
const { retrieveRelevantContent } = require('../services/embeddingService');

// Define mode-to-characteristic mapping
const modeCharacteristics = {
  'news-assistant': 'news',
  'sales-chatbot': 'sales',
  'cybersecurity-expert': 'technical',
  'general-assistant': 'general'
};

// Define mode-specific service types if needed
const modeServiceTypes = {
  // You can customize which AI service to use for each mode
  'news-assistant': 'groq', // or 'groq', 'openai', etc.
  'sales-chatbot': 'groq',
  'cybersecurity-expert': 'groq',
  'general-assistant': 'groq'
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, apiKey, mode = 'general-assistant', systemPrompt } = req.body;
    
    // Map mode to characteristic and service type
    const characteristic = modeCharacteristics[mode] || 'general';
    const serviceType = modeServiceTypes[mode] || 'groq';
    
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
    
    // Add system prompt to history if it's the first message in session
    if (history.length === 0 && systemPrompt) {
      history.push({ role: 'system', content: systemPrompt });
    }
    
    // Retrieve relevant content from vector store if RAG is enabled for this mode
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
    
    // Update history (don't include system messages in the stored history)
    const userAssistantHistory = history.filter(msg => msg.role !== 'system');
    const newHistory = [
      ...userAssistantHistory,
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
        serviceType,
        mode
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

// The getHistory and clearHistory functions remain the same
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