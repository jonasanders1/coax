import shutil

import chromadb
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer

from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction


DB_PATH = "./coax-chroma_db"
FOLDER_PATH = "./documents"
EMBEDDER_MODEL = "intfloat/e5-large-v2"

tokenizer = AutoTokenizer.from_pretrained(EMBEDDER_MODEL)
embedder = SentenceTransformer(EMBEDDER_MODEL)
embedding_fn = SentenceTransformerEmbeddingFunction(model_name=EMBEDDER_MODEL)


client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_collection(
    name="coax_knowledge_db"
)

# ------------------------------------------------------------------
# 7. QUICK TEST QUERY
# ------------------------------------------------------------------
test_query = "Hva er fordelene med COAX vannvarmer?"
q_emb = embedder.encode(test_query, normalize_embeddings=True).tolist()

results = collection.query(
    query_embeddings=[q_emb],
    n_results=4,
    include=["documents", "metadatas", "distances"],
)

print("\n--- TEST QUERY ------------------------------------------------")
print(f"Query: {test_query}\n")

for doc, meta, dist in zip(
    results["documents"][0],
    results["metadatas"][0],
    results["distances"][0],
):
    print(f"[{dist:.4f}] {meta['source_file']}")
    print(f"   Preview: {doc[:300].strip()}...\n")