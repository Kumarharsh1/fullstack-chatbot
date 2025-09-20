// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate API key format based on service
export const isValidApiKey = (key, service) => {
  if (!key || typeof key !== 'string') return false;
  
  const patterns = {
    grok: /^gk-[a-zA-Z0-9]{40}$/,
    gemini: /^AIza[0-9A-Za-z-_]{35}$/,
    openai: /^sk-[a-zA-Z0-9]{48}$/,
    deepseek: /^ds-[a-zA-Z0-9]{48}$/
  };
  
  return patterns[service]?.test(key) || false;
};

// Validate URL format
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Check if value is empty
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Validate password strength
export const isStrongPassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
  return strongRegex.test(password);
};