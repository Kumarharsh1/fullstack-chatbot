const axios = require('axios');

async function validateApiKey(apiKey, serviceType) {
  try {
    switch (serviceType) {
      case 'grok':
        return await validateGrokKey(apiKey);
      case 'gemini':
        return await validateGeminiKey(apiKey);
      case 'openai':
        return await validateOpenAIKey(apiKey);
      case 'deepseek':
        return await validateDeepSeekKey(apiKey);
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error validating ${serviceType} API key:`, error);
    return false;
  }
}

async function validateGrokKey(apiKey) {
  try {
    const response = await axios.get('https://api.x.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.status === 200;
  } catch (error) {
    return error.response?.status === 401 ? false : true;
  }
}

async function validateGeminiKey(apiKey) {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );
    return response.status === 200;
  } catch (error) {
    return error.response?.status === 400 ? false : true;
  }
}

// Similar validation functions for other services

module.exports = {
  validateApiKey
};