import React, { useEffect, useState } from 'react';
import { X, Video, Plus } from 'lucide-react';

type MentorNewSessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle: string;
  onSessionTitleChange: (value: string) => void;
  sessionDate: string;
  onSessionDateChange: (value: string) => void;
  sessionTime: string;
  onSessionTimeChange: (value: string) => void;
  meetingLink: string;
  onMeetingLinkChange: (value: string) => void;
  onSchedule: () => void;
  isLoading?: boolean;
  isEditMode?: boolean;
};

type SessionErrors = {
  title?: string;
  date?: string;
  time?: string;
  meetingLink?: string;
};

const labelClass =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A91A5]';

const inputClass =
  'w-full rounded-xl border border-[#E6E9F2] bg-[#F4F6FA] px-4 py-3 text-sm text-[#1F2432] outline-none transition placeholder:text-[#9AA1B1] focus:border-[#5E4BC5] focus:bg-white';

function buildSessionErrors(
  sessionTitle: string,
  sessionDate: string,
  sessionTime: string,
  meetingLink: string
): SessionErrors {
  const errors: SessionErrors = {};

  if (!sessionTitle.trim()) {
    errors.title = 'Session title is required';
  } else if (sessionTitle.trim().length < 4) {
    errors.title = 'Title must be at least 4 characters';
  }

  if (!sessionDate.trim()) {
    errors.date = 'Session date is required';
  }

  if (!sessionTime.trim()) {
    errors.time = 'Session time is required';
  }

  if (!meetingLink.trim()) {
    errors.meetingLink = 'Meeting link is required';
  } else {
    try {
      new URL(meetingLink);
    } catch {
      errors.meetingLink = 'Please enter a valid URL';
    }
  }

  return errors;
}

export default function MentorNewSessionModal({
  isOpen,
  onClose,
  sessionTitle,
  onSessionTitleChange,
  sessionDate,
  onSessionDateChange,
  sessionTime,
  onSessionTimeChange,
  meetingLink,
  onMeetingLinkChange,
  onSchedule,
  isLoading = false,
  isEditMode = false,
}: MentorNewSessionModalProps) {
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSubmitAttempted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const errors = buildSessionErrors(
    sessionTitle,
    sessionDate,
    sessionTime,
    meetingLink
  );

  const selectedDateTime =
    sessionDate && sessionTime
      ? new Date(`${sessionDate}T${sessionTime}`)
      : null;

  const isPastSession =
    !!selectedDateTime && selectedDateTime.getTime() < Date.now();

  const isValid =
    Object.keys(errors).length === 0 && !isPastSession;

  const handleScheduleClick = () => {
    setSubmitAttempted(true);
    if (isValid && !isLoading) {
      onSchedule();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#ECEFF6] px-6 py-5">
          <h2 className="text-xl font-bold text-[#1F2432]">
            {isEditMode ? 'Edit Session' : 'New Session'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6F7689] transition hover:bg-[#F2F4F8]"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className={labelClass}>Session title</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => onSessionTitleChange(e.target.value)}
              placeholder="e.g. Advanced UI Systems Review"
              className={inputClass}
            />
            {submitAttempted && errors.title && (
              <p className="mt-1 text-xs font-medium text-[#AF2F4D]">
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => onSessionDateChange(e.target.value)}
                className={`${inputClass} [color-scheme:light]`}
              />
              {submitAttempted && errors.date && (
                <p className="mt-1 text-xs font-medium text-[#AF2F4D]">
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Time</label>
              <input
                type="time"
                value={sessionTime}
                onChange={(e) => onSessionTimeChange(e.target.value)}
                className={`${inputClass} [color-scheme:light]`}
              />
              {submitAttempted && errors.time && (
                <p className="mt-1 text-xs font-medium text-[#AF2F4D]">
                  {errors.time}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Meeting link</label>
            <div className="relative">
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => onMeetingLinkChange(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className={`${inputClass} pr-11`}
              />
              <Video
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A91A5]"
              />
            </div>
            {submitAttempted && errors.meetingLink && (
              <p className="mt-1 text-xs font-medium text-[#AF2F4D]">
                {errors.meetingLink}
              </p>
            )}
          </div>

          {submitAttempted && isPastSession && (
            <div className="rounded-xl border border-[#FFD6DC] bg-[#FFF4F6] px-4 py-3">
              <p className="text-sm font-medium text-[#AF2F4D]">
                Session date and time must be in the future.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#ECEFF6] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F4F6FA]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleScheduleClick}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5E4BC5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4F3DB0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Scheduling...
              </>
            ) : (
              <>
                {!isEditMode && <Plus size={16} />}
                {isEditMode ? 'Save Changes' : 'Schedule Session'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
