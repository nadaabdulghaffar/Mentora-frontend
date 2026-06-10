import React from 'react';
import { X, Calendar, Clock3, Video, Pencil } from 'lucide-react';

type SessionDetailsModalProps = {
isOpen: boolean;
onClose: () => void;
session: {
id: string;
title: string;
dateLabel: string;
duration: string;
live: boolean;
meetingLink?: string;
} | null;

onCancelSession?: (sessionId: string) => void;
isMentor?: boolean;

};

export default function SessionDetailsModal({
isOpen,
onClose,
session,
onCancelSession,
isMentor = false,
}: SessionDetailsModalProps) {
if (!isOpen || !session) return null;


const [isEditing, setIsEditing] = React.useState(false);

const [editedTitle, setEditedTitle] = React.useState(session.title);
const [editedMeetingLink, setEditedMeetingLink] = React.useState(
  session.meetingLink || ''
);

return ( <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/45 p-4"> <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">


    {/* HEADER */}
    <div className="flex items-start justify-between border-b border-[#ECEFF6] px-6 py-5">
      <div>
        <h2 className="text-xl font-bold text-[#1F2432]">
          Session Details
        </h2>

        <p className="mt-1 text-sm text-[#7B8193]">
          Review your scheduled classroom session.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1.5 text-[#6F7689] transition hover:bg-[#F2F4F8]"
      >
        <X size={22} />
      </button>
    </div>

    {/* BODY */}
    <div className="space-y-5 px-6 py-5">

      {/* TITLE */}
      <div className="rounded-2xl border border-[#ECEFF6] bg-[#FAFBFE] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A91A5]">
          Session Title
        </p>

        <p className="mt-2 text-lg font-semibold text-[#1F2432]">
          {session.title}
        </p>
      </div>

      {/* DATE */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#ECEFF6] bg-white p-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#F3F4F8]">
          <Calendar size={20} className="text-[#6E56CF]" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A91A5]">
            Date & Time
          </p>

          <p className="mt-1 text-sm font-medium text-[#1F2432]">
            {session.dateLabel}
          </p>
        </div>
      </div>

     

      {/* STATUS */}
      <div className="flex items-center justify-between rounded-2xl border border-[#ECEFF6] bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A91A5]">
            Status
          </p>

          <p className="mt-1 text-sm font-semibold text-[#1F2432]">
            {session.live ? 'Live Now' : 'Upcoming'}
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            session.live
              ? 'bg-[#E7F8F5] text-[#0E8B6F]'
              : 'bg-[#F3F4F8] text-[#6F7689]'
          }`}
        >
          {session.live ? 'LIVE' : 'UPCOMING'}
        </div>
      </div>

      {/* MEETING LINK */}
      {session.meetingLink && (
        <div className="rounded-2xl border border-[#ECEFF6] bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#F3F4F8]">
              <Video size={20} className="text-[#6E56CF]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A91A5]">
                Meeting Link
              </p>

              <a
                href={session.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block truncate text-sm font-medium text-[#5E48C3] hover:underline"
              >
                {session.meetingLink}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>




    {/* FOOTER */}
    <div className="flex items-center justify-end gap-3 border-t border-[#ECEFF6] px-6 py-4">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F4F6FA]"
      >
        Close
      </button>

      {session.meetingLink && (
        <button
          type="button"
          onClick={() => window.open(session.meetingLink, '_blank')}
          className="inline-flex items-center gap-2 rounded-xl bg-[#5E4BC5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4F3DB0]"
        >
          <Video size={16} />
          Join Session
        </button>
      )}
    </div>
  </div>
</div>


);
}
