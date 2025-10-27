// src/context/AppContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Message, ChatRequest } from "@/types/chat";
import { streamChat, StreamChunk } from "@/lib/api";

interface AppState {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const greetingsMessageContent = `COAX er en leverandør av elektriske vannvarmere som varmer vann direkte ved behov, uten lagringstank. Dette gir flere fordeler, inkludert:

- **Plassbesparende design:** Vannvarmerne er kompakte og kan enkelt monteres nær tappesteder, noe som reduserer behovet for lange rørstrekk.
- **Energieffektivitet:** De er kun aktive under bruk, noe som reduserer strømforbruket betydelig.
- **Miljøvennlig:** Mindre vann- og strømforbruk bidrar til å redusere avløpsbelastningen.
- **Hygienisk:** Vannet varmes direkte, noe som minimerer bakterievekst og sikrer friskt vann.
- **Allsidighet:** COAX vannvarmere passer til ulike bruksområder, fra håndvasker til store bolighus og industrielle bygg. 

Disse egenskapene gjør COAX vannvarmere til en økonomisk og praktisk løsning for varmtvann i både boliger og industri.
`;

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: greetingsMessageContent,
      timestamp: new Date().toISOString(),
      status: "complete",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      // 1. Optimistic user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // 2. Abort previous request if still running
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 3. Placeholder assistant message (will be filled token-by-token)
      const assistantId = `assistant-${Date.now()}`;
      const assistantPlaceholder: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        status: "writing" as const,
      };
      setMessages((prev) => [...prev, assistantPlaceholder]);

      try {
        const payload: ChatRequest = {
          messages: [...messages, userMessage],
        };

        await streamChat(payload, {
          signal: controller.signal,
          onMessage: (chunk) => {
            if (chunk.type === "token") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: m.content + chunk.token,
                        status: "writing" as const,
                      }
                    : m
                )
              );
            } else if (chunk.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...chunk.message, status: "complete" as const }
                    : m
                )
              );
            }
          },
          onError: (error) => {
            console.error("Streaming error:", error);
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          },
          onComplete: () => {
            setIsLoading(false);
            abortControllerRef.current = null;
          },
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Chat error:", err);
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        }
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages]
  );

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      sendMessage,
      isLoading,
    }),
    [messages, sendMessage, isLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
