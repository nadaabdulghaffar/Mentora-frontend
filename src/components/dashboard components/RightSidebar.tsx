import ProfileCompletionCard from "./right/ProfileCompletionCard";
import UpcomingCard from "./right/UpcomingCard";
import LearningHubCard from "./right/LearningHubCard";

const RightSidebar = () => {
  return (
    <div className="space-y-6">
      <ProfileCompletionCard />
      <UpcomingCard />
      <LearningHubCard />
    </div>
  );
};

export default RightSidebar;
