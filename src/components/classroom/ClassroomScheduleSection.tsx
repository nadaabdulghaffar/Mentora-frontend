import { Calendar, Clock3 } from 'lucide-react';

export type ClassroomScheduleSession = {
  id: string;
  title: string;
  dateLabel: string;
  duration: string;
  live: boolean;
};

type ClassroomScheduleSectionProps = {
  sessions: ClassroomScheduleSession[];
};

export default function ClassroomScheduleSection({ sessions }: ClassroomScheduleSectionProps) {
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-[#1F2432]">My Upcoming Sessions</h1>
        <p className="mt-1 text-base text-[#5E48C3]">
          Active Phase: <span className="text-[#495164]">Editorial Design Mastery</span>
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[#E6E9F2] bg-white p-5">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex min-h-[112px] items-center justify-between rounded-2xl border border-[#E9ECF4] bg-[#FCFCFE] p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${session.live ? 'bg-[#E7F8F5]' : 'bg-[#F2F3F8]'}`}>
                <Calendar size={22} className={session.live ? 'text-[#0E8B6F]' : 'text-[#8B91A4]'} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#6E758A]">{session.dateLabel}</p>
                <p className="text-xl font-semibold leading-tight text-[#202737]">{session.title}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#6F7689]">
                  <Clock3 size={14} />
                  {session.duration}
                </p>
              </div>
            </div>

            {session.live ? (
              <button
                type="button"
                className="h-12 rounded-xl bg-[#6E56CF] px-8 text-base font-semibold text-white"
              >
                Join
              </button>
            ) : (
              <button
                type="button"
                className="h-11 rounded-xl border border-[#D4D9E5] bg-white px-6 text-sm font-semibold text-[#4D5670]"
              >
                View Details
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}