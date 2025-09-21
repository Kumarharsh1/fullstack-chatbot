const axios = require('axios');

// Service-specific API endpoints
const API_ENDPOINTS = {
  groq: 'https://api.groq.com/openai/v1/chat/completions', // Replaced Grok with Groq
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

// Model mappings for each service
const SERVICE_MODELS = {
  groq: 'llama3-70b-8192', // Default Groq model
  gemini: 'gemini-pro',
  openai: 'gpt-3.5-turbo',
  deepseek: 'deepseek-chat'
};

async function getAIResponse(message, history, apiKey, serviceType, characteristic, context) {
  const prompt = CHARACTERISTIC_PROMPTS[characteristic] || CHARACTERISTIC_PROMPTS.default;
  
  // Prepare context if available
  const contextText = context ? `\n\nContext:\n${context}` : '';
  const systemMessage = `${prompt}${contextText}`;
  
  try {
    switch (serviceType) {
      case 'groq': // Added Groq case
        return await callGroqAPI(message, history, apiKey, systemMessage);
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
    throw new Error(`Failed to get response from ${serviceType}: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function callGroqAPI(message, history, apiKey, systemMessage) {
  const messages = [
    { role: 'system', content: systemMessage },
    ...history.filter(msg => msg.role !== 'system').map(msg => ({ 
      role: msg.role, 
      content: msg.content 
    })),
    { role: 'user', content: message }
  ];
  
  const response = await axios.post(API_ENDPOINTS.groq, {
    messages,
    model: SERVICE_MODELS.groq,
    temperature: 0.7,
    max_tokens: 1000,
    stream: false
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 second timeout
  });
  
  if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
    throw new Error('Invalid response format from Groq API');
  }
  
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
    },
    {
      timeout: 30000
    }
  );
  
  if (!response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content) {
    throw new Error('Invalid response format from Gemini API');
  }
  
  return response.data.candidates[0].content.parts[0].text;
}

async function callOpenAIAPI(message, history, apiKey, systemMessage) {
  const messages = [
    { role: 'system', content: systemMessage },
    ...history.filter(msg => msg.role !== 'system').map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: message }
  ];
  
  const response = await axios.post(API_ENDPOINTS.openai, {
    messages,
    model: SERVICE_MODELS.openai,
    temperature: 0.7,
    max_tokens: 1000
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  
  if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
    throw new Error('Invalid response format from OpenAI API');
  }
  
  return response.data.choices[0].message.content;
}

async function callDeepSeekAPI(message, history, apiKey, systemMessage) {
  const messages = [
    { role: 'system', content: systemMessage },
    ...history.filter(msg => msg.role !== 'system').map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: message }
  ];
  
  const response = await axios.post(API_ENDPOINTS.deepseek, {
    messages,
    model: SERVICE_MODELS.deepseek,
    temperature: 0.7,
    max_tokens: 1000,
    stream: false
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  
  if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
    throw new Error('Invalid response format from DeepSeek API');
  }
  
  return response.data.choices[0].message.content;
}

module.exports = {
  getAIResponse,
  SERVICE_MODELS // Export if needed elsewhere
};