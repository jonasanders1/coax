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
  const greetingsMessageContent = `Hei! Velkommen til COAX. Jeg er Flux, din digitale assistent. Jeg kan hjelpe deg med å svare på spørsmål om produktene våre.`;

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: greetingsMessageContent,
      timestamp: new Date().toISOString(),
      status: "complete",
    },
    {
      id: "mock-1",
      role: "assistant",
      content: `
  Her er en oversikt over XFJ-2 i tabellformat:

| **Egenskap**          | **Detaljer**                          |
|-----------------------|---------------------------------------|
| **Modell**            | XFJ-2 (1-faset, 230V)                |
| **Beskrivelse**       | Kompakt modell for dusj, håndvask, leiligheter, hytter og mindre boliger. Monteres på vegg, kun 8 cm ut fra veggen. |
| **Kapasitet**         | 3–7 liter/min (justerbar)            |
| **Watteffekt**        | 3,5–15 kW                            |
| **Sikringskurs**      | 10–50A                               |
| **Egenskaper**        | - LED-skjerm med berøringspanel for temperatur- og vannmengdeinnstilling. <br> - Beskyttelse mot lekkasjestrøm, overoppheting, overtrykk og skålding. <br> - IPX4-sertifisert (sprutsikker). |
| **Dimensjoner**       | 300 x 180 x 80 mm                    |

Hvis du har flere spørsmål om XFJ-2 eller andre produkter, er det bare å spørre!
      `,
      timestamp: new Date().toISOString(),
      status: "complete",
    },
    {
      id: "mock-2",
      role: "assistant",
      content: `
  ## Example Calculation
  
  Suppose we have a flow of 7 L/min and a temperature rise of 28 °C:
  
  \`\`\`katex
  P = 7 \\cdot 28 \\cdot 69{,}77 \\approx 13{,}7 \\text{kW}
  \`\`\`
  
  Comparison to a traditional tank heater:
  
  \`\`\`text
  Tank Heater: ~24 kW standby loss
  COAX:      0 kW standby loss
  \`\`\`
      `,
      timestamp: new Date().toISOString(),
      status: "complete",
    },
    {
      id: "mock-3",
      role: "assistant",
      content: `
  ### Maintenance Tips
  
  1. Check inlet filters every 6 months
  2. Inspect electrical connections
  3. Use **soft water** to reduce scaling
  
  For a more advanced calculation, solve for flow given a power limit:
  
  \`\`\`katex
  Q = \\frac{P}{\\Delta T \\cdot 69{,}77}
  \`\`\`
      `,
      timestamp: new Date().toISOString(),
      status: "complete",
    },
    {
      id: "mock-4",
      role: "assistant",
      content: `
  ### Energy Savings Example
  
  If you reduce the flow to 5 L/min and the temperature rise to 25 °C:
  
  \`\`\`katex
  P = 5 \\cdot 25 \\cdot 69{,}77 \\approx 8{,}7 \\text{kW}
  \`\`\`
  
  Small optimizations in flow and temperature significantly reduce power consumption.
      `,
      timestamp: new Date().toISOString(),
      status: "complete",
    },
    {
      id: "mock-5",
      role: "assistant",
      content: `
  ### Quick Reference Table
  
  | Flow (L/min) | Temp Rise (°C) | Power (kW) |
  |--------------|----------------|------------|
  | 7            | 28             | 13.7       |
  | 5            | 25             | 8.7        |
  | 10           | 30             | 20.9       |
  
  \`\`\`katex
  P = Q \\cdot \\Delta T \\cdot 69{,}77
  \`\`\`
      `,
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
