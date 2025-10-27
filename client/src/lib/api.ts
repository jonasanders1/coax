import { ChatRequest, ChatResponse } from "@/types/chat";
// http://16.171.29.254:8000

// export const API_BASE_URL = "http://localhost:8000"; // DEV Local
// export const API_BASE_URL = "http://51.21.199.196:8000"; // DEV SSH
export const API_BASE_URL = "https://api.jonasanders1.com/"; // PROD SSH


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
