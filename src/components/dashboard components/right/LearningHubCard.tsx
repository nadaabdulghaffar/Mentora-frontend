import { BookOpen } from "lucide-react";

const LearningHubCard = () => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slateInk">
                    Learning Hub
                </h3>

                <BookOpen className="w-5 h-5 text-gray-400" />
            </div>

            {/* Divider */}
            <div className="border-t mt-4 pt-4 space-y-3">

                <LearningItem
                    title="Goal Settings for Growth"
                    date="19/2/2025"
                />

                <LearningItem
                    title="How to ask a great question"
                    date="19/2/2025"
                />

                <LearningItem
                    title="Networking best practice"
                    date="19/2/2025"
                />

            </div>

        </div>
    );
};

export default LearningHubCard;

/* ---------- Learning Item ---------- */

interface LearningItemProps {
    title: string;
    date: string;
}

const LearningItem = ({ title, date }: LearningItemProps) => {
    return (
        <div className="bg-[#F3F2F7] rounded-xl px-4 py-2.5 hover:bg-[#EAE8F5] transition cursor-pointer">

            <p className="text-sm font-semibold text-slateInk">
                {title}
            </p>

            <p className="text-xs text-gray-400 mt-0.5">
                {date}
            </p>

        </div>
    );
};
