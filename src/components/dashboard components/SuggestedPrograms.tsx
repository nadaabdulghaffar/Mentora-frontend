import { Link } from "react-router-dom";
import ProgramCard from "../ProgramCard";

const SuggestedPrograms = () => {
    return (
        <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm">

            {/* Header */}
            <div className="flex justify-between items-start mb-6">

                <div>
                    <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800">
                        Programs Suggested for you
                    </h3>
                    <p className="text-xs md:text-sm lg:text-base text-gray-400 mt-1">
                        AI-matched based on your goals
                    </p>
                </div>

                <Link
                    to="/suggested-programs"
                    className="text-xs text-gray-500 transition hover:text-primary md:text-sm lg:text-base"
                >
                    View all
                </Link>
            </div>

            {/* Cards Wrapper */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProgramCard
                    variant="dual-buttons"
                    image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"
                    tag="DESIGN"
                    phases="92% MATCHING"
                    title="UX Research Fundamentals"
                    description="Master the art of user research with industry experts from top tech companies."
                    author={{
                        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Moraa",
                        name: "Moraa Zaki",
                    }}
                    primaryButtonText="Apply"
                    secondaryButtonText="Details"
                />
                <ProgramCard
                    variant="dual-buttons"
                    image="https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80"
                    tag="LEADERSHIP"
                    phases="88% MATCHING"
                    title="Future Leaders Track"
                    description="Develop soft skills and strategic thinking necessary for senior management roles."
                    author={{
                        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Mona",
                        name: "Mona Zaki",
                    }}
                    primaryButtonText="Apply"
                    secondaryButtonText="Details"
                />
                <ProgramCard
                    variant="dual-buttons"
                    image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"
                    tag="DESIGN"
                    phases="85% MATCHING"
                    title="UX Research Fundamentals"
                    description="Master the craft of user-centered design through practical mentorship."
                    author={{
                        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Moraa2",
                        name: "Moraa Zaki",
                    }}
                    primaryButtonText="Apply"
                    secondaryButtonText="Details"
                />
            </div>

        </div>
    );
};

export default SuggestedPrograms;
