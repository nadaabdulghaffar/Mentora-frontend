import { Calendar, Clock3, Plus } from 'lucide-react';
export type ClassroomScheduleSession = {
  id: string;
  title: string;
  dateLabel: string;
  duration: string;
  live: boolean;
  meetingLink?: string;


};

type ClassroomScheduleSectionProps = {
  sessions: ClassroomScheduleSession[];
  onScheduleSession: () => void;
  onViewDetails: (session: ClassroomScheduleSession) => void;
  onEditSession: (session: ClassroomScheduleSession) => void;
   onCancelSession: (session: ClassroomScheduleSession) => void;
  isMentor?: boolean;
  activePhase?: string;

};

export default function ClassroomScheduleSection({
  sessions,
  activePhase = "Active classroom",
  onScheduleSession,
  onViewDetails,
  onEditSession,
    onCancelSession,
  isMentor = false, 
}: ClassroomScheduleSectionProps)
{
  return (
    <section className="space-y-5">
     <div className="flex flex-wrap items-start justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold leading-tight text-[#1F2432]">
      My Upcoming Sessions
    </h1>

    <p className="mt-1 text-base text-[#5E48C3]">
      Active Phase:{' '}
      <span className="text-[#495164]">
        {activePhase}
      </span>
    </p>
  </div>

 {isMentor && (
  <button
    type="button"
    onClick={onScheduleSession}
    className="inline-flex items-center gap-2 rounded-xl bg-[#5E4BC5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4F3DB0]"
  >
    <Plus size={18} strokeWidth={2.5} />
    Schedule New Session
  </button>
)}


</div>
<div className="space-y-4 rounded-2xl border border-[#E6E9F2] bg-white p-5">
  {sessions.length === 0 ? (
    <div className="grid min-h-[220px] place-items-center rounded-2xl border border-dashed border-[#E3E7F0] bg-[#FCFCFE]">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#F3F4F8]">
          <Calendar size={28} className="text-[#8B91A4]" />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-[#1F2432]">
          No upcoming sessions
        </h3>

        <p className="mt-2 max-w-[320px] text-sm leading-6 text-[#7B8193]">
          You haven’t scheduled any classroom sessions yet.
         
          {isMentor && (
  <button
    type="button"
    onClick={onScheduleSession}
    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5E4BC5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F3DB0]"
  >
    <Plus size={18} />
    Schedule Session
  </button>
)}
        </p>

      </div>
    </div>
  ) : (
    sessions.map((session) => (
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
                <div
  className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
    session.live
      ? 'bg-[#E7F8F5] text-[#0E8B6F]'
      : 'bg-[#F3F4F8] text-[#6F7689]'
  }`}
>
  {session.live ? 'Live Now' : 'Upcoming'}
</div>
              </div>
            </div>

{session.live ? (
  <button
    type="button"
    onClick={() => {
      if (session.meetingLink) {
        window.open(session.meetingLink, '_blank');
      }
    }}
    className="h-12 rounded-xl bg-[#6E56CF] px-8 text-base font-semibold text-white transition hover:bg-[#5B45BE]"
  >
    Join
  </button>
)


: (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onViewDetails(session)}
      className="h-11 rounded-xl border border-[#D4D9E5] bg-white px-6 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F4F6FA]"
    >
      View Details
    </button>

   {isMentor && (
  <button
    type="button"
    onClick={() => onEditSession(session)}
    className="h-11 rounded-xl bg-[#5E4BC5] px-6 text-sm font-semibold text-white transition hover:bg-[#4F3DB0]"
  >
    Edit
  </button>
)}

    {isMentor && (
      <button
        type="button"
        onClick={() => onCancelSession(session)}
        className="h-11 rounded-xl border border-[#D4D9E5] bg-white px-6 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F4F6FA]"
      >
        Cancel
      </button>
    )}
  </div>
)}
          </div>
             ))
      )}
      </div>
    </section>
  );
}