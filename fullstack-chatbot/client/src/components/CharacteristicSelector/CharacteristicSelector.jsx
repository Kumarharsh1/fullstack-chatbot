import React from 'react';
import './CharacteristicSelector.scss';

const characteristics = [
  { id: 'news', name: 'News Assistant', icon: '📰' },
  { id: 'sales', name: 'Sales Chatbot', icon: '💼' },
  { id: 'cybersecurity', name: 'Cybersecurity Expert', icon: '🔒' },
  { id: 'default', name: 'General Assistant', icon: '🤖' }
];

const CharacteristicSelector = ({ selected, onSelect }) => {
  return (
    <div className="characteristic-selector">
      <h3>Select Chatbot Mode</h3>
      <div className="characteristic-grid">
        {characteristics.map((char) => (
          <div
            key={char.id}
            className={`characteristic-card ${selected === char.id ? 'selected' : ''}`}
            onClick={() => onSelect(char.id)}
          >
            <div className="characteristic-icon">{char.icon}</div>
            <div className="characteristic-name">{char.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacteristicSelector;