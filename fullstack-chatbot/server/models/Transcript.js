const { DataTypes } = require('sequelize');
const { pgPool } = require('../config/database');

// Define Transcript model
const Transcript = pgPool.define('Transcript', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false // 'user' or 'assistant'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'transcripts',
  timestamps: true
});

// Define association
Transcript.associate = (models) => {
  Transcript.belongsTo(models.Session, { foreignKey: 'sessionId' });
};

module.exports = Transcript;