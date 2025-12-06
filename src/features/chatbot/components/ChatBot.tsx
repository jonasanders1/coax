"use client";
import { useLayoutEffect, useRef, useState, useEffect } from "react";

import { Button } from "@/shared/components/ui/button";
import { ErrorBoundary } from "@/shared/components/common/ErrorBoundary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";
import { useChatBot } from "@/features/chatbot/hooks/useChatBot";
import { useAppContext } from "@/shared/context/AppContext";
import { toast } from "@/shared/hooks/use-toast";
import { Textarea } from "@/shared/components/ui/textarea";
import { Message } from "@/shared/types/chat";
import ChatbotMessage from "@/features/chatbot/components/ChatbotMessage";
import { truncateString } from "@/shared/utils/inputValidation";

// Maximum length for chat input (prevents DoS and excessive API costs)
const MAX_CHAT_INPUT_LENGTH = 2000;

const ChatBot = () => {
  const { messages, setMessages, sendMessage, isLoading } = useAppContext();
  const { isOpen, openChat, closeChat } = useChatBot();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const hasInitialized = useRef(false);

  // Show welcome message when chat first opens
  useEffect(() => {
    if (isOpen && !hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;

      setTimeout(() => {
        const welcomeMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "Hei! Jeg er Flux, din hjelpsomme assistent for COAX varmtvannsberedere. Hvordan kan jeg hjelpe deg i dag?",
          timestamp: new Date().toISOString(),
        };

        setMessages([welcomeMessage]);
      }, 1000);
    }
  }, [isOpen, messages.length, setMessages]);

  useLayoutEffect(() => {
    const root = scrollAreaRef.current;
    const viewport = root?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Truncate input to max length to prevent DoS attacks
    const sanitizedInput = truncateString(input.trim(), MAX_CHAT_INPUT_LENGTH);
    const correlationId = crypto.randomUUID();

    if (!sanitizedInput) return;

    const currentInput = sanitizedInput;
    setInput("");

    try {
      await sendMessage(currentInput, correlationId);
    } catch (error) {
      console.error("Chat error:", error);
      // Error handling is done in AppContext, but show toast for critical errors
      toast({
        className: "bg-secondary text-white",
        title: "Noe gikk galt",
        description: "Flux kan ikke svare akkurat nå. Prøv igjen senere.",
      });
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="icon"
            className="md:h-12 md:w-12 h-10 w-10 rounded-full shadow-md border border-border"
            aria-label="Chat er midlertidig utilgjengelig"
            disabled
            title="Chat er midlertidig utilgjengelig"
          >
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
      }
    >
      {/* Floating Button */}
      <Button
        onClick={openChat}
        size="icon"
        className="md:h-12 md:w-12 h-10 w-10 rounded-full shadow-md border border-border"
        aria-label="Åpne chat med Flux assistent"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={closeChat}>
        <DialogContent className="md:h-[700px] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-4 border-b">
            <div
              className="flex items-center space-x-2"
              data-radix-dialog-title="Flux"
            >
              <DialogTitle className="text-2xl m-0">Flux</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Snakk med assistenten for å få hjelp om produkter og valg av
              modell.
            </DialogDescription>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea id="chat-messages" className="flex-1 px-4 bg-background" ref={scrollAreaRef}>
            <div className="space-y-4 pt-4 pb-8">
              {messages.map((message) => (
                <ChatbotMessage key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>

          <form
            onSubmit={handleSubmit}
            className="relative flex-shrink-0 bg-transparent border border-border rounded-lg focus-within:border-primary m-3 flex items-end gap-2 pt-2 pr-2 pb-2"
          >
            <Textarea
              value={input}
              onChange={(e) => {
                // Limit input length to prevent DoS
                const value = e.target.value;
                if (value.length <= MAX_CHAT_INPUT_LENGTH) {
                  setInput(value);
                }
              }}
              placeholder="Fortell Flux hva du lurer på..."
              autoResize
              maxHeight={150}
              maxLength={MAX_CHAT_INPUT_LENGTH}
              className="bg-transparent resize-none overflow-hidden border-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
              aria-label="Skriv melding til Flux assistent"
              aria-describedby="chat-input-hint"
            />
            <span id="chat-input-hint" className="sr-only">
              Trykk Enter for å sende, Shift+Enter for ny linje
            </span>
            <div className="">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-primary h-10 aspect-square rounded-lg"
                aria-label="Send melding til Flux"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </form>
          <div className="text-center text-xs text-muted-foreground mb-4">
            Flux kan ta feil – dobbeltsjekk viktig informasjon.
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};

export default ChatBot;
