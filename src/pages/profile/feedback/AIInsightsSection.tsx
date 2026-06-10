import { useQuery } from '@tanstack/react-query';
import { Sparkles, AlertCircle } from 'lucide-react';
import { getMentorFeedbackSummary } from '../../../services/feedbackService';

interface AIInsightsSectionProps {
  mentorUserId: string;
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

export function AIInsightsSection({ mentorUserId }: AIInsightsSectionProps) {
  const { data: insights, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'mentor-feedback-summary', mentorUserId],
    queryFn: () => getMentorFeedbackSummary(mentorUserId),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 2,
    retry: 1,
  });

  if (isLoading) {
    return (
      <section className="overflow-hidden rounded-3xl border border-[#E8EBF2] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-[#6B7289]">Loading AI Insights…</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="overflow-hidden rounded-3xl border border-[#E8EBF2] bg-[#FAFBFE] p-8 text-center shadow-sm">
        <div className="flex justify-center mb-3">
          <AlertCircle className="text-[#9CA3B8]" size={28} />
        </div>
        <p className="text-sm font-medium text-[#6B7289]">AI Insights are temporarily unavailable.</p>
      </section>
    );
  }

  if (!insights || insights.breakdown.total === 0) {
    return (
      <section className="overflow-hidden rounded-3xl border border-[#E8EBF2] bg-white shadow-sm">
        <div className="border-b border-[#ECEFF5] bg-gradient-to-r from-primary/5 via-white to-accent/10 px-6 py-5 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <Sparkles size={14} className="text-accent" />
              AI Insights
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold text-[#1F2533]">
            Feedback intelligence
          </h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-[#6B7289]">
            AI insights require more feedback before meaningful analysis can be generated.
          </p>
        </div>
      </section>
    );
  }

  const { positive, neutral, negative, total } = insights.breakdown;
  const satisfactionRounded = Math.round(insights.satisfaction_rate);

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
            Generated from review sentiment
          </p>
        </div>
        <h2 id="ai-insights-heading" className="mt-3 text-xl font-bold text-[#1F2533]">
          Feedback intelligence
        </h2>
      </div>

      <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,240px)_1fr] md:p-8">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F8F9FD] p-6 h-fit">
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-primary/15 bg-white shrink-0"
            role="img"
            aria-label={`${satisfactionRounded}% satisfaction`}
          >
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">
                {satisfactionRounded}%
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
              total={total}
              colorClass="bg-[#4DB6AC]"
            />
            <SentimentBar
              label="Neutral"
              count={neutral}
              total={total}
              colorClass="bg-[#9CA3B8]"
            />
            <SentimentBar
              label="Negative"
              count={negative}
              total={total}
              colorClass="bg-[#F59E0B]"
            />
          </div>
        </div>

        <div className="space-y-5">
          {insights.summary && insights.summary.trim() !== '' && (
            <div className="rounded-2xl border border-[#ECEFF5] bg-[#FAFBFE] p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8B92A8]">
                AI Summary
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#5C6378]">{insights.summary}</p>
            </div>
          )}

          {((insights.top_positive_themes && insights.top_positive_themes.length > 0) || 
            (insights.top_negative_themes && insights.top_negative_themes.length > 0)) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#E8EBF2] p-5 h-fit">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1F2533]">
                  Key Strengths
                </div>
                {insights.top_positive_themes && insights.top_positive_themes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {insights.top_positive_themes.map((theme, idx) => (
                      <span key={idx} className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                        {theme}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9CA3B8] italic">No prominent strengths identified yet.</p>
                )}
              </div>
              
              <div className="rounded-2xl border border-[#E8EBF2] p-5 h-fit">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1F2533]">
                  Growth Opportunities
                </div>
                {insights.top_negative_themes && insights.top_negative_themes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {insights.top_negative_themes.map((theme, idx) => (
                      <span key={idx} className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                        {theme}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#9CA3B8] italic">No specific growth areas identified.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
