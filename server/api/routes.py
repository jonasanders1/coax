# api/routes.py
from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
import datetime as dt
from api.schemas import Message, ChatRequest
from rag.chat import get_chat_engine
from utils.logger import get_logger

bp = Blueprint('api', __name__)
logger = get_logger(__name__)

chat_engine = get_chat_engine()  # Singleton

@bp.route("/")
def health_check():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})

@bp.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return make_response()

    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No JSON payload"}), 400

        chat_req = ChatRequest(messages=payload.get("messages", []))
        query = chat_req.get_user_query()
        if not query:
            return jsonify({"error": "No user message"}), 400

        response = chat_engine.chat(query)
        answer = str(response).strip()

        logger.info(f"Query: {query!r} | Nodes: {len(response.source_nodes)}")

        assistant_msg = Message(
            id=f"assistant-{dt.datetime.now().timestamp()}",
            role="assistant",
            content=answer,
            timestamp=dt.datetime.now(dt.timezone.utc).isoformat(),
        )

        metadata = [
            {
                "chunk_id": n.node.node_id,
                "section": n.node.metadata.get("section"),
                "similarity": round(n.score, 4) if n.score else None,
            }
            for n in response.source_nodes
        ]

        return jsonify({
            "message": assistant_msg.to_dict(),
            "metadata": metadata
        })

    except Exception as exc:
        logger.error(f"RAG error: {exc}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500