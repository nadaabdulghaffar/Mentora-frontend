import { AlertCircle, X } from "lucide-react";

type Variant = "error" | "warning" | "info";

const styles: Record<
  Variant,
  { wrap: string; icon: string; title: string }
> = {
  error: {
    wrap: "border-red-200 bg-red-50/90 text-red-900",
    icon: "text-red-600",
    title: "Action required",
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50/90 text-amber-950",
    icon: "text-amber-600",
    title: "Heads up",
  },
  info: {
    wrap: "border-slate-200 bg-slate-50 text-slate-800",
    icon: "text-slate-500",
    title: "Note",
  },
};

interface Props {
  variant?: Variant;
  /** Short summary or single-line error. */
  message?: string | null;
  /** Structured issues (preferred for validation). */
  detailLines?: string[] | null;
  /** If true, splits `message` on newlines into a list. */
  splitMessageToList?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export default function RoadmapNotice({
  variant = "error",
  message,
  detailLines,
  splitMessageToList = true,
  onDismiss,
  className = "",
}: Props) {
  const fromProp =
    detailLines?.map((l) => l.trim()).filter((l) => l.length > 0) ?? null;

  const fromMessage =
    splitMessageToList && message?.includes("\n")
      ? message
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
      : null;

  const list = fromProp ?? fromMessage;
  const singleLine =
    message?.trim() &&
    (!splitMessageToList || !message.includes("\n"))
      ? message.trim()
      : null;

  if (!singleLine && (!list || list.length === 0)) return null;

  const s = styles[variant];

  return (
    <div
      role="alert"
      className={`
        rounded-2xl border px-4 py-3 shadow-sm
        ${s.wrap}
        ${className}
      `}
    >
      <div className="flex gap-3">
        <AlertCircle
          className={`shrink-0 mt-0.5 ${s.icon}`}
          size={20}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide opacity-80">
            {s.title}
          </p>
          {singleLine && (!list || list.length === 0) ? (
            <p className="text-sm font-medium leading-relaxed">{singleLine}</p>
          ) : null}
          {list && list.length > 0 ? (
            <ul className="list-disc pl-4 space-y-1.5 text-sm leading-relaxed">
              {list.map((line, i) => (
                <li key={`${i}-${line.slice(0, 40)}`}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 hover:bg-black/5 transition"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
