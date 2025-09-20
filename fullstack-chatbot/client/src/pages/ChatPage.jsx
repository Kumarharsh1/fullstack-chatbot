import React from 'react';
import ApiKeyManager from '../components/ApiKeyManager/ApiKeyManager';
import CharacteristicSelector from '../components/CharacteristicSelector/CharacteristicSelector';
import ChatInterface from '../components/ChatInterface/ChatInterface';
import SessionManager from '../components/SessionManager/SessionManager';

const ChatPage = ({
  apiKey,
  serviceType,
  characteristic,
  sessionId,
  onApiKeySet,
  onCharacteristicSelect,
  onSessionChange
}) => {
  return (
    <div className="chat-page">
      <div className="config-panel">
        <ApiKeyManager 
          onApiKeySet={onApiKeySet} 
          currentService={serviceType} 
          currentKey={apiKey} 
        />
        <CharacteristicSelector 
          selected={characteristic} 
          onSelect={onCharacteristicSelect} 
        />
        <SessionManager 
          sessionId={sessionId} 
          onNewSession={onSessionChange} 
        />
      </div>
      
      <div className="chat-panel">
        <ChatInterface 
          apiKey={apiKey}
          serviceType={serviceType}
          characteristic={characteristic}
          sessionId={sessionId}
          onSessionChange={onSessionChange}
        />
      </div>
    </div>
  );
};

export default ChatPage;