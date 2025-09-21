#!/usr/bin/env python3
"""
Document Embedding Script
Processes various document types and generates embeddings for RAG applications
"""

import os
import argparse
import tempfile
from pathlib import Path
from typing import List, Dict, Any
import numpy as np

# Import required libraries
try:
    from langchain.document_loaders import (
        PyPDFLoader, Docx2txtLoader, UnstructuredPowerPointLoader,
        UnstructuredFileLoader, UnstructuredMarkdownLoader
    )
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.embeddings import OpenAIEmbeddings, HuggingFaceEmbeddings
    from langchain.vectorstores import Chroma, FAISS
    from langchain.schema import Document
except ImportError:
    print("Please install required packages: pip install langchain chromadb docx2txt unstructured")
    exit(1)

class DocumentEmbedder:
    def __init__(self, embedding_model: str = "openai", vector_store: str = "chroma"):
        """
        Initialize the document embedder
        
        Args:
            embedding_model: Type of embedding model ('openai', 'huggingface', or 'gemini')
            vector_store: Type of vector store ('chroma' or 'faiss')
        """
        self.embedding_model = self._setup_embedding_model(embedding_model)
        self.vector_store_type = vector_store
        self.vector_store = None
        
    def _setup_embedding_model(self, model_type: str):
        """Initialize the appropriate embedding model"""
        if model_type == "openai":
            return OpenAIEmbeddings(model="text-embedding-3-large")
        elif model_type == "huggingface":
            return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        elif model_type == "gemini":
            # Gemini embedding setup would go here
            try:
                import google.generativeai as genai
                genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
                # Return a wrapper for Gemini embeddings
                return GeminiEmbeddingWrapper()
            except ImportError:
                raise ImportError("Google Generative AI package required for Gemini embeddings")
        else:
            raise ValueError(f"Unsupported embedding model: {model_type}")

    def load_documents(self, input_path: str) -> List[Document]:
        """
        Load documents from various formats supported by LangChain 
        
        Supported formats: PDF, DOCX, PPTX, TXT, MD, HTML
        """
        document_path = Path(input_path)
        documents = []
        
        if document_path.is_file():
            # Single file processing
            loader = self._get_loader_for_file(document_path)
            if loader:
                documents = loader.load()
        elif document_path.is_dir():
            # Directory processing - handle all supported files
            for ext in ['*.pdf', '*.docx', '*.pptx', '*.txt', '*.md', '*.html']:
                for file_path in document_path.glob(ext):
                    loader = self._get_loader_for_file(file_path)
                    if loader:
                        documents.extend(loader.load())
        
        return documents

    def _get_loader_for_file(self, file_path: Path):
        """Get appropriate loader based on file extension"""
        extension = file_path.suffix.lower()
        
        loaders = {
            '.pdf': PyPDFLoader,
            '.docx': Docx2txtLoader,
            '.doc': Docx2txtLoader,
            '.pptx': UnstructuredPowerPointLoader,
            '.ppt': UnstructuredPowerPointLoader,
            '.txt': UnstructuredFileLoader,
            '.md': UnstructuredMarkdownLoader,
            '.html': UnstructuredFileLoader
        }
        
        if extension in loaders:
            return loaders[extension](str(file_path))
        return None

    def chunk_documents(self, documents: List[Document], 
                       chunk_size: int = 1000, 
                       chunk_overlap: int = 200) -> List[Document]:
        """
        Split documents into smaller chunks for better embedding 
        """
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
        
        return text_splitter.split_documents(documents)

    def create_vector_store(self, documents: List[Document], 
                          persist_directory: str = None) -> Any:
        """
        Create and populate vector store with document embeddings 
        """
        if self.vector_store_type == "chroma":
            self.vector_store = Chroma.from_documents(
                documents=document,
                embedding=self.embedding_model,
                persist_directory=persist_directory
            )
            if persist_directory:
                self.vector_store.persist()
                
        elif self.vector_store_type == "faiss":
            self.vector_store = FAISS.from_documents(
                documents=documents,
                embedding=self.embedding_model
            )
            if persist_directory:
                self.vector_store.save_local(persist_directory)
        
        return self.vector_store

    def process_documents(self, input_path: str, 
                        output_path: str = None,
                        chunk_size: int = 1000,
                        chunk_overlap: int = 200) -> Dict[str, Any]:
        """
        Main method to process documents and generate embeddings 
        """
        # Load documents
        print(f"Loading documents from {input_path}...")
        documents = self.load_documents(input_path)
        
        if not documents:
            return {"success": False, "message": "No documents found or supported"}
        
        print(f"Loaded {len(documents)} documents")
        
        # Chunk documents
        print("Chunking documents...")
        chunked_documents = self.chunk_documents(
            documents, chunk_size, chunk_overlap
        )
        print(f"Created {len(chunked_documents)} chunks")
        
        # Create vector store
        print("Generating embeddings and creating vector store...")
        vector_store = self.create_vector_store(
            chunked_documents, output_path
        )
        
        return {
            "success": True,
            "document_count": len(documents),
            "chunk_count": len(chunked_documents),
            "vector_store": vector_store,
            "vector_store_type": self.vector_store_type
        }

# Gemini Embedding Wrapper (example implementation)
class GeminiEmbeddingWrapper:
    """Wrapper for Gemini embedding functionality """
    def __init__(self):
        import google.generativeai as genai
        self.model = genai.GenerativeModel('models/embedding-001')
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple documents"""
        return [self.embed_query(text) for text in texts]
    
    def embed_query(self, text: str) -> List[float]:
        """Embed a single query"""
        result = self.model.embed_content(text)
        return result['embedding']

def main():
    parser = argparse.ArgumentParser(description="Embed documents for RAG applications")
    parser.add_argument("input_path", help="Path to input file or directory")
    parser.add_argument("--output-path", "-o", help="Path to save vector store")
    parser.add_argument("--embedding-model", "-m", default="openai", 
                       choices=["openai", "huggingface", "gemini"],
                       help="Embedding model to use")
    parser.add_argument("--vector-store", "-v", default="chroma",
                       choices=["chroma", "faiss"],
                       help="Vector store type")
    parser.add_argument("--chunk-size", "-s", type=int, default=1000,
                       help="Chunk size for document splitting")
    parser.add_argument("--chunk-overlap", "-l", type=int, default=200,
                       help="Chunk overlap for document splitting")
    
    args = parser.parse_args()
    
    # Initialize embedder
    embedder = DocumentEmbedder(
        embedding_model=args.embedding_model,
        vector_store=args.vector_store
    )
    
    # Process documents
    result = embedder.process_documents(
        input_path=args.input_path,
        output_path=args.output_path,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap
    )
    
    if result["success"]:
        print(f"Successfully processed {result['document_count']} documents")
        print(f"Created {result['chunk_count']} chunks")
        print(f"Vector store type: {result['vector_store_type']}")
        if args.output_path:
            print(f"Vector store saved to: {args.output_path}")
    else:
        print(f"Error: {result['message']}")

if __name__ == "__main__":
    main()
