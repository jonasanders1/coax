# api/schemas.py
from dataclasses import dataclass, asdict
from datetime import datetime
import datetime as dt

@dataclass
class Message:
    id: str
    role: str
    content: str
    timestamp: str

    def to_dict(self):
        return asdict(self)

@dataclass
class ChatRequest:
    messages: list[dict]

    def get_user_query(self) -> str | None:
        for msg in self.messages:
            if msg.get("role") == "user":
                return msg.get("content", "").strip()
        return None