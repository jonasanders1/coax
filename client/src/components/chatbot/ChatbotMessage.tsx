"use client";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const formattedTime = (() => {
    const date = new Date(message.timestamp);
    if (isNaN(date.getTime())) return message.timestamp;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  })();

  return (
    <div className={cn("flex flex-col gap-1 p-3 md:p-0")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
          isUser ? "bg-primary text-white self-end" : "bg-white self-start"
        )}
      >
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <div className="font-semibold text-sm">
            {isUser ? "Meg" : "ThermaBuddy"}
          </div>
          <div
            className={cn(
              "text-xs",
              isUser ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {formattedTime}
          </div>
        </div>
        <p
          className={cn(
            "whitespace-pre-wrap text-sm md:text-md leading-relaxed text-foreground",
            isUser ? "text-white" : "text-muted-foreground"
          )}
        >
          {message.content === "..." ? (
            <span className="flex items-center gap-2 text-sm animate-pulse">
              <Loader className="animate-spin h-4 w-4" />
              <span className="">Thinking...</span>
            </span>
          ) : (
            <span>{message.content}</span>
          )}
        </p>
      </div>
    </div>
  );
}
