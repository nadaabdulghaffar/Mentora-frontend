import type { ProfileEntity } from '../types';

interface MentorRoadmapsContentProps {
  profile: ProfileEntity;
}

export function MentorRoadmapsContent({ profile }: MentorRoadmapsContentProps) {
  const list = profile.roadmaps ?? [];

  return (
    <div className="rounded-3xl border border-[#E8EBF2] bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((rm) => (
          <div key={rm.id} className="flex h-full flex-col rounded-2xl border border-[#EEF1F7] bg-[#FBFCFF] p-4">
            <h3 className="text-base font-bold text-[#1F2533]">{rm.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7289]">{rm.description}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#8B92A8]">
              ◆ {rm.phaseCount} PHASES
            </p>
            <button
              type="button"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              View Roadmap
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
