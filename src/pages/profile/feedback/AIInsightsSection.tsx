import { Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { AiFeedbackInsights } from './types';

interface AIInsightsSectionProps {
  insights: AiFeedbackInsights;
}

function SentimentBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}) {
  const width = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#5C6378]">
        <span>{label}</span>
        <span className="text-[#1F2533]">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#ECEFF5]">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function AIInsightsSection({ insights }: AIInsightsSectionProps) {
  const { positive, neutral, negative } = insights.sentimentCounts;
  const sentimentTotal = positive + neutral + negative;

  return (
    <section
      aria-labelledby="ai-insights-heading"
      className="overflow-hidden rounded-3xl border border-[#E8EBF2] bg-white shadow-sm"
    >
      <div className="border-b border-[#ECEFF5] bg-gradient-to-r from-primary/5 via-white to-accent/10 px-6 py-5 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles size={14} className="text-accent" />
            AI Insights
          </span>
          <p className="text-xs font-medium text-[#6B7289]">
            Generated from review sentiment — preview data
          </p>
        </div>
        <h2 id="ai-insights-heading" className="mt-3 text-xl font-bold text-[#1F2533]">
          Feedback intelligence
        </h2>
      </div>

      <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,240px)_1fr] md:p-8">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F8F9FD] p-6">
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-primary/15 bg-white"
            role="img"
            aria-label={`${insights.satisfactionPercentage}% satisfaction`}
          >
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">
                {insights.satisfactionPercentage}%
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#6B7289]">
                Satisfaction
              </p>
            </div>
          </div>
          <div className="mt-6 w-full space-y-3">
            <SentimentBar
              label="Positive"
              count={positive}
              total={sentimentTotal}
              colorClass="bg-[#4DB6AC]"
            />
            <SentimentBar
              label="Neutral"
              count={neutral}
              total={sentimentTotal}
              colorClass="bg-[#9CA3B8]"
            />
            <SentimentBar
              label="Negative"
              count={negative}
              total={sentimentTotal}
              colorClass="bg-[#F59E0B]"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#ECEFF5] bg-[#FAFBFE] p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8B92A8]">
              AI Summary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#5C6378]">{insights.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E8EBF2] p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1F2533]">
                <ThumbsUp size={16} className="text-[#4DB6AC]" />
                Positive feedback
              </div>
              <p className="text-sm leading-relaxed text-[#5C6378]">
                {insights.positiveSummary}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E8EBF2] p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1F2533]">
                <ThumbsDown size={16} className="text-[#F59E0B]" />
                Areas to improve
              </div>
              <p className="text-sm leading-relaxed text-[#5C6378]">
                {insights.negativeSummary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
