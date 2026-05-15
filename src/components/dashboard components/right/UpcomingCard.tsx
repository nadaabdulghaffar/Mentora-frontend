import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

type UpcomingCardProps = {
    title?: string;
};

const UpcomingCard = ({ title = "Upcoming" }: UpcomingCardProps) => {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg lg:text-xl font-semibold text-slateInk">
                    {title}
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
                className={`w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 rounded-xl flex flex-col items-center justify-center text-xs font-semibold ${color}`}
            >
                <span>{date}</span>
                <span className="text-sm">{day}</span>
            </div>

            {/* Info */}
            <div className="flex-1">
                <p className="font-semibold text-xs md:text-sm lg:text-base text-slateInk">
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
