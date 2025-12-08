interface PromptSuggestionsProps {
  label: string;
  append: (message: { role: "user"; content: string }) => void;
  suggestions: string[];
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
      <h2 className="text-center text-2xl font-bold">{label}</h2>
      <div className="flex flex-col md:flex-row gap-3 text-sm">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => append({ role: "user", content: suggestion })}
            className="flex-1 rounded-xl border bg-background p-4 hover:bg-muted flex items-center justify-center h-full"
            style={{ height: "100%" }}
          >
            <p className="w-full text-center">{suggestion}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
