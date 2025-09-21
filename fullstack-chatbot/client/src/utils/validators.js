// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate API key format based on service
export const isValidApiKey = (key, service) => {
  if (!key || typeof key !== 'string') return false;
  
  // Trim the key to remove any accidental whitespace
  const trimmedKey = key.trim();
  
  const patterns = {
    groq: /^gsk_[a-zA-Z0-9]{32,}$/i, // Groq API keys: gsk_ followed by at least 32 alphanumeric chars
    gemini: /^AIza[0-9A-Za-z-_]{35}$/, // Google Gemini keys
    openai: /^sk-[a-zA-Z0-9]{48}$/, // OpenAI keys
    deepseek: /^ds-[a-zA-Z0-9]{40,50}$/ // DeepSeek keys (approximate pattern)
  };
  
  // For services without a known pattern, just check if it's a non-empty string
  if (!patterns[service]) return trimmedKey.length > 0;
  
  return patterns[service].test(trimmedKey);
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
  // At least 8 characters, one uppercase, one lowercase, one number, and one special character
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return strongRegex.test(password);
};