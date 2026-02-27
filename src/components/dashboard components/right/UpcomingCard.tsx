import { CalendarDays } from "lucide-react";

const UpcomingCard = () => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slateInk">
                    Upcoming
                </h3>

                <CalendarDays className="w-5 h-5 text-gray-400" />
            </div>

            <div className="border-t mt-4 pt-4 space-y-4">

                {/* Event 1 */}
                <EventItem
                    date="OCT"
                    day="10"
                    title="Session with Sara"
                    time="Tomorrow , 4pm"
                    field="Product management"
                    color="bg-orange-200"
                />

                {/* Event 2 */}
                <EventItem
                    date="OCT"
                    day="10"
                    title="Assignment : user research"
                    time="Tomorrow , 4pm"
                    field=""
                    color="bg-rose-200"
                />

            </div>

            {/* Button */}
            <button className="mt-3 w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 transition font-medium text-slateInk">
                Full calendar
            </button>

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
    color: string;
}

const EventItem = ({
    date,
    day,
    title,
    time,
    field,
    color,
}: EventItemProps) => {
    return (
        <div className="flex gap-4">

            {/* Date Box */}
            <div
                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-semibold ${color}`}
            >
                <span>{date}</span>
                <span className="text-sm">{day}</span>
            </div>

            {/* Info */}
            <div className="flex-1">
                <p className="font-semibold text-sm text-slateInk">
                    {title}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                    {time}
                </p>

                {field && (
                    <p className="text-xs text-gray-400">
                        {field}
                    </p>
                )}
            </div>

        </div>
    );
};
