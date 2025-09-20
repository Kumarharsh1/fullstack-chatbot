const { QdrantClient } = require('@qdrant/js-client-rest');
const { Pool } = require('pg');
const redis = require('redis');

// PostgreSQL configuration (optional)
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Redis configuration
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Qdrant vector database configuration
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const initializeVectorStore = async () => {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis');
    
    // Check if collection exists, create if not
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      col => col.name === process.env.QDRANT_COLLECTION || 'news-articles'
    );
    
    if (!collectionExists) {
      await qdrantClient.createCollection(
        process.env.QDRANT_COLLECTION || 'news-articles', 
        {
          vectors: {
            size: 768, // Jina Embeddings size
            distance: 'Cosine'
          }
        }
      );
      console.log('Created new Qdrant collection');
    }
    
    console.log('Vector store initialized');
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
};

module.exports = {
  pgPool,
  redisClient,
  qdrantClient,
  initializeVectorStore
};