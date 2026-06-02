import { BookOpen, Pencil } from 'lucide-react';
import type { ProfileEntity } from '../types';
import { AiInsightCard, ProfileOverviewDetails } from '../../../components/profile';

interface MenteeOverviewContentProps {
  profile: ProfileEntity;
  isOwner: boolean;
  onEditBio?: () => void;
  onEditEducation?: () => void;
  onAiCta?: () => void;
}

export function MenteeOverviewContent({
  profile,
  isOwner,
  onEditBio,
  onEditEducation,
  onAiCta,
}: MenteeOverviewContentProps) {
  const showAi = isOwner && profile.aiInsight;

  return (
    <div
      className={`grid gap-6 ${showAi ? 'lg:grid-cols-[1fr_300px]' : ''}`}
    >
      <div className="rounded-3xl border border-[#E8EBF2] bg-white p-6 shadow-sm md:p-8">
        <ProfileOverviewDetails profile={profile} />

        <div className="relative mb-8">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold text-[#1F2533]">Bio</h2>
            {isOwner ? (
              <button
                type="button"
                onClick={onEditBio}
                className="rounded-lg p-2 text-primary transition hover:bg-primary/10"
                aria-label="Edit bio"
              >
                <Pencil size={18} />
              </button>
            ) : null}
          </div>
          <p className="mt-3 text-base leading-relaxed text-[#5C6378]">{profile.bio}</p>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold text-[#1F2533]">Education</h2>
            {isOwner ? (
              <button
                type="button"
                onClick={onEditEducation}
                className="rounded-lg p-2 text-primary transition hover:bg-primary/10"
                aria-label="Edit education"
              >
                <Pencil size={18} />
              </button>
            ) : null}
          </div>
          <ul className="mt-4 space-y-4">
            {profile.education.map((edu) => (
              <li key={edu.id} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <BookOpen size={22} />
                </div>
                <div>
                  <p className="font-semibold text-[#1F2533]">{edu.degree}</p>
                  <p className="text-sm text-[#6B7289]">{edu.institution}</p>
                  {edu.faculty ? <p className="text-sm text-[#6B7289]">{edu.faculty}</p> : null}
                  <p className="text-sm text-[#9CA3B8]">
                    {edu.startYear} - {edu.endYear}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showAi && profile.aiInsight ? (
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
