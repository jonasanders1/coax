import shutil
import os
import uuid

from dotenv import load_dotenv
import json
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction


load_dotenv()

DB_PATH = "./coax-chroma_db"
FOLDER_PATH = "./documents"
EMBEDDER_MODEL = "intfloat/e5-large-v2"

if os.path.exists(DB_PATH):
    shutil.rmtree(DB_PATH)
    print("Removed old Chroma DB.")