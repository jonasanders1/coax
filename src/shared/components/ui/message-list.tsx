import {
  ChatMessage,
  type ChatMessageProps,
  type Message,
} from "@/shared/components/ui/chat-message";
import { TypingIndicator } from "@/shared/components/ui/typing-indicator";

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>;

interface MessageListProps {
  messages: Message[];
  showTimeStamps?: boolean;
  isTyping?: boolean;
  messageOptions?:
    | AdditionalMessageOptions
    | ((message: Message) => AdditionalMessageOptions);
}

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
}: MessageListProps) {
  return (
    <div className="space-y-4 p-4">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions;

        const rendered = (
          <ChatMessage
            key={message.id || index}
            showTimeStamp={showTimeStamps}
            {...message}
            {...additionalOptions}
          />
        );

        // Only render if ChatMessage returns something (not null for empty messages)
        return rendered;
      })}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
