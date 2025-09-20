const { generateEmbedding } = require('../utils/embeddings');
const { qdrantClient } = require('../config/database');

// Retrieve relevant content for a query
exports.retrieveRelevantContent = async (query, limit = 3) => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search for similar content in the vector store
    const searchResult = await qdrantClient.search(
      process.env.QDRANT_COLLECTION || 'news-articles',
      {
        vector: queryEmbedding,
        limit: limit,
        with_payload: true,
        with_vector: false
      }
    );
    
    // Format the results into a context string
    let context = '';
    searchResult.forEach((result, index) => {
      context += `[Source ${index + 1}: ${result.payload.title || 'Unknown'}]\n`;
      context += `${result.payload.content}\n\n`;
    });
    
    return context;
  } catch (error) {
    console.error('Error retrieving relevant content:', error);
    return '';
  }
};

// Ingest multiple documents into the vector store
exports.ingestDocuments = async (documents) => {
  try {
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
      
      return points.length;
    }
    
    return 0;
  } catch (error) {
    console.error('Error ingesting documents:', error);
    throw error;
  }
};