("use client");
import type { Message, ErrorResponse } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Loader, AlertCircle, Info } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.css";
import MarkdownPreview from "@uiw/react-markdown-preview";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { useTheme } from "@/hooks/useTheme";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

// Helper function to check if content is an error JSON string
function parseErrorIfPresent(content: string): ErrorResponse | null {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(content);
    // Check if it has error structure
    if (parsed && typeof parsed === "object" && parsed.error && parsed.error_code) {
      return parsed as ErrorResponse;
    }
  } catch {
    // Not JSON or not an error structure
  }
  return null;
}

// Helper function to get user-friendly error message
function getErrorMessage(errorCode: string, error: string): { title: string; description: string; retry?: number } {
  const errorMessages: Record<string, { title: string; description: string }> = {
    VALIDATION_ERROR: {
      title: "Valideringsfeil",
      description: "Forespørselen inneholder ugyldige data. Vennligst sjekk at alle felter er korrekt utfylt.",
    },
    INVALID_JSON: {
      title: "Ugyldig format",
      description: "Forespørselen har et ugyldig format. Prøv å oppdatere siden og send meldingen på nytt.",
    },
    MISSING_QUERY: {
      title: "Mangler melding",
      description: "Meldingen din er tom. Vennligst skriv inn en melding og prøv igjen.",
    },
    REQUEST_TOO_LARGE: {
      title: "Forespørselen er for stor",
      description: error || "Forespørselen overstiger størrelsesgrensen. Vennligst forkort meldingen og prøv igjen.",
    },
    PROMPT_INJECTION_DETECTED: {
      title: "Sikkerhetsadvarsel",
      description: "Meldingen din inneholder potensielt skadelig innhold og kan ikke behandles.",
    },
    BEDROCK_INIT_ERROR: {
      title: "Tjenestefeil",
      description: "Kunne ikke koble til AI-tjenesten. Vennligst prøv igjen om litt.",
    },
    INTERNAL_ERROR: {
      title: "Intern feil",
      description: "En uventet feil oppstod. Vårt team har blitt varslet. Prøv igjen om litt.",
    },
    OPENSEARCH_AUTH: {
      title: "Tilgangsfeil",
      description: "Kunne ikke få tilgang til søketjenesten. Vennligst prøv igjen senere.",
    },
    OPENSEARCH_CONNECTION_ERROR: {
      title: "Tilkoblingsfeil",
      description: "Kunne ikke koble til søketjenesten. Vennligst prøv igjen om litt.",
    },
    OPENSEARCH_INIT_ERROR: {
      title: "Tjenestefeil",
      description: "Søketjenesten kunne ikke initialiseres. Vennligst prøv igjen senere.",
    },
    OPENSEARCH_TIMEOUT: {
      title: "Timeout",
      description: "Søketjenesten tok for lang tid å svare. Vennligst prøv igjen om litt.",
    },
    NETWORK_ERROR: {
      title: "Nettverksfeil",
      description: "Kunne ikke koble til serveren. Sjekk internettforbindelsen din og prøv igjen.",
    },
  };

  const errorInfo = errorMessages[errorCode] || {
    title: "En feil oppstod",
    description: error || "Vennligst prøv igjen senere.",
  };

  return errorInfo;
}

// Component for error messages
function ErrorMessage({ error }: { error: ErrorResponse }) {
  const errorInfo = getErrorMessage(error.error_code, error.error);
  const isRetryable = error.details?.retry_after !== undefined;
  const isValidationError = error.details?.service === "validation";

  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {errorInfo.title}
        {isValidationError && (
          <span className="text-xs font-normal text-muted-foreground">
            (Validering)
          </span>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{errorInfo.description}</p>
        
        {isRetryable && error.details?.retry_after && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Prøv igjen om {error.details.retry_after} sekunder</span>
          </div>
        )}

        {error.correlation_id && (
          <div className="mt-2 text-xs text-muted-foreground">
            Feil-ID: {error.correlation_id.slice(0, 8)}...
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Component for bot's markdown content
function BotMessageContent({ content }: { content: string }) {
  const { theme } = useTheme();

  // Check if content is an error JSON string
  const error = parseErrorIfPresent(content);
  if (error) {
    return <ErrorMessage error={error} />;
  }

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
