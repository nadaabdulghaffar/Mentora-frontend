import type { ProgramCardData } from '../../pages/profile/types';

const tagStyles = {
  leadership: 'bg-emerald-50 text-emerald-700',
  design: 'bg-violet-50 text-violet-700',
} as const;

interface ProgramCardProps {
  program: ProgramCardData;
  actionLabel?: string;
  onAction?: () => void;
}

export function ProgramCard({ program, actionLabel, onAction }: ProgramCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#E8EBF2] bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-40 w-full overflow-hidden bg-[#F0F2F8]">
        <img src={program.imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tagStyles[program.tagVariant]}`}>
            {program.tag}
          </span>
          <span className="text-xs font-semibold text-[#8B92A8]">{program.durationWeeks} Weeks</span>
        </div>
        <h3 className="text-lg font-bold text-[#1F2533]">{program.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#6B7289]">{program.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F0F2F8] pt-4">
          <div className="flex items-center gap-2">
            <img
              src={program.instructorAvatar}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-[#3D4559]">{program.instructorName}</span>
          </div>
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
