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
} from "react";
import { Message, ChatRequest, ErrorResponse } from "@/types/chat";
import { streamChat } from "@/lib/api";
import { SSEEvent } from "@/types/chat";
import { getAllProducts } from "@/lib/products";
import type { Product } from "@/types/product";

interface AppState {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (content: string, correlationId: string) => Promise<void>;
  isLoading: boolean;
  products: Product[];
  productsLoading: boolean;
  productsError: Error | null;
  fetchProducts: () => Promise<void>;
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
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<Error | null>(null);
  const productsFetchedRef = useRef(false);

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
      // INSERT_YOUR_CODE

      // Define the specific category order you want
      const categoryOrder = ["Tankløs varmtvannsbereder"]; 

      // Helper to get index in order, unknown categories at end
      const getCategoryOrderIndex = (category: string) => {
        const idx = categoryOrder.indexOf(category);
        return idx === -1 ? categoryOrder.length : idx;
      };

      // Sort products array by category first (with specific order), then by name as fallback
      const sortedProducts = fetchedProducts.slice().sort((a, b) => {
        const catA = getCategoryOrderIndex(a.category);
        const catB = getCategoryOrderIndex(b.category);
        if (catA !== catB) return catA - catB;
        // fallback: alphabetically by name
        return a.name.localeCompare(b.name);
      });
      setProducts(sortedProducts);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to fetch products");
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
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
        correlation_id: correlationId,
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

      // Accumulate text in closure variable (following documentation pattern)
      // This avoids React state batching issues and ensures reliable streaming
      let accumulatedText = "";

      try {
        const payload: ChatRequest = {
          messages: [...messages, userMessage],
        };

        await streamChat(payload, {
          signal: controller.signal,
          correlationId: correlationId,
          onMessage: (chunk: SSEEvent) => {
            if (chunk.type === "token") {
              // Accumulate text in closure variable (not reading from React state)
              accumulatedText += chunk.token;
              
              // Update state with accumulated text (following documentation pattern)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: accumulatedText, // Use closure variable, not m.content
                        status: "writing" as const,
                      }
                    : m
                )
              );
            } else if (chunk.type === "done") {
              // Use done event's content (which should be complete), fallback to accumulated
              const finalContent = chunk.message.content || accumulatedText;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...chunk.message,
                        status: "complete" as const,
                        content: finalContent,
                      }
                    : m
                )
              );
            } else if (chunk.type === "error") {
              console.error("Streaming error:", chunk);
              // Store full error object as JSON string for proper error display
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: JSON.stringify(chunk),
                        status: "complete" as const,
                      }
                    : m
                )
              );
            }
          },
          onError: (error) => {
            console.error("Streaming error:", error);
            // Store full error object as JSON string for proper error display
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: JSON.stringify(error),
                      status: "complete" as const,
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
        if (err.name !== "AbortError") {
          console.error("Chat error:", err);
          // Create a proper error response for network/unknown errors
          const errorResponse: ErrorResponse = {
            type: "error",
            error: err instanceof Error ? err.message : "En uventet feil oppstod. Prøv igjen senere.",
            error_code: "NETWORK_ERROR",
            correlation_id: correlationId,
            timestamp: new Date().toISOString(),
            details: {
              service: "network",
            },
          };
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: JSON.stringify(errorResponse),
                    status: "complete" as const,
                  }
                : m
            )
          );
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
      products,
      productsLoading,
      productsError,
      fetchProducts,
    }),
    [messages, sendMessage, isLoading, products, productsLoading, productsError, fetchProducts]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
