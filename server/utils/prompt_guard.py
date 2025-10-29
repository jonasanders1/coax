# utils/prompt_guard.py
import re
from utils.logger import get_logger

logger = get_logger(__name__)

# Common injection patterns (expand as needed)
INJECTION_PATTERNS = [
    r'ignore\s+(previous|all|instructions)',  # e.g., "ignore previous instructions"
    r'system\s+prompt',                       # Attempts to override system prompt
    r'(?i)forget\s+everything',               # Case-insensitive "forget everything"
    r'base64\s*decode',                       # Potential encoded payloads
    r'(?i)reveal\s+(secret|key|prompt)',      # Attempts to extract secrets
    # Add more regex for known jailbreaks
]

def check_for_injection(query: str) -> bool:
    """
    Returns True if potential injection detected.
    """
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, query, re.IGNORECASE):
            logger.warning(f"Potential prompt injection detected: {query}")
            return True
    return False