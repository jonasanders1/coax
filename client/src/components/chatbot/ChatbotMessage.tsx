"use client";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import luna from "@/assets/luna.png";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const formattedTime = (() => {
    const date = new Date(message.timestamp);
    if (isNaN(date.getTime())) return message.timestamp;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  })();

  return (
    <div className={cn("flex flex-col gap-1 p-0")}>
      <div
        className={cn(
          "py-3",
          isUser
            ? "max-w-[90%] md:max-w-[80%] bg-primary text-white self-end shadow-sm px-4 rounded-lg"
            : "w-[90%] md:w-[80%] self-start border-b-2 rounded-b-none"
        )}
      >
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <div className="font-semibold text-sm">
            {isUser ? (
              "Meg"
            ) : (
              <div className="flex items-center gap-2">
                <img src={luna} className="w-5 h-5" />
                <p>Luna</p>
              </div>
            )}
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
            "whitespace-pre-wrap text-base leading-relaxed text-foreground",
            isUser ? "text-white" : "text-muted-foreground"
          )}
        >
          {message.status === 'writing' && message.content === '' ? (
            <span className="flex items-center gap-2 text-base">
              <Loader className="animate-spin h-4 w-4" />
              <span>Tenker...</span>
            </span>
          ) : (
            <span className={message.status === 'writing' ? 'after:content-["_"] after:animate-pulse' : ''}>
              {message.content}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
