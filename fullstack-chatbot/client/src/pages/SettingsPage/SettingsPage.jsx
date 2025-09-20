import React, { useState } from 'react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    autoScroll: true,
    notifications: false
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      
      <div className="settings-group">
        <h3>Appearance</h3>
        
        <div className="setting-item">
          <label htmlFor="theme">Theme:</label>
          <select
            id="theme"
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label htmlFor="fontSize">Font Size:</label>
          <select
            id="fontSize"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
      
      <div className="settings-group">
        <h3>Behavior</h3>
        
        <div className="setting-item">
          <label htmlFor="autoScroll">Auto-scroll to new messages:</label>
          <input
            id="autoScroll"
            type="checkbox"
            checked={settings.autoScroll}
            onChange={(e) => handleSettingChange('autoScroll', e.target.checked)}
          />
        </div>
        
        <div className="setting-item">
          <label htmlFor="notifications">Enable notifications:</label>
          <input
            id="notifications"
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => handleSettingChange('notifications', e.target.checked)}
          />
        </div>
      </div>
      
      <button 
        className="save-settings-btn"
        onClick={() => alert('Settings saved!')}
      >
        Save Settings
      </button>
    </div>
  );
};

export default SettingsPage;