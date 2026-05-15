import UpcomingCard from "./right/UpcomingCard";
import RecommendedCommunitiesCard from "./right/RecommendedCommunitiesCard";

type RightSidebarProps = {
  upcomingTitle?: string;
};

const RightSidebar = ({ upcomingTitle }: RightSidebarProps) => {
  return (
    <div className="space-y-6">
      <UpcomingCard title={upcomingTitle} />
      <RecommendedCommunitiesCard />
    </div>
  );
};

export default RightSidebar;
