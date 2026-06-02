import type { ReactNode } from 'react';

interface ActivityScrollSectionProps {
  title: string;
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  loading?: boolean;
}

export function ActivityScrollSection({
  title,
  children,
  emptyMessage = 'Nothing here yet.',
  isEmpty = false,
  loading = false,
}: ActivityScrollSectionProps) {
  return (
    <section className="w-full min-w-0 rounded-3xl border border-[#E8EBF2] bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-[#1F2533]">{title}</h2>

      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : isEmpty ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8DEE8] bg-[#FAFBFD] px-6 py-10 text-center">
          <p className="text-sm font-medium text-[#6B7289]">{emptyMessage}</p>
        </div>
      ) : (
        <div
          className="w-full min-w-0 overflow-x-auto overflow-y-hidden pb-3"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="inline-flex w-max flex-nowrap items-stretch gap-5 pr-2">
            {children}
          </div>
        </div>
      )}
    </section>
  );
}
