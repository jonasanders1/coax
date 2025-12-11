"use client";

// src/context/AppContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  type Message,
  type MessagePart,
} from "@/shared/components/ui/chat-message";
import {
  ApiMessage,
  ChatRequest,
  ErrorResponse,
  isWarning,
} from "@/shared/types/chat";
import { streamChat } from "@/shared/lib/api";
import { SSEEvent } from "@/shared/types/chat";
import { getAllProducts } from "@/features/products/lib/products";
import type { Product } from "@/shared/types/product";
import { getAllFaqs, type FaqCategory } from "@/features/faq/lib/faqs";
import { useConversationId } from "@/hooks/useConversationId";

interface AppState {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (content: string, correlationId: string) => Promise<void>;
  isLoading: boolean;
  products: Product[];
  productsLoading: boolean;
  productsError: Error | null;
  fetchProducts: () => Promise<void>;
  faqs: FaqCategory[];
  faqsLoading: boolean;
  faqsError: Error | null;
  fetchFaqs: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Convert Chat Message to API Message format (serialize Date to ISO string)
function toApiMessage(msg: Message): ApiMessage {
  const roleStr = String(msg.role);
  const role: "user" | "assistant" | "system" =
    roleStr === "user" || roleStr === "assistant" || roleStr === "system"
      ? (roleStr as "user" | "assistant" | "system")
      : "user";

  return {
    id: msg.id,
    role,
    content: msg.content,
    createdAt: msg.createdAt?.toISOString(),
    correlation_id: undefined,
  };
}

// Convert API Message to Chat Message format (parse ISO string to Date)
function toChatMessage(msg: ApiMessage): Message {
  // Convert API parts to Chat Message parts
  const chatParts: MessagePart[] = [];

  if (msg.parts) {
    for (const part of msg.parts) {
      if (part.type === "reasoning") {
        chatParts.push({ type: "reasoning", reasoning: part.reasoning });
      } else if (part.type === "text") {
        chatParts.push({ type: "text", text: part.text });
      } else if (part.type === "tool-invocation") {
        // Convert API tool invocation to Chat Message tool invocation
        const toolInv = part.toolInvocation;
        if (toolInv.state === "result") {
          chatParts.push({
            type: "tool-invocation",
            toolInvocation: {
              state: "result",
              toolName: toolInv.toolName,
              result: toolInv.result || {},
            },
          });
        } else if (toolInv.state === "call") {
          chatParts.push({
            type: "tool-invocation",
            toolInvocation: {
              state: "call",
              toolName: toolInv.toolName,
            },
          });
        } else if (toolInv.state === "partial-call") {
          chatParts.push({
            type: "tool-invocation",
            toolInvocation: {
              state: "partial-call",
              toolName: toolInv.toolName,
            },
          });
        }
      }
    }
  }

  return {
    id:
      msg.id ||
      `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
    parts: chatParts && chatParts.length > 0 ? chatParts : undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const greetingsMessageContent = `Hei! Velkommen til COAX. Jeg er COAX-AI, din digitale assistent. Jeg kan hjelpe deg med å svare på spørsmål om produktene våre.`;

  // Get conversation ID for message storage (backend generates it, we just track it)
  const { conversationId, setConversationId } = useConversationId();

  // Use ref to access current messages without creating dependency
  const messagesRef = useRef<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: greetingsMessageContent,
      createdAt: new Date(),
    },
  ]);

  // Keep ref in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<Error | null>(null);
  const productsFetchedRef = useRef(false);
  // FAQs state
  const [faqs, setFaqs] = useState<FaqCategory[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [faqsError, setFaqsError] = useState<Error | null>(null);
  const faqsFetchedRef = useRef(false);

  const fetchProducts = useCallback(async () => {
    // Only fetch if products haven't been loaded yet
    if (productsFetchedRef.current || productsLoading) {
      return;
    }

    productsFetchedRef.current = true;
    setProductsLoading(true);
    setProductsError(null);
    try {
      const fetchedProducts = await getAllProducts();

      // Define the specific category order you want
      const categoryOrder = ["Direkte vannvarmer"];

      // Helper to get index in order, unknown categories at end
      const getCategoryOrderIndex = (category: string) => {
        const idx = categoryOrder.indexOf(category);
        return idx === -1 ? categoryOrder.length : idx;
      };

      // Sort products array by category first (with specific order),
      // then by model name as a fallback
      const sortedProducts = fetchedProducts.slice().sort((a, b) => {
        const catA = getCategoryOrderIndex(a.category);
        const catB = getCategoryOrderIndex(b.category);
        if (catA !== catB) return catA - catB;
        return a.model.localeCompare(b.model);
      });

      setProducts(sortedProducts);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Failed to fetch products");
      setProductsError(err);
      console.error("Error fetching products:", error);
      // Reset ref on error so user can retry
      productsFetchedRef.current = false;
    } finally {
      setProductsLoading(false);
    }
  }, [productsLoading]);

  const sendMessage = useCallback(
    async (content: string, correlationId: string) => {
      // 1. Optimistic user message
      // Create user message with proper metadata (id, timestamp)
      const userMessage: Message = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: "user",
        content,
        createdAt: new Date(), // ISO timestamp will be converted in toApiMessage
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
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantPlaceholder]);

      // Accumulate text and reasoning in closure variables
      let accumulatedText = "";
      let accumulatedReasoning = "";

      try {
        // Use ref to get current messages without dependency
        const currentMessages = messagesRef.current;
        // Convert to API format for the request
        const apiMessages = currentMessages.map(toApiMessage);
        const apiUserMessage = toApiMessage(userMessage);
        const payload: ChatRequest = {
          messages: [...apiMessages, apiUserMessage],
        };

        await streamChat(payload, {
          signal: controller.signal,
          correlationId: correlationId,
          conversationId, // Pass existing conversation ID (optional - backend generates if not sent)
          onConversationId: setConversationId, // Capture conversation ID from backend response
          onMessage: (chunk: SSEEvent) => {
            if (chunk.type === "reasoning") {
              // Accumulate reasoning text
              accumulatedReasoning = chunk.reasoning;
              // Update message with reasoning part
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== assistantId) return m;

                  const parts: Array<
                    | { type: "reasoning"; reasoning: string }
                    | { type: "text"; text: string }
                  > = [];

                  // Add reasoning part if we have reasoning
                  if (accumulatedReasoning) {
                    parts.push({
                      type: "reasoning",
                      reasoning: accumulatedReasoning,
                    });
                  }

                  // Add text part if we have text
                  if (accumulatedText) {
                    parts.push({
                      type: "text",
                      text: accumulatedText,
                    });
                  }

                  return {
                    ...m,
                    parts: parts.length > 0 ? parts : undefined,
                    content: accumulatedText || "",
                  };
                })
              );
            } else if (chunk.type === "token") {
              accumulatedText += chunk.token;
              // Update message with both reasoning and text parts
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== assistantId) return m;

                  const parts: Array<
                    | { type: "reasoning"; reasoning: string }
                    | { type: "text"; text: string }
                  > = [];

                  // Add reasoning part if we have reasoning
                  if (accumulatedReasoning) {
                    parts.push({
                      type: "reasoning",
                      reasoning: accumulatedReasoning,
                    });
                  }

                  // Add text part with accumulated text
                  if (accumulatedText) {
                    parts.push({
                      type: "text",
                      text: accumulatedText,
                    });
                  }

                  return {
                    ...m,
                    parts: parts.length > 0 ? parts : undefined,
                    content: accumulatedText,
                  };
                })
              );
            } else if (chunk.type === "done") {
              // Convert API message to Chat message format
              const completedMessage = toChatMessage(chunk.message);

              // Build parts array from API message or accumulated data
              const parts: Array<
                | { type: "reasoning"; reasoning: string }
                | { type: "text"; text: string }
              > = [];

              if (chunk.message.parts) {
                // Use parts from API if available
                const chatParts = chunk.message.parts
                  .map((part) => {
                    if (part.type === "reasoning") {
                      return {
                        type: "reasoning" as const,
                        reasoning: part.reasoning,
                      };
                    } else if (part.type === "text") {
                      return { type: "text" as const, text: part.text };
                    }
                    return null;
                  })
                  .filter(
                    (
                      p
                    ): p is
                      | { type: "reasoning"; reasoning: string }
                      | { type: "text"; text: string } => p !== null
                  );

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: completedMessage.content || accumulatedText,
                          createdAt: completedMessage.createdAt,
                          parts: chatParts.length > 0 ? chatParts : undefined,
                        }
                      : m
                  )
                );
              } else {
                // Fallback: build parts from accumulated data
                if (accumulatedReasoning) {
                  parts.push({
                    type: "reasoning",
                    reasoning: accumulatedReasoning,
                  });
                }
                if (accumulatedText) {
                  parts.push({
                    type: "text",
                    text: accumulatedText,
                  });
                }

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: completedMessage.content || accumulatedText,
                          createdAt: completedMessage.createdAt,
                          parts: parts.length > 0 ? parts : undefined,
                        }
                      : m
                  )
                );
              }
            } else if (chunk.type === "error") {
              console.error("Streaming error:", chunk);
              const isWarningError = isWarning(chunk);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: chunk.error,
                        isError: !isWarningError,
                        isWarning: isWarningError,
                        retryAfter: chunk.details?.retry_after,
                      }
                    : m
                )
              );
            }
          },
          onError: (error) => {
            console.error("Streaming error:", error);
            const isWarningError = isWarning(error);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: error.error,
                      isError: !isWarningError,
                      isWarning: isWarningError,
                      retryAfter: error.details?.retry_after,
                    }
                  : m
              )
            );
          },
          onComplete: () => {
            setIsLoading(false);
            abortControllerRef.current = null;
          },
        });
      } catch (err) {
        // Type guard for AbortError
        const isAbortError = err instanceof Error && err.name === "AbortError";

        if (!isAbortError) {
          console.error("Chat error:", err);
          // Create a proper error response for network/unknown errors
          const errorResponse: ErrorResponse = {
            type: "error",
            error:
              err instanceof Error
                ? err.message
                : "En uventet feil oppstod. Prøv igjen senere.",
            error_code: "NETWORK_ERROR",
            correlation_id: correlationId,
            timestamp: new Date().toISOString(),
            details: {
              service: "network",
            },
          };
          const isWarningError = isWarning(errorResponse);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: errorResponse.error,
                    isError: !isWarningError,
                    isWarning: isWarningError,
                  }
                : m
            )
          );
        }
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [] // Empty deps - using ref for messages
  );

  const fetchFaqs = useCallback(async () => {
    // Only fetch if FAQs haven't been loaded yet
    if (faqsFetchedRef.current || faqsLoading) {
      return;
    }

    faqsFetchedRef.current = true;
    setFaqsLoading(true);
    setFaqsError(null);
    try {
      const fetchedFaqs = await getAllFaqs();
      setFaqs(fetchedFaqs);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Failed to fetch FAQs");
      setFaqsError(err);
      console.error("Error fetching FAQs:", error);
      // Reset ref on error so user can retry
      faqsFetchedRef.current = false;
    } finally {
      setFaqsLoading(false);
    }
  }, [faqsLoading]);

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      sendMessage,
      isLoading,
      products,
      productsLoading,
      productsError,
      fetchProducts,
      faqs,
      faqsLoading,
      faqsError,
      fetchFaqs,
    }),
    [
      messages,
      sendMessage,
      isLoading,
      products,
      productsLoading,
      productsError,
      fetchProducts,
      faqs,
      faqsLoading,
      faqsError,
      fetchFaqs,
    ]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
