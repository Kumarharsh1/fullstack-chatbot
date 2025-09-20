const axios = require('axios');

// Service-specific API endpoints
const API_ENDPOINTS = {
  grok: 'https://api.x.ai/v1/chat/completions',
  gemini: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`,
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions'
};

// Characteristic-specific system prompts
const CHARACTERISTIC_PROMPTS = {
  news: 'You are a news assistant. Provide accurate, up-to-date information based on the context provided. If you don\'t know something, say so.',
  sales: 'You are a sales assistant. Be persuasive but honest. Help users find products that meet their needs and answer questions about pricing and features.',
  cybersecurity: 'You are a cybersecurity expert. Provide detailed, technical information about security best practices, threats, and protections.',
  default: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses to user queries.'
};

async function getAIResponse(message, history, apiKey, serviceType, characteristic, context) {
  const prompt = CHARACTERISTIC_PROMPTS[characteristic] || CHARACTERISTIC_PROMPTS.default;
  
  // Prepare context if available
  const contextText = context ? `\n\nContext:\n${context}` : '';
  const systemMessage = `${prompt}${contextText}`;
  
  try {
    switch (serviceType) {
      case 'grok':
        return await callGrokAPI(message, history, apiKey, systemMessage);
      case 'gemini':
        return await callGeminiAPI(message, history, apiKey, systemMessage);
      case 'openai':
        return await callOpenAIAPI(message, history, apiKey, systemMessage);
      case 'deepseek':
        return await callDeepSeekAPI(message, history, apiKey, systemMessage);
      default:
        throw new Error(`Unsupported service type: ${serviceType}`);
    }
  } catch (error) {
    console.error(`Error calling ${serviceType} API:`, error.response?.data || error.message);
    throw new Error(`Failed to get response from ${serviceType}`);
  }
}

async function callGrokAPI(message, history, apiKey, systemMessage) {
  const messages = [
    { role: 'system', content: systemMessage },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: message }
  ];
  
  const response = await axios.post(API_ENDPOINTS.grok, {
    messages,
    model: 'grok-beta',
    temperature: 0.7,
    max_tokens: 1000
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

async function callGeminiAPI(message, history, apiKey, systemMessage) {
  // Gemini has a different API structure
  const contents = [
    {
      role: 'user',
      parts: [{ text: systemMessage }]
    },
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user',
      parts: [{ text: message }]
    }
  ];
  
  const response = await axios.post(
    `${API_ENDPOINTS.gemini}?key=${apiKey}`,
    {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    }
  );
  
  return response.data.candidates[0].content.parts[0].text;
}

// Similar implementations for OpenAI and DeepSeek would follow

module.exports = {
  getAIResponse
};