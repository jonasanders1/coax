"""COAX RAG Server for handling chat requests with ChromaDB and OpenAI integration."""

import datetime
import json
import os
from dataclasses import dataclass, asdict, field
from typing import Dict, Any, List, Optional

import chromadb
from dotenv import load_dotenv
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from openai import OpenAI
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Load environment variables
load_dotenv()

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Global collection variable
collection = None

@dataclass
class Message:
    """Message model."""
    id: str
    role: str
    content: str
    timestamp: str

    def to_dict(self):
        return asdict(self)

def init_chroma():
    """Initialize ChromaDB collection."""
    global collection
    try:
        chroma_client = chromadb.PersistentClient(path="./coax-chroma_db")
        embedding_fn = SentenceTransformerEmbeddingFunction(
            model_name="intfloat/e5-large-v2"
        )
        collection = chroma_client.get_collection(
            name="coax_knowledge_db",
            embedding_function=embedding_fn,
        )
        print("Chroma collection 'coax_knowledge_db' loaded successfully.")
        return True
    except Exception as e:
        print(f"Error initializing ChromaDB: {e}")
        return False


@app.route('/')
def health_check():
    """Root endpoint for health checks."""
    return jsonify({"status": "ok"})

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_endpoint():
    """Process chat message and return response using RAG."""
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:8080')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    # Validate collection is initialized
    if collection is None:
        if not init_chroma():
            return jsonify({"error": "ChromaDB collection not initialized"}), 500

    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No JSON payload provided"}), 400

        messages = payload.get('messages', [])
        n_results = payload.get('n_results', 10)

        user_messages = [m for m in messages if m.get("role") == "user"]
        if not user_messages:
            return jsonify({"error": "No user message provided"}), 400

        query = user_messages[-1].get("content", "")

        # Retrieve relevant chunks from ChromaDB
        try:
            results = collection.query(
                query_texts=[query],
                n_results=n_results
            )
            docs = results.get("documents", [[]])
            metadatas = results.get("metadatas", [[]])
            distances = results.get("distances", [[]])
            context_list = docs[0] if docs else []
            context = "\n\n".join(context_list[:5]) if context_list else ""
            print(f"Retrieved {len(context_list)} chunks. Context chars: {len(context)}")
            
        except Exception as e:
            return jsonify({"error": f"Error querying Chroma: {str(e)}"}), 500



        # Generate prompt
        prompt = f"""
        Du er en hjelpsom og vennlig assistent som spesialiserer seg på COAX tankløse varmtvannsberedere. 
        Du skal kun svare på spørsmål relatert til COAX varmtvannsberedere, deres funksjoner, installasjon, tekniske spesifikasjoner eller bruk (f.eks. i boliger, hytter eller industribygg). 
        Bruk informasjonen i konteksten nedenfor, som er på norsk, og svar på norsk. 
        Hvis konteksten inneholder relevant informasjon, men ikke direkte svarer på spørsmålet, gi et kortfattet svar basert på tilgjengelig informasjon, og fokuser på relevante fordeler eller egenskaper hvis mulig. 
        Bruk metadata (seksjon, nøkkelord) for å prioritere relevant informasjon.

        Hvis spørsmålet er utenfor temaet COAX varmtvannsberedere, svar:
        "Beklager, jeg kan kun svare på spørsmål om COAX varmtvannsberedere."

        Hvis konteksten ikke inneholder relevant informasjon, svar:
        "Beklager, jeg kan ikke svare på dette spørsmålet basert på tilgjengelig informasjon."

        Kontekst:
        {context}
        
        Spørsmål:
        {query}

        Svar:
        """.strip()

        try:
            # Query OpenAI API
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.0,
            )
            generated_text = response.choices[0].message.content.strip()
            
            # Create response
            assistant_message = Message(
                id=f"assistant-{datetime.datetime.now().timestamp()}",
                role="assistant",
                content=generated_text,
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            )

            # Prepare metadata
            metadata = None
            if results:
                metadata = [
                    {
                        "chunk_id": chunk_id,
                        "section": meta.get("section") if meta else None,
                        "distance": dist
                    }
                    for chunk_id, meta, dist in zip(
                        results.get("ids", [[]])[0],
                        metadatas[0] if metadatas else [],
                        distances[0] if distances else []
                    )
                ]

            response_data = {
                "message": assistant_message.to_dict(),
                "metadata": metadata
            }
            
            response = make_response(jsonify(response_data))
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:8080')
            return response
            
        except Exception as e:
            return jsonify({"error": f"Error generating response: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Invalid request: {str(e)}"}), 400

# Initialize ChromaDB when the app starts
with app.app_context():
    init_chroma()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)