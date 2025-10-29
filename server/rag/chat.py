# rag/chat.py
from .index import load_index
from .engine import build_chat_engine, build_query_engine
from .index import load_index

_chat_engine = None
_query_engine = None
_index = None

def get_chat_engine():
    global _chat_engine
    if _chat_engine is None:
        index = get_index()
        _chat_engine = build_chat_engine(index)
    return _chat_engine

def get_query_engine():
    """Get query engine directly for testing/debugging"""
    global _query_engine
    if _query_engine is None:
        from llama_index.llms.openai import OpenAI
        from config.settings import settings
        index = get_index()
        llm = OpenAI(
            model=settings.LLM_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=settings.TEMPERATURE,
            max_tokens=settings.MAX_TOKENS,
        )
        _query_engine = build_query_engine(index, llm)
    return _query_engine

def get_index():
    global _index
    if _index is None:
        _index = load_index()
    return _index