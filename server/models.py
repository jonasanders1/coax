
from pydantic import BaseModel
from typing import Literal, List

class Message(BaseModel):
    id: str
    role: Literal['user', 'assistant']
    content: str
    timestamp: str

class ChatRequest(BaseModel):
    messages: List[Message]
    n_results: int | None = 5

class ChatResponse(BaseModel):
    message: Message
    
