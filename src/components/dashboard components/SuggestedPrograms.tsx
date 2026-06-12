import { useNavigate } from "react-router-dom";
import ProgramCard from "../ProgramCard";
import { useRecommendations } from "../../hooks/useRecommendations";
import SectionTitle from "../SectionTitle";
import ViewAllLink from "../ViewAllLink";

const SuggestedPrograms = () => {
    const navigate = useNavigate();
    const { data: programs, isLoading, isError } = useRecommendations('programs', 3);

    return (
        <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <SectionTitle>Programs Suggested for you</SectionTitle>
                    <p className="text-xs md:text-sm lg:text-base text-gray-400 mt-1">
                        AI-matched based on your goals
                    </p>
                </div>
                <ViewAllLink to="/suggested-programs" />
            </div>

            {/* Cards Wrapper */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                         <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-80 w-full"></div>
                    ))}
                </div>
            ) : isError || !programs || programs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No program recommendations available right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {programs.map((program) => (
                        <ProgramCard
                            key={program.id}
                            variant="dual-buttons"
                            tag={program.headline?.toUpperCase() || undefined}
                            matchPercentage={program.aiMatchScore}
                            matchReasons={program.aiMatchReasons}
                            title={program.name}
                            description={program.description || ''}
                            primaryButtonText="View Details"
                            onPrimaryClick={() => navigate(`/applications/${program.id}?apply=1`)}
                            className="h-full"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuggestedPrograms;
