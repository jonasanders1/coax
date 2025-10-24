import chromadb
import json
import os

# Connect to ChromaDB
client = chromadb.PersistentClient(path="./coax-chroma_db")
collection_name = "coax_knowledge_db"

# Get existing collection data
try:
    collection = client.get_collection(collection_name)
    print(f"Found collection: {collection_name}")
except:
    print(f"No collection found, creating new one")
    client.create_collection(collection_name)
    quit()

# Export data
items = collection.get()
ids = items["ids"]
embeddings = items.get("embeddings", [])
documents = items["documents"]
metadatas = items["metadatas"]

# Delete old collection
client.delete_collection(collection_name)

# Create new collection with updated config
new_collection = client.create_collection(collection_name)

# Re-insert data
if ids:
    new_collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings if embeddings else None
    )
    print(f"Migrated {len(ids)} items to new collection")
else:
    print("No data to migrate")