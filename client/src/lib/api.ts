import { ChatRequest, ChatResponse } from "@/types/chat";
// http://16.171.29.254:8000

const resolveBaseUrl = (): string => {
  // 1. Explicit override via env (Next.js, Vite, CRA, etc.)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Development mode – `localhost` or `127.0.0.1`
  const isLocal =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      : false;

  return isLocal
    ? "http://localhost:8000" // DEV
    : "https://api.jonasanders1.com/"; // PROD
};

export const API_BASE_URL = resolveBaseUrl();

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function postChat(
  payload: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  return handleResponse<ChatResponse>(res);
}
