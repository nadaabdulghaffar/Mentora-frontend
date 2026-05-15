import { useState } from "react";
import mentoRobot from "../../assets/images/Gemini_Generated_Image_oov0p2oov0p2oov0 1.png";

const SUGGESTION_CHIPS: { label: string; className: string }[] = [
    { label: "How to use Mentora", className: "bg-[#fef3c7] hover:bg-[#fde68a]" },
    { label: "Recommend Mentorship program", className: "bg-[#d1fae5] hover:bg-[#a7f3d0]" },
    { label: "Recommend Mentor", className: "bg-[#ffedd5] hover:bg-[#fed7aa]" },
    { label: "Create Roadmap", className: "bg-[#fee2e2] hover:bg-[#fecaca]" },
    { label: "Study Partner", className: "bg-[#99f6e4] hover:bg-[#5eead4]" },
];

const SearchSection = () => {
    const [message, setMessage] = useState("");

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <h3 className="mb-6 text-lg font-bold leading-snug text-[#3730a3] md:text-xl">
                Mento AI is here for you to guide you step by step
            </h3>

            <div className="mb-6 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex shrink-0 justify-center sm:justify-start">
                    <img
                        src={mentoRobot}
                        alt="Mento AI assistant"
                        className="h-36 w-auto max-w-[140px] object-contain sm:h-40 sm:max-w-[160px]"
                    />
                </div>

                <div className="flex min-w-0 flex-1 flex-wrap gap-2 sm:gap-2.5">
                    {SUGGESTION_CHIPS.map(({ label, className }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setMessage(label)}
                            className={`rounded-full px-3.5 py-2 text-left text-xs font-medium text-gray-900 transition sm:text-sm ${className}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I'm here to assist you on your career path! Don't hesitate to reach out with any questions..."
                    className="min-h-[48px] flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                    type="button"
                    className="shrink-0 rounded-lg bg-[#f3f4f6] px-8 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-200"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default SearchSection;
