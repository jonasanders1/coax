"use client";

import { useCustomChat } from "@/features/chatbot/hooks/useCustomChat";
import { Chat } from "@/shared/components/ui/chat";
import { type Message } from "@/shared/components/ui/chat-message";
import { toast } from "sonner";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useChatBot } from "@/features/chatbot/hooks/useChatBot";
import { useEffect, useRef } from "react";

type ChatDemoProps = {
  initialMessages?: Message[];
};

/**
 * Handles message rating (thumbs up/down)
 * You can extend this to send feedback to your backend
 */
function handleRateResponse(
  messageId: string,
  rating: "thumbs-up" | "thumbs-down"
) {
  // TODO: Send rating to your backend/analytics
  // console.log(`Rating message ${messageId}: ${rating}`);

  toast.success(
    rating === "thumbs-up"
      ? "Takk for tilbakemeldingen! 👍"
      : "Takk! Vi jobber med å forbedre oss. 👎"
  );

  // Example: You could send this to your analytics or backend
  // await fetch('/api/feedback', {
  //   method: 'POST',
  //   body: JSON.stringify({ messageId, rating })
  // });
}

export function ChatDemo(props: ChatDemoProps) {
  const { isOpen, openChat, closeChat } = useChatBot();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    status,
    setMessages,
  } = useCustomChat(props.initialMessages);

  const isLoading = status === "submitted" || status === "streaming";
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close chat
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeChat();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeChat]);

  // Prevent body scroll when chat is open (mobile-friendly)
  useEffect(() => {
    if (!isOpen) return;

    // Save current scroll position
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    // Lock scroll on mobile - use position fixed to prevent iOS Safari scroll
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    // Also set on html for better compatibility
    html.style.overflow = "hidden";

    // Prevent touchmove on background (iOS Safari fix)
    const preventTouchMove = (e: TouchEvent) => {
      // Allow touchmove inside the chat container
      const target = e.target as HTMLElement;
      const chatContainer = target.closest("[data-chatbot-dialog]");
      if (!chatContainer) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });

    return () => {
      // Restore scroll position
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";
      html.style.overflow = "";

      // Restore scroll position
      window.scrollTo(0, scrollY);

      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isOpen]);

  // Handle mobile keyboard - scroll input into view when keyboard appears
  useEffect(() => {
    if (!isOpen) return;

    // On mobile, when input is focused, ensure it's visible above keyboard
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        // Small delay to allow keyboard to appear
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("focusin", handleFocus);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("focusin", handleFocus);
      }
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating action button */}
      <Button
        onClick={openChat}
        size="icon"
        className={cn(
          "md:h-12 md:w-12 h-10 w-10 rounded-full shadow-md",
          "transition-all duration-200",
          isOpen && "opacity-0 pointer-events-none"
        )}
        aria-label="Åpne chat med COAX-AI"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* Chat overlay */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            // Mobile: full screen from bottom
            "md:items-center md:justify-center md:p-4",
            // Animation
            "animate-in fade-in-0 duration-200",
            // Identifier for CSS targeting
            "coax-chatbot-dialog"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="COAX-AI assistent chat"
          data-chatbot-dialog
        >
          {/* Backdrop - click to close on mobile */}
          <div
            className="absolute inset-0 bg-black/50 md:hidden"
            onClick={closeChat}
            aria-hidden="true"
          />

          {/* Chat container */}
          <div
            ref={chatContainerRef}
            className={cn(
              "relative flex flex-col w-full h-full md:rounded-lg md:overflow-hidden",
              // Desktop: rounded card with max width
              "md:h-[80vh] md:max-w-4xl md:rounded-lg md:shadow-2xl",
              // Mobile: full screen
              "bg-background",
              // Animation
              "animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300",
              // Better touch handling
              "touch-pan-y"
            )}
            onClick={(e) => {
              // Prevent closing when clicking inside the chat container
              e.stopPropagation();
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0 bg-background">
              <h2 className="text-lg font-semibold">COAX-AI</h2>
              <Button
                onClick={closeChat}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Lukk chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat content */}
            <div className="flex-1 min-h-0 relative bg-muted">
              <Chat
                className="h-full"
                messages={messages}
                handleSubmit={handleSubmit}
                input={input}
                handleInputChange={handleInputChange}
                isGenerating={isLoading}
                stop={stop}
                append={append}
                setMessages={setMessages}
                onRateResponse={handleRateResponse}
                suggestions={[
                  "Hvor mye kan jeg spare med en COAX vannvarmer?",
                  "Hva er forskjellen mellom COAX og tradisjonelle varmere?",
                  "Hvorfor skal jeg velge en COAX vannvarmer?",
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
