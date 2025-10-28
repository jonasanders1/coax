# config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    RAG_API_KEY: str = os.getenv("RAG_API_KEY")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CHROMA_DB_PATH: str = "./coax-chroma_db"
    COLLECTION_NAME: str = "coax_knowledge_db"
    EMBED_MODEL_NAME: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    LLM_MODEL: str = "gpt-4o-mini"
    SIMILARITY_TOP_K: int = 5
    PORT: int = 8000
    TEMPERATURE: float = 0.0
    MAX_TOKENS: int = 300
    HOST: str = "0.0.0.0"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    def validate(self):
        if not self.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable not set")

settings = Settings()
settings.validate()