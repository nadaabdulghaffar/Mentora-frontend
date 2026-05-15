import { Star } from 'lucide-react';
import type { ProfileEntity, ReviewDistribution } from '../types';

function DistributionBars({ dist, total }: { dist: ReviewDistribution; total: number }) {
  const rows = [
    { stars: 5, count: dist.stars5 },
    { stars: 4, count: dist.stars4 },
    { stars: 3, count: dist.stars3 },
    { stars: 2, count: dist.stars2 },
    { stars: 1, count: dist.stars1 },
  ];
  return (
    <div className="flex flex-1 flex-col gap-2">
      {rows.map(({ stars, count }) => (
        <div key={stars} className="flex items-center gap-3 text-xs">
          <span className="w-3 font-semibold text-[#5C6378]">{stars}</span>
          <Star size={12} className="shrink-0 text-[#4DB6AC]" fill="currentColor" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ECEFF5]">
            <div
              className="h-full rounded-full bg-[#4DB6AC]"
              style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
            />
          </div>
          <span className="w-6 text-right font-semibold text-[#5C6378]">{count}</span>
        </div>
      ))}
    </div>
  );
}

interface MentorReviewsContentProps {
  profile: ProfileEntity;
}

export function MentorReviewsContent({ profile }: MentorReviewsContentProps) {
  const avg = profile.reviewAverage ?? 4.9;
  const total = profile.reviewTotal ?? 74;
  const dist = profile.reviewDistribution ?? {
    stars5: 68,
    stars4: 4,
    stars3: 2,
    stars2: 0,
    stars1: 0,
  };
  const reviews = profile.reviews ?? [];
  const distSum = dist.stars1 + dist.stars2 + dist.stars3 + dist.stars4 + dist.stars5;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#E8EBF2] bg-white p-6 shadow-sm md:flex md:gap-10 md:p-8">
        <div className="mb-8 flex flex-col items-center border-b border-[#ECEFF5] pb-8 md:mb-0 md:w-52 md:shrink-0 md:border-b-0 md:border-r md:pb-0 md:pr-10">
          <p className="text-5xl font-bold text-[#1F2533]">{avg.toFixed(1)}</p>
          <div className="mt-2 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={20} className="text-[#4DB6AC]" fill="currentColor" />
            ))}
          </div>
          <p className="mt-2 text-sm font-medium text-[#6B7289]">Total {total} reviews</p>
        </div>
        <DistributionBars dist={dist} total={distSum || 1} />
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="rounded-3xl border border-[#E8EBF2] bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <img src={r.authorAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <span className="font-semibold text-[#1F2533]">{r.authorName}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-[#4DB6AC]" fill="currentColor" />
                ))}
              </div>
              <span className="text-xs text-[#9CA3B8]">{r.date}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#5C6378]">{r.text}</p>
          </article>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          className="rounded-full border border-[#D8DCE8] bg-white px-8 py-2.5 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F8F9FD]"
        >
          Load more reviews
        </button>
      </div>
    </div>
  );
}
