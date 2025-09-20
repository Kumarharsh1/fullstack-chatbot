import requests
import json
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models
import feedparser
import hashlib
import os

# Initialize models and clients
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
qdrant_client = QdrantClient(
    url=os.environ.get("QDRANT_URL", "http://localhost:6333"),
    api_key=os.environ.get("QDRANT_API_KEY")
)

# Collection name
COLLECTION_NAME = os.environ.get("QDRANT_COLLECTION", "news-articles")

def fetch_news_rss(rss_url):
    """Fetch news from RSS feed"""
    feed = feedparser.parse(rss_url)
    articles = []
    
    for entry in feed.entries:
        article = {
            'title': entry.title,
            'summary': entry.summary if hasattr(entry, 'summary') else '',
            'link': entry.link,
            'published': entry.published if hasattr(entry, 'published') else '',
            'source': 'rss'
        }
        articles.append(article)
    
    return articles

def fetch_reuters_news():
    """Fetch news from Reuters sitemap"""
    sitemap_url = "https://www.reuters.com/arc/outboundfeeds/sitemap-index/?outputType=xml"
    
    try:
        response = requests.get(sitemap_url)
        # Parse sitemap and extract news URLs
        # This is a simplified implementation
        # A real implementation would parse the sitemap XML and extract article URLs
        
        # For demo purposes, we'll return some mock data
        return [
            {
                'title': 'Sample Reuters Article 1',
                'summary': 'This is a summary of a sample Reuters article',
                'link': 'https://www.reuters.com/article/sample1',
                'published': '2023-10-01T12:00:00Z',
                'source': 'reuters'
            },
            {
                'title': 'Sample Reuters Article 2',
                'summary': 'This is a summary of another sample Reuters article',
                'link': 'https://www.reuters.com/article/sample2',
                'published': '2023-10-01T13:00:00Z',
                'source': 'reuters'
            }
        ]
    except Exception as e:
        print(f"Error fetching Reuters news: {e}")
        return []

def generate_embedding(text):
    """Generate embedding for text"""
    return model.encode(text).tolist()

def generate_document_id(text):
    """Generate a unique ID for a document"""
    return hashlib.md5(text.encode()).hexdigest()

def ingest_articles(articles):
    """Ingest articles into vector database"""
    points = []
    
    for article in articles:
        # Combine title and summary for embedding
        text = f"{article['title']} {article['summary']}"
        
        # Generate embedding
        embedding = generate_embedding(text)
        
        # Create point for Qdrant
        point = models.PointStruct(
            id=generate_document_id(text),
            vector=embedding,
            payload=article
        )
        
        points.append(point)
    
    # Upload to Qdrant
    if points:
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print(f"Ingested {len(points)} articles into Qdrant")
    else:
        print("No articles to ingest")

if __name__ == "__main__":
    # Fetch news from multiple sources
    rss_articles = fetch_news_rss("https://feeds.reuters.com/reuters/topNews")
    reuters_articles = fetch_reuters_news()
    
    # Combine articles
    all_articles = rss_articles + reuters_articles
    
    # Ingest into vector database
    ingest_articles(all_articles)