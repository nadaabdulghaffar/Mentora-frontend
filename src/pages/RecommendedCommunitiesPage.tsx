import Layout from "../shared/components/Layout";
import CommunityRecommendationCard from "../components/CommunityRecommendationCard";
import { useRecommendations } from "../hooks/useRecommendations";
import { useNavigate } from "react-router-dom";

const RecommendedCommunitiesPage = () => {
  const navigate = useNavigate();
  const { data: communities, isLoading, isError } = useRecommendations('communities', 20);

  return (
    <Layout>
      <section className="w-full pb-8 pt-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191D2B] md:text-5xl">
            Recommended Communities for You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#6D7386] md:text-base">
            Discover communities that match your professional interests and goals.
          </p>
        </div>

        {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-64 w-full"></div>
              ))}
            </div>
        ) : isError ? (
            <div className="text-center py-12 text-gray-500">
                <p>Failed to load recommendations. Please try again later.</p>
            </div>
        ) : !communities || communities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
                <p>No community recommendations available at this time.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {communities.map((community) => (
                <CommunityRecommendationCard
                  key={community.id}
                  id={community.id}
                  name={community.name}
                  domain={community.headline}
                  matchPercentage={community.aiMatchScore}
                  matchReasons={community.aiMatchReasons}
                  imageUrl={community.avatarUrl}
                  onExploreClick={() => navigate(`/community/${community.id}`)}
                  className="h-full"
                />
              ))}
            </div>
        )}
      </section>
    </Layout>
  );
};

export default RecommendedCommunitiesPage;
