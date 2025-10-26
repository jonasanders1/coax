import { useLayoutEffect, useRef, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import luna from "@/assets/luna.png";

import { ChatMessage } from "@/components/chatbot/ChatbotMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";
import { useChatBot } from "@/hooks/useChatBot";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { Message } from "@/types/chat";

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
          "Hei! Jeg er Luna, din hjelpsomme assistent for COAX varmtvannsberedere. Hvordan kan jeg hjelpe deg i dag?",
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

    setIsLoading(true);
    const currentInput = input;
    setInput("");
    try {
      await sendMessage(currentInput);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        className: "bg-secondary text-white",
        title: "Noe gikk galt",
        description: "Luna kan ikke svare akkurat nå. Prøv igjen senere.",
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
        className="md:h-12 md:w-12 h-10 w-10 bg-white rounded-full shadow-lg border border-border"
      >
        <img src={luna} />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={closeChat} >
        <DialogContent className="md:h-[600px] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 pt-6 pb-4 border-b">
            <div className="flex items-center space-x-2">
              <img src={luna} className="w-6 h-6" alt="Luna Logo" />
              <DialogTitle className="text-xl m-0">Luna</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Chat med assistenten for å få hjelp om produkter og valg av
              modell.
            </DialogDescription>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 bg-gray-100" ref={scrollAreaRef}>
            <div className="space-y-4 pt-4 pb-8">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <ChatMessage
                  message={{
                    id: "loading",
                    role: "assistant",
                    content: "...",
                    timestamp: "",
                  }}
                />
              )}
            </div>
          </ScrollArea>

          <form
            onSubmit={handleSubmit}
            className="relative flex-shrink-0 bg-white border border-border rounded-lg focus-within:border-primary m-3"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Fortell Luna hva du lurer på..."
              autoResize
              maxHeight={150}
              className="pr-12 py-3 bg-transparent border-none resize-none overflow-hidden"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <div className="w-full flex justify-end pr-2 pb-2">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-primary h-8 w-8 rounded-lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatBot;
