import React from "react";
("use client");
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Loader, MessageSquareText } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import katex from "katex";
import "katex/dist/katex.css";
import MarkdownPreview from "@uiw/react-markdown-preview";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { useTheme } from "@/hooks/useTheme";
import { useEffect } from "react";

// Normalize fenced code blocks labeled as "katex" into $$ math blocks $$ so rehype-katex can render them
function normalizeMarkdown(src: string) {
  // Convert ```katex ... ``` to $$...$$
  const fencedToMath = src.replace(
    /```katex[\r\n]+([\s\S]*?)```/g,
    (_m, p1) => `$$\n${p1.trim()}\n$$`
  );
  return fencedToMath;
}

// Helper component for the message header
function MessageHeader({
  isUser,
  formattedTime,
}: {
  isUser: boolean;
  formattedTime: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-2">
      <div className="font-semibold text-md">
        {isUser ? (
          "Meg"
        ) : (
          <div className="flex items-center gap-2">
            <p>Flux</p>
          </div>
        )}
      </div>
      <div className="text-xs">{formattedTime}</div>
    </div>
  );
}

// Component for user messages
function UserMessage({ content }: { content: string }) {
  return (
    <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground text-white">
      {content}
    </p>
  );
}

// Component for bot's "thinking" state
function ThinkingIndicator() {
  return (
    <span className="flex items-center gap-2 text-base">
      <Loader className="animate-spin h-4 w-4" />
      <span>Tenker...</span>
    </span>
  );
}

// Component for bot's markdown content
function BotMessageContent({ content }: { content: string }) {
  const { theme } = useTheme();

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert markdown-body">
      <MarkdownPreview
        source={normalizeMarkdown(content)}
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        style={{
          background: "transparent",
          color: "inherit",
          fontSize: "1rem",
        }}
        wrapperElement={{
          "data-color-mode": theme === "dark" ? "dark" : "light",
        }}
      />
    </div>
  );
}

export function ChatbotMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const formattedTime = (() => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  })();
  // Get the appropriate message content based on message type and status
  const renderMessageContent = () => {
    if (isUser) {
      return <UserMessage content={message.content} />;
    }

    if (message.status === "writing" && message.content === "") {
      return <ThinkingIndicator />;
    }

    return <BotMessageContent content={message.content} />;
  };

  return (
    <div className={cn("flex flex-col gap-1 p-0")}>
      <div
        className={cn(
          "py-3",
          isUser
            ? "max-w-[90%] md:max-w-[80%] bg-primary dark:bg-primary/80 text-white self-end shadow-sm px-4 rounded-lg"
            : "max-w-[100%] md:max-w-[90%] self-start border-b-2 rounded-b-none"
        )}
      >
        <MessageHeader isUser={isUser} formattedTime={formattedTime} />
        {renderMessageContent()}
      </div>
    </div>
  );
}

export default ChatbotMessage;
