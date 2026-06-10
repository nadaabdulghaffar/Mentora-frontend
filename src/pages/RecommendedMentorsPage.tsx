import Layout from "../shared/components/Layout";
import MentorRecommendationCard from "../components/MentorRecommendationCard";
import { useRecommendations } from "../hooks/useRecommendations";
import { useNavigate } from "react-router-dom";

const RecommendedMentorsPage = () => {
  const navigate = useNavigate();
  const { data: mentors, isLoading, isError } = useRecommendations('mentors', 20);

  return (
    <Layout>
      <section className="w-full pb-8 pt-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191D2B] md:text-5xl">
            Recommended Mentors for You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#6D7386] md:text-base">
            Connect with expert mentors who can guide your journey and help you reach your goals.
          </p>
        </div>

        {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-96 w-full"></div>
              ))}
            </div>
        ) : isError ? (
            <div className="text-center py-12 text-gray-500">
                <p>Failed to load recommendations. Please try again later.</p>
            </div>
        ) : !mentors || mentors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
                <p>No mentor recommendations available at this time.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {mentors.map((m) => (
                <MentorRecommendationCard
                  key={m.id}
                  id={m.id}
                  name={m.name}
                  domain={m.headline}
                  imageUrl={m.avatarUrl}
                  matchPercentage={m.aiMatchScore}
                  matchReasons={m.aiMatchReasons}
                  onSeeProfileClick={() => navigate(`/profile/${m.id}`)}
                  className="h-full"
                />
              ))}
            </div>
        )}
      </section>
    </Layout>
  );
};

export default RecommendedMentorsPage;
