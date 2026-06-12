import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import mentoRobot from "../../assets/images/Gemini_Generated_Image_oov0p2oov0p2oov0 1.png";
import { type SuggestionChip, MENTEE_DASHBOARD_CHIPS } from "../../constants/chatbotPrompts";

interface SearchSectionProps {
    title?: string;
    placeholder?: string;
    suggestionChips?: SuggestionChip[];
}

const SearchSection = ({
    title = "Mento AI is here for you to guide you step by step",
    placeholder = "I'm here to assist you on your career path! Don't hesitate to reach out with any questions...",
    suggestionChips = MENTEE_DASHBOARD_CHIPS
}: SearchSectionProps) => {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const navigate = useNavigate();

    const handleSend = (promptText: string) => {
        if (!promptText.trim()) return;
        navigate("/mento-ai", { state: { autoSendPrompt: promptText } });
    };

    const handleChipClick = (promptText: string) => {
        if (isTyping) return;
        setIsTyping(true);
        setMessage("");
        let i = 0;
        const interval = setInterval(() => {
            setMessage(promptText.slice(0, i + 1));
            i++;
            if (i >= promptText.length) {
                clearInterval(interval);
                setIsTyping(false);
                handleSend(promptText);
            }
        }, 15); // Type very quickly
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSend(message);
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <h3 className="mb-6 text-lg font-bold leading-snug text-[#3730a3] md:text-xl">
                {title}
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
                    {suggestionChips.map(({ label, className }) => (
                        <button
                            key={label}
                            type="button"
                            disabled={isTyping}
                            onClick={() => handleChipClick(label)}
                            className={`rounded-full px-3.5 py-2 text-left text-xs font-medium text-gray-900 transition sm:text-sm ${className} disabled:opacity-50`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[48px] flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                    type="submit"
                    className="shrink-0 rounded-lg bg-[#f3f4f6] px-8 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-200"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default SearchSection;
