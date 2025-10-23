import { useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChatMessage } from "@/components/chatbot/ChatbotMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";
import { useChatBot } from "@/hooks/useChatBot";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";

const ChatBot = () => {
  const { messages, sendMessage } = useAppContext();
  const { isOpen, openChat, closeChat } = useChatBot();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        variant: "destructive",
        title: "Chat failed",
        description: error instanceof Error ? error.message : "Unknown error",
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
        className="md:h-12 md:w-12 h-10 w-10 rounded-full shadow-lg border border-border"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={closeChat}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl">ThermaBuddy</DialogTitle>
            <DialogDescription className="sr-only">
              Chat med assistenten for å få hjelp om produkter og valg av
              modell.
            </DialogDescription>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 bg-gray-200" ref={scrollAreaRef}>
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
              placeholder="Fortell ThermaBuddy hva du lurer på..."
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
