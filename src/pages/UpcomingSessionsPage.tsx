import React from "react";
import Layout from "../shared/components/Layout";
import { useAllUpcomingSessions } from "../hooks/useAllUpcomingSessions";
import { CalendarX } from "lucide-react";

const UpcomingSessionsPage = () => {
    const { data: response, isLoading, isError, refetch } = useAllUpcomingSessions();
    const sessions = response?.data || [];

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-[42px] font-bold leading-tight text-[#1F2432]">Upcoming Sessions</h1>
                    <p className="mt-2 max-w-4xl text-xl text-[#5B6474]">
                        Monitor your mentoring schedule. Join live sessions directly from this page.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                        {[1, 2, 3, 4].map((i) => (
                            <article key={i} className="flex flex-col h-[280px] overflow-hidden rounded-2xl border border-[#D8DBE4] bg-white shadow-[0_2px_8px_rgba(22,29,47,0.06)] p-4 animate-pulse">
                                <div className="h-6 bg-gray-100 rounded w-1/3 mb-4"></div>
                                <div className="h-8 bg-gray-100 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2 mb-auto"></div>
                                <div className="h-[50px] bg-gray-100 rounded-xl mt-4"></div>
                            </article>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="rounded-2xl border border-dashed border-[#C8CDD9] bg-white p-10 text-center">
                        <p className="text-lg text-red-600 mb-4 font-semibold">Failed to load upcoming sessions.</p>
                        <button onClick={() => refetch()} className="px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition">
                            Retry
                        </button>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#C8CDD9] bg-white p-10 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-gray-50 p-4 rounded-full text-gray-400">
                                <CalendarX className="w-8 h-8" />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-[#2A3042]">Your schedule is clear!</h2>
                        <p className="mt-2 text-[#7B869C]">
                            You have no upcoming sessions scheduled at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {sessions.map((session) => {
                            const dateObj = new Date(session.scheduledAt);
                            const month = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
                            const day = dateObj.getDate().toString();
                            const time = dateObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                            
                            const today = new Date();
                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            
                            let timeDisplay = time;
                            if (dateObj.toDateString() === today.toDateString()) {
                                timeDisplay = `Today, ${time}`;
                            } else if (dateObj.toDateString() === tomorrow.toDateString()) {
                                timeDisplay = `Tomorrow, ${time}`;
                            }

                            const formattedDate = `${month} ${day}`;

                            return (
                                <article 
                                    key={session.sessionId} 
                                    className="flex p-5 gap-4 rounded-2xl border border-gray-100 bg-white shadow-sm min-h-[160px] hover:border-gray-200 transition"
                                >
                                    {/* Left: Date Box */}
                                    <div className="w-14 h-16 md:w-[68px] md:h-[76px] rounded-xl flex flex-col items-center justify-center font-bold bg-[#F4F0FF] text-primary shrink-0">
                                        <span className="uppercase text-xs font-semibold tracking-wide">{month}</span>
                                        <span className="text-[26px] leading-none mt-1">{day}</span>
                                    </div>

                                    {/* Right: Content & Button */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-sm text-gray-500 truncate">{timeDisplay}</p>
                                        
                                        <h3 className="text-xl md:text-[22px] font-extrabold text-[#1F2432] mt-1 line-clamp-1" title={session.title}>
                                            {session.title}
                                        </h3>
                                        
                                        <p className="text-sm text-gray-500 mt-1 truncate" title={session.programTitle}>
                                            {session.programTitle || "Mentorship Program"}
                                        </p>

                                        {/* Join Button */}
                                        <div className="mt-auto pt-4 flex justify-end">
                                            {session.isJoinable && session.meetingLink ? (
                                                <button
                                                    onClick={() => window.open(session.meetingLink!, '_blank', 'noopener,noreferrer')}
                                                    className="rounded-lg px-6 py-2 text-sm font-semibold text-primary bg-[#F4F0FF] hover:bg-primary hover:text-white transition"
                                                >
                                                    Join
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="rounded-lg px-6 py-2 text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed"
                                                >
                                                    Not Joinable Yet
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default UpcomingSessionsPage;
