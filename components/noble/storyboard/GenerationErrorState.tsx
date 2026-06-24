import { AlertCircle, RefreshCw, Shuffle } from "lucide-react";

const ERROR_PATTERNS: { test: (e: string) => boolean; msg: string }[] = [
  {
    test: (e) => e.includes("522") || e.includes("temporarily unavailable") || e.includes("502") || e.includes("503"),
    msg: "The image provider is temporarily unavailable. This usually resolves in a few minutes.",
  },
  {
    test: (e) => e.includes("timeout") || e.includes("timed out") || e.includes("abort"),
    msg: "The request timed out. The provider may be under load — try again.",
  },
  {
    test: (e) => e.includes("401") || e.includes("Unauthorized") || e.includes("API key") || e.includes("authentication"),
    msg: "Provider authentication failed. Check the API configuration in settings.",
  },
  {
    test: (e) => e.includes("429") || e.includes("rate limit") || e.includes("quota"),
    msg: "Rate limit reached. Please wait a moment before retrying.",
  },
  {
    test: (e) => e.includes("No Noble voice"),
    msg: "Noble's voice ID is not configured. Check the ElevenLabs settings.",
  },
];

function friendlyMessage(raw: string): string {
  for (const { test, msg } of ERROR_PATTERNS) {
    if (test(raw)) return msg;
  }
  return "Generation failed. Please retry or try a different provider.";
}

interface Props {
  error: string;
  type?: "image" | "video" | "voice";
  onRetry: () => void;
  onSwitchProvider?: () => void;
  disabled?: boolean;
}

export function GenerationErrorState({ error, type = "image", onRetry, onSwitchProvider, disabled }: Props) {
  const label = type === "image" ? "Image generation failed" : type === "video" ? "Video generation failed" : "Voice generation failed";

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)" }}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: "#f87171" }} />
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "#fca5a5", fontFamily: "'Inter', sans-serif" }}>
            {label}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(252,165,165,0.7)", fontFamily: "'Inter', sans-serif" }}>
            {friendlyMessage(error)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRetry}
          disabled={disabled}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "rgba(201,162,39,0.12)",
            color: "#c9a227",
            border: "1px solid rgba(201,162,39,0.2)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <RefreshCw size={10} />
          Retry
        </button>

        {onSwitchProvider && type === "image" && (
          <button
            onClick={onSwitchProvider}
            disabled={disabled}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Shuffle size={10} />
            Try Fal Instead
          </button>
        )}
      </div>
    </div>
  );
}
