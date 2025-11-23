// src/lib/api.ts
import {
  ChatRequest,
  ChatResponse,
  ErrorResponse,
  SSEEvent,
  createErrorResponse,
} from "@/types/chat";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  signal?: AbortSignal
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });
  return handleResponse<ChatResponse>(res);
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
}

export async function streamChat(
  payload: ChatRequest,
  { onMessage, onError, onComplete, signal, correlationId }: StreamChatOptions
): Promise<void> {
  const correlationIdToUse = correlationId || crypto.randomUUID();
  console.log("🌐 API_BASE_URL:", API_BASE_URL);
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

  // Prepare payload - ensure messages only include required fields for API
  const apiPayload: ChatRequest = {
    messages: payload.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      // Note: correlation_id and status are client-side only, not sent to API
    })),
  };

  console.log("🌐 Making API request:", {
    url: apiUrl,

    correlationId: correlationIdToUse,
    payload: apiPayload,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "X-Correlation-ID": correlationIdToUse,
    },
  });

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "X-Correlation-ID": correlationIdToUse,
      },
      body: JSON.stringify(apiPayload),
      signal,
    });

    if (!res.ok) {
      // Try to parse error response from API
      try {
        const errorData = await res.json();
        // Check if it's an ErrorResponse format
        if (errorData && errorData.error_code && errorData.error) {
          const apiError: ErrorResponse = {
            type: "error",
            error: errorData.error,
            error_code: errorData.error_code,
            correlation_id: errorData.correlation_id || correlationIdToUse,
            timestamp: errorData.timestamp || new Date().toISOString(),
            details: errorData.details || { service: "api" },
          };
          onError?.(apiError);
          return;
        }
      } catch {
        // Not JSON, try text
      }

      // Fallback to text error
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `HTTP ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("Failed to get response reader");

    const decoder = new TextDecoder();
    let buffer = "";

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
          onMessage(data);
        } catch (err) {
          console.error("Error parsing final SSE message:", err);
        }
      }
    }

    onComplete?.();
  } catch (err) {
    if (err.name === "AbortError") return;
    const correlationIdToUse = correlationId || crypto.randomUUID();

    // Enhanced error message for debugging
    let errorMessage = "En feil oppstod ved kommunikasjon med serveren.";
    let errorCode = "NETWORK_ERROR";

    if (err instanceof Error) {
      if (err.message.includes("Failed to fetch")) {
        errorMessage = "Kunne ikke koble til server.";
        errorCode = "CONNECTION_ERROR";
      } else {
        errorMessage = err.message;
      }

      console.error("❌ Network error:", {
        message: err.message,
        url: `${API_BASE_URL}/chat`,
        correlationId: correlationIdToUse,
        error: err,
      });
    }

    onError?.(
      createErrorResponse(
        errorMessage,
        errorCode,
        correlationIdToUse,
        "network"
      )
    );
  }
}
