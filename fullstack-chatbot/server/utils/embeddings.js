// For production, you would use a proper embedding service
// For demo purposes, we'll use a simple TF-IDF like approach

// Simple embedding function (in production, use a proper embedding model)
exports.generateEmbedding = async (text) => {
  // This is a simplified version - in a real application, you would use
  // a proper embedding model like SentenceTransformers, OpenAI embeddings, etc.
  
  // Convert text to lowercase and split into words
  const words = text.toLowerCase().split(/\s+/);
  
  // Create a simple bag-of-words representation
  // In a real application, you would use a proper embedding model
  const embedding = Array(768).fill(0);
  
  // Simple hash-based embedding for demo purposes
  words.forEach(word => {
    // Simple hash function to distribute words across dimensions
    const hash = word.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const index = hash % 768;
    embedding[index] = (embedding[index] + 1) * 0.1; // Simple weighting
  });
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((acc, val) => acc + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }
  
  return embedding;
};

// Calculate cosine similarity between two embeddings
exports.cosineSimilarity = (embeddingA, embeddingB) => {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embeddings must have the same length');
  }
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    magnitudeA += embeddingA[i] * embeddingA[i];
    magnitudeB += embeddingB[i] * embeddingB[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
};