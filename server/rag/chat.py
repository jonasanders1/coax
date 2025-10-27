# rag/chat.py
from .index import load_index
from .engine import build_chat_engine

_chat_engine = None

def get_chat_engine():
    global _chat_engine
    if _chat_engine is None:
        index = load_index()
        _chat_engine = build_chat_engine(index)
    return _chat_engine