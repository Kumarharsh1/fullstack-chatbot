const express = require('express');
const router = express.Router();
const { authenticateApiKey } = require('../middleware/authentication');

// Protected admin routes
router.get('/admin/stats', authenticateApiKey, (req, res) => {
  // In a real application, you would fetch stats from your database
  res.json({
    totalSessions: 150,
    activeSessions: 23,
    totalMessages: 1250,
    apiUsage: {
      groq: 450,
      gemini: 320,
      openai: 280,
      deepseek: 200
    }
  });
});

router.get('/admin/users', authenticateApiKey, (req, res) => {
  // In a real application, you would fetch user data
  res.json({
    users: [
      { id: 1, name: 'John Doe', sessions: 5 },
      { id: 2, name: 'Jane Smith', sessions: 8 },
      { id: 3, name: 'Bob Johnson', sessions: 3 }
    ]
  });
});

module.exports = router;