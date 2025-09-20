import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessage = async (message, sessionId, apiKey, serviceType, characteristic) => {
  try {
    const response = await api.post('/chat', {
      message,
      sessionId,
      apiKey,
      serviceType,
      characteristic
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatHistory = async (sessionId) => {
  try {
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

export const clearChatHistory = async (sessionId) => {
  try {
    const response = await api.delete(`/chat/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};

export default api;