"use client";

import { useState, useCallback, useRef } from "react";
import { type Message, type MessagePart } from "@/shared/components/ui/chat-message";
import { ApiMessage, ChatRequest } from "@/shared/types/chat";
import { streamChat } from "@/shared/lib/api";
import { SSEEvent } from "@/shared/types/chat";

type ChatStatus = "idle" | "submitted" | "streaming";

interface UseCustomChatReturn {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) => void;
  append: (message: { role: "user"; content: string }) => void;
  status: ChatStatus;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
}

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
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
    parts: chatParts && chatParts.length > 0 ? chatParts : undefined,
  };
}

export function useCustomChat(initialMessages?: Message[]): UseCustomChatReturn {
  const initialMessagesValue = initialMessages || [];
  const [messages, setMessages] = useState<Message[]>(initialMessagesValue);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>(initialMessagesValue);

  // Keep ref in sync with state
  messagesRef.current = messages;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStatus("idle");
    }
  }, []);

  const handleSubmitInternal = useCallback(
    async (contentToSubmit: string) => {
      if (!contentToSubmit.trim() || status !== "idle") return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: contentToSubmit.trim(),
        createdAt: new Date(),
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput("");
      setStatus("submitted");

      const correlationId = crypto.randomUUID();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      let accumulatedText = "";
      let accumulatedReasoning = "";

      try {
        const currentMessages = messagesRef.current;
        // Convert to API format for the request
        const apiMessages = currentMessages.map(toApiMessage);
        const apiUserMessage = toApiMessage(userMessage);
        const payload: ChatRequest = {
          messages: [...apiMessages, apiUserMessage],
        };

        setStatus("streaming");

        await streamChat(payload, {
          signal: controller.signal,
          correlationId,
          onMessage: (chunk: SSEEvent) => {
            if (chunk.type === "reasoning") {
              // Accumulate reasoning text
              accumulatedReasoning = chunk.reasoning;
              // Update message with reasoning part
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== assistantId) return m;
                  
                  const parts: Array<{ type: "reasoning"; reasoning: string } | { type: "text"; text: string }> = [];
                  
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
                    // Keep content for backward compatibility
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
                  
                  const parts: Array<{ type: "reasoning"; reasoning: string } | { type: "text"; text: string }> = [];
                  
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
              const parts: Array<{ type: "reasoning"; reasoning: string } | { type: "text"; text: string }> = [];
              
              if (chunk.message.parts) {
                // Use parts from API if available
                const chatParts = chunk.message.parts.map((part) => {
                  if (part.type === "reasoning") {
                    return { type: "reasoning" as const, reasoning: part.reasoning };
                  } else if (part.type === "text") {
                    return { type: "text" as const, text: part.text };
                  }
                  return null;
                }).filter((p): p is { type: "reasoning"; reasoning: string } | { type: "text"; text: string } => p !== null);
                
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
              
              setStatus("idle");
              abortControllerRef.current = null;
            } else if (chunk.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: `Error: ${chunk.error}`,
                      }
                    : m
                )
              );
              setStatus("idle");
              abortControllerRef.current = null;
            }
          },
          onError: (error) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: `Error: ${error.error}`,
                    }
                  : m
              )
            );
            setStatus("idle");
            abortControllerRef.current = null;
          },
          onComplete: () => {
            setStatus("idle");
            abortControllerRef.current = null;
          },
        });
      } catch (error) {
        const isAbortError = error instanceof Error && error.name === "AbortError";
        if (!isAbortError) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                  }
                : m
            )
          );
        }
        setStatus("idle");
        abortControllerRef.current = null;
      }
    },
    [status]
  );

  const append = useCallback(
    (message: { role: "user"; content: string }) => {
      // Automatically submit the appended message
      if (message.content.trim() && status === "idle") {
        handleSubmitInternal(message.content);
      }
    },
    [status, handleSubmitInternal]
  );

  const handleSubmit = useCallback(
    (
      event?: { preventDefault?: () => void },
      options?: { experimental_attachments?: FileList }
    ) => {
      event?.preventDefault?.();
      if (!input.trim() || status !== "idle") return;
      handleSubmitInternal(input);
    },
    [input, status, handleSubmitInternal]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    status,
    stop,
    setMessages,
  };
}

