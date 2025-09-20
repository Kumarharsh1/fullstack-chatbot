import React, { useState, useEffect } from 'react';
import ApiKeyManager from './components/ApiKeyManager/ApiKeyManager';
import CharacteristicSelector from './components/CharacteristicSelector/CharacteristicSelector';
import ChatInterface from './components/ChatInterface/ChatInterface';
import SessionManager from './components/SessionManager/SessionManager';
import SettingsPage from './pages/SettingsPage';
import { getChatHistory } from './services/api';
import './App.scss';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [serviceType, setServiceType] = useState('grok');
  const [characteristic, setCharacteristic] = useState('news');
  const [sessionId, setSessionId] = useState('');
  const [currentPage, setCurrentPage] = useState('chat');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat history when sessionId changes
  useEffect(() => {
    const loadHistory = async () => {
      if (sessionId) {
        setIsLoading(true);
        try {
          const response = await getChatHistory(sessionId);
          setChatHistory(response.history || []);
        } catch (error) {
          console.error('Error loading chat history:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setChatHistory([]);
      }
    };

    loadHistory();
  }, [sessionId]);

  const handleApiKeySet = (key, service) => {
    setApiKey(key);
    setServiceType(service);
    // Save to localStorage for persistence
    localStorage.setItem('apiKey', key);
    localStorage.setItem('serviceType', service);
  };

  const handleCharacteristicSelect = (char) => {
    setCharacteristic(char);
    localStorage.setItem('characteristic', char);
  };

  const handleNewSession = () => {
    setSessionId('');
    setChatHistory([]);
  };

  const handleSessionChange = (newSessionId) => {
    setSessionId(newSessionId);
  };

  // Load saved preferences on initial render
  useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey');
    const savedServiceType = localStorage.getItem('serviceType');
    const savedCharacteristic = localStorage.getItem('characteristic');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedServiceType) setServiceType(savedServiceType);
    if (savedCharacteristic) setCharacteristic(savedCharacteristic);
  }, []);

  return (
    <div className="app cartoon-theme">
      <header className="app-header">
        <h1>Multi-AI Chatbot</h1>
        <div className="nav-buttons">
          <button 
            className={`nav-btn ${currentPage === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentPage('chat')}
          >
            💬 Chat
          </button>
          <button 
            className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
            ⚙️ Settings
          </button>
        </div>
        <SessionManager 
          sessionId={sessionId} 
          onNewSession={handleNewSession} 
        />
      </header>
      
      <main className="app-main">
        {currentPage === 'chat' ? (
          <>
            <div className="config-panel">
              <ApiKeyManager 
                onApiKeySet={handleApiKeySet} 
                currentService={serviceType} 
                currentKey={apiKey} 
              />
              <CharacteristicSelector 
                selected={characteristic} 
                onSelect={handleCharacteristicSelect} 
              />
            </div>
            
            <div className="chat-panel">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading chat history...</p>
                </div>
              ) : (
                <ChatInterface 
                  apiKey={apiKey}
                  serviceType={serviceType}
                  characteristic={characteristic}
                  sessionId={sessionId}
                  onSessionChange={handleSessionChange}
                  initialHistory={chatHistory}
                />
              )}
            </div>
          </>
        ) : (
          <SettingsPage />
        )}
      </main>
      
      <footer className="app-footer">
        <p>Powered by Multiple AI APIs | Built with React & Node.js</p>
      </footer>
    </div>
  );
}

export default App;