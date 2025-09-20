# Deployment Guide

## Prerequisites
- Node.js 16+ 
- Python 3.8+ (for news ingestion script)
- Redis
- PostgreSQL (optional)
- Qdrant vector database

## Local Development

1. Clone the repository
2. Install backend dependencies: `cd server && npm install`
3. Install frontend dependencies: `cd client && npm install`
4. Set up environment variables (see .env.example files)
5. Start Redis: `redis-server`
6. Start Qdrant: `docker run -p 6333:6333 qdrant/qdrant`
7. Run news ingestion: `cd scripts && python ingest-news.py`
8. Start backend: `cd server && npm run dev`
9. Start frontend: `cd client && npm start`

## Deployment to Render

1. Fork the repository
2. Connect your GitHub account to Render
3. Create a new Web Service and point to your fork
4. Add environment variables in Render dashboard
5. Deploy

## Environment Variables

### Backend (.env)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)
- `REDIS_URL`: Redis connection string
- `DATABASE_URL`: PostgreSQL connection string (optional)
- `QDRANT_URL`: Qdrant server URL
- `QDRANT_API_KEY`: Qdrant API key
- `QDRANT_COLLECTION`: Qdrant collection name

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL

## News Ingestion

Set up a cron job to regularly ingest news:
```bash
# Run every 6 hours
0 */6 * * * cd /path/to/scripts && python ingest-news.py