import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import UsersPage from "../pages/users/UsersPage";

import { ModerationPage } from "../pages/moderation/ModerationPage";

import ProgramsPage from "../pages/programs/ProgramsPage";
import CommunitiesPage from "../pages/communities/CommunitiesPage";
import RoadmapsPage from "../pages/roadmaps/RoadmapsPage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Default route redirects to dashboard */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users/*" element={<UsersPage />} />
        <Route path="moderation/*" element={<ModerationPage />} />
        <Route path="programs/*" element={<ProgramsPage />} />
        <Route path="communities/*" element={<CommunitiesPage />} />
        <Route path="roadmaps/*" element={<RoadmapsPage />} />
        
        {/* Catch-all for unknown admin routes */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
