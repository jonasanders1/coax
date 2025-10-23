"""COAX RAG Server for handling chat requests with ChromaDB and OpenAI integration."""

import datetime
import os
from typing import Dict, Any, List, Optional

import chromadb
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# Load environment variables
load_dotenv()

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Load environment variables
load_dotenv()

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(
    title="COAX RAG Server",
    description="API for COAX RAG chat application",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global collection variable
collection: Optional[Any] = None

class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    messages: List[Dict[str, Any]]
    n_results: int = 10

class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    message: Dict[str, Any]
    metadata: Optional[List[Dict[str, Any]]] = None

class Message(BaseModel):
    """Message model."""
    id: str
    role: str
    content: str
    timestamp: str

@app.on_event("startup")
async def startup_event() -> None:
    """Initialize ChromaDB collection on startup."""
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
    except Exception as e:
        print(f"Error initializing ChromaDB: {e}")
        raise

@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint for health checks."""
    return {"status": "ok"}

@app.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Process chat message and return response"
)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    """
    Process a chat message and return a response using RAG.
    
    Args:
        payload: The chat request payload containing messages and configuration.
        
    Returns:
        ChatResponse: The assistant's response.
        
    Raises:
        HTTPException: If there's an error processing the request.
    """
    # Validate collection is initialized
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ChromaDB collection not initialized"
        )

    n_results = payload.n_results or 10
    user_messages = [m for m in payload.messages if m.get("role") == "user"]
    
    if not user_messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No user message provided."
        )
        
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying Chroma: {str(e)}"
        ) from e
            
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
            temperature=0.0,  # Factual responses
        )
        generated_text = response.choices[0].message.content.strip()
        
        # Create response
        assistant_message = Message(
            id=f"assistant-{datetime.datetime.now().timestamp()}",
            role="assistant",
            content=generated_text,
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )

        return ChatResponse(
            message=assistant_message.dict(),
            metadata=[
                {
                    "chunk_id": chunk_id,
                    "section": meta.get("section"),
                    "distance": dist
                }
                for chunk_id, meta, dist in zip(
                    results.get("ids", [[]])[0],
                    metadatas[0] if metadatas else [],
                    distances[0] if distances else []
                )
            ]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        ) from e

def main() -> None:
    """Run the FastAPI application."""
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()