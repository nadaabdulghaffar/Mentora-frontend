import { useNavigate } from "react-router-dom";
import { useRecommendations } from "../../hooks/useRecommendations";
import CommunityRecommendationCard from "../CommunityRecommendationCard";
import SectionTitle from "../SectionTitle";
import ViewAllLink from "../ViewAllLink";

const RecommendedCommunities = () => {
    const navigate = useNavigate();
    const { data: communities, isLoading, isError } = useRecommendations('communities', 3);

    return (
        <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <SectionTitle>Recommended Communities</SectionTitle>
                    <p className="text-xs md:text-sm lg:text-base text-gray-400 mt-1">
                        Based on your interests and goals
                    </p>
                </div>
                <ViewAllLink to="/recommended-communities" />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-64 w-full"></div>
                    ))}
                </div>
            ) : isError || !communities || communities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No community recommendations available right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {communities.map((community) => (
                        <CommunityRecommendationCard
                            key={community.id}
                            id={community.id}
                            name={community.name}
                            domain={community.headline}
                            onExploreClick={() => navigate(`/community/${community.id}`)}
                            className="h-full"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecommendedCommunities;
