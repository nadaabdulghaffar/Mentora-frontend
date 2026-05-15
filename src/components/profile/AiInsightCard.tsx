import { Sparkles } from 'lucide-react';

interface AiInsightCardProps {
  title: string;
  body: string;
  ctaLabel: string;
  onCta?: () => void;
}

export function AiInsightCard({ title, body, ctaLabel, onCta }: AiInsightCardProps) {
  return (
    <aside className="h-fit rounded-3xl bg-primary p-6 text-white shadow-lg shadow-primary/20">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/90">
        <Sparkles size={16} className="text-accent" />
        {title}
      </div>
      <p className="text-sm leading-relaxed text-white/95">{body}</p>
      <button
        type="button"
        onClick={onCta}
        className="mt-5 w-full rounded-xl bg-white py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
      >
        {ctaLabel}
      </button>
    </aside>
  );
}
