"use client";

import { useState, useEffect, useCallback } from "react";

const CONVERSATION_ID_KEY = "coax-conversation-id";

/**
 * Hook to manage conversation ID for chat sessions.
 * 
 * According to CLIENT_INTEGRATION.md:
 * - Backend generates conversation IDs automatically
 * - Client should capture X-Conversation-ID from response headers
 * - Client should store and reuse the conversation ID for continuity
 * 
 * This hook:
 * - Retrieves existing conversation ID from localStorage if available
 * - Provides function to update conversation ID (called when received from backend)
 * - Provides function to start a new conversation (clears stored ID)
 * 
 * @returns Object with conversationId, setConversationId, and startNewConversation function
 */
export function useConversationId() {
  const [conversationId, setConversationIdState] = useState<string | null>(null);

  // Initialize conversation ID on mount - retrieve from localStorage if available
  useEffect(() => {
    try {
      const storedId = localStorage.getItem(CONVERSATION_ID_KEY);
      
      if (storedId) {
        // Validate that it's a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(storedId)) {
          setConversationIdState(storedId);
        } else {
          // Invalid format, remove it
          localStorage.removeItem(CONVERSATION_ID_KEY);
        }
      }
      // If no stored ID, start with null - backend will generate one
    } catch (error) {
      // localStorage might not be available (e.g., incognito mode, SSR)
      console.warn("Failed to access localStorage for conversation ID:", error);
    }
  }, []);

  /**
   * Update conversation ID (called when received from backend response headers)
   */
  const setConversationId = useCallback((id: string | null) => {
    setConversationIdState(id);
    try {
      if (id) {
        localStorage.setItem(CONVERSATION_ID_KEY, id);
      } else {
        localStorage.removeItem(CONVERSATION_ID_KEY);
      }
    } catch (error) {
      console.warn("Failed to store conversation ID:", error);
    }
  }, []);

  /**
   * Start a new conversation by clearing the stored conversation ID.
   * Backend will generate a new one on the next request.
   */
  const startNewConversation = useCallback(() => {
    setConversationIdState(null);
    try {
      localStorage.removeItem(CONVERSATION_ID_KEY);
    } catch (error) {
      console.warn("Failed to clear conversation ID:", error);
    }
  }, []);

  return {
    conversationId,
    setConversationId,
    startNewConversation,
  };
}

