# api/routes.py
from flask import Blueprint, request, jsonify, make_response, Response
from datetime import datetime
import datetime as dt
from api.schemas import Message, ChatRequest
from rag.chat import get_chat_engine
from utils.logger import get_logger
import json

bp = Blueprint('api', __name__)
logger = get_logger(__name__)

chat_engine = get_chat_engine()  # Singleton

@bp.route("/")
def health_check():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})

# api/routes.py
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

        def generate():
            try:
                stream_response = chat_engine.stream_chat(query)
                tokens = []

                # Initialize tokens list
                tokens = []
                
                # Stream tokens + collect
                for token in stream_response.response_gen:
                    tokens.append(token)
                    yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"

                full_content = "".join(tokens)

                # Get metadata from source nodes if available
                metadata = []
                if hasattr(stream_response, 'source_nodes'):
                    metadata = [
                        {
                            'node_id': node.node.node_id,
                            'score': float(node.score) if node.score is not None else None,
                            'text': node.node.text[:200] + '...' if node.node.text else '',
                            'metadata': dict(node.node.metadata) if hasattr(node.node, 'metadata') else {}
                        }
                        for node in stream_response.source_nodes
                    ]

                # Final message with metadata
                assistant_msg = Message(
                    id=f"assistant-{dt.datetime.now().timestamp()}",
                    role="assistant",
                    content=full_content,
                    timestamp=dt.datetime.now(dt.timezone.utc).isoformat(),
                )
                
                # Send metadata with the final message
                yield f"data: {json.dumps({
                    'type': 'done',
                    'message': assistant_msg.to_dict(),
                    'metadata': metadata
                })}\n\n"

            except Exception as e:
                logger.error(f"Streaming error: {e}", exc_info=True)
                yield f"data: {json.dumps({'type': 'error', 'error': 'Streaming failed'})}\n\n"

        return Response(generate(), mimetype="text/event-stream")

    except Exception as exc:
        logger.error(f"RAG error: {exc}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500