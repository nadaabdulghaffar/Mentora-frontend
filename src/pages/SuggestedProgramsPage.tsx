import Layout from "../shared/components/Layout";
import ProgramCard from "../components/ProgramCard";
import { useRecommendations } from "../hooks/useRecommendations";
import { useNavigate } from "react-router-dom";

const SuggestedProgramsPage = () => {
  const navigate = useNavigate();
  const { data: programs, isLoading, isError } = useRecommendations('programs', 20);

  return (
    <Layout>
      <section className="w-full pb-8 pt-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191D2B] md:text-5xl">
            Recommended Programs for You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#6D7386] md:text-base">
            Curated programs tailored to match your learning goals and interests.
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
        ) : !programs || programs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
                <p>No program recommendations available at this time.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  variant="dual-buttons"
                  image={program.avatarUrl || undefined}
                  tag={program.headline?.toUpperCase() || undefined}
                  phases={`${program.aiMatchScore}% MATCHING`}
                  title={program.name}
                  description={program.description || ''}
                  primaryButtonText="View Details"
                  onPrimaryClick={() => navigate(`/applications/${program.id}?apply=1`)}
                  className="h-full"
                />
              ))}
            </div>
        )}
      </section>
    </Layout>
  );
};

export default SuggestedProgramsPage;
