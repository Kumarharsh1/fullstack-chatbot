const { validateApiKey } = require('../services/validationService');

// Validate API key endpoint
exports.validateKey = async (req, res) => {
  try {
    const { apiKey, serviceType } = req.body;
    
    if (!apiKey || !serviceType) {
      return res.status(400).json({ 
        error: 'API key and service type are required' 
      });
    }
    
    const isValid = await validateApiKey(apiKey, serviceType);
    
    res.json({ 
      valid: isValid,
      service: serviceType
    });
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get API key usage statistics
exports.getKeyStats = async (req, res) => {
  try {
    const { apiKey } = req.params;
    
    // In a real implementation, you would query your database for usage stats
    // For now, we'll return mock data
    const stats = {
      totalRequests: 150,
      requestsToday: 23,
      lastUsed: new Date().toISOString(),
      cost: 12.50 // in dollars
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting API key stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};