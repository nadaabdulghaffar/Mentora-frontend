import { useNavigate } from "react-router-dom";
import { useRecommendations } from "../../../hooks/useRecommendations";
import { SharedCommunitySidebarCard } from "../../../shared/components/SharedCommunitySidebarCard";

const RecommendedCommunitiesCard = () => {
    const navigate = useNavigate();
    const { data: communities, isLoading, isError, refetch } = useRecommendations('communities', 3);

    const mappedCommunities = (communities || []).map(c => ({
        id: c.id,
        name: c.name,
        avatarUrl: c.avatarUrl || undefined
    }));

    return (
        <SharedCommunitySidebarCard
            title="Recommended Communities"
            communities={mappedCommunities}
            isLoading={isLoading}
            isError={isError}
            emptyMessage="No community recommendations right now."
            actionText="Explore"
            onActionClick={(id) => navigate(`/community/${id}`)}
            footerLinkTo="/recommended-communities"
            footerLinkText="View All Communities"
            onRetry={() => refetch()}
        />
    );
};

export default RecommendedCommunitiesCard;
