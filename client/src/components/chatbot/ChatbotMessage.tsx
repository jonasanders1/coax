"use client";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Loader, MessageSquareText } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import katex from "katex";
import "katex/dist/katex.css";

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
            ? "max-w-[90%] md:max-w-[80%] bg-primary dark:bg-primary/80 text-white self-end shadow-sm px-4 rounded-lg"
            : "w-[90%] md:w-[80%] self-start border-b-2 rounded-b-none"
        )}
      >
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <div className="font-semibold text-sm">
            {isUser ? (
              "Meg"
            ) : (
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-5 h-5" />
                <p>Flux</p>
              </div>
            )}
          </div>
          <div className={cn("text-xs text-white")}>{formattedTime}</div>
        </div>

        {/* Message content */}
        {isUser ? (
          <p className={cn("whitespace-pre-wrap text-base leading-relaxed text-foreground text-white")}>
            {message.content}
          </p>
        ) : message.status === "writing" && message.content === "" ? (
          <span className="flex items-center gap-2 text-base">
            <Loader className="animate-spin h-4 w-4" />
            <span>Tenker...</span>
          </span>
        ) : (
          <div className="prose text-foreground max-w-full">
            <MDEditor.Markdown
              source={message.content}
              style={{ whiteSpace: "pre-wrap" }}
              previewOptions={{
                components: {
                  code: ({ children = [], className, ...props }) => {
                    // KaTeX inline / block handling
                    if (typeof children === "string" && /^\$\$(.*)\$\$/.test(children)) {
                      const html = katex.renderToString(
                        children.replace(/^\$\$(.*)\$\$/, "$1"),
                        { throwOnError: false }
                      );
                      return (
                        <code
                          dangerouslySetInnerHTML={{ __html: html }}
                          style={{ background: "transparent" }}
                        />
                      );
                    }

                    const code =
                      props.node && props.node.children
                        ? props.node.children[0]?.value || ""
                        : children;

                    if (
                      typeof code === "string" &&
                      typeof className === "string" &&
                      /^language-katex/.test(className.toLowerCase())
                    ) {
                      const html = katex.renderToString(code, { throwOnError: false });
                      return <code dangerouslySetInnerHTML={{ __html: html }} style={{ fontSize: "150%" }} />;
                    }

                    return <code className={String(className)}>{children}</code>;
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
