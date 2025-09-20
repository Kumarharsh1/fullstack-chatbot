const { qdrantClient } = require('../config/database');
const { generateEmbedding } = require('../utils/embeddings');

// Ingest documents into vector store
exports.ingestDocuments = async (req, res) => {
  try {
    const { documents } = req.body;
    
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ 
        error: 'Documents array is required' 
      });
    }
    
    const points = [];
    
    for (const doc of documents) {
      try {
        // Generate embedding for the document content
        const embedding = await generateEmbedding(doc.content || doc.text);
        
        // Create point for Qdrant
        points.push({
          id: doc.id || Math.random().toString(36).substring(7),
          vector: embedding,
          payload: {
            content: doc.content || doc.text,
            title: doc.title || '',
            source: doc.source || 'unknown',
            timestamp: doc.timestamp || new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error processing document:', error);
      }
    }
    
    // Insert points into Qdrant
    if (points.length > 0) {
      await qdrantClient.upsert(
        process.env.QDRANT_COLLECTION || 'news-articles',
        {
          points: points
        }
      );
    }
    
    res.json({ 
      message: `Successfully ingested ${points.length} documents`,
      ingested: points.length,
      failed: documents.length - points.length
    });
  } catch (error) {
    console.error('Error ingesting documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search for relevant documents
exports.searchDocuments = async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search for similar documents
    const searchResult = await qdrantClient.search(
      process.env.QDRANT_COLLECTION || 'news-articles',
      {
        vector: queryEmbedding,
        limit: parseInt(limit),
        with_payload: true,
        with_vector: false
      }
    );
    
    // Format results
    const results = searchResult.map(result => ({
      id: result.id,
      score: result.score,
      content: result.payload.content,
      title: result.payload.title,
      source: result.payload.source,
      timestamp: result.payload.timestamp
    }));
    
    res.json({ results });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get collection info
exports.getCollectionInfo = async (req, res) => {
  try {
    const collectionName = process.env.QDRANT_COLLECTION || 'news-articles';
    
    const info = await qdrantClient.getCollection(collectionName);
    
    res.json({
      name: info.name,
      status: info.status,
      vectorsCount: info.vectors_count,
      pointsCount: info.points_count
    });
  } catch (error) {
    console.error('Error getting collection info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};