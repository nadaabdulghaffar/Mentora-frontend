import { MessageSquare, Star } from 'lucide-react';
import { formatRating } from './utils';

interface FeedbackMetricsProps {
  averageRating: number;
  totalReviews: number;
}

const metricConfig = [
  {
    key: 'average',
    label: 'Average Rating',
    icon: Star,
    iconClass: 'text-[#4DB6AC]',
    bgClass: 'bg-[#E8F8F6]',
  },
  {
    key: 'total',
    label: 'Total Reviews',
    icon: MessageSquare,
    iconClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
] as const;

export function FeedbackMetrics({
  averageRating,
  totalReviews,
}: FeedbackMetricsProps) {
  const values = {
    average: formatRating(averageRating),
    total: totalReviews.toLocaleString(),
  };

  return (
    <section aria-labelledby="feedback-metrics-heading">
      <h2 id="feedback-metrics-heading" className="sr-only">
        Feedback metrics
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {metricConfig.map(({ key, label, icon: Icon, iconClass, bgClass }) => (
          <div
            key={key}
            className="rounded-3xl border border-[#E8EBF2] bg-white p-5 shadow-sm transition hover:border-[#D8DCE8]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-bold text-[#1F2533]">
                  {values[key]}
                  {key !== 'total' ? (
                    <span className="ml-1 text-lg font-semibold text-[#9CA3B8]">/ 5</span>
                  ) : null}
                </p>
              </div>
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${bgClass}`}
              >
                <Icon size={22} className={iconClass} strokeWidth={2} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
