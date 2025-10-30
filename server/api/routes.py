# api/routes.py
from flask import Blueprint, request, Response, jsonify, make_response
from datetime import datetime
import datetime as dt
import json
import logging
from llama_index.core.base.llms.types import ChatMessage, MessageRole
from api.schemas import ChatRequest, Message
from rag.chat import get_chat_engine, get_query_engine, get_index
from llama_index.core.memory import ChatMemoryBuffer
from config.settings import settings
from utils.logger import get_logger
from utils.auth import require_api_key
from pydantic import ValidationError
from utils.prompt_guard import check_for_injection

bp = Blueprint('api', __name__)
logger = get_logger(__name__)


@bp.route("/")
def health_check():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})

@bp.route("/chat", methods=["POST", "OPTIONS"])
@require_api_key
def chat():
    # === BYPASS AUTH FOR OPTIONS (CORS preflight) ===
    if request.method == "OPTIONS":
        resp = make_response()
        resp.status_code = 204
        return resp

    # === NORMAL POST: Auth already passed via @require_api_key ===
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No JSON payload"}), 400

        chat_req = ChatRequest.model_validate(payload)
        query = chat_req.get_user_query()
        if not query:
            return jsonify({"error": "No user message"}), 400

        # Check for prompt injection before processing
        if check_for_injection(query):
            return jsonify({"error": "Potential prompt injection detected"}), 400

        # Convert messages to LlamaIndex ChatMessage format for history
        chat_history = []
        for msg in chat_req.messages:
            role = msg.get("role", "")
            content = msg.get("content", "")
            if role == "user":
                chat_history.append(ChatMessage(role=MessageRole.USER, content=content))
            elif role == "assistant":
                chat_history.append(ChatMessage(role=MessageRole.ASSISTANT, content=content))

        def generate():
            try:
                # Build chat history for context (exclude the last user message which is the current query)
                # CondenseQuestionChatEngine uses internal state, so we need to populate it first
                if len(chat_history) > 0 and chat_history[-1].role == MessageRole.USER:
                    history_for_context = chat_history[:-1]
                else:
                    history_for_context = chat_history
                
                logger.info(f"Processing query: {query}, with {len(history_for_context)} previous messages")
                logger.info("Chat History: %s", history_for_context)
                # If there's no history, use query engine directly (more reliable for first messages)
                # If there is history, use chat engine (handles context better)
                if len(history_for_context) == 0:
                    # No history - use query engine directly for better reliability
                    logger.info("No chat history - using query engine directly")
                    query_engine = get_query_engine()
                    
                    # Use streaming query
                    stream_response = query_engine.stream_query(query)
                    
                    tokens = []
                    source_nodes = []
                    
                    # Stream the tokens
                    for token in stream_response.response_gen:
                        tokens.append(token)
                        yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"
                    
                    full_content = "".join(tokens)
                    
                    # Extract source nodes and metadata
                    if hasattr(stream_response, 'source_nodes') and stream_response.source_nodes:
                        source_nodes = stream_response.source_nodes
                    
                    metadata = []
                    if source_nodes:
                        logger.info(f"Query engine found {len(source_nodes)} source nodes")
                        for node in source_nodes:
                            node_text = node.node.text if hasattr(node.node, 'text') else str(node.node)[:200]
                            metadata.append({
                                'node_id': node.node.node_id,
                                'score': float(node.score) if node.score is not None else None,
                                'text': (node_text[:200] + '...') if len(node_text) > 200 else node_text,
                                'metadata': dict(node.node.metadata) if hasattr(node.node, 'metadata') and node.node.metadata else {}
                            })
                    else:
                        logger.warning("Query engine returned no source nodes")
                    
                    assistant_msg = Message(
                        id=f"assistant-{dt.datetime.now().timestamp()}",
                        role="assistant",
                        content=full_content,
                        timestamp=dt.datetime.now(dt.timezone.utc).isoformat(),
                    )
                    
                    yield f"data: {json.dumps({ 
                        'type': 'done', 
                        'message': assistant_msg.model_dump(), 
                        'metadata': metadata 
                    })}\n\n"
                    return


                
                # Has history - build a per-request chat engine with memory
                index = get_index()
                # Create ChatMemoryBuffer and populate it with history
                chat_memory = ChatMemoryBuffer(token_limit=settings.CHAT_MEMORY_TOKEN_LIMIT)
                for msg in history_for_context:
                    chat_memory.put(msg)
                
                # Rebuild chat engine with memory (fresh, per request)
                from rag.engine import build_chat_engine as build_engine
                chat_engine = build_engine(index, chat_memory=chat_memory)
                stream_response = chat_engine.stream_chat(query)
                tokens = []

                for token in stream_response.response_gen:
                    tokens.append(token)
                    yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"

                full_content = "".join(tokens)
                logger.info(f"Generated response length: {len(full_content)}")

                # Extract metadata to verify retrieval is working
                metadata = []
                source_nodes_info = []
                if hasattr(stream_response, 'source_nodes') and stream_response.source_nodes:
                    logger.info(f"Found {len(stream_response.source_nodes)} source nodes")
                    for node in stream_response.source_nodes:
                        node_text = node.node.text if hasattr(node.node, 'text') else str(node.node)[:200]
                        node_score = float(node.score) if node.score is not None else None
                        source_nodes_info.append({
                            'score': node_score,
                            'text_preview': node_text[:100] if node_text else ''
                        })
                        metadata.append({
                            'node_id': node.node.node_id,
                            'score': node_score,
                            'text': (node_text[:200] + '...') if len(node_text) > 200 else node_text,
                            'metadata': dict(node.node.metadata) if hasattr(node.node, 'metadata') and node.node.metadata else {}
                        })
                else:
                    logger.warning("No source nodes found in response - retrieval may not be working!")
                
                logger.info(f"Source nodes info: {source_nodes_info}")

                # Final message
                assistant_msg = Message(
                    id=f"assistant-{dt.datetime.now().timestamp()}",
                    role="assistant",
                    content=full_content,
                    timestamp=dt.datetime.now(dt.timezone.utc).isoformat(),
                )

                yield f"data: {json.dumps({
                    'type': 'done',
                    'message': assistant_msg.model_dump(),
                    'metadata': metadata
                })}\n\n"

            except Exception as e:
                logger.error(f"Streaming error: {e}", exc_info=True)
                yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

        return Response(generate(), mimetype="text/event-stream")

    except ValidationError as ve:
        logger.error(f"Validation error: {ve}")
        return jsonify({"error": f"Invalid request {ve.errors()}"}), 400
    except Exception as exc:
        logger.error(f"RAG error: {exc}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500