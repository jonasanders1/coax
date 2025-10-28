// src/lib/api.ts
import { ChatRequest, ChatResponse } from "@/types/chat";

const resolveBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL)
    return import.meta.env.VITE_API_BASE_URL;
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  return isLocal ? "http://localhost:8000" : "https://api.jonasanders1.com";
};

export const API_BASE_URL = resolveBaseUrl();

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
export type StreamChunk =
  | { type: "token"; token: string }
  | {
      type: "done";
      message: ChatResponse["message"];
      metadata?: Array<{
        node_id: string;
        score: number | null;
        text: string;
        metadata: Record<string, unknown>;
      }>;
    }
  | { type: "error"; error: string };

export interface StreamChatOptions {
  onMessage: (chunk: StreamChunk) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  signal?: AbortSignal;
}

export async function streamChat(
  payload: ChatRequest,
  { onMessage, onError, onComplete, signal }: StreamChatOptions
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "X-API-Key": import.meta.env.VITE_API_KEY,
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
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
        const jsonStr = line.slice(5).trim();
        if (!jsonStr) continue;

        try {
          const data = JSON.parse(jsonStr) as StreamChunk;
          onMessage(data);
        } catch (err) {
          console.error("Error parsing SSE message:", err);
        }
      }
    }

    // Handle any remaining data
    if (buffer.trim()) {
      const jsonStr = buffer.trim().replace(/^data:\s*/, "");
      if (jsonStr) {
        try {
          const data = JSON.parse(jsonStr) as StreamChunk;
          onMessage(data);
        } catch (err) {
          console.error("Error parsing final SSE message:", err);
        }
      }
    }

    onComplete?.();
  } catch (err) {
    if (err.name === "AbortError") return;
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}
