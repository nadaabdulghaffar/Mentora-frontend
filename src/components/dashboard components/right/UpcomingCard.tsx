import { CalendarDays, CalendarX } from "lucide-react";
import { useAllUpcomingSessions } from "../../../hooks/useAllUpcomingSessions";
import SectionTitle from "../../SectionTitle";
import ViewAllLink from "../../ViewAllLink";

type UpcomingCardProps = {
    title?: string;
};

const UpcomingCard = ({ title = "Upcoming Sessions" }: UpcomingCardProps) => {
    const { data: response, isLoading, isError, refetch } = useAllUpcomingSessions();
    
    // Extract data and limit to 3 inside the component
    const sessions = response?.data || [];
    const displayedSessions = sessions.slice(0, 3);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <SectionTitle>{title}</SectionTitle>
                <CalendarDays className="w-5 h-5 text-gray-400" />
            </div>

            <div className="border-t pt-4">
                {isLoading ? (
                    <div className="flex flex-col space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 rounded-xl animate-pulse bg-gray-100 shrink-0"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-6 text-gray-500 text-sm flex flex-col items-center gap-2">
                        <p>Failed to load upcoming sessions.</p>
                        <button onClick={() => refetch()} className="text-primary hover:underline font-semibold">
                            Retry
                        </button>
                    </div>
                ) : displayedSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                        <div className="bg-gray-50 p-3 rounded-full mb-3 text-gray-400">
                            <CalendarX className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-slateInk">Your schedule is clear!</p>
                        <p className="text-xs mt-1">Take a break or check back later.</p>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        {displayedSessions.map((session) => {
                            // Ensure date is treated as UTC from backend string
                            const dateObj = new Date(session.scheduledAt);
                            const month = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
                            const day = dateObj.getDate().toString();
                            const time = dateObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                            
                            // Determine Today/Tomorrow helper text based on local time
                            const today = new Date();
                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            
                            let timeDisplay = time;
                            if (dateObj.toDateString() === today.toDateString()) {
                                timeDisplay = `Today, ${time}`;
                            } else if (dateObj.toDateString() === tomorrow.toDateString()) {
                                timeDisplay = `Tomorrow, ${time}`;
                            }

                            return (
                                <EventItem
                                    key={session.sessionId}
                                    date={month}
                                    day={day}
                                    title={session.title}
                                    time={timeDisplay}
                                    field={session.programTitle}
                                    isJoinable={session.isJoinable}
                                    meetingLink={session.meetingLink}
                                />
                            );
                        })}

                        <div className="pt-3 mt-1 border-t border-gray-100 w-full text-center">
                            <ViewAllLink to="/upcoming-sessions" text="See All Sessions" className="w-full" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingCard;

interface EventItemProps {
    date: string;
    day: string;
    title: string;
    time: string;
    field?: string;
    isJoinable?: boolean;
    meetingLink?: string | null;
}

const EventItem = ({
    date,
    day,
    title,
    time,
    field,
    isJoinable,
    meetingLink
}: EventItemProps) => {
    return (
        <div className="flex gap-4 items-center">
            {/* Date Box */}
            <div className="w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 rounded-xl flex flex-col items-center justify-center text-xs font-semibold bg-[#F4F0FF] text-primary shrink-0">
                <span>{date}</span>
                <span className="text-sm">{day}</span>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 min-w-0">
                <p className="font-semibold text-xs md:text-sm lg:text-base text-slateInk truncate" title={title}>
                    {title}
                </p>

                <p className="text-xs text-gray-500 mt-1 truncate" title={time}>
                    {time}
                </p>

                {field && (
                    <p className="text-xs text-gray-400 truncate" title={field}>
                        {field}
                    </p>
                )}
            </div>

            {/* Join Button */}
            {isJoinable && meetingLink && (
                <button
                    onClick={() => window.open(meetingLink, '_blank', 'noopener,noreferrer')}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary bg-[#F4F0FF] hover:bg-primary hover:text-white transition"
                >
                    Join
                </button>
            )}
        </div>
    );
};
