"use client";

interface ChatBotStore {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

import { useAppStore } from "@/store/appStore";

export const useChatBot = () => {
  const isOpen = useAppStore((s) => s.isOpen);
  const openChat = useAppStore((s) => s.openChat);
  const closeChat = useAppStore((s) => s.closeChat);
  const toggleChat = useAppStore((s) => s.toggleChat);
  return { isOpen, openChat, closeChat, toggleChat } as ChatBotStore;
};
