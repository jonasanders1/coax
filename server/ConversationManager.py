from typing import List, Dict
from datetime import datetime

class ConversationManager:
    """Manages conversation history and context"""
    
    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.history: List[Dict[str, str]] = []
    
    def add_exchange(self, user_input: str, bot_response: str):
        """Add a user-bot exchange to history"""
        self.history.append({
            "user": user_input,
            "bot": bot_response,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only recent history
        if len(self.history) > self.max_history:
            self.history = self.history[-self.max_history:]
    
    def get_context(self) -> str:
        """Get recent conversation context"""
        if not self.history:
            return ""
        
        context_parts = []
        for exchange in self.history[-5:]:  # Last 2 exchanges
            context_parts.append(f"User: {exchange['user']}")
            context_parts.append(f"Assistant: {exchange['bot']}")
        
        return "\n".join(context_parts)