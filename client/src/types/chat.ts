export type MessageStatus = 'writing' | 'complete';

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: MessageStatus;
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatResponse {
  message: Message;
}
