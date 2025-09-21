# embed-documents.py

from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from sentence_transformers import SentenceTransformer

# 1. Connect to Qdrant
client = QdrantClient("http://localhost:6333")  # change if using docker/remote

# 2. Initialize embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# 3. Create a Qdrant collection (if not exists)
collection_name = "documents"
client.recreate_collection(
    collection_name=collection_name,
    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
)

# 4. Example documents (replace with your text loading logic)
docs = [
    {"id": 1, "text": "Climate change affects biodiversity."},
    {"id": 2, "text": "Machine learning improves medical records search."},
    {"id": 3, "text": "Qdrant is a vector database for similarity search."}
]

# 5. Generate embeddings
vectors = [model.encode(doc["text"]).tolist() for doc in docs]

# 6. Upload to Qdrant
client.upsert(
    collection_name=collection_name,
    points=[
        {
            "id": doc["id"],
            "vector": vector,
            "payload": {"text": doc["text"]}
        }
        for doc, vector in zip(docs, vectors)
    ]
)

print("✅ Documents embedded and stored in Qdrant!")
