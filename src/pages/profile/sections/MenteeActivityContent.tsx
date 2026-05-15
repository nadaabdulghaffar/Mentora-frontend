import { Award } from 'lucide-react';
import type { ProfileEntity } from '../types';
import { AiInsightCard, ProgramCard } from '../../../components/profile';

interface MenteeActivityContentProps {
  profile: ProfileEntity;
  isOwner: boolean;
  onAiCta?: () => void;
}

export function MenteeActivityContent({ profile, isOwner, onAiCta }: MenteeActivityContentProps) {
  const enrolled = profile.enrolledProgram;
  const showAi = isOwner && profile.aiInsight;

  const main = enrolled ? (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Award className="text-primary" size={22} />
        <h2 className="text-lg font-bold text-[#1F2533]">Enrolled Program</h2>
      </div>
      <div className="max-w-lg">
        <ProgramCard program={enrolled} />
      </div>
    </section>
  ) : (
    <section className="flex flex-col items-center justify-center rounded-3xl border border-[#E8EBF2] bg-white px-8 py-16 text-center shadow-sm">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <Award size={40} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-[#1F2533]">No Activity yet!</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#6B7289]">
        Start your journey and connect with mentors, complete sessions, and grow your skills.
      </p>
    </section>
  );

  if (!showAi) {
    return <div>{main}</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>{main}</div>
      {profile.aiInsight ? (
        <AiInsightCard
          title={profile.aiInsight.title}
          body={profile.aiInsight.body}
          ctaLabel={profile.aiInsight.ctaLabel}
          onCta={onAiCta}
        />
      ) : null}
    </div>
  );
}
