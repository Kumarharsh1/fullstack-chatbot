import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../services/api';
import './ChatInterface.scss';

const ChatInterface = ({ apiKey, serviceType, characteristic, sessionId, onSessionChange, initialHistory = [] }) => {
  const [messages, setMessages] = useState(initialHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(initialHistory);
  }, [initialHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !apiKey) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage(
        inputMessage, 
        sessionId, 
        apiKey, 
        serviceType, 
        characteristic
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      
      if (!sessionId && response.sessionId) {
        onSessionChange(response.sessionId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please check your API key and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading || !apiKey}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isLoading || !inputMessage.trim() || !apiKey}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;