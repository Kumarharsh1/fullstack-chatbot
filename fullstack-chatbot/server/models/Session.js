const { DataTypes } = require('sequelize');
const { pgPool } = require('../config/database');

// Define Session model
const Session = pgPool.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  characteristic: {
    type: DataTypes.STRING,
    defaultValue: 'default'
  },
  serviceType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'sessions',
  timestamps: true
});

module.exports = Session;