"use client";

import { useCustomChat } from "@/features/chatbot/hooks/useCustomChat";
import { Chat } from "@/shared/components/ui/chat";
import { type Message } from "@/shared/components/ui/chat-message";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

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
  console.log(`Rating message ${messageId}: ${rating}`);

  toast.success(
    rating === "thumbs-up"
      ? "Takk for tilbakemeldingen! 👍"
      : "Takk for tilbakemeldingen! Vi jobber med å forbedre oss. 👎"
  );

  // Example: You could send this to your analytics or backend
  // await fetch('/api/feedback', {
  //   method: 'POST',
  //   body: JSON.stringify({ messageId, rating })
  // });
}

export function ChatDemo(props: ChatDemoProps) {
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="md:h-12 md:w-12 h-10 w-10 rounded-full shadow-md border border-border"
        >
          <MessageCircle />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className={`shrink-0 bg-background ${cn("p-4")}`}>
          <SheetTitle>Flux assistent</SheetTitle>
          <SheetDescription className="sr-only">
            Snakk med assistenten for å få hjelp om produkter og valg av modell.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 min-h-0 relative bg-background">
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
      </SheetContent>
    </Sheet>
  );
}
