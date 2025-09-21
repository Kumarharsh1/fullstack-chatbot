# Multi-AI Chatbot API Documentation

Base URL: `https://your-domain.com/api`

This API enables chat interactions, document ingestion and retrieval (RAG), and API key management across multiple AI services including Grok, Gemini, OpenAI, and DeepSeek.
## Authentication

Most endpoints require an API key passed in the request body:
```json
{
  "apiKey": "your-api-key",
  "serviceType": "groq"
}

### 3. **Endpoints**

#### 🗨️ Chat Endpoints
```md
### Send a Message
- **URL**: `/chat`
- **Method**: `POST`
- **Body**:
```json
{
  "message": "Hello, how are you?",
  "sessionId": "optional-session-id",
  "apiKey": "your-api-key",
  "serviceType": "groq",
  "characteristic": "news"
}
{
  "response": "I'm doing well, thank you!",
  "sessionId": "generated-session-id",
  "history": [
    {"role": "user", "content": "Hello, how are you?"},
    {"role": "assistant", "content": "I'm doing well, thank you!"}
  ]
}

Repeat this format for:
- `/chat/history/:sessionId` (GET)
- `/chat/history/:sessionId` (DELETE)

#### 🔑 API Key Endpoints
Document `/validate-key` and `/key-stats/:apiKey` similarly.

#### 📄 RAG Endpoints
Include:
- `/rag/ingest` (POST)
- `/rag/search` (POST)
- `/rag/collection-info` (GET)

### 4. **WebSocket Events**
```md
## WebSocket Events

- `message`: New chat message
- `typing_start`: User started typing
- `typing_stop`: User stopped typing
- `session_update`: Session information updated
## Rate Limiting

- Chat endpoints: 100 requests per 15 minutes
- API key validation: 50 requests per hour
## Status Codes

- `200 OK`: Request was successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
## Support

- Email: support@your-domain.com
- Documentation: https://your-domain.com/docs
- GitHub: https://github.com/your-username/your-repo

## Changelog

### v1.0.0 (2023-10-01)
- Initial release
- Support for Groq, Gemini, OpenAI, DeepSeek
- RAG with Qdrant
- Redis-based session management