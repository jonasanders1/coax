import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { Message, ChatRequest } from "../types/chat";
import { postChat } from "../lib/api";
// import { MOCK_CONVERSATION } from "../lib/mock-data";

interface AppState {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (content: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      try {
        const base = Array.isArray(messages) ? messages : [];
        const payload: ChatRequest = {
          messages: [...base, userMessage],
        };
        const { message } = await postChat(payload);
        // append assistant message
        setMessages((prev) => [...prev, message]);
      } catch (error) {
        // On error, remove the optimistic user message
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        throw error;
      }
    },
    [messages]
  );

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      sendMessage,
    }),
    [messages, sendMessage]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
