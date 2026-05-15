import { BookOpen, Pencil, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProfileEntity } from '../types';

interface MentorOverviewContentProps {
  profile: ProfileEntity;
  isOwner: boolean;
  onEditBio?: () => void;
  onEditEducation?: () => void;
}

export function MentorOverviewContent({ profile, isOwner, onEditBio, onEditEducation }: MentorOverviewContentProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-[#E8EBF2] bg-white p-6 shadow-sm md:p-8">
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

      <div className="mb-8">
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

      {!isOwner && (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#1F2533]">Suggested Programs for You</h2>
              <button
                type="button"
                onClick={() => navigate('/suggested-programs')}
                className="flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                View all
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-[#E8EBF2] bg-gradient-to-br from-[#F3F4F7] to-white p-6 text-center">
              <p className="text-sm text-[#6B7289]">Programs curated based on this mentor's expertise and your interests</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#1F2533]">Recommended Mentors</h2>
              <button
                type="button"
                onClick={() => navigate('/recommended-mentors')}
                className="flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                View all
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-[#E8EBF2] bg-gradient-to-br from-[#F3F4F7] to-white p-6 text-center">
              <p className="text-sm text-[#6B7289]">Mentors similar to this profile who might be a great fit for you</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
