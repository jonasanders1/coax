
"""COAX RAG Server with LlamaIndex for advanced retrieval and conversation history."""

import datetime
import json
import os
import logging
import warnings
from dataclasses import dataclass, asdict
from typing import List

# Suppress Pydantic warning
warnings.filterwarnings("ignore", category=Warning, module="pydantic")

import chromadb
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.core.chat_engine import CondenseQuestionChatEngine
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.core.vector_stores.types import (
    MetadataFilter,
    MetadataFilters,
)

from dotenv import load_dotenv

# Initialize logging
logging.basicConfig(filename="app.log", level=logging.INFO)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],  # Match frontend
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

# Initialize LlamaIndex components
chroma_client = chromadb.PersistentClient(path="./coax-chroma_db")
try:
    chroma_collection = chroma_client.get_or_create_collection("coax_knowledge_db")
except Exception as e:
    logging.error(f"Failed to load collection, resetting: {str(e)}")
    chroma_client.delete_collection("coax_knowledge_db")
    chroma_collection = chroma_client.create_collection("coax_knowledge_db")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)


# Embedding model
embed_model = HuggingFaceEmbedding(model_name="intfloat/e5-large-v2")

index = VectorStoreIndex.from_vector_store(
    vector_store,
    storage_context=storage_context,
    embed_model=embed_model
)

# LLM
llm = OpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY, temperature=0.0, max_tokens=300)

# Retriever WITHOUT filters
retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=10, # fetch top 10 most similar chunks
    filters=MetadataFilters(filters=[])
)

# Optional: post-processing to rerank by similarity
postprocessor = SimilarityPostprocessor(similarity_cutoff=0.7)

# Query engine
query_engine = RetrieverQueryEngine.from_args(
    retriever=retriever,
    llm=llm,
    node_postprocessors=[postprocessor]
)

# Chat engine with history
chat_engine = CondenseQuestionChatEngine.from_defaults(
    query_engine=query_engine,
    llm=llm
)

@dataclass
class Message:
    """Message model."""
    id: str
    role: str
    content: str
    timestamp: str

    def to_dict(self):
        return asdict(self)

@app.route('/')
def health_check():
    """Root endpoint for health checks."""
    return jsonify({"status": "ok"})

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_endpoint():
    """Process chat message and return response using LlamaIndex RAG (no filters)."""
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:8080')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    payload = request.get_json()
    if not payload:
        return jsonify({"error": "No JSON payload provided"}), 400

    messages = payload.get('messages', [])
    user_messages = [m for m in messages if m.get("role") == "user"]
    if not user_messages:
        return jsonify({"error": "No user message provided"}), 400

    query = user_messages[-1].get("content", "")

    try:
        # Run chat engine (no need to touch filters)
        response = chat_engine.chat(query)
        generated_text = str(response).strip()
        logging.info(f"Query: {query}, Retrieved: {len(response.source_nodes)} chunks")

        # Prepare assistant message
        assistant_message = Message(
            id=f"assistant-{datetime.datetime.now().timestamp()}",
            role="assistant",
            content=generated_text,
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )

        # Collect metadata from retrieved chunks
        metadata = [
            {
                "chunk_id": node.node.node_id,
                "section": node.node.metadata.get("section"),
                "similarity": node.score
            }
            for node in response.source_nodes
        ]

        response_data = {
            "message": assistant_message.to_dict(),
            "metadata": metadata
        }

        resp = make_response(jsonify(response_data))
        resp.headers.add('Access-Control-Allow-Origin', 'http://localhost:8080')
        print("MODEL_RESPONSE: ", response_data)
        return resp

    except Exception as e:
        logging.error(f"Error querying RAG chain: {str(e)}")
        return jsonify({"error": f"Error querying RAG chain: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
