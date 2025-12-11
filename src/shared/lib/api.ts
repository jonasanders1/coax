// src/lib/api.ts
import {
  ChatRequest,
  ChatResponse,
  ErrorResponse,
  SSEEvent,
  ApiMessage,
  createErrorResponse,
} from "@/shared/types/chat";

type ApiResponse =
  | { type: "stream"; message: ApiMessage | null; metadata: unknown[] | null }
  | {
      type: "error";
      error: ErrorResponse;
      status?: number;
      statusText?: string;
      errorData?: unknown;
      originalError?: string;
    }
  | { type: "response"; message: ApiMessage }
  | null;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* --------------------------------------------------------------
   LOGGING – Write messages and user queries to JSON file
   -------------------------------------------------------------- */
async function logChatToFile(
  payload: ChatRequest,
  correlationId: string,
  apiResponse?: ApiResponse
): Promise<void> {
  // Skip logging in production (Vercel)
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    // Extract user query (last user message)
    const userMessages = payload.messages.filter((msg) => msg.role === "user");
    const userQuery = userMessages[userMessages.length - 1]?.content || "";

    const logData = {
      timestamp: new Date().toISOString(),
      correlationId,
      userQuery,
      request: {
        messages: payload.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        })),
      },
      response: apiResponse || null,
    };

    // Call the logging API route
    const response = await fetch("/api/log-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("❌ Failed to log chat to file:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return;
    }

    const result = await response.json().catch(() => null);
  } catch (err) {
    // Log error but don't interrupt the main flow
    console.error("❌ Error logging chat to file:", err);
  }
}

/* --------------------------------------------------------------
   1. NON-STREAMING (existing) – kept for health-checks, etc.
   -------------------------------------------------------------- */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function postChat(
  payload: ChatRequest,
  options?: {
    signal?: AbortSignal;
    conversationId?: string | null;
    onConversationId?: (conversationId: string) => void;
  }
): Promise<ChatResponse> {
  const correlationId = crypto.randomUUID();
  const { signal, conversationId, onConversationId } = options || {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add X-Conversation-ID header if provided (optional - backend generates if not sent)
  if (conversationId) {
    headers["X-Conversation-ID"] = conversationId;
  }

  // Prepare payload - make IDs and timestamps optional (backend generates them)
  const apiPayload: ChatRequest = {
    messages: payload.messages.map((msg): ApiMessage => {
      const apiMsg: ApiMessage = {
        role: msg.role,
        content: msg.content,
      };
      // Include id and createdAt only if they exist (optional - backend generates them)
      if (msg.id) {
        apiMsg.id = msg.id;
      }
      if (msg.createdAt) {
        apiMsg.createdAt = msg.createdAt;
      }
      return apiMsg;
    }),
  };

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(apiPayload),
    signal,
  });

  // Capture conversation ID from response headers (backend generates it if not sent)
  const responseConversationId = res.headers.get("X-Conversation-ID");
  if (responseConversationId && onConversationId) {
    onConversationId(responseConversationId);
  }

  const responseData = await handleResponse<ChatResponse>(res);

  // Log the chat request and response
  await logChatToFile(payload, correlationId, {
    type: "response",
    message: responseData.message,
  });

  return responseData;
}

/* --------------------------------------------------------------
   2. STREAMING – Server-Sent Events (SSE)
   -------------------------------------------------------------- */

export interface StreamChatOptions {
  onMessage: (chunk: SSEEvent) => void;
  onError?: (error: ErrorResponse) => void;
  onComplete?: () => void;
  signal?: AbortSignal;
  correlationId?: string;
  conversationId?: string | null;
  onConversationId?: (conversationId: string) => void; // Callback when conversation ID is received from backend
}

export async function streamChat(
  payload: ChatRequest,
  { onMessage, onError, onComplete, signal, correlationId, conversationId, onConversationId }: StreamChatOptions
): Promise<void> {
  const correlationIdToUse = correlationId || crypto.randomUUID();

  // Validate configuration before making request
  if (!API_BASE_URL) {
    const error = createErrorResponse(
      "API base URL is not configured. Please check your .env file.",
      "CONFIGURATION_ERROR",
      correlationIdToUse,
      "frontend"
    );
    onError?.(error);
    return;
  }

  const apiUrl = `${API_BASE_URL}/chat`;

  // Prepare payload - backend generates IDs and timestamps automatically if not provided
  // We include them if available (for backward compatibility), but they're optional
  const apiPayload: ChatRequest = {
    messages: payload.messages.map((msg): ApiMessage => {
      const apiMsg: ApiMessage = {
        role: msg.role,
        content: msg.content,
      };
      // Include id and createdAt only if they exist (optional - backend generates them)
      if (msg.id) {
        apiMsg.id = msg.id;
      }
      if (msg.createdAt) {
        apiMsg.createdAt = msg.createdAt;
      }
      return apiMsg;
    }),
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    "X-Correlation-ID": correlationIdToUse,
  };

  // Add X-Conversation-ID header if provided
  if (conversationId) {
    headers["X-Conversation-ID"] = conversationId;
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(apiPayload),
      signal,
    });

    // Capture conversation ID from response headers (backend generates it if not sent)
    const responseConversationId = res.headers.get("X-Conversation-ID");
    if (responseConversationId && onConversationId) {
      onConversationId(responseConversationId);
    }

    if (!res.ok) {
      // Try to parse error response from API
      let errorData: unknown = null;
      try {
        errorData = await res.json();
        // Check if it's an ErrorResponse format
        if (
          errorData &&
          typeof errorData === "object" &&
          "error_code" in errorData &&
          "error" in errorData
        ) {
          const errorObj = errorData as {
            error: string;
            error_code: string;
            correlation_id?: string;
            timestamp?: string;
            details?: { service: string; retry_after?: number };
          };

          const apiError: ErrorResponse = {
            type: "error",
            error: errorObj.error,
            error_code: errorObj.error_code,
            correlation_id: errorObj.correlation_id || correlationIdToUse,
            timestamp: errorObj.timestamp || new Date().toISOString(),
            details: errorObj.details || { service: "api" },
          };

          // Log the error response
          await logChatToFile(payload, correlationIdToUse, {
            type: "error",
            error: apiError,
            status: res.status,
          });

          onError?.(apiError);
          return;
        }
      } catch {
        // Not JSON, try text
      }

      // Fallback to text error - preserve full error details
      const txt = await res.text().catch(() => "");
      const errorMessage =
        txt || `HTTP ${res.status}: ${res.statusText || "Unknown error"}`;
      const errorResponseObj = createErrorResponse(
        errorMessage,
        "HTTP_ERROR",
        correlationIdToUse,
        "api"
      );

      // Log the error response
      await logChatToFile(payload, correlationIdToUse, {
        type: "error" as const,
        error: errorResponseObj,
        status: res.status,
        statusText: res.statusText,
        errorData,
      });

      onError?.(errorResponseObj);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("Failed to get response reader");

    const decoder = new TextDecoder();
    let buffer = "";
    let finalMessage: ApiMessage | null = null;
    let metadata: unknown[] | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        // Handle both "data: " (with space) and "data:" (without space)
        const jsonStr = line.replace(/^data:\s*/, "").trim();
        if (!jsonStr) continue;

        try {
          const data = JSON.parse(jsonStr) as SSEEvent;

          // Only capture the "done" event which contains the final message
          if (data.type === "done") {
            finalMessage = data.message;
            metadata = data.metadata;
          }

          onMessage(data);
        } catch (err) {
          console.error("Error parsing SSE message:", err, "Raw:", jsonStr);
        }
      }
    }

    // Handle any remaining data
    if (buffer.trim()) {
      const jsonStr = buffer.trim().replace(/^data:\s*/, "");
      if (jsonStr) {
        try {
          const data = JSON.parse(jsonStr) as SSEEvent;

          // Only capture the "done" event which contains the final message
          if (data.type === "done") {
            finalMessage = data.message;
            metadata = data.metadata;
          }

          onMessage(data);
        } catch (err) {
          console.error("Error parsing final SSE message:", err);
        }
      }
    }

    // Log the chat request and final message only
    await logChatToFile(payload, correlationIdToUse, {
      type: "stream",
      message: finalMessage,
      metadata: metadata,
    });

    onComplete?.();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return;
    const correlationIdToUse = correlationId || crypto.randomUUID();

    // Preserve detailed error information
    let errorMessage = "En feil oppstod ved kommunikasjon med serveren.";
    let errorCode = "NETWORK_ERROR";

    if (err instanceof Error) {
      // Preserve the full error message instead of simplifying it
      errorMessage = err.message;

      if (err.message.includes("Failed to fetch")) {
        errorCode = "CONNECTION_ERROR";
        // Provide more context for connection errors
        errorMessage = `Kunne ikke koble til server. ${err.message}`;
      } else if (
        err.message.includes("NetworkError") ||
        err.message.includes("network")
      ) {
        errorCode = "NETWORK_ERROR";
      }

      console.error("❌ Network error:", {
        message: err.message,
        url: `${API_BASE_URL}/chat`,
        correlationId: correlationIdToUse,
        error: err,
      });
    } else {
      // For non-Error objects, convert to string but preserve details
      errorMessage = String(err);
    }

    const errorResponse = createErrorResponse(
      errorMessage,
      errorCode,
      correlationIdToUse,
      "network"
    );

    // Log the error response with full details
    await logChatToFile(payload, correlationIdToUse, {
      type: "error",
      error: errorResponse,
      originalError: err instanceof Error ? err.message : String(err),
      errorData: err instanceof Error ? { stack: err.stack } : undefined,
    });

    onError?.(errorResponse);
  }
}
