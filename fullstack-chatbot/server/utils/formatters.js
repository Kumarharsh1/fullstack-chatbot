// Format error response
exports.formatError = (message, details = null) => {
  return {
    error: message,
    details,
    timestamp: new Date().toISOString()
  };
};

// Format success response
exports.formatSuccess = (data, message = null) => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

// Format chat response
exports.formatChatResponse = (response, sessionId, history) => {
  return {
    response,
    sessionId,
    history,
    timestamp: new Date().toISOString()
  };
};

// Format API key validation response
exports.formatKeyValidation = (valid, service, details = null) => {
  return {
    valid,
    service,
    details,
    timestamp: new Date().toISOString()
  };
};

// Sanitize user input
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Basic sanitization to prevent XSS
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};