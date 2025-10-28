# api/auth.py
import os
from flask import request, jsonify
from functools import wraps

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # === ALLOW OPTIONS WITHOUT AUTH ===
        if request.method == "OPTIONS":
            return f(*args, **kwargs)

        api_key = request.headers.get('X-API-Key')
        expected_key = os.getenv('RAG_API_KEY')

        if not api_key or api_key != expected_key:
            return jsonify({"error": "Unauthorized"}), 401

        return f(*args, **kwargs)
    return decorated_function