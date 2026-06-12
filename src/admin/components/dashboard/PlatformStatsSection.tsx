import { BookOpen, Users2, Map } from "lucide-react";
import { 
  useAdminProgramsStats, 
  useAdminCommunitiesStats, 
  useAdminRoadmapsStats 
} from "../../hooks/useAdminDashboard";
import { StatCard } from "./StatCard";

export const PlatformStatsSection = () => {
  const { data: progData, isLoading: progLoad, isError: progErr, refetch: progRefetch } = useAdminProgramsStats();
  const { data: comData, isLoading: comLoad, isError: comErr, refetch: comRefetch } = useAdminCommunitiesStats();
  const { data: roadData, isLoading: roadLoad, isError: roadErr, refetch: roadRefetch } = useAdminRoadmapsStats();

  return (
    <div className="mb-10">
      <h2 className="text-xl font-poppins font-semibold text-slateInk mb-6">Platform Engagement</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Programs"
          value={progData?.data?.totalPrograms}
          description={`(${progData?.data?.totalAcceptedMentees ?? 0} Accepted Mentees)`}
          icon={<BookOpen size={28} />}
          isLoading={progLoad}
          isError={progErr}
          onRetry={progRefetch}
        />
        <StatCard
          title="Communities"
          value={comData?.data?.totalCommunities}
          description={`(${comData?.data?.totalMembers ?? 0} Members, ${comData?.data?.totalPosts ?? 0} Posts)`}
          icon={<Users2 size={28} />}
          isLoading={comLoad}
          isError={comErr}
          onRetry={comRefetch}
        />
        <StatCard
          title="Roadmaps"
          value={roadData?.data?.totalRoadmaps}
          icon={<Map size={28} />}
          isLoading={roadLoad}
          isError={roadErr}
          onRetry={roadRefetch}
        />
      </div>
    </div>
  );
};
