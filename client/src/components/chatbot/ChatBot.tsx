import { useLayoutEffect, useRef, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// import { ChatMessage } from "@/components/chatbot/ChatbotMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, MessageSquareText, Send } from "lucide-react";
import { useChatBot } from "@/hooks/useChatBot";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { Message } from "@/types/chat";
import ChatbotMessage from "@/components/chatbot/ChatbotMessage";
import { truncateString } from "@/utils/inputValidation";

// Maximum length for chat input (prevents DoS and excessive API costs)
const MAX_CHAT_INPUT_LENGTH = 2000;

const ChatBot = () => {
  const { messages, setMessages, sendMessage } = useAppContext();
  const { isOpen, openChat, closeChat } = useChatBot();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);

  // Show welcome message when chat first opens
  useEffect(() => {
    if (isOpen && !hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;
      setIsLoading(true);

      setTimeout(() => {
        const welcomeMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "Hei! Jeg er Flux, din hjelpsomme assistent for COAX varmtvannsberedere. Hvordan kan jeg hjelpe deg i dag?",
          timestamp: new Date().toISOString(),
        };

        setMessages([welcomeMessage]);
        setIsLoading(false);
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

    if (!sanitizedInput) return;

    setIsLoading(true);
    const currentInput = sanitizedInput;

    setInput("");
    try {
      await sendMessage(currentInput);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        className: "bg-secondary text-white",
        title: "Noe gikk galt",
        description: "Flux kan ikke svare akkurat nå. Prøv igjen senere.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={openChat}
        size="icon"
        className="md:h-12 md:w-12 h-10 w-10 text-white rounded-full shadow-lg"
        style={{ background: "var(--gradient-primary)" }}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={closeChat}>
        <DialogContent className="md:h-[700px] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 pt-6 pb-4 border-b">
            <div
              className="flex items-center space-x-2"
              data-radix-dialog-title="Flux"
            >
              <MessageCircle className="h-6 w-6" />
              <DialogTitle className="text-xl m-0">Snakk med Flux</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Snakk med assistenten for å få hjelp om produkter og valg av
              modell.
            </DialogDescription>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 bg-muted" ref={scrollAreaRef}>
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
            />
            <div className="">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-primary h-10 aspect-square rounded-lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
          <div className="text-center text-xs text-muted-foreground mb-4">
            Flux kan ta feil – dobbeltsjekk viktig informasjon.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatBot;
