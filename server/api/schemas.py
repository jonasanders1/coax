# api/schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict
import datetime as dt


class Message(BaseModel):
    id: str
    role: str = Field(..., pattern="^(user|assistant|system)$")  # Restrict roles to valid ones
    content: str = Field(..., min_length=1, max_length=4096)  # Prevent empty or overly long content
    timestamp: str

    @field_validator("timestamp")
    def validate_timestamp(cls, v):
        try:
            dt.datetime.fromisoformat(v)
        except ValueError:
            raise ValueError("Invalid ISO timestamp format")
        return v


class ChatRequest(BaseModel):
    messages: List[Dict[str, str]] = Field(..., min_items=1, max_items=50)  # Limit history to prevent DoS attacks

    def get_user_query(self) -> str | None:
        # Iterate in reverse to get the most recent user message
        for msg in reversed(self.messages):
            if msg.get("role") == "user":
                return msg.get("content", "").strip()
        return None