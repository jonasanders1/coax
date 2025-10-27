# rag/engine.py
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.llms.openai import OpenAI
from llama_index.core.chat_engine import CondenseQuestionChatEngine
from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)

def build_retriever(index):
    return VectorIndexRetriever(
        index=index,
        similarity_top_k=settings.SIMILARITY_TOP_K,
        filters=None,  # Explicitly no filters
    )

def build_query_engine(index, llm):
    retriever = build_retriever(index)
    return RetrieverQueryEngine.from_args(
        retriever=retriever,
        llm=llm,
        node_postprocessors=[],  # No cutoff
    )

def build_chat_engine(index):
    llm = OpenAI(
        model=settings.LLM_MODEL,
        api_key=settings.OPENAI_API_KEY,
        temperature=settings.TEMPERATURE,
        max_tokens=settings.MAX_TOKENS,
    )
    query_engine = build_query_engine(index, llm)
    chat_engine = CondenseQuestionChatEngine.from_defaults(
        query_engine=query_engine,
        llm=llm,
    )
    logger.info("Chat engine initialized (streaming-ready).")
    return chat_engine