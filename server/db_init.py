import shutil
import os
import uuid
# import chromadb
# from sentence_transformers import SentenceTransformer
# from transformers import AutoTokenizer
# from markdown import markdown
# from bs4 import BeautifulSoup
# from openai import OpenAI
from dotenv import load_dotenv
import json
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# Load environment variables
load_dotenv()
# openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ------------------------------------------------------------------
# 1. SETTINGS
# ------------------------------------------------------------------
DB_PATH = "./coax-chroma_db"
FOLDER_PATH = "./documents"
EMBEDDER_MODEL = "intfloat/e5-large-v2"

# ------------------------------------------------------------------
# 2. OPTIONAL CLEAN-UP
# ------------------------------------------------------------------
if os.path.exists(DB_PATH):
    shutil.rmtree(DB_PATH)
    print("Removed old Chroma DB.")

# ------------------------------------------------------------------
# 3. EMBEDDING & TOKENIZER
# ------------------------------------------------------------------
# tokenizer = AutoTokenizer.from_pretrained(EMBEDDER_MODEL)
# embedder = SentenceTransformer(EMBEDDER_MODEL)
# embedding_fn = SentenceTransformerEmbeddingFunction(model_name=EMBEDDER_MODEL)

# ------------------------------------------------------------------
# 4. SEMANTIC CHUNKING
# ------------------------------------------------------------------
# def parse_markdown(file_path: str) -> list:
#     """Parse Markdown file into semantic sections."""
#     with open(file_path, "r", encoding="utf-8") as f:
#         md_content = f.read()
    
#     # Convert Markdown to HTML for easier parsing
#     html = markdown(md_content)
#     soup = BeautifulSoup(html, "html.parser")
    
#     chunks = []
#     current_chunk = []
#     current_heading = None
    
#     for element in soup.children:
#         if element.name in ("h1", "h2", "h3", "h4"):
#             # Start a new chunk on heading
#             if current_chunk:
#                 chunks.append("\n".join(current_chunk).strip())
#                 current_chunk = []
#             current_heading = element.get_text().strip()
#             current_chunk.append(element.get_text())
#         elif element.name in ("p", "ul", "ol", "table"):
#             # Add paragraphs, lists, and tables to the current chunk
#             current_chunk.append(element.get_text().strip())
#         elif element.get_text().strip():
#             # Handle plain text or other elements
#             current_chunk.append(element.get_text().strip())
    
#     # Add the final chunk
#     if current_chunk:
#         chunks.append("\n".join(current_chunk).strip())
    
#     return chunks

# def generate_metadata(chunk: str) -> dict:
#     """Use OpenAI API to generate metadata for a chunk."""
#     prompt = f"""
#     Analyser følgende tekst på norsk og generer metadata for bruk i en vektordatabase. Metadata skal inkludere:
#     - section: Navnet på seksjonen (f.eks. "Oversikt", "XFJ-2", "FAQ").
#     - tags: Relevante nøkkelord som en kommaseparert streng (f.eks. "vannvarmer,COAX,energieffektiv").
#     - summary: En kort oppsummering av innholdet (1–2 setninger).
#     - priority: "High", "Medium" eller "Low" basert på viktighet (produktbeskrivelser = High, kontaktinfo = Low).

#     Tekst:
#     {chunk}

#     Svar i JSON-format:
#     ```json
#     {{
#         "section": "",
#         "tags": "",
#         "summary": "",
#         "priority": ""
#     }}
#     ```
#     """
#     try:
#         response = openai_client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=150,
#             temperature=0.0
#         )
#         metadata = json.loads(response.choices[0].message.content.strip("```json\n").strip("\n```"))
#         # Ensure tags is a string, not a list
#         if isinstance(metadata["tags"], list):
#             metadata["tags"] = ",".join(metadata["tags"])
#         return metadata
#     except Exception as e:
#         print(f"Error generating metadata: {e}")
#         return {
#             "section": "Ukjent",
#             "tags": "",
#             "summary": "Kunne ikke generere oppsummering.",
#             "priority": "Medium"
#         }

# ------------------------------------------------------------------
# 5. CHROMA CLIENT + COLLECTION
# ------------------------------------------------------------------
# client = chromadb.PersistentClient(path=DB_PATH)
# collection = client.get_or_create_collection(
#     name="coax_knowledge_db",
#     embedding_function=embedding_fn,
#     metadata={"hnsw:space": "cosine"},
# )
# print("Created new Chroma collection: 'coax_knowledge_db'")

# ------------------------------------------------------------------
# 6. PROCESS EACH MARKDOWN FILE
# ------------------------------------------------------------------
# for file in os.listdir(FOLDER_PATH):
#     if not file.endswith(".md"):
#         continue

#     file_path = os.path.join(FOLDER_PATH, file)

#     try:
#         # Parse Markdown into semantic chunks
#         chunks = parse_markdown(file_path)
        
#         # Filter out empty or overly short chunks
#         chunks = [c for c in chunks if len(c.strip()) > 50]
        
#         # Generate metadata and validate chunk size
#         texts, metadatas = [], []
#         for chunk in chunks:
#             # Check chunk size (aim for 500–1500 chars)
#             if len(chunk) > 1500:
#                 # Split large chunks
#                 sub_chunks = [chunk[i:i+1000] for i in range(0, len(chunk), 1000)]
#             else:
#                 sub_chunks = [chunk]
            
#             for sub_chunk in sub_chunks:
#                 texts.append(sub_chunk)
#                 metadata = generate_metadata(sub_chunk)
#                 metadata.update({
#                     "source_file": file,
#                     "language": "Norwegian"
#                 })
#                 metadatas.append(metadata)
        
#         # Generate embeddings
#         embeddings = embedder.encode(
#             texts, batch_size=16, show_progress_bar=True, normalize_embeddings=True
#         ).tolist()

#         # Create IDs
#         ids = [f"{file}_{i}_{uuid.uuid4().hex[:8]}" for i in range(len(texts))]

#         # Store in ChromaDB
#         collection.add(
#             ids=ids,
#             embeddings=embeddings,
#             documents=texts,
#             metadatas=metadatas,
#         )
#         print(f"{len(texts)} chunks stored from {file}")
#         for i, (txt, meta) in enumerate(zip(texts, metadatas)):
#             print(f"Chunk {i}: {txt[:100]}... | Metadata: {meta}")
#     except Exception as e:
#         print(f"Failed to process {file}: {e}")
#         continue

# print("\nCOAX Vector DB created and populated successfully!")