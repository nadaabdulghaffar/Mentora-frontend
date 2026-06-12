import { GlobalStatsSection } from "../../components/dashboard/GlobalStatsSection";
import { PlatformStatsSection } from "../../components/dashboard/PlatformStatsSection";

const DashboardPage = () => {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-bold text-slateInk mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">Monitor platform metrics and engagement statistics.</p>
      </div>
      
      <GlobalStatsSection />
      <PlatformStatsSection />
    </div>
  );
};

export default DashboardPage;
