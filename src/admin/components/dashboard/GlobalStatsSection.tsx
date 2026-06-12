import { Users, UserCheck, UserPlus, ShieldOff } from "lucide-react";
import { useAdminStats } from "../../hooks/useAdminDashboard";
import { StatCard } from "./StatCard";

export const GlobalStatsSection = () => {
  const { data, isLoading, isError, refetch } = useAdminStats();
  const stats = data?.data;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-poppins font-semibold text-slateInk mb-6">Global Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={<Users size={28} />}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
        <StatCard
          title="Total Mentors"
          value={stats?.totalMentors}
          icon={<UserCheck size={28} />}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
        <StatCard
          title="Total Mentees"
          value={stats?.totalMentees}
          icon={<UserPlus size={28} />}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
        <StatCard
          title="Banned Users"
          value={stats?.bannedUsersCount}
          icon={<ShieldOff size={28} />}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
      </div>
    </div>
  );
};
