import React, { useState } from 'react';
import './ApiKeyManager.scss';

const ApiKeyManager = ({ onApiKeySet, currentService, currentKey }) => {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [serviceType, setServiceType] = useState(currentService || 'groq');
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim() && serviceType) {
      onApiKeySet(apiKey, serviceType);
    }
  };

  return (
    <div className="api-key-manager">
      <div className="api-key-header" onClick={() => setIsVisible(!isVisible)}>
        <h3>API Key Configuration</h3>
        <span>{isVisible ? '▲' : '▼'}</span>
      </div>
      
      {isVisible && (
        <form onSubmit={handleSubmit} className="api-key-form">
          <div className="form-group">
            <label htmlFor="service-type">AI Service:</label>
            <select
              id="service-type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            >
              <option value="groq">Groq Cloud API</option>
              <option value="gemini">Gemini (Google)</option>
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="api-key">API Key:</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${serviceType === 'groq' ? 'Groq' : serviceType} API key`}
            />
          </div>
          
          <button type="submit" className="save-button">
            Save API Key
          </button>
        </form>
      )}
    </div>
  );
};

export default ApiKeyManager;