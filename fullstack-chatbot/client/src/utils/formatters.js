// Format date to readable string
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - d);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' });
  } else {
    return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

// Format file size to readable string
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format API key for display (hide most characters)
export const formatApiKey = (key) => {
  if (!key) return '';
  if (key.length <= 8) return key;
  
  const firstFour = key.substring(0, 4);
  const lastFour = key.substring(key.length - 4);
  return `${firstFour}...${lastFour}`;
};

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};