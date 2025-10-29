import os
import json
from llama_index.core import VectorStoreIndex, StorageContext, SimpleDirectoryReader
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.openai import OpenAI
import warnings
from llama_index.core.node_parser import MarkdownNodeParser
from llama_index.core.extractors import BaseExtractor
from dotenv import load_dotenv

warnings.filterwarnings("ignore", category=Warning, module="pydantic")
import chromadb

# Custom metadata extractor for COAX
class CoaxMetadataExtractor(BaseExtractor):
    def __init__(self, llm, **kwargs):
        super().__init__(**kwargs)
        self._llm = llm

    async def aextract(self, nodes):
        for node in nodes:
            prompt = f"""
            Analyser følgende tekst på norsk og generer metadata for bruk i en vektordatabase. Metadata skal inkludere:
            - section: Navnet på seksjonen (f.eks. "Oversikt", "XFJ-2", "FAQ").
            - tags: Relevante nøkkelord som en kommaseparert streng (f.eks. "vannvarmer,COAX,energieffektiv").
            - summary: En kort oppsummering av innholdet (1–2 setninger).
            - priority: "High", "Medium" eller "Low" basert på viktighet (produktbeskrivelser = High, kontaktinfo = Low).

            Tekst:
            {node.text[:1500]}

            Svar i JSON-format:
            ```json
            {{
                "section": "",
                "tags": "",
                "summary": "",
                "priority": ""
            }}
            ```
            """
            try:
                response = await self._llm.acomplete(
                    prompt=prompt,
                    max_tokens=150,
                    temperature=0.0
                )
                metadata = json.loads(response.text.strip("```json\n").strip("\n```"))
                if isinstance(metadata["tags"], list):
                    metadata["tags"] = ",".join(metadata["tags"])
                metadata.update({
                    "source_file": node.metadata.get("file_name", "unknown"),
                    "language": "Norwegian"
                })
                node.metadata.update(metadata)  # Update node metadata in-place
            except Exception as e:
                print(f"Error generating metadata: {e}")
                node.metadata.update({
                    "section": "Ukjent",
                    "tags": "",
                    "summary": "Kunne ikke generere oppsummering.",
                    "priority": "Medium",
                    "source_file": node.metadata.get("file_name", "unknown"),
                    "language": "Norwegian"
                })
        return nodes  # Return the updated nodes

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./coax-chroma_db")
try:
    chroma_client.delete_collection("coax_knowledge_db")
except:
    pass
chroma_collection = chroma_client.create_collection("coax_knowledge_db", metadata={"hnsw:space": "cosine"})
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# Initialize LLM and embedding model
llm = OpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY, temperature=0.0, max_tokens=150)

embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# Initialize node parser and metadata extractor
node_parser = MarkdownNodeParser()
metadata_extractor = CoaxMetadataExtractor(llm=llm)

# Load COAX document
documents = SimpleDirectoryReader(
    input_dir="./documents",
    file_metadata=lambda x: {"file_name": os.path.basename(x)}
).load_data()

# Parse into nodes and extract metadata
nodes = node_parser.get_nodes_from_documents(documents)
nodes = metadata_extractor.extract(nodes)  # Updates nodes with metadata

# Build index
index = VectorStoreIndex(
    nodes,
    storage_context=storage_context,
    embed_model=embed_model,
    show_progress=True
)

print("New ChromaDB collection 'coax_knowledge_db' created and populated successfully!")
