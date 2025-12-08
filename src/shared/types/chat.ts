import { type Message } from "@/shared/components/ui/chat-message";

// Use the Chat component's Message format throughout
export type { Message };

// Legacy type for backward compatibility with older components
export type MessageStatus = 'writing' | 'complete';

// API representation of message parts
export interface ApiReasoningPart {
  type: "reasoning";
  reasoning: string;
}

export interface ApiTextPart {
  type: "text";
  text: string;
}

export interface ApiToolInvocationPart {
  type: "tool-invocation";
  toolInvocation: {
    state: "partial-call" | "call" | "result";
    toolName: string;
    result?: Record<string, unknown>;
  };
}

export type ApiMessagePart = ApiReasoningPart | ApiTextPart | ApiToolInvocationPart;

// For API requests, we serialize Date to ISO string
export interface ApiMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string; // ISO string for API
  correlation_id?: string;
  parts?: ApiMessagePart[]; // Support for structured message parts
}

export interface ChatRequest {
  messages: ApiMessage[];
}

export interface ChatResponse {
  message: ApiMessage;
}

export interface ErrorResponse {
  type: 'error';
  error: string;
  error_code: string;
  correlation_id: string;
  timestamp: string;
  details: {
    service: string;
    retry_after?: number;
  };
}

export function createErrorResponse(
  error: string,
  error_code: string = "UNKNOWN_ERROR",
  correlation_id: string = "UNKNOWN_ID",
  service: string = "UNKNOWN_SERVICE"
): ErrorResponse {
  return {
    type: "error",
    error,
    error_code,
    correlation_id,
    timestamp: new Date().toISOString(),
    details: { service },
  };
}


export interface TokenEvent {
  type: 'token';
  token: string;
}

export interface ReasoningEvent {
  type: 'reasoning';
  reasoning: string; // The reasoning text chunk (can be accumulated)
  messageId?: string; // Optional: ID of the message this reasoning belongs to
}

export interface DoneEvent {
  type: 'done';
  message: ApiMessage;
  metadata: unknown[];
}

export type SSEEvent = ErrorResponse | TokenEvent | ReasoningEvent | DoneEvent;