export type MessageStatus = 'writing' | 'complete';

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  status?: MessageStatus;
  correlation_id?: string;
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatResponse {
  message: Message;
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

export interface DoneEvent {
  type: 'done';
  message: Message;
  metadata: any[];
}

export type SSEEvent = ErrorResponse | TokenEvent | DoneEvent;