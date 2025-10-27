"""COAX RAG Server – no metadata filters, tiny KB friendly."""

import datetime
import json
import logging
import warnings
from dataclasses import dataclass, asdict

# ----------------------------------------------------------------------
# 1. General setup
# ----------------------------------------------------------------------
warnings.filterwarnings("ignore", category=Warning, module="pydantic")
logging.basicConfig(filename="app.log", level=logging.INFO)

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

app = Flask(__name__)

from flask_cors import CORS

if ENVIRONMENT == "development":
    CORS(
        app,
        resources={
            r"/*": {
                "origins": [
                    "http://localhost:8080",
                    "http://127.0.0.1:8080",
                ],
                "methods": ["GET", "POST", "OPTIONS"],
                "allow_headers": ["Content-Type"],
                "supports_credentials": True,
            }
        },
    )
    print("✅ Running in development mode with Flask-CORS enabled")
else:
    print("🚀 Running in production mode with Nginx handling CORS")


# ----------------------------------------------------------------------
# 2. LlamaIndex components (latest, no filters)
# ----------------------------------------------------------------------
import chromadb
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.core.chat_engine import CondenseQuestionChatEngine
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.postprocessor import SimilarityPostprocessor

# Chroma client & collection
chroma_client = chromadb.PersistentClient(path="./coax-chroma_db")
collection_name = "coax_knowledge_db"
chroma_collection = chroma_client.get_or_create_collection(collection_name)

vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# Embedding model
embed_model = HuggingFaceEmbedding(model_name="intfloat/e5-large-v2")

# Load index from persisted vector store
index = VectorStoreIndex.from_vector_store(
    vector_store,
    storage_context=storage_context,
    embed_model=embed_model,
)

# LLM
llm = OpenAI(
    model="gpt-4o-mini",
    api_key=OPENAI_API_KEY,
    temperature=0.0,
    max_tokens=300,
)

# ----------------------------------------------------------------------
# 3. Retriever – **NO FILTERS WHATSOEVER**
# ----------------------------------------------------------------------

retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=5,   # fetch *everything* (or a fixed number if you prefer)
    filters=None,                  # <-- crucial: None → where clause omitted
)

# ----------------------------------------------------------------------
# 4. Optional similarity cutoff (turn off for tiny KB)
# ----------------------------------------------------------------------
# postprocessor = SimilarityPostprocessor(similarity_cutoff=0.0)   # 0.0 = keep all
# OR simply omit it:
postprocessors = []   # <--- empty list = no post-processing

# ----------------------------------------------------------------------
# 5. Query & chat engines
# ----------------------------------------------------------------------
query_engine = RetrieverQueryEngine.from_args(
    retriever=retriever,
    llm=llm,
    node_postprocessors=postprocessors,
)

chat_engine = CondenseQuestionChatEngine.from_defaults(
    query_engine=query_engine,
    llm=llm,
)

# ----------------------------------------------------------------------
# 6. Flask dataclass & endpoints
# ----------------------------------------------------------------------
@dataclass
class Message:
    id: str
    role: str
    content: str
    timestamp: str

    def to_dict(self):
        return asdict(self)


@app.route("/")
def health_check():
    return jsonify({"status": "ok"})


@app.route("/chat", methods=["POST", "OPTIONS"])
def chat_endpoint():
    if request.method == "OPTIONS":
        return make_response()

    payload = request.get_json()
    if not payload:
        return jsonify({"error": "No JSON payload"}), 400

    user_msg = next((m for m in payload.get("messages", []) if m.get("role") == "user"), None)
    if not user_msg:
        return jsonify({"error": "No user message"}), 400

    query = user_msg.get("content", "").strip()
    if not query:
        return jsonify({"error": "Empty query"}), 400

    try:
        response = chat_engine.chat(query)
        answer = str(response).strip()

        logging.info(
            f"Query: {query!r} | Retrieved {len(response.source_nodes)} nodes"
        )

        assistant_msg = Message(
            id=f"assistant-{datetime.datetime.now().timestamp()}",
            role="assistant",
            content=answer,
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )

        metadata = [
            {
                "chunk_id": n.node.node_id,
                "section": n.node.metadata.get("section"),
                "similarity": round(n.score, 4) if n.score is not None else None,
            }
            for n in response.source_nodes
        ]

        data = {"message": assistant_msg.to_dict(), "metadata": metadata}
        return jsonify(data)

    except Exception as exc:
        logging.error(f"RAG error: {exc}", exc_info=True)
        return jsonify({"error": f"RAG error: {exc}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
    # gunicorn -w 4 -b 0.0.0.0:8000 main:app
    